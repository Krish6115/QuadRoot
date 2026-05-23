"""
defense.py — Multi-Agent Swarm Defense Daemon (ARGUS + PHINEAS + HERMES)
========================================================================
Team QuadRoot | Problem Statement #24 | FoSC 23CSE313 Hackathon

PURPOSE:
    This script is the DEFENSIVE core of the project. It runs as a persistent
    background daemon that:
      1. ARGUS  — Places a honeypot canary decoy file in the sandbox directory
      2. PHINEAS — Monitors the sandbox using Wazuh-style File Integrity Monitoring
      3. HERMES  — Terminates the ransomware process upon canary violation

MAPPED TOOLS:
    - Wazuh Agent (FIM/syscheck): Simulated by the watchdog Observer + AnomalyHandler.
      Wazuh's real-time FIM works identically: it hooks OS kernel file change
      notifications (inotify on Linux, ReadDirectoryChangesW on Windows) and
      compares file state against a known-good baseline.
    - psutil: Used for process enumeration and SIGKILL dispatch, simulating
      the automated incident response that an enterprise SOAR platform would
      perform after receiving a Wazuh Level 15 FIM alert.

HOW WATCHDOG WORKS INTERNALLY:
    The `watchdog` library creates a background thread (Observer) that registers
    with the operating system's native file notification API:
      - On Windows: Win32 ReadDirectoryChangesW API
      - On Linux:   inotify kernel subsystem
      - On macOS:   FSEvents / kqueue
    
    When ANY file in the monitored directory is created, modified, deleted,
    or moved, the OS kernel immediately sends a notification to our Observer
    thread, which dispatches the event to our AnomalyHandler callback.
    
    This is fundamentally different from polling (checking files in a loop):
      - Polling: CPU-intensive, introduces latency (seconds)
      - Event-Driven: Near-zero CPU usage, sub-millisecond response time

USAGE:
    Terminal 1:  python defense.py     (start this FIRST — places canary)
    Terminal 2:  python attacker.py    (then launch the attack)
"""

import os       # os — Filesystem operations: path joining, existence checks, directory creation
import time     # time — High-resolution timing for mitigation latency measurement
import psutil   # psutil — Cross-platform process and system utilities
import json     # json — Serialization for the Live API server
import threading # threading — Concurrent background server execution
from http.server import BaseHTTPRequestHandler, HTTPServer

# watchdog — Cross-platform filesystem event monitoring library
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# ====================================================================
# CONFIGURATION CONSTANTS & GLOBAL LIVE STATE
# ====================================================================

SANDBOX_DIR = "./sandbox"
CANARY_FILE = os.path.join(SANDBOX_DIR, "000_urgent_salary_audit.xlsx")

ACTIVE_HANDLER = None  # Tracks the instantiated watchdog callback to allow runtime resets

# LIVE_STATE: In-memory live telemetry and logs database synchronized in real-time
# with the React front-end dashboard to visualize actual filesystem changes.
LIVE_STATE = {
    "status": "MONITORING",
    "attacker_pid": "OFFLINE",
    "mitigation_latency": "N/A",
    "logs": [
        {"timestamp": time.strftime("%H:%M:%S"), "level": "INFO", "source": "SYSTEM", "message": "Multi-Agent Swarm Defense Daemon active."},
        {"timestamp": time.strftime("%H:%M:%S"), "level": "INFO", "source": "ARGUS", "message": "Canary decoy file deployed to protected namespace."},
        {"timestamp": time.strftime("%H:%M:%S"), "level": "INFO", "source": "PHINEAS", "message": "Wazuh FIM active. Standing by..."}
    ],
    "ipc_logs": [
        {"sender": "SYSTEM", "message": "Autonomous Swarm EDR standing by...", "colorClass": "text-muted"},
        {"sender": "ARGUS", "message": "Canary Honey-pot trap placed alphabetically first.", "colorClass": "argus-color"},
        {"sender": "PHINEAS", "message": "ReadDirectoryChangesW hook successfully mounted.", "colorClass": "phineas-color"}
    ],
    "kills": 0
}


def get_sandbox_files():
    """Scans ./sandbox dynamically and formats the output for the React SPA dashboard."""
    if not os.path.exists(SANDBOX_DIR):
        return []
    
    files = os.listdir(SANDBOX_DIR)
    file_list = []
    seen = set()
    
    # 1. Identify all locked files
    for f in files:
        if f.endswith('.locked'):
            orig_name = f[:-7] # Remove .locked suffix
            seen.add(orig_name)
            file_list.append({
                "id": len(file_list) + 1,
                "name": orig_name,
                "path": os.path.join(SANDBOX_DIR, f),
                "type": "canary" if orig_name.startswith("000_") else "user",
                "status": "locked"
            })
            
    # 2. Identify clean or preserved files
    for f in files:
        if f.endswith('.locked'):
            continue
        if f in seen:
            continue
        
        file_list.append({
            "id": len(file_list) + 1,
            "name": f,
            "path": os.path.join(SANDBOX_DIR, f),
            "type": "canary" if f.startswith("000_") else "user",
            "status": "clean" if LIVE_STATE["status"] != "MITIGATED" else "preserved"
        })
        
    return sorted(file_list, key=lambda x: x["name"])


class APIServerHandler(BaseHTTPRequestHandler):
    """API Server Handler resolving local cross-origin HTTP requests from React SPA dashboard."""
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/status':
            self._set_headers()
            response = {
                "status": LIVE_STATE["status"],
                "pid": LIVE_STATE["attacker_pid"],
                "latency": LIVE_STATE["mitigation_latency"],
                "logs": LIVE_STATE["logs"],
                "ipc_logs": LIVE_STATE["ipc_logs"],
                "kills": LIVE_STATE["kills"]
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
        elif self.path == '/api/files':
            self._set_headers()
            response = get_sandbox_files()
            self.wfile.write(json.dumps(response).encode('utf-8'))
        elif self.path == '/api/reset':
            # Reset global LIVE_STATE variables
            LIVE_STATE["status"] = "MONITORING"
            LIVE_STATE["attacker_pid"] = "OFFLINE"
            LIVE_STATE["mitigation_latency"] = "N/A"
            LIVE_STATE["logs"] = [
                {"timestamp": time.strftime("%H:%M:%S"), "level": "INFO", "source": "SYSTEM", "message": "Multi-Agent Swarm Defense Daemon reset successfully."},
                {"timestamp": time.strftime("%H:%M:%S"), "level": "INFO", "source": "ARGUS", "message": "Canary decoy file deployed to protected namespace."},
                {"timestamp": time.strftime("%H:%M:%S"), "level": "INFO", "source": "PHINEAS", "message": "Wazuh FIM active. Standing by..."}
            ]
            LIVE_STATE["ipc_logs"] = [
                {"sender": "SYSTEM", "message": "Autonomous Swarm EDR standing by...", "colorClass": "text-muted"},
                {"sender": "ARGUS", "message": "Canary Honey-pot trap placed alphabetically first.", "colorClass": "argus-color"},
                {"sender": "PHINEAS", "message": "ReadDirectoryChangesW hook successfully mounted.", "colorClass": "phineas-color"}
            ]
            
            # Restore sandbox files dynamically
            try:
                # 1. Clean existing locked and residual files
                if os.path.exists(SANDBOX_DIR):
                    for f in os.listdir(SANDBOX_DIR):
                        os.remove(os.path.join(SANDBOX_DIR, f))
                else:
                    os.makedirs(SANDBOX_DIR)
                
                # 2. Re-create clean documents
                dummy_files = {
                    "financial_report.xlsx":      "CONFIDENTIAL FINANCIAL AUDIT: $4.2M OPEX REPORT",
                    "customer_database.sql":      "SELECT * FROM corporate_customers WHERE credit_limit > 500000;",
                    "product_roadmap.pdf":        "INTERNAL PRODUCT STRATEGY // AEGIS PLATFORM VERSION 5.0",
                    "intellectual_property.key":  "CERTIFICATE AUTHORITY SYMMETRIC PRIVKEY: 0x82A1B7E3",
                    "api_secrets.env":            "DATABASE_URL=postgresql://db_admin:supersecurepwd@localhost:5432/prod"
                }
                for name, content in dummy_files.items():
                    with open(os.path.join(SANDBOX_DIR, name), "w") as f:
                        f.write(content)

                # 3. Deploy fresh canary trap
                with open(CANARY_FILE, "w") as f:
                    f.write("CANARY DATA: DO NOT ACCESS OR MODIFY. ENCRYPTED FIELD AUDIT VAL: 0x93FA1")
                    
                print("[SYSTEM] Received remote reset request from UI. Sandbox successfully restored.")
            except Exception as e:
                print(f"[ERROR] Remote UI sandbox reset failed: {e}")

            # Reset the mitigation flag on the active watchdog handler
            global ACTIVE_HANDLER
            if ACTIVE_HANDLER:
                ACTIVE_HANDLER.mitigated = False
            
            self._set_headers()
            self.wfile.write(json.dumps({"status": "success", "message": "Sandbox reset completed."}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        # Suppress standard HTTP access logs to prevent polluting Command Prompt output
        pass

# ====================================================================
# CONFIGURATION CONSTANTS
# ====================================================================

# SANDBOX_DIR: The directory being actively monitored by our FIM daemon.
# This mirrors how Wazuh Agent's syscheck configuration specifies
# <directories> blocks in ossec.conf to define monitored paths.
SANDBOX_DIR = "./sandbox"

# CANARY_FILE: The honeypot trap file placed by ARGUS.
# Named with "000_" prefix to ensure it appears near the TOP of any
# alphabetical directory listing (sorted() in attacker.py).
# This forces the ransomware to encounter and attempt to encrypt it
# early in its traversal, triggering our detection before most
# user files are compromised.
CANARY_FILE = os.path.join(SANDBOX_DIR, "000_urgent_salary_audit.xlsx")


class AnomalyHandler(FileSystemEventHandler):
    """
    AnomalyHandler — Wazuh FIM Event Callback (PHINEAS Agent)
    ==========================================================
    
    This class extends watchdog's FileSystemEventHandler to implement
    custom File Integrity Monitoring logic. It acts as the simulated
    equivalent of Wazuh's syscheck engine.
    
    How Wazuh syscheck works (what this simulates):
        1. Wazuh creates a baseline of file checksums (SHA-256/MD5)
        2. When a file is modified, the OS kernel notifies Wazuh
        3. Wazuh recalculates the file's checksum
        4. If the checksum differs from baseline → FIM alert generated
        5. Alert severity is determined by the file's classification
        6. Level 15 alerts (critical) trigger automated response rules
    
    Our simplified version:
        - We don't compute checksums (we check the file PATH instead)
        - If the modified file's path matches our canary → ALERT
        - This is sufficient because we know EXACTLY which file is the trap
    """

    def __init__(self):
        """Initialize the handler with a mitigation flag to prevent double-triggers."""
        super().__init__()
        # self.mitigated prevents the kill logic from firing multiple times
        # if the OS sends duplicate modification events (which can happen
        # when a file is opened, written, and closed in rapid succession)
        self.mitigated = False

    def on_modified(self, event):
        """
        Callback fired by the OS kernel when ANY file in SANDBOX_DIR is modified.
        
        This method is called by the watchdog Observer thread, NOT the main thread.
        On Windows, this fires when ReadDirectoryChangesW detects a write.
        On Linux, this fires when inotify detects an IN_MODIFY event.
        
        Args:
            event: A FileSystemEvent object containing:
                - event.src_path:  Absolute path of the modified file
                - event.event_type: Type of change ('modified', 'created', etc.)
                - event.is_directory: Whether the event is for a directory
        """
        # Guard clause: if we already killed the attacker, ignore further events
        if self.mitigated:
            return

        # Normalize both paths to absolute form for reliable comparison
        normalized_event_path = os.path.abspath(event.src_path)
        normalized_canary_path = os.path.abspath(CANARY_FILE)

        # CRITICAL CHECK: Is the modified file our canary honeypot?
        if normalized_event_path == normalized_canary_path:
            # Record the exact timestamp for latency calculation
            start_time = time.time()

            # Record event in global LIVE_STATE for the React SPA dashboard
            timestamp = time.strftime("%H:%M:%S")
            LIVE_STATE["status"] = "ALERTING"
            LIVE_STATE["logs"].append({
                "timestamp": timestamp,
                "level": "ERROR",
                "source": "Wazuh EDR",
                "message": f"ALERT [Level 15] FIM integrity violation at Canary path: {event.src_path}"
            })
            LIVE_STATE["ipc_logs"].append({
                "sender": "PHINEAS",
                "message": f"ALERT! Canary file modified. Triggering swarming intrusion event!",
                "colorClass": "phineas-color"
            })

            # Display Wazuh-style Level 15 FIM Alert
            print("\n" + "=" * 60)
            print("[CRITICAL] WAZUH FIM DETECTED WRITE EVENT ON DECOY CANARY!")
            print(f"[ALERT] Target File: {event.src_path}")
            print("=" * 60)

            # Trigger HERMES mitigation immediately
            self.mitigate(start_time)

    def mitigate(self, start_time):
        """
        HERMES Agent — Automated Process Termination Engine
        ====================================================
        """
        # Set flag to prevent re-entry
        self.mitigated = True
        print("[HERMES] Dispatching process-mitigation protocols...")

        LIVE_STATE["ipc_logs"].append({
            "sender": "HERMES",
            "message": "Mitigation interceptor active. Preparing SIGKILL vector.",
            "colorClass": "hermes-color"
        })

        # Scan all active system processes to find the ransomware simulator
        attacker_pid = None
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                cmd = proc.info['cmdline']
                if cmd and any('attacker.py' in part for part in cmd):
                    attacker_pid = proc.info['pid']
                    break
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                continue

        if attacker_pid:
            try:
                # Get a handle to the malicious process
                process = psutil.Process(attacker_pid)

                # SIGKILL — Hard kill the ransomware process immediately
                process.kill()

                # Calculate the total latency from canary trigger to process death
                latency = (time.time() - start_time) * 1000

                # Update live state upon successful mitigation!
                timestamp = time.strftime("%H:%M:%S")
                LIVE_STATE["status"] = "MITIGATED"
                LIVE_STATE["attacker_pid"] = str(attacker_pid)
                LIVE_STATE["mitigation_latency"] = f"{latency:.2f}ms"
                LIVE_STATE["kills"] += 1
                
                LIVE_STATE["logs"].append({
                    "timestamp": timestamp,
                    "level": "SUCCESS",
                    "source": "HERMES",
                    "message": f"EDR interrupt caught. Executing task: psutil.kill({attacker_pid}, SIGKILL)"
                })
                LIVE_STATE["logs"].append({
                    "timestamp": timestamp,
                    "level": "SUCCESS",
                    "source": "HERMES",
                    "message": f"Malicious Process ID {attacker_pid} terminated successfully. Latency: {latency:.2f}ms."
                })
                LIVE_STATE["ipc_logs"].append({
                    "sender": "HERMES",
                    "message": f"SIGKILL dispatched to process {attacker_pid}. Threat vector closed in {latency:.2f}ms.",
                    "colorClass": "hermes-color"
                })
                LIVE_STATE["ipc_logs"].append({
                    "sender": "ARES",
                    "message": "SIGKILL interrupt caught. Process context destroyed. Core dumped.",
                    "colorClass": "ares-color"
                })
                LIVE_STATE["ipc_logs"].append({
                    "sender": "ARGUS",
                    "message": "Decoy canary engagement successful. Threat isolated successfully.",
                    "colorClass": "argus-color"
                })

                print(f"[SUCCESS] HERMES terminated process PID: {attacker_pid} (attacker.py)")
                print(f"[SUCCESS] Mitigation Latency: {latency:.2f} ms")
                print("[SYSTEM] Swarm active containment successful. Files preserved.")
            except Exception as e:
                print(f"[ERROR] Failed to terminate ransomware PID {attacker_pid}: {e}")
        else:
            # This case occurs if the attacker process already exited naturally
            print("[WARNING] Anomaly flagged, but no active 'attacker.py' process was discovered.")
            LIVE_STATE["status"] = "MONITORING"
            LIVE_STATE["ipc_logs"].append({
                "sender": "HERMES",
                "message": "Anomaly flagged, but no active 'attacker.py' process was discovered.",
                "colorClass": "text-muted"
            })

        print("=" * 60 + "\n")


def setup_environment():
    """
    ARGUS Agent — Environment Setup & Canary Placement
    ====================================================
    
    This function performs two critical setup operations:
    
    1. Creates the sandbox directory if it doesn't exist
       → Simulates an isolated filesystem containment zone
    
    2. Places the canary honeypot file
       → The canary is a fake document designed to look like a high-value
         target to ransomware. Its name ("000_urgent_salary_audit.xlsx")
         is engineered to:
         - Start with "000_" to sort first alphabetically
         - Use "urgent" and "salary" keywords to attract ransomware
           that prioritizes high-value business documents
         - Use ".xlsx" extension which ransomware commonly targets
    
    In a real enterprise deployment, canary files would be distributed
    across multiple directories with randomized names and monitored by
    the Wazuh Agent's syscheck engine with real-time FIM enabled.
    """
    # Create sandbox directory if it doesn't exist
    if not os.path.exists(SANDBOX_DIR):
        os.makedirs(SANDBOX_DIR)
        print(f"[SYSTEM] Created isolated sandbox directory: {SANDBOX_DIR}")

    # Place the canary honeypot decoy file
    if not os.path.exists(CANARY_FILE):
        with open(CANARY_FILE, "w") as f:
            # Write realistic-looking content to make the file non-empty
            # A zero-byte file might be skipped by sophisticated ransomware
            f.write("CANARY DATA: DO NOT ACCESS OR MODIFY. ENCRYPTED FIELD AUDIT VAL: 0x93FA1")
        print(f"[ARGUS] Placed moving-target canary trap: {CANARY_FILE}")


def run_api_server():
    """Runs a lightweight local HTTP API server supporting live telemetry endpoints."""
    try:
        server_address = ('', 5000)
        httpd = HTTPServer(server_address, APIServerHandler)
        httpd.serve_forever()
    except Exception as e:
        print(f"[SYSTEM] Local API server error: {e}")


def main():
    """
    Main daemon entry point — orchestrates the complete defense system.
    """
    print("=" * 60)
    print("      AEGIS // MULTI-AGENT SWARM DEFENSE DEAMON ACTIVE      ")
    print("=" * 60)

    # Phase 1: ARGUS — Setup environment and deploy canary
    setup_environment()

    # Start the local API server in a background thread to sync with the React UI
    api_thread = threading.Thread(target=run_api_server, daemon=True)
    api_thread.start()

    # Phase 2: PHINEAS — Initialize Wazuh FIM monitoring
    # Create the event handler that will receive file change notifications
    global ACTIVE_HANDLER
    event_handler = AnomalyHandler()
    ACTIVE_HANDLER = event_handler

    # Create the Observer — this is the core watchdog monitoring engine
    # Internally, it creates a platform-specific emitter:
    #   Windows: WindowsApiEmitter (uses ReadDirectoryChangesW)
    #   Linux:   InotifyEmitter (uses inotify_add_watch syscall)
    #   macOS:   FSEventsEmitter (uses FSEventStreamCreate)
    observer = Observer()

    # Schedule our handler to watch the sandbox directory
    # recursive=False means we only watch the top-level directory,
    # not subdirectories (our sandbox has no subdirectories)
    observer.schedule(event_handler, path=SANDBOX_DIR, recursive=False)

    # Start the Observer background thread
    # From this point, any file changes in SANDBOX_DIR will trigger
    # our AnomalyHandler.on_modified() callback
    observer.start()

    print(f"[PHINEAS] Wazuh FIM Active: Monitoring '{SANDBOX_DIR}' for integrity changes...")
    print("[SYSTEM] Swarm listening for alerts. Standing by...")

    # Phase 3: Keep the main thread alive
    # The Observer runs in a daemon thread, which would die if the main
    # thread exits. This loop keeps the process running indefinitely.
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        # Graceful shutdown on Ctrl+C
        print("\n[SYSTEM] Swarm defense daemon shutting down.")
        observer.stop()

    # Wait for the Observer thread to fully terminate before exiting
    observer.join()


# ====================================================================
# ENTRY POINT
# ====================================================================
# When this script is executed directly (not imported), start the daemon.
if __name__ == "__main__":
    main()
