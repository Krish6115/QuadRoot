# Setup Documentation
### AEGIS // Ransomware Behaviour Simulation & Canary File Detection System
**Team QuadRoot** | Problem Statement #24 | FoSC 23CSE313 Hackathon

---

## Table of Contents

1. [System Requirements](#1-system-requirements)
2. [Pre-Installation Checklist](#2-pre-installation-checklist)
3. [Step 1 — Clone the Repository](#3-step-1--clone-the-repository)
4. [Step 2 — React Dashboard Setup](#4-step-2--react-dashboard-setup)
5. [Step 3 — Python Backend Setup](#5-step-3--python-backend-setup)
6. [Step 4 — Wazuh Agent Installation](#6-step-4--wazuh-agent-installation)
7. [Step 5 — Docker Setup (Optional)](#7-step-5--docker-setup-optional)
8. [Running the Complete System](#8-running-the-complete-system)
9. [Execution Order Summary](#9-execution-order-summary)
10. [Troubleshooting Guide](#10-troubleshooting-guide)
11. [Uninstallation & Cleanup](#11-uninstallation--cleanup)

---

## 1. System Requirements

| Component | Minimum Requirement |
|-----------|-------------------|
| **Operating System** | Windows 10/11 (recommended), Linux (Ubuntu 20.04+), macOS 12+ |
| **Python** | 3.10 or higher (3.11 recommended) |
| **Node.js** | 18.0 or higher (for React dashboard) |
| **npm** | 9.0 or higher (bundled with Node.js) |
| **RAM** | 4 GB minimum (8 GB recommended) |
| **Disk Space** | 500 MB free (includes `node_modules` and virtual environment) |
| **Docker** | Docker Desktop 4.x (optional, for containerized execution) |
| **IDE** | VS Code / Cursor IDE (recommended) |

---

## 2. Pre-Installation Checklist

Before proceeding, verify these tools are accessible from your terminal:

### Windows (PowerShell)
```powershell
# Verify Python installation
python --version
# Expected: Python 3.11.x

# Verify Node.js installation
node --version
# Expected: v18.x.x or higher

# Verify npm
npm --version
# Expected: 9.x.x or higher

# Verify pip
pip --version
# Expected: pip 23.x or higher
```

### Linux / macOS (Terminal)
```bash
python3 --version
node --version
npm --version
pip3 --version
```

> **If Python is not installed:** Download from [python.org](https://www.python.org/downloads/).  
> During Windows installation, **check "Add Python to PATH"** — this is critical.
>
> **If Node.js is not installed:** Download from [nodejs.org](https://nodejs.org/en/download).

---

## 3. Step 1 — Clone the Repository

### Using Git
```bash
git clone https://github.com/Krish6115/QuadRoot.git
cd QuadRoot
```

### Using GitHub Desktop
1. Open GitHub Desktop
2. Click **File → Clone Repository**
3. Paste URL: `https://github.com/Krish6115/QuadRoot`
4. Choose local path and click **Clone**

### Manual Download
1. Navigate to `https://github.com/Krish6115/QuadRoot`
2. Click the green **Code** button → **Download ZIP**
3. Extract the ZIP to `C:\Users\<YourUser>\Desktop\cyber`

---

## 4. Step 2 — React Dashboard Setup

The React dashboard provides the visual simulation interface at `http://localhost:5173/`.

### 4.1 Install Node.js Dependencies

Open a terminal in the project root directory:

```powershell
# Navigate to project root
cd c:\Users\ashwa\OneDrive\Desktop\cyber

# Install all frontend dependencies (React, Vite, ESLint, etc.)
npm install
```

**What this command does:**
- Reads `package.json` to identify required packages
- Downloads React 19, Vite 8, and related build tools into `node_modules/`
- Generates `package-lock.json` for deterministic builds

**Expected output:**
```
added 135 packages, and audited 136 packages in 45s
found 0 vulnerabilities
```

### 4.2 Start the Development Server

```powershell
npm run dev
```

**Expected output:**
```
  VITE v8.0.14  ready in 333 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your browser and navigate to **http://localhost:5173/** to view the AEGIS dashboard.

> **Note:** Keep this terminal open. The Vite server must remain running while you use the dashboard.

---

## 5. Step 3 — Python Backend Setup

The Python backend contains the actual ransomware simulator and active defense daemon.

### 5.1 Create a Virtual Environment

A virtual environment (`venv`) isolates Python dependencies from your system-wide packages, preventing version conflicts.

#### Windows (PowerShell)
```powershell
cd c:\Users\ashwa\OneDrive\Desktop\cyber\python_implementation

# Create the virtual environment
python -m venv venv

# Allow script execution (required on some Windows setups)
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# Activate the virtual environment
.\venv\Scripts\Activate.ps1
```

#### Linux / macOS
```bash
cd python_implementation

python3 -m venv venv
source venv/bin/activate
```

**How to verify activation:**
Your terminal prompt should now show `(venv)` as a prefix:
```
(venv) PS C:\Users\ashwa\OneDrive\Desktop\cyber\python_implementation>
```

### 5.2 Install Python Dependencies

With the virtual environment activated, install the required libraries:

```powershell
pip install cryptography watchdog psutil rich
```

**What each package does:**

| Package | Purpose | Version |
|---------|---------|---------|
| `cryptography` | AES-128 CBC symmetric encryption engine | Latest |
| `watchdog` | Cross-platform filesystem event monitoring | Latest |
| `psutil` | Process enumeration and termination | Latest |
| `rich` | Rich terminal UI formatting (colored output, tables) | Latest |

**Expected output:**
```
Successfully installed cffi-1.x.x cryptography-42.x.x psutil-5.x.x
rich-13.x.x watchdog-4.x.x
```

### 5.3 Verify Installation

```powershell
python -c "import cryptography; import watchdog; import psutil; import rich; print('All dependencies verified successfully.')"
```

**Expected output:**
```
All dependencies verified successfully.
```

---

## 6. Step 4 — Wazuh Agent Installation

Wazuh is an enterprise-grade open-source security platform. The Wazuh Agent provides **File Integrity Monitoring (FIM)** that detects unauthorized file changes at the OS kernel level.

### 6.1 Download the Wazuh Agent

1. Navigate to the official Wazuh downloads page:  
   **https://documentation.wazuh.com/current/installation-guide/wazuh-agent/wazuh-agent-package-windows.html**
2. Download the Windows MSI installer: `wazuh-agent-4.14.5-1.msi`

### 6.2 Install the Agent

1. Double-click the downloaded `.msi` file
2. Follow the installation wizard
3. When prompted for the **Wazuh Manager IP**, you may enter `127.0.0.1` (localhost) for local-only monitoring
4. Complete the installation

### 6.3 Configure FIM to Monitor the Sandbox Directory

After installation, edit the Wazuh Agent configuration file:

**File location:** `C:\Program Files (x86)\ossec-agent\ossec.conf`

Add the following block inside the `<syscheck>` section:

```xml
<syscheck>
  <!-- Enable real-time monitoring on our sandbox directory -->
  <directories check_all="yes" realtime="yes">
    C:\Users\ashwa\OneDrive\Desktop\cyber\python_implementation\sandbox
  </directories>
  
  <!-- Monitor frequency in seconds -->
  <frequency>10</frequency>
  
  <!-- Alert on new files -->
  <alert_new_files>yes</alert_new_files>
</syscheck>
```

### 6.4 Start the Wazuh Agent Service

```powershell
# Start the Wazuh Agent Windows service
net start WazuhSvc

# Verify the service is running
Get-Service WazuhSvc
```

**Expected output:**
```
Status   Name          DisplayName
------   ----          -----------
Running  WazuhSvc      Wazuh Agent
```

### 6.5 Verify FIM Monitoring

The Wazuh Agent logs are stored at:
```
C:\Program Files (x86)\ossec-agent\logs\ossec.log
```

You can tail the log to see FIM events:
```powershell
Get-Content "C:\Program Files (x86)\ossec-agent\logs\ossec.log" -Tail 20 -Wait
```

> **Note:** The Wazuh Agent provides an additional enterprise-grade monitoring layer alongside our Python `watchdog` daemon. Both operate independently to provide defense-in-depth.

---

## 7. Step 5 — Docker Setup (Optional)

Docker provides an isolated container environment so the ransomware simulator cannot accidentally affect your real files.

### 7.1 Install Docker Desktop

1. Download Docker Desktop from: **https://www.docker.com/products/docker-desktop**
2. Install and restart your machine
3. Verify installation:
```powershell
docker --version
# Expected: Docker version 24.x.x or higher

docker-compose --version
# Expected: docker-compose version 2.x.x
```

### 7.2 Build and Launch the Defense Container

```powershell
cd c:\Users\ashwa\OneDrive\Desktop\cyber\python_implementation

# Build the Docker image and start the container
docker-compose up --build -d
```

**What this command does:**
1. Reads `Dockerfile` — builds a Python 3.11-slim Linux image
2. Installs `cryptography`, `watchdog`, `psutil` inside the container
3. Copies `defense.py` and `attacker.py` into `/app/`
4. Creates an isolated `sandbox/` volume
5. Starts `defense.py` as the default command

### 7.3 Monitor Defense Logs

```powershell
docker logs -f aegis-swarm-defense
```

### 7.4 Launch the Attack Inside the Container

Open a second terminal:
```powershell
docker exec -it aegis-swarm-defense python attacker.py
```

### 7.5 Cleanup Docker Resources

```powershell
docker-compose down
docker rmi aegis-swarm-defense
```

---

## 8. Running the Complete System

### Full Execution Sequence (3 Terminals Required)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ TERMINAL 1: React Dashboard                                             │
│                                                                          │
│  cd c:\Users\ashwa\OneDrive\Desktop\cyber                                │
│  npm run dev                                                             │
│  → Dashboard running at http://localhost:5173/                           │
├──────────────────────────────────────────────────────────────────────────┤
│ TERMINAL 2: Defense Daemon (start this BEFORE the attacker)              │
│                                                                          │
│  cd c:\Users\ashwa\OneDrive\Desktop\cyber\python_implementation          │
│  .\venv\Scripts\Activate.ps1                                             │
│  python defense.py                                                       │
│  → Wazuh FIM monitoring active. Canary placed. Waiting...                │
├──────────────────────────────────────────────────────────────────────────┤
│ TERMINAL 3: Attack Simulator (start this AFTER the defense daemon)       │
│                                                                          │
│  cd c:\Users\ashwa\OneDrive\Desktop\cyber\python_implementation          │
│  .\venv\Scripts\Activate.ps1                                             │
│  python attacker.py                                                      │
│  → AES-128 encryption starts. Canary triggered. Process killed.          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Execution Order Summary

| Step | Action | Terminal | Command |
|------|--------|----------|---------|
| 1 | Start React dashboard | Terminal 1 | `npm run dev` |
| 2 | Activate Python venv | Terminal 2 | `.\venv\Scripts\Activate.ps1` |
| 3 | Start defense daemon | Terminal 2 | `python defense.py` |
| 4 | Activate Python venv | Terminal 3 | `.\venv\Scripts\Activate.ps1` |
| 5 | Launch attack | Terminal 3 | `python attacker.py` |
| 6 | Observe dashboard | Browser | Navigate to `http://localhost:5173/` |

---

## 10. Troubleshooting Guide

### Issue: `npx` or `npm` cannot be loaded (PowerShell execution policy)
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

### Issue: `python` command not found
Ensure Python is added to your system PATH. Re-install Python with **"Add to PATH"** checked.

### Issue: `pip install cryptography` fails with compilation errors
```powershell
pip install --upgrade pip setuptools wheel
pip install cryptography
```

### Issue: Wazuh Agent service fails to start
```powershell
# Check Wazuh logs for errors
Get-Content "C:\Program Files (x86)\ossec-agent\logs\ossec.log" -Tail 50
```

### Issue: Port 5173 already in use
```powershell
# Find and kill the process using port 5173
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

### Issue: Docker build fails
```powershell
# Ensure Docker Desktop is running
docker info
# Retry with clean build cache
docker-compose build --no-cache
```

---

## 11. Uninstallation & Cleanup

### Remove Python Virtual Environment
```powershell
deactivate
Remove-Item -Recurse -Force .\venv
```

### Remove Node Modules
```powershell
Remove-Item -Recurse -Force .\node_modules
```

### Remove Docker Containers and Images
```powershell
docker-compose down --rmi all --volumes
```

### Uninstall Wazuh Agent
```powershell
msiexec /x wazuh-agent-4.14.5-1.msi /qn
```

### Clean Sandbox Files
```powershell
Remove-Item -Recurse -Force .\python_implementation\sandbox\*
```
