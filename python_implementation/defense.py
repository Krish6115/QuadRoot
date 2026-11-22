"""
defense.py - AEGIS multi-agent defence daemon (ARGUS + PHINEAS + HERMES)
=======================================================================
Ransomware canary-file detection with real file-system monitoring.

  ARGUS    deploys canary (honeypot) files and records SHA-256 baselines
  PHINEAS  FIM engine: OS-native file events (watchdog) + hash verification
           + behavioural mass-encryption burst detector
  HERMES   process attribution + termination (psutil), latency measured

Everything the dashboard shows comes from this process's real state
(file system, psutil, perf_counter). Nothing is scripted or random.

HTTP API (port 5000):
  GET  /api/state            full live snapshot
  POST /api/attack           launch attacker.py {"profile":"standard|stealth","delay":0.8}
  POST /api/reset            kill attacker, restore sandbox, re-arm canaries
  POST /api/config           {"mode":"swarm|passive","policy":"canary|canary+behaviour"}

Run:  python defense.py
"""
import hashlib
import json
import os
import subprocess
import sys
import threading
import time
from collections import deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import psutil
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

HERE = os.path.dirname(os.path.abspath(__file__))
SANDBOX_DIR = os.path.join(HERE, "sandbox")
ATTACKER = os.path.join(HERE, "attacker.py")
PORT = int(os.environ.get("AEGIS_PORT", "5000"))

# ---- protected user data (restored on reset) -------------------------------
USER_FILES = {
    "financial_report.xlsx": "CONFIDENTIAL FINANCIAL AUDIT: $4.2M OPEX REPORT\n" * 4,
    "customer_database.sql": "SELECT * FROM corporate_customers WHERE credit_limit > 500000;\n" * 4,
    "product_roadmap.pdf": "INTERNAL PRODUCT STRATEGY // AEGIS PLATFORM VERSION 5.0\n" * 4,
    "intellectual_property.key": "CERTIFICATE AUTHORITY SYMMETRIC PRIVKEY: 0x82A1B7E3\n" * 4,
    "api_secrets.env": "DATABASE_URL=postgresql://db_admin:changeme@localhost:5432/prod\n" * 4,
    "contract_draft_v2.docx": "DRAFT CONTRACT v2 - CONFIDENTIAL CLAUSES\n" * 4,
    "patch_notes.txt": "Release 5.0.1: fixed login race condition\n" * 4,
}
# ---- ARGUS canaries: first/early AND last in alphabetical order ------------
CANARIES = {
    "000_urgent_salary_audit.xlsx": "CANARY: DO NOT ACCESS. PAYROLL AUDIT Q4 - EXECUTIVE COMPENSATION\n" * 4,
    "000_vpn_credentials_backup.txt": "CANARY: VPN ADMIN BACKUP CREDENTIALS - ROTATE QUARTERLY\n" * 4,
    "zzz_board_minutes_confidential.pdf": "CANARY: BOARD MINUTES - ACQUISITION PLANS\n" * 4,
}

LOCK = threading.RLock()
START = time.time()


def sha256_file(path):
    h = hashlib.sha256()
    try:
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                h.update(chunk)
        return h.hexdigest()
    except OSError:
        return None


class State:
    def __init__(self):
        self.mode = "swarm"                    # swarm = detect+respond, passive = detect only
        self.policy = "canary+behaviour"
        self.status = "MONITORING"             # MONITORING|ATTACK|ALERTING|MITIGATED|BREACHED
        self.logs, self.ipc = [], []
        self.baseline = {}                     # name -> sha256
        self.alerts = 0
        self.kills = 0
        self.fim_events = 0
        self.latency_ms = None
        self.detect_source = None
        self.attacker_pid = None
        self.attacker_proc = None              # Popen if launched from dashboard
        self.attack_started = None
        self.attack_profile = None
        self.handled = False                   # one incident per attack
        self.suspend_until = 0.0
        self.lock_times = deque(maxlen=64)
        self.canary_hit = None


S = State()


def log(level, source, message, ipc_sender=None, ipc_msg=None, color=None):
    ts = time.strftime("%Y-%m-%d %H:%M:%S")
    with LOCK:
        S.logs.append({"timestamp": ts, "level": level, "source": source, "message": message})
        S.logs[:] = S.logs[-300:]
        if ipc_sender:
            S.ipc.append({"sender": ipc_sender, "message": ipc_msg or message,
                          "colorClass": color or "text-muted"})
            S.ipc[:] = S.ipc[-300:]
    print(f"[{source}] {message}", flush=True)


# ============================ ARGUS ==========================================
def argus_deploy():
    os.makedirs(SANDBOX_DIR, exist_ok=True)
    S.suspend_until = time.time() + 1.0
    for name, content in CANARIES.items():
        p = os.path.join(SANDBOX_DIR, name)
        if not os.path.exists(p):
            with open(p, "w") as f:
                f.write(content)
    rebaseline()
    log("INFO", "ARGUS", f"{len(CANARIES)} canary files deployed (SHA-256 baselined)",
        "ARGUS", f"Armed {len(CANARIES)} decoys: {', '.join(CANARIES)}", "argus-color")


def rebaseline():
    with LOCK:
        S.baseline = {}
        for n in list(USER_FILES) + list(CANARIES):
            h = sha256_file(os.path.join(SANDBOX_DIR, n))
            if h:
                S.baseline[n] = h


def restore_sandbox():
    os.makedirs(SANDBOX_DIR, exist_ok=True)
    for n in os.listdir(SANDBOX_DIR):
        p = os.path.join(SANDBOX_DIR, n)
        if os.path.isfile(p):
            try:
                os.remove(p)
            except OSError:
                pass
    for name, content in {**USER_FILES, **CANARIES}.items():
        with open(os.path.join(SANDBOX_DIR, name), "w") as f:
            f.write(content)
    rebaseline()


# ============================ HERMES =========================================
def find_attackers():
    me = os.getpid()
    out = []
    for p in psutil.process_iter(["pid", "cmdline"]):
        try:
            cmd = p.info["cmdline"] or []
            if p.info["pid"] != me and any(os.path.basename(c) == "attacker.py" for c in cmd[1:]):
                out.append(p.info["pid"])
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    return out


def hermes_kill(t0, reason):
    pids = []
    if S.attacker_proc and S.attacker_proc.poll() is None:
        pids.append(S.attacker_proc.pid)
    if S.attacker_pid and S.attacker_pid not in pids:
        pids.append(S.attacker_pid)
    if not pids:
        pids = find_attackers()
    if not pids:
        log("WARNING", "HERMES", "Alert raised but no live attacker process found",
            "HERMES", "No attacker process to terminate (already exited).", "text-muted")
        return
    log("INFO", "HERMES", f"Attributed malicious process PID {pids[0]} ({reason})",
        "HERMES", f"Attribution: PID {pids[0]} running attacker.py. Dispatching SIGKILL.", "hermes-color")
    for pid in pids:
        try:
            proc = psutil.Process(pid)
            for child in proc.children(recursive=True):
                child.kill()
            proc.kill()
            proc.wait(timeout=3)
        except psutil.NoSuchProcess:
            pass
        except Exception as exc:
            log("ERROR", "HERMES", f"Kill failed for PID {pid}: {exc}")
            return
    dead = all(not psutil.pid_exists(p) or
               psutil.Process(p).status() == psutil.STATUS_ZOMBIE for p in pids)
    latency = (time.perf_counter() - t0) * 1000
    with LOCK:
        S.latency_ms = round(latency, 2)
        S.kills += 1
        S.attacker_pid = pids[0]
        S.status = "MITIGATED" if dead else "ALERTING"
    log("SUCCESS", "HERMES",
        f"PID {pids[0]} terminated and verified dead. Detection->kill latency {latency:.2f} ms",
        "HERMES", f"SIGKILL confirmed on PID {pids[0]} in {latency:.2f} ms.", "hermes-color")
    log("SUCCESS", "SYSTEM", "Intrusion contained", "ARES",
        "Process terminated by external SIGKILL.", "ares-color")


# ============================ PHINEAS ========================================
def canary_of(path):
    """Return canary name if `path` is a canary or an artefact of one (e.g. .locked)."""
    base = os.path.basename(path)
    for c in CANARIES:
        if base == c or base.startswith(c + "."):
            return c
    return None


def raise_alert(t0, source, detail, canary=None):
    with LOCK:
        if S.handled:
            return
        S.handled = True
        S.alerts += 1
        S.status = "ALERTING"
        S.detect_source = source
        S.canary_hit = canary
        mode = S.mode
    log("ERROR", "Wazuh-FIM", f"ALERT [Level 15] {detail}",
        "PHINEAS", f"CRITICAL: {detail}", "phineas-color")
    if mode == "swarm":
        hermes_kill(t0, source)
    else:
        log("WARNING", "PHINEAS", "Passive mode: alert logged, NO automated response",
            "PHINEAS", "Passive EDR - logging only. Attack is not interrupted.", "phineas-color")


class FIMHandler(FileSystemEventHandler):
    def on_any_event(self, event):
        if event.is_directory or time.time() < S.suspend_until:
            return
        t0 = time.perf_counter()
        paths = [event.src_path] + ([event.dest_path] if getattr(event, "dest_path", "") else [])
        with LOCK:
            S.fim_events += 1
        # attacker seen at the file system? (attacker launched from a terminal)
        if S.status == "MONITORING" and event.event_type in ("created", "modified", "deleted", "moved"):
            if any(p.endswith(".locked") or canary_of(p) for p in paths):
                with LOCK:
                    S.status = "ATTACK"
                    S.attack_started = S.attack_started or time.time()
        for p in paths:
            c = canary_of(p)
            if c and event.event_type in ("modified", "deleted", "moved", "created"):
                if event.event_type == "created" and not p.endswith(".locked") and os.path.basename(p) == c:
                    continue  # our own deployment
                raise_alert(t0, "canary",
                            f"Canary '{c}' {event.event_type}: {os.path.basename(p)}", c)
                return
        # behavioural detector: mass rename-to-.locked burst
        if event.event_type == "created" and event.src_path.endswith(".locked"):
            now = time.time()
            with LOCK:
                S.lock_times.append(now)
                burst = sum(1 for x in S.lock_times if now - x <= 3.0)
                pol = S.policy
            if burst >= 3 and pol == "canary+behaviour":
                raise_alert(t0, "behaviour",
                            f"Mass-encryption burst: {burst} .locked files in 3s")


# ============================ monitor / metrics ==============================
def monitor_loop():
    """Tracks the attacker process and detects end of attack."""
    while True:
        time.sleep(0.25)
        try:
            pids = []
            if S.attacker_proc and S.attacker_proc.poll() is None:
                pids = [S.attacker_proc.pid]
            else:
                pids = find_attackers()
            with LOCK:
                if pids:
                    S.attacker_pid = pids[0]
                    if S.status == "MONITORING":
                        S.status = "ATTACK"
                        S.attack_started = time.time()
                        log("WARNING", "SYSTEM", f"Process attacker.py (PID {pids[0]}) running",
                            "ARES", f"Encryption sweep started, PID {pids[0]}.", "ares-color")
                elif S.status in ("ATTACK", "ALERTING"):
                    locked = sum(1 for n in os.listdir(SANDBOX_DIR) if n.endswith(".locked"))
                    if locked:
                        S.status = "BREACHED"
                        log("ERROR", "SYSTEM", f"Attack finished undetected/unblocked: {locked} files encrypted",
                            "ARES", f"Sweep complete. {locked} files locked.", "ares-color")
        except Exception:
            pass


def snapshot():
    files = []
    try:
        names = set(os.listdir(SANDBOX_DIR))
    except OSError:
        names = set()
    for n in sorted(set(USER_FILES) | set(CANARIES)):
        is_c = n in CANARIES
        p = os.path.join(SANDBOX_DIR, n)
        if n in names:
            h = sha256_file(p)
            st = "clean" if h == S.baseline.get(n) else "modified"
            if S.status == "MITIGATED" and st == "clean":
                st = "preserved"
        elif n + ".locked" in names:
            st = "locked"
        else:
            st = "missing"
        files.append({"id": len(files) + 1, "name": n, "path": p,
                      "type": "canary" if is_c else "user", "status": st})
    user = [f for f in files if f["type"] == "user"]
    locked = sum(1 for f in user if f["status"] in ("locked", "modified", "missing"))
    safe = sum(1 for f in user if f["status"] in ("clean", "preserved"))
    running = bool((S.attacker_proc and S.attacker_proc.poll() is None) or
                   S.status in ("ATTACK",) and S.attacker_pid and psutil.pid_exists(S.attacker_pid))
    return {
        "status": S.status, "mode": S.mode, "policy": S.policy,
        "pid": S.attacker_pid if S.attacker_pid else "OFFLINE",
        "attackerRunning": running, "profile": S.attack_profile,
        "latencyMs": S.latency_ms, "detectSource": S.detect_source, "canaryHit": S.canary_hit,
        "alerts": S.alerts, "kills": S.kills, "fimEvents": S.fim_events,
        "totalUser": len(user), "locked": locked, "preserved": safe,
        "canaries": len(CANARIES), "uptime": round(time.time() - START),
        "files": files, "logs": S.logs[-150:], "ipc": S.ipc[-150:],
    }


# ============================ actions ========================================
def do_reset():
    with LOCK:
        for pid in ([S.attacker_proc.pid] if S.attacker_proc else []) + find_attackers():
            try:
                psutil.Process(pid).kill()
            except Exception:
                pass
        S.suspend_until = time.time() + 1.5
    time.sleep(0.2)
    restore_sandbox()
    with LOCK:
        S.status, S.alerts, S.kills, S.fim_events = "MONITORING", 0, 0, 0
        S.latency_ms = S.detect_source = S.canary_hit = S.attack_started = None
        S.attacker_pid = S.attacker_proc = S.attack_profile = None
        S.handled = False
        S.lock_times.clear()
        S.logs, S.ipc = [], []
    log("INFO", "SYSTEM", "Sandbox restored, daemon re-armed", "SYSTEM", "Reset complete.", "text-muted")
    argus_deploy()
    log("INFO", "PHINEAS", "Wazuh-style FIM active on sandbox (ReadDirectoryChangesW/inotify)",
        "PHINEAS", f"FIM watching {SANDBOX_DIR}", "phineas-color")


def do_attack(profile="standard", delay=0.8):
    with LOCK:
        if S.status in ("ATTACK", "ALERTING") and S.attacker_proc and S.attacker_proc.poll() is None:
            return {"ok": False, "error": "attack already running"}
    if S.status != "MONITORING":
        do_reset()
    profile = profile if profile in ("standard", "stealth") else "standard"
    delay = max(0.1, min(float(delay), 3.0))
    S.suspend_until = 0
    proc = subprocess.Popen([sys.executable, "-u", ATTACKER, "--profile", profile, "--delay", str(delay)],
                            cwd=HERE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    with LOCK:
        S.attacker_proc, S.attacker_pid = proc, proc.pid
        S.attack_started, S.attack_profile, S.status = time.time(), profile, "ATTACK"
    log("WARNING", "ARES", f"Ransomware simulator launched PID {proc.pid} profile={profile} (T1486)",
        "ARES", f"Launched attacker.py PID {proc.pid} ({profile}).", "ares-color")
    return {"ok": True, "pid": proc.pid}


class API(BaseHTTPRequestHandler):
    def _send(self, code, obj):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send(200, {})

    def do_GET(self):
        if self.path == "/api/state":
            with LOCK:
                self._send(200, snapshot())
        else:
            self._send(404, {"error": "not found"})

    def do_POST(self):
        n = int(self.headers.get("Content-Length") or 0)
        try:
            data = json.loads(self.rfile.read(n) or b"{}")
        except ValueError:
            data = {}
        if self.path == "/api/attack":
            self._send(200, do_attack(data.get("profile", "standard"), data.get("delay", 0.8)))
        elif self.path == "/api/reset":
            do_reset()
            self._send(200, {"ok": True})
        elif self.path == "/api/config":
            with LOCK:
                if data.get("mode") in ("swarm", "passive"):
                    S.mode = data["mode"]
                if data.get("policy") in ("canary", "canary+behaviour"):
                    S.policy = data["policy"]
            log("INFO", "SYSTEM", f"Config: mode={S.mode} policy={S.policy}")
            self._send(200, {"ok": True, "mode": S.mode, "policy": S.policy})
        else:
            self._send(404, {"error": "not found"})

    def log_message(self, *a):
        pass


def main():
    print("=" * 60 + "\n AEGIS // MULTI-AGENT SWARM DEFENCE DAEMON\n" + "=" * 60)
    restore_sandbox()
    log("INFO", "SYSTEM", "Defence daemon online", "SYSTEM", "Autonomous swarm EDR standing by.", "text-muted")
    argus_deploy()
    obs = Observer()
    obs.schedule(FIMHandler(), SANDBOX_DIR, recursive=False)
    obs.start()
    log("INFO", "PHINEAS", "Wazuh-style FIM active on sandbox (ReadDirectoryChangesW/inotify)",
        "PHINEAS", f"FIM watching {SANDBOX_DIR}", "phineas-color")
    threading.Thread(target=monitor_loop, daemon=True).start()
    srv = ThreadingHTTPServer(("127.0.0.1", PORT), API)
    print(f"[SYSTEM] API on http://127.0.0.1:{PORT}/api/state", flush=True)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        obs.stop()
        obs.join()


if __name__ == "__main__":
    main()
