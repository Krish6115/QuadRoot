# Code Comments — Annotated Source Reference
### AEGIS // Ransomware Behaviour Simulation & Canary File Detection System
**Team QuadRoot** | Problem Statement #24 | FoSC 23CSE313 Hackathon

---

## Table of Contents

1. [Document Purpose](#1-document-purpose)
2. [Project File Map](#2-project-file-map)
3. [File 1 — `attacker.py` (Ransomware Simulator)](#3-file-1--attackerpy-ransomware-simulator)
4. [File 2 — `defense.py` (Multi-Agent Swarm Defense Daemon)](#4-file-2--defensepy-multi-agent-swarm-defense-daemon)
5. [File 3 — `App.jsx` (React Dashboard & Simulation Engine)](#5-file-3--appjsx-react-dashboard--simulation-engine)
6. [File 4 — `index.css` (Cybersecurity Design System)](#6-file-4--indexcss-cybersecurity-design-system)
7. [File 5 — `main.jsx` (React DOM Entry Point)](#7-file-5--mainjsx-react-dom-entry-point)
8. [File 6 — `index.html` (Vite HTML Shell)](#8-file-6--indexhtml-vite-html-shell)
9. [File 7 — `Dockerfile` (Container Build Instructions)](#9-file-7--dockerfile-container-build-instructions)
10. [File 8 — `docker-compose.yml` (Container Orchestration)](#10-file-8--docker-composeyml-container-orchestration)
11. [Key Design Decisions Explained](#11-key-design-decisions-explained)
12. [Glossary of Technical Terms](#12-glossary-of-technical-terms)

---

## 1. Document Purpose

This document provides a **comprehensive, line-by-line code commentary** for every source file in the AEGIS project. It is designed for:

- **Viva / Project Evaluation:** Professors can verify the student understands every line of code
- **Non-Technical Readers:** Each code block includes a plain-English explanation
- **Self-Study:** Students can use this as a learning guide for Python cryptography, OS-level monitoring, and React state management

---

## 2. Project File Map

```
cyber/
├── python_implementation/           ← Python Backend (Active EDR)
│   ├── attacker.py                  ← [FILE 1] Ransomware simulator
│   ├── defense.py                   ← [FILE 2] Swarm defense daemon
│   ├── Dockerfile                   ← [FILE 7] Container build
│   ├── docker-compose.yml           ← [FILE 8] Container orchestration
│   └── sandbox/                     ← Virtual filesystem (attack target)
├── src/                             ← React Frontend (Visual Dashboard)
│   ├── App.jsx                      ← [FILE 3] Main simulation engine
│   ├── index.css                    ← [FILE 4] Design system
│   ├── main.jsx                     ← [FILE 5] React DOM entry point
│   └── App.css                      ← Cleared boilerplate (not used)
├── index.html                       ← [FILE 6] Vite HTML shell
└── package.json                     ← Node.js dependency manifest
```

---

## 3. File 1 — `attacker.py` (Ransomware Simulator)

**Role:** This is the **offensive / red-team** component. It simulates a real ransomware binary that enumerates, reads, encrypts, and destroys user documents.

**Mapped Tool:** Atomic Red Team — Test Case T1486 (Data Encrypted for Impact)

### 3.1 Imports — What Each Library Does

```python
import os       # os — Standard library for filesystem operations (listdir, remove, path)
import time     # time — Used to introduce sleep delays between encryptions for visibility
import base64   # base64 — Available for encoding operations (imported for extensibility)
```

| Import | Why We Need It |
|--------|---------------|
| `os` | Used to list directory contents (`os.listdir`), check if files exist (`os.path.exists`), join paths (`os.path.join`), and delete originals (`os.remove`) |
| `time` | Inserts 1-second delay between encryptions so humans can observe the attack during presentation |
| `base64` | Available for future encoding needs (not actively used in current version) |

```python
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
```

**Why `hazmat`?** The `cryptography` library has two layers:
- **High-level (Fernet):** Simple encrypt/decrypt with automatic key management
- **Low-level (`hazmat`):** Direct access to primitives like AES, RSA, HMAC

We use `hazmat` because ransomware uses **raw AES-CBC**, not a convenience wrapper. This gives us direct control over:
- `Cipher` — The encryption engine object
- `algorithms.AES` — Selects the AES block cipher algorithm
- `modes.CBC` — Selects Cipher Block Chaining mode
- `default_backend()` — Uses the system's OpenSSL installation

### 3.2 Configuration Constants

```python
SANDBOX_DIR = "./sandbox"
AES_KEY = b"1234567890123456"  # 16 bytes = AES-128
IV = b"1234567890123456"       # 16 bytes (must match AES block size)
```

| Constant | Purpose | Real-World Equivalent |
|----------|---------|----------------------|
| `SANDBOX_DIR` | Isolated directory the ransomware targets | `C:\Users\victim\Documents` |
| `AES_KEY` | 16-byte symmetric key (128-bit) | In real ransomware: randomly generated per victim, encrypted with attacker's RSA public key |
| `IV` | Initialization vector for CBC mode | In real ransomware: randomly generated per file to ensure unique ciphertext |

**Why 16 bytes?** AES operates on fixed 128-bit (16-byte) blocks. The key length determines the AES variant:
- 16 bytes = AES-128 (our project)
- 24 bytes = AES-192
- 32 bytes = AES-256

### 3.3 `encrypt_data(data)` — AES-128 CBC Encryption Function

```python
def encrypt_data(data):
    # Step 1: Calculate PKCS#7 padding length
    pad_len = 16 - (len(data) % 16)
    
    # Step 2: Append padding bytes (each byte has the value of pad_len)
    padded_data = data + bytes([pad_len] * pad_len)
    
    # Step 3: Create the AES cipher object with our key and IV
    backend = default_backend()
    cipher = Cipher(algorithms.AES(AES_KEY), modes.CBC(IV), backend=backend)
    
    # Step 4: Create an encryptor context and perform the encryption
    encryptor = cipher.encryptor()
    
    # Step 5: Feed padded data through the cipher and finalize
    return encryptor.update(padded_data) + encryptor.finalize()
```

**Step-by-Step Breakdown:**

| Step | What It Does | Why It's Needed |
|------|-------------|-----------------|
| **1** | `pad_len = 16 - (len(data) % 16)` | AES only processes data in exact 16-byte chunks. If data is 25 bytes, we need 7 padding bytes (16 - 25%16 = 7) |
| **2** | `bytes([pad_len] * pad_len)` | PKCS#7 standard: append N bytes, each with value N. So for 7 bytes of padding: `\x07\x07\x07\x07\x07\x07\x07` |
| **3** | `Cipher(algorithms.AES(AES_KEY), modes.CBC(IV), ...)` | Creates the cipher configuration: AES algorithm + CBC mode + our key and IV |
| **4** | `cipher.encryptor()` | Returns an encryptor context object — the actual encryption engine |
| **5** | `.update(data) + .finalize()` | `.update()` feeds data blocks into the cipher. `.finalize()` flushes internal buffers and outputs final ciphertext |

### 3.4 `generate_dummy_files()` — Target File Seeding

```python
def generate_dummy_files():
    if not os.path.exists(SANDBOX_DIR):
        os.makedirs(SANDBOX_DIR)
    
    dummy_files = {
        "financial_report.xlsx":      "CONFIDENTIAL FINANCIAL AUDIT...",
        "customer_database.sql":      "SELECT * FROM corporate_customers...",
        ...
    }
    
    for name, content in dummy_files.items():
        path = os.path.join(SANDBOX_DIR, name)
        if not os.path.exists(path):
            with open(path, "w") as f:
                f.write(content)
```

**Key Design Choices:**
- **`os.makedirs()`** — Creates directory and all parent directories if they don't exist
- **`os.path.exists()` check** — Makes the function **idempotent** (safe to re-run without duplicating files)
- **File types chosen** — `.xlsx`, `.sql`, `.pdf`, `.key`, `.env` are real-world ransomware targets (high-value corporate data)

### 3.5 `run_attack()` — Main Ransomware Loop (T1486)

```python
def run_attack():
    generate_dummy_files()
    
    files = sorted(os.listdir(SANDBOX_DIR))        # T1083: File Discovery
    
    for filename in files:
        if filename.endswith(".locked"):             # Skip already encrypted
            continue
        
        with open(file_path, "rb") as f:             # T1005: Data Collection
            plaintext = f.read()
        
        ciphertext = encrypt_data(plaintext)         # T1486: Encryption
        
        with open(file_path + ".locked", "wb") as f: # Write ciphertext
            f.write(ciphertext)
        
        os.remove(file_path)                         # T1485: Delete original
        
        time.sleep(1.0)                              # Demo delay
```

**MITRE ATT&CK Techniques Mapped:**

| Code Line | MITRE Technique | Description |
|-----------|----------------|-------------|
| `sorted(os.listdir(...))` | T1083 — File and Directory Discovery | Enumerates all files in the target directory |
| `open(file_path, "rb")` | T1005 — Data from Local System | Reads raw bytes of the target file |
| `encrypt_data(plaintext)` | T1486 — Data Encrypted for Impact | AES-128 CBC encryption |
| `os.remove(file_path)` | T1485 — Data Destruction | Deletes the original plaintext file |

**Why `sorted()`?** — Alphabetical traversal is critical. The canary file is named `000_urgent_salary_audit.xlsx` with a `000_` prefix, so it appears early in the sorted list. This ensures the ransomware encounters the trap before reaching most user files.

---

## 4. File 2 — `defense.py` (Multi-Agent Swarm Defense Daemon)

**Role:** This is the **defensive / blue-team** component. It runs as a persistent background daemon implementing three simulated agents: ARGUS, PHINEAS, and HERMES.

**Mapped Tools:** Wazuh Agent (FIM), `watchdog` (OS monitoring), `psutil` (process control)

### 4.1 Imports — Defense Dependencies

```python
import os       # Filesystem operations
import time     # High-resolution timing for latency measurement
import psutil   # Cross-platform process and system utilities

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
```

| Import | Agent Mapping | What It Does |
|--------|---------------|-------------|
| `psutil` | HERMES | Enumerates all running processes, reads their command-line args, and dispatches `kill()` signals |
| `Observer` | PHINEAS | Creates a background thread that hooks into the OS kernel's native file notification API |
| `FileSystemEventHandler` | PHINEAS | Base class we extend to define what happens when a file is modified |

**How `watchdog` Works Under the Hood:**
```
watchdog.Observer (Python)
    │
    ├── Windows: ReadDirectoryChangesW (Win32 API)
    │             └── Kernel notifies on ANY file write in the watched directory
    │
    ├── Linux:   inotify (kernel subsystem)
    │             └── inotify_add_watch() syscall registers the directory
    │
    └── macOS:   FSEvents / kqueue
                  └── FSEventStreamCreate() registers the event stream
```

This is **event-driven** (not polling). The OS kernel pushes notifications to our code. This means:
- **Zero CPU usage** while waiting (no busy loops)
- **Sub-millisecond response time** (OS kernel sends the event immediately)

### 4.2 Configuration Constants

```python
SANDBOX_DIR = "./sandbox"
CANARY_FILE = os.path.join(SANDBOX_DIR, "000_urgent_salary_audit.xlsx")
```

**Canary File Naming Strategy:**
| Naming Element | Purpose |
|----------------|---------|
| `000_` prefix | Forces the file to sort **first** alphabetically via `sorted()` in attacker.py |
| `urgent` keyword | Mimics high-value business documents that ransomware prioritizes |
| `salary` keyword | Financial terms attract automated ransomware file-selection heuristics |
| `.xlsx` extension | Most common ransomware target extension (Excel spreadsheets) |

### 4.3 `class AnomalyHandler(FileSystemEventHandler)` — FIM Event Callback

This class is the **heart of the detection engine**. It simulates what Wazuh Agent's `syscheck` module does.

```python
class AnomalyHandler(FileSystemEventHandler):
    def __init__(self):
        super().__init__()
        self.mitigated = False    # Prevents double-trigger on rapid file events
```

**Why `self.mitigated = False`?**
When a file is modified, the OS may fire multiple events (e.g., `OPEN`, `WRITE`, `CLOSE`). Without this flag, our `mitigate()` function could fire 2-3 times, attempting to kill an already-dead process.

#### `on_modified(self, event)` — Kernel Event Callback

```python
def on_modified(self, event):
    if self.mitigated:                              # Guard: already handled
        return

    normalized_event_path = os.path.abspath(event.src_path)   # Normalize path
    normalized_canary_path = os.path.abspath(CANARY_FILE)     # Normalize canary

    if normalized_event_path == normalized_canary_path:       # Is it the canary?
        start_time = time.time()                              # Record timestamp
        self.mitigate(start_time)                             # DISPATCH KILL
```

**Why `os.path.abspath()`?**
The `watchdog` library might report the path as `./sandbox/000_urgent_salary_audit.xlsx` while our constant uses a relative path. `os.path.abspath()` converts both to their full absolute forms (e.g., `C:\Users\ashwa\...\sandbox\000_urgent_salary_audit.xlsx`) so the comparison works reliably.

### 4.4 `mitigate(self, start_time)` — HERMES Kill Engine

```python
def mitigate(self, start_time):
    self.mitigated = True
    
    # STEP 1: Scan all running processes to find attacker.py
    attacker_pid = None
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            cmd = proc.info['cmdline']
            if cmd and any('attacker.py' in part for part in cmd):
                attacker_pid = proc.info['pid']
                break
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue
    
    # STEP 2: Kill the identified process
    if attacker_pid:
        process = psutil.Process(attacker_pid)
        process.kill()                                   # SIGKILL (TerminateProcess on Windows)
        latency = (time.time() - start_time) * 1000      # Calculate ms latency
```

**Process Enumeration Deep Dive:**

| `psutil` Method | OS-Level Implementation | What It Returns |
|-----------------|------------------------|-----------------|
| `process_iter(['pid', 'name', 'cmdline'])` | Windows: `OpenProcess()` + `NtQueryInformationProcess()` / Linux: reads `/proc/<pid>/cmdline` | Generator yielding Process objects |
| `proc.info['cmdline']` | Reads the full command-line string used to launch the process | `['python', 'attacker.py']` |
| `process.kill()` | Windows: `TerminateProcess()` via `kernel32.dll` / Linux: `kill(pid, SIGKILL)` syscall | Immediate process termination |

**Why `SIGKILL`?**
`SIGKILL` (signal 9) is the most forceful termination signal available:
- **Cannot be caught** by the target process (no signal handlers)
- **Cannot be blocked** (no signal masks)
- **Cannot be ignored** (the kernel enforces it immediately)
- The process is dead before it can encrypt another byte

**Exception Handling:**

| Exception | When It Occurs | Why We Catch It |
|-----------|---------------|-----------------|
| `psutil.NoSuchProcess` | Process terminated between iteration and access | Normal race condition |
| `psutil.AccessDenied` | System process we lack permissions to inspect | Windows services, antivirus |
| `psutil.ZombieProcess` | Process finished but parent hasn't called `wait()` | Linux-specific edge case |

### 4.5 `setup_environment()` — ARGUS Canary Placement

```python
def setup_environment():
    if not os.path.exists(SANDBOX_DIR):
        os.makedirs(SANDBOX_DIR)
    
    if not os.path.exists(CANARY_FILE):
        with open(CANARY_FILE, "w") as f:
            f.write("CANARY DATA: DO NOT ACCESS OR MODIFY. ENCRYPTED FIELD AUDIT VAL: 0x93FA1")
```

**Why non-empty content?** — A zero-byte file might be skipped by sophisticated ransomware that checks `os.path.getsize() > 0` before wasting CPU cycles on encryption.

### 4.6 `main()` — Daemon Lifecycle

```python
def main():
    setup_environment()                              # ARGUS: Place canary
    
    event_handler = AnomalyHandler()                 # Create FIM callback
    observer = Observer()                            # Create watchdog engine
    observer.schedule(event_handler, path=SANDBOX_DIR, recursive=False)
    observer.start()                                 # Start background thread
    
    try:
        while True:
            time.sleep(1)                            # Keep main thread alive
    except KeyboardInterrupt:
        observer.stop()                              # Graceful shutdown
    observer.join()                                  # Wait for thread cleanup
```

**Threading Model:**
```
┌─────────────────────┐        ┌──────────────────────────┐
│    MAIN THREAD      │        │    OBSERVER THREAD       │
│                     │        │    (Daemon Thread)        │
│  setup_environment()│        │                          │
│  observer.start() ──┼───────>│  Register with OS kernel │
│  while True:        │        │  Wait for notifications  │
│    time.sleep(1)    │        │  on_modified() callback  │
│                     │        │  → mitigate() → kill()   │
└─────────────────────┘        └──────────────────────────┘
```

**Why `recursive=False`?** — Our sandbox has no subdirectories. Setting `recursive=True` would create unnecessary overhead by registering watches on non-existent paths.

---

## 5. File 3 — `App.jsx` (React Dashboard & Simulation Engine)

**Role:** The main React component that renders the entire AEGIS dashboard UI and implements the client-side simulation state machine.

### 5.1 SVG Icon Components (Lines 4–94)

```jsx
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" ...>
    <path ... />
  </svg>
);
```

**Why custom SVGs instead of an icon library (FontAwesome, Lucide)?**
- **Zero external dependencies** — No CDN calls or npm packages needed
- **No loading flicker** — Icons render instantly with the page
- **Full control** — Each icon's stroke width, color, and size is configurable via CSS
- **Smaller bundle** — Only the 10 icons we actually use are included

### 5.2 Virtual File System (Lines 96–106)

```jsx
const INITIAL_FILES = [
  { id: 1, name: "financial_report.xlsx", path: "/home/user/documents/...", type: "user", status: "clean" },
  { id: 2, name: "customer_database.sql", ... },
  ...
];
```

| Property | Purpose |
|----------|---------|
| `id` | Unique identifier for React's key prop (prevents rendering bugs) |
| `name` | Display name shown in the file explorer grid |
| `path` | Full simulated Unix path for log messages |
| `type` | `"user"` = real document, `"canary"` = honeypot (injected dynamically) |
| `status` | `"clean"` → `"encrypting"` → `"locked"` OR `"preserved"` |

### 5.3 React State Architecture (Lines 108–151)

```jsx
// Config state
const [architecture, setArchitecture] = useState('swarm');   // 'passive' | 'swarm'
const [simSpeed, setSimSpeed] = useState(300);               // ms delay between steps
const [sensitivity, setSensitivity] = useState('high');      // Canary trigger threshold

// Simulation state
const [files, setFiles] = useState(INITIAL_FILES);
const [agentStates, setAgentStates] = useState({...});

// Log Streams
const [elkLogs, setElkLogs] = useState([]);
const [ipcLogs, setIpcLogs] = useState([]);
```

### 5.4 The Ref Pattern — Solving React's Closure Bug (Lines 139–162)

```jsx
const loopRef = useRef(null);
const filesRef = useRef(files);
const simRunningRef = useRef(simRunning);

useEffect(() => { filesRef.current = files; }, [files]);
useEffect(() => { simRunningRef.current = simRunning; }, [simRunning]);
```

**Why Refs AND State?**

This is the **most critical design pattern** in the entire React codebase. Here's why:

React's `useState` has a **stale closure problem** with `setTimeout`:

```
// THE BUG (without refs):
setTimeout(() => {
  // This callback "captures" the value of `files` at the time setTimeout was CREATED
  // NOT the current value when the timeout fires
  console.log(files);  // ← STALE! Shows old data
}, 1000);
```

**Solution:** Use `useRef` to create a mutable reference that always points to the latest value:
```
// THE FIX (with refs):
setTimeout(() => {
  console.log(filesRef.current);  // ← ALWAYS current
}, 1000);
```

We maintain **both** `useState` (for rendering) and `useRef` (for timeout callbacks), synced via `useEffect`.

### 5.5 Simulation Engine — `runStep()` (Lines 290–458)

This is the **core state machine** that drives the entire simulation:

```
STATE MACHINE TRANSITIONS:
═══════════════════════════

clean ──→ encrypting ──→ locked          (File was encrypted by ARES)
clean ──→ preserved                      (File was saved by HERMES kill)
canary ──→ preserved                     (Canary triggered the defense)

AGENT STATE TRANSITIONS:
════════════════════════

ARES:    IDLE → ACTIVE → TERMINATED
ARGUS:   IDLE → MONITORING → DEPLOYED → COMPLETED
PHINEAS: IDLE → MONITORING → SECURED
HERMES:  IDLE → MONITORING → COMPLETED
```

**Key Logic — Sensitivity-Based Canary Placement (Lines 418–448):**

```jsx
let threshold = 1;                                          // Default: 'high' → 2 files locked
if (sensitivityRef.current === 'medium') threshold = 2;     // 3 files locked before canary
else if (sensitivityRef.current === 'low') threshold = 4;   // 5 files locked before canary
else if (sensitivityRef.current === 'random') threshold = randomThresholdRef.current;

if (architectureRef.current === 'swarm' && index === threshold) {
    // ARGUS injects canary file at position (threshold + 1)
    const splicedFiles = [...latestFiles];
    splicedFiles.splice(threshold + 1, 0, decoyFile);       // Array splice injection
    setFiles(splicedFiles);
}
```

**What each sensitivity level means:**

| Sensitivity | Threshold | Files Locked Before Detection | Files Preserved | Efficiency |
|------------|-----------|-------------------------------|-----------------|------------|
| High | 1 | 2 | 7 | ~78% |
| Medium | 2 | 3 | 6 | ~67% |
| Low | 4 | 5 | 4 | ~44% |
| Random | 1–3 | 2–4 | 5–7 | Varies per run |

This is why **each run can produce different results** — the `random` setting generates a new threshold each time.

---

## 6. File 4 — `index.css` (Cybersecurity Design System)

**Role:** Custom vanilla CSS design system implementing a dark-mode cybersecurity dashboard aesthetic.

### 6.1 CSS Custom Properties (Variables)

```css
:root {
  --bg-primary: #020617;      /* Slate-950 — deepest background */
  --bg-secondary: #0b1329;    /* Deep cyber blue-gray */
  --bg-tertiary: #1c2541;     /* Card backgrounds */
  --border-color: #1e293b;    /* Subtle dark borders */
  
  --text-primary: #f1f5f9;    /* Near-white text */
  --text-secondary: #94a3b8;  /* Muted labels */
  
  --accent-cyan: #22d3ee;     /* Highlights and active elements */
  --accent-emerald: #34d399;  /* Success / preserved files */
  --accent-rose: #f43f5e;     /* Danger / locked files */
  --accent-amber: #f59e0b;    /* Warning / canary files */
}
```

### 6.2 Key CSS Techniques Used

| Technique | CSS Property | Purpose |
|-----------|-------------|---------|
| **Glassmorphism** | `backdrop-filter: blur(12px)` | Semi-transparent card backgrounds |
| **Neon Glow** | `box-shadow: 0 0 20px rgba(34,211,238,0.3)` | Cyberpunk-style glowing borders |
| **Pulse Animation** | `@keyframes pulse { ... }` | Status indicator breathing effect |
| **Smooth Scrollbar** | `::-webkit-scrollbar { ... }` | Custom dark scrollbar in terminals |
| **Grid Layout** | `display: grid; grid-template-columns: ...` | Responsive dashboard layout |
| **CSS Transitions** | `transition: all 0.3s ease` | Smooth hover effects on cards |

---

## 7. File 5 — `main.jsx` (React DOM Entry Point)

```jsx
import { StrictMode } from 'react'            // Enables extra development warnings
import { createRoot } from 'react-dom/client'  // React 18+ concurrent rendering
import './index.css'                           // Load global styles FIRST
import App from './App.jsx'                    // Import main application component

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

| Line | Purpose |
|------|---------|
| `StrictMode` | Enables additional React development checks (double-renders in dev to catch side effects) |
| `createRoot` | React 18+ API for concurrent rendering (replaces legacy `ReactDOM.render()`) |
| `document.getElementById('root')` | Mounts React into the `<div id="root">` element in `index.html` |

---

## 8. File 6 — `index.html` (Vite HTML Shell)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Google Fonts: Three font families for premium typography -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700
          &family=Inter:wght@300;400;500;600;700
          &family=Orbitron:wght@400;500;600;700;800;900&display=swap" 
          rel="stylesheet">
    
    <title>AEGIS // Autonomous Swarm Defense Simulator</title>
  </head>
  <body>
    <div id="root"></div>             <!-- React mounts here -->
    <script type="module" src="/src/main.jsx"></script>  <!-- Vite module entry -->
  </body>
</html>
```

**Fonts Used:**

| Font | Usage | Why |
|------|-------|-----|
| **Orbitron** | Main title, headings | Futuristic geometric font for cybersecurity aesthetic |
| **Inter** | Body text, labels | Clean, highly readable sans-serif |
| **Fira Code** | Terminal logs, monospace data | Monospace with programming ligatures |

**Why `<link rel="preconnect">`?** — Tells the browser to establish TCP connections to Google Fonts servers *before* it discovers the actual font CSS file, reducing total load time by ~100-200ms.

---

## 9. File 7 — `Dockerfile` (Container Build Instructions)

```dockerfile
FROM python:3.11-slim                    # Base image: lightweight Python 3.11

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \                                # C compiler (needed for cryptography)
    python3-dev \                        # Python headers (for C extensions)
    libffi-dev \                         # Foreign Function Interface library
    && rm -rf /var/lib/apt/lists/*       # Clean apt cache (reduce image size)

WORKDIR /app                             # Set working directory inside container

RUN pip install --no-cache-dir \         # Install Python dependencies (no pip cache)
    cryptography \
    watchdog \
    psutil

COPY defense.py /app/defense.py          # Copy defense script into container
COPY attacker.py /app/attacker.py        # Copy attacker script into container

RUN mkdir -p /app/sandbox                # Create isolated sandbox directory

CMD ["python", "defense.py"]             # Default command: run defense daemon
```

| Directive | Purpose |
|-----------|---------|
| `FROM python:3.11-slim` | Uses a minimal Debian-based Python image (~150MB vs ~900MB for full) |
| `--no-install-recommends` | Only install required packages, not suggested extras |
| `rm -rf /var/lib/apt/lists/*` | Removes downloaded package lists to reduce final image size |
| `--no-cache-dir` | Prevents pip from caching downloaded packages inside the container |
| `CMD ["python", "defense.py"]` | When the container starts, it automatically launches the defense daemon |

---

## 10. File 8 — `docker-compose.yml` (Container Orchestration)

```yaml
version: '3.8'

services:
  swarm-defense:
    build: .                             # Build from Dockerfile in current directory
    container_name: aegis-swarm-defense   # Human-readable container name
    volumes:
      - ./sandbox:/app/sandbox           # Bind-mount: sync sandbox between host and container
    tty: true                            # Allocate pseudo-TTY (for colored terminal output)
    stdin_open: true                     # Keep STDIN open (allows docker exec interaction)
    restart: unless-stopped              # Auto-restart on crash (unless manually stopped)
```

| Directive | Purpose |
|-----------|---------|
| `volumes: ./sandbox:/app/sandbox` | **Bind mount** — Changes in the container's sandbox are visible on the host, and vice versa. This lets you inspect encrypted files from your host machine |
| `tty: true` | Allocates a pseudo-terminal so `rich` library formatting and colors render correctly |
| `stdin_open: true` | Allows `docker exec -it` to send input to the container (needed for running attacker.py) |
| `restart: unless-stopped` | If the defense daemon crashes, Docker automatically restarts it. Stops only if you explicitly run `docker stop` |

---

## 11. Key Design Decisions Explained

### Q: Why use `watchdog` instead of polling with `os.listdir()`?
**A:** Polling would require checking the directory every N milliseconds in a loop, wasting CPU and introducing detection latency equal to the polling interval. `watchdog` uses OS kernel hooks (inotify/ReadDirectoryChangesW) for zero-latency, event-driven detection.

### Q: Why `useRef` alongside `useState` in React?
**A:** React's `useState` values are captured by closures in `setTimeout` callbacks. Without refs, the simulation loop would read stale state values, causing files to appear un-encrypted or the loop to process the wrong index.

### Q: Why AES-128 CBC instead of AES-256 GCM?
**A:** CBC is the most commonly used mode in real-world ransomware (WannaCry, NotPetya). GCM provides authenticated encryption (integrity checking), but ransomware doesn't care about data integrity — it only wants to make data unreadable.

### Q: Why name the canary `000_urgent_salary_audit.xlsx`?
**A:** The `000_` prefix ensures alphabetical sort order places it first. `urgent` and `salary` are high-value keywords. `.xlsx` is a top ransomware target extension. This maximizes the probability that the ransomware encounters the trap early.

### Q: Why Docker for the backend?
**A:** Docker provides filesystem isolation. Even if the ransomware script has a bug that targets paths outside `./sandbox/`, the container's filesystem is completely isolated from the host OS. Only the bind-mounted `./sandbox/` directory is shared.

---

## 12. Glossary of Technical Terms

| Term | Definition |
|------|-----------|
| **AES (Advanced Encryption Standard)** | Symmetric block cipher adopted by NIST. Operates on 128-bit blocks with 128/192/256-bit keys |
| **CBC (Cipher Block Chaining)** | AES mode where each plaintext block is XORed with the previous ciphertext block before encryption |
| **IV (Initialization Vector)** | Random value used as the "first previous block" in CBC mode to ensure unique ciphertext |
| **PKCS#7** | Padding standard that appends N bytes of value N to align data to block boundaries |
| **FIM (File Integrity Monitoring)** | Security control that detects unauthorized changes to files by comparing checksums against baselines |
| **SIGKILL** | Unix signal 9 — forces immediate process termination at the kernel level (cannot be caught or ignored) |
| **PID (Process ID)** | Unique integer assigned by the OS to each running process |
| **Canary File** | Honeypot decoy designed to look like a real document but actually serves as a detection tripwire |
| **SOAR** | Security Orchestration, Automation, and Response — platforms that automate incident response playbooks |
| **EDR (Endpoint Detection and Response)** | Security software that continuously monitors endpoints for threat detection and response |
| **inotify** | Linux kernel subsystem that monitors filesystem events (creation, modification, deletion) |
| **ReadDirectoryChangesW** | Windows API that monitors a directory for file change notifications |
| **useRef (React)** | React hook that creates a mutable reference object persisting across re-renders, not captured by closures |
| **useState (React)** | React hook that declares a reactive state variable — changes trigger component re-rendering |
| **Bind Mount (Docker)** | Maps a host directory into a container, allowing shared access to the same files |
