<p align="center">
  <img src="https://img.shields.io/badge/MITRE%20ATT%26CK-T1486-red?style=for-the-badge" alt="MITRE ATT&CK T1486"/>
  <img src="https://img.shields.io/badge/Python-3.11+-blue?style=for-the-badge&logo=python" alt="Python 3.11+"/>
  <img src="https://img.shields.io/badge/React-Vite-purple?style=for-the-badge&logo=react" alt="React + Vite"/>
  <img src="https://img.shields.io/badge/Wazuh-FIM-orange?style=for-the-badge" alt="Wazuh FIM"/>
  <img src="https://img.shields.io/badge/Docker-Supported-2496ED?style=for-the-badge&logo=docker" alt="Docker"/>
</p>

# AEGIS // Ransomware Behaviour Simulation & Canary File Detection System

> **Problem Statement #24** — FoSC 23CSE313 Hackathon  
> **Team:** QuadRoot  
> **Architecture:** On-Premises / Hybrid  
> **MITRE ATT&CK:** T1486 — Data Encrypted for Impact

---

## Overview

Traditional antivirus software relies on **signature-based detection** — it only catches malware it has seen before. This project demonstrates a fundamentally different approach: **behavioural detection using canary file deception and real-time file integrity monitoring**.

The system consists of two tightly integrated layers:

| Layer | Description | Technology |
|-------|-------------|------------|
| **Offensive Simulation** | AES-128 ransomware simulator that enumerates and encrypts files sequentially | Python, `cryptography` |
| **Active Swarm Defense** | Multi-agent defense system with canary placement, FIM monitoring, and automated process termination | Python `watchdog`, `psutil`, Wazuh Agent |
| **Visual Dashboard** | Real-time cybersecurity telemetry dashboard with agent HUD, file explorer, and dual terminal streams | React, Vite, Vanilla CSS |

---

## Key Features

- **Real AES-128 CBC Encryption** — Not mock strings; actual cryptographic block cipher operations via Python `cryptography`
- **Canary Honeypot Deception** — Dynamically placed decoy files (`000_urgent_salary_audit.xlsx`) that act as tripwires
- **Event-Driven FIM** — Uses OS kernel APIs (`ReadDirectoryChangesW` on Windows / `inotify` on Linux) via `watchdog` for zero-latency file change detection
- **Automated Process Kill** — `psutil` scans active process tables and dispatches `SIGKILL` to terminate the ransomware PID in under 5ms
- **Wazuh Agent Integration** — Enterprise-grade File Integrity Monitoring validates the defense pipeline against industry standards
- **Docker Isolation** — Full `Dockerfile` and `docker-compose.yml` for safe, containerized execution
- **Passive vs Active Comparison** — Toggle between log-only passive EDR (100% data loss) and active swarm defense (~89% data preserved)
- **Configurable Sensitivity** — Adjustable deception trigger policies (High / Medium / Low / Random) producing different outcomes each run

---

## Project Structure

```
cyber/
├── src/                          # React Frontend (Visual Dashboard)
│   ├── App.jsx                   # Main simulation engine & multi-agent state machine
│   ├── index.css                 # Cybersecurity dark-mode design system
│   └── main.jsx                  # React DOM entry point
├── python_implementation/        # Python Backend (Active EDR)
│   ├── attacker.py               # T1486 ransomware simulator (AES-128 CBC)
│   ├── defense.py                # Wazuh FIM daemon + canary monitor + process killer
│   ├── Dockerfile                # Containerized sandbox environment
│   ├── docker-compose.yml        # One-command Docker orchestration
│   └── sandbox/                  # Isolated virtual filesystem (attack target)
├── index.html                    # Vite entry with Google Fonts
├── package.json                  # Node.js dependencies
├── PROJECT_DOCUMENTATION.md      # Full 14-section technical documentation
├── SETUP_DOCUMENTATION.md        # Step-by-step installation guide
└── THREAT_MODEL.md               # Formal threat model write-up
```

---

## Quick Start

### Option A: Run Everything Locally

```bash
# 1. Clone the repository
git clone https://github.com/Krish6115/QuadRoot.git
cd QuadRoot

# 2. Install & start the React dashboard
npm install
npm run dev
# Dashboard available at http://localhost:5173/

# 3. Setup Python backend (new terminal)
cd python_implementation
python -m venv venv
.\venv\Scripts\Activate.ps1          # Windows
# source venv/bin/activate           # Linux/macOS
pip install cryptography watchdog psutil rich

# 4. Start the defense daemon
python defense.py

# 5. Launch the attack (another terminal)
python attacker.py
```

### Option B: Run Backend in Docker

```bash
cd python_implementation
docker-compose up --build -d
docker logs -f aegis-swarm-defense          # Watch defense logs
docker exec -it aegis-swarm-defense python attacker.py   # Launch attack
```

---

## Multi-Agent Architecture

| Agent | Role | Color | Mapped Tool |
|-------|------|-------|-------------|
| **ARES** | Red-Team Attacker | 🔴 Rose | Atomic Red Team (T1486) |
| **ARGUS** | Moving Target Deception | 🟡 Amber | Canary Honeypot Placement |
| **PHINEAS** | FIM Auditor | 🔵 Cyan | Wazuh EDR / `watchdog` |
| **HERMES** | Mitigation Engine | 🟢 Emerald | `psutil.kill(SIGKILL)` |

---

## Detection Flow

```
ARES encrypts file[0] ──> ARES encrypts file[1] ──> ARGUS detects IO burst
                                                            │
                                                     Injects canary at file[2]
                                                            │
                                                     ARES touches canary
                                                            │
                                               PHINEAS fires Level 15 FIM Alert
                                                            │
                                               HERMES dispatches SIGKILL (< 5ms)
                                                            │
                                               Files [3..N] → PRESERVED ✅
```

---

## Team Contributions

| Member | Responsibility |
|--------|---------------|
| **Person 1** | Ransomware simulator + AES encryption pipeline |
| **Person 2** | Canary file placement strategy + monitoring daemon |
| **Person 3** | Process kill + alert mechanism + recovery measurement |
| **Person 4** | Analytics dashboard + logging architecture + documentation |

---

## Tech Stack

| Category | Tools |
|----------|-------|
| **Language** | Python 3.11+, JavaScript (ES6+) |
| **Cryptography** | `cryptography` (AES-128 CBC), HMAC-SHA256 |
| **File Monitoring** | `watchdog`, `inotify` / `ReadDirectoryChangesW` |
| **Process Control** | `psutil` |
| **EDR Platform** | Wazuh Agent 4.14.5 (File Integrity Monitoring) |
| **Frontend** | React 19, Vite 8, Vanilla CSS |
| **Containerisation** | Docker, docker-compose |
| **Terminal UI** | Rich (Python) |

---

## License

This project is developed for academic evaluation under the FoSC 23CSE313 Cybersecurity Hackathon.  
For educational and research purposes only. **Do not use the ransomware simulator on production systems.**
