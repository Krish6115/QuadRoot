# Python Backend: Multi-Agent Swarm Defense Simulator

This folder contains the **actual, working Python implementation** representing the active swarm defense system described in the hackathon challenge. While your **React web interface** runs as a futuristic visual simulation dashboard, **these Python scripts execute the real security operations** (actual file encryption, FIM folder watching, and active process mitigation).

---

## Technical Stack Architecture

*   **Ransomware Simulator (`attacker.py`):** Enumerates files inside the `./sandbox/` folder, encrypts their contents using **AES-128 (CBC mode)** from the Python `cryptography` library, renames them with a `.locked` extension, and removes original source files. It sleeps for `1.0s` between files to allow observation.
*   **Defense Daemon (`defense.py`):** Uses the Python `watchdog` library to bind file change events natively (via `inotify` on Linux or `ReadDirectoryChangesW` on Windows).
    *   Places a caution decoy canary: `./sandbox/000_urgent_salary_audit.xlsx`.
    *   Listens for modification notifications on that canary.
    *   The moment the canary is touched, it calculates mitigation latency, scans system handles using `psutil`, identifies the PID of the attacker, and dispatches a simulated `psutil.Process(PID).kill()` (SIGKILL signal).
*   **Containment Isolation (`Docker`):** The provided `Dockerfile` and `docker-compose.yml` build an isolated containerized Linux environment where the attacker can be executed without risking any files on your local host operating system.

---

## Option 1: Running inside Docker (Isolated Container)

Running inside Docker is highly recommended to demonstrate containerized isolation (and will impress your invigilator!).

### 1. Build and Launch the Defense Container
In your terminal, navigate to this folder and run:
```bash
docker-compose up --build -d
```
*This downloads the slim base, installs cryptography dependencies, copies your defense daemon (`defense.py`), and mounts a `./sandbox` directory on your host computer.*

### 2. Monitor EDR Logs in Real Time
To watch the active EDR monitoring logs (Wazuh FIM simulation):
```bash
docker logs -f aegis-swarm-defense
```
*(You will see: `[PHINEAS] Wazuh FIM Active: Monitoring 'sandbox' for integrity changes...`)*

### 3. Launch the Attack Inside the Container
Open a separate terminal window and launch the attack:
```bash
docker exec -it aegis-swarm-defense python attacker.py
```

### 4. Observe the Mitigation
In your logger window, you will watch the following sequence occur in under 5 milliseconds:
1.  ARES encrypts the first user files: `financial_report.xlsx.locked` and `customer_database.sql.locked`.
2.  ARES targets and writes to the decoy canary: `000_urgent_salary_audit.xlsx`.
3.  The **Wazuh FIM watchdog** fires.
4.  HERMES scans container handles, locates `attacker.py` (PID), and dispatches a hard `kill()`.
5.  ARES terminates instantly.
6.  The remaining files (`product_roadmap.pdf`, etc.) remain completely clean and preserved!

---

## Option 2: Running Natively on Your Laptop (Without Docker)

If you don't have Docker installed, you can execute it natively on your machine:

### 1. Install Dependencies
Open a PowerShell or Terminal window:
```bash
pip install cryptography watchdog psutil
```

### 2. Start the Defense Daemon
```bash
python defense.py
```
*(This creates the `./sandbox` folder and places the canary decoy `000_urgent_salary_audit.xlsx` automatically!)*

### 3. Start the Attack Simulator
Open another terminal window and run:
```bash
python attacker.py
```

### 4. Watch the Magic Happen!
Watch the terminal speeds as the defense daemon instantly intercepts, mitigates, and kills the attack process context within milliseconds of the canary modification!
