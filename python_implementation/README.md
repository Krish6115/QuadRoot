# AEGIS backend (real, no simulation)

```
pip install -r requirements.txt
python defense.py            # daemon + API on 127.0.0.1:5000
# in the repo root:  npm install && npm run dev   -> http://localhost:5173
```
Click **LAUNCH REAL ATTACK** in the dashboard (or run `python attacker.py` yourself).

- `attacker.py` - real AES-128-CBC encryptor (random key/IV), sandbox-confined. Profiles: `standard`, `stealth` (skips canaries).
- `defense.py` - ARGUS (3 canaries + SHA-256 baseline), PHINEAS (watchdog FIM + mass-encryption burst detector), HERMES (psutil attribution + SIGKILL, measured latency). `Passive` mode only logs, so the attack completes - a real A/B comparison.
- Dashboard values (PID, latency, file states, logs) are all read from the daemon via `/api/state`; file states come from disk + hashes.

Verified scenarios: swarm+standard (0/7 user files lost), swarm+stealth (caught by behaviour detector, 3/7 lost), passive (7/7 lost).
