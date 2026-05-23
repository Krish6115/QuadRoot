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

# watchdog — Cross-platform filesystem event monitoring library
# Observer: Background thread that hooks into OS kernel file notification APIs
# FileSystemEventHandler: Base class for defining callbacks on file events
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

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
        # This prevents false negatives from relative vs absolute path mismatches
        # (e.g., "./sandbox/file.xlsx" vs "C:\Users\...\sandbox\file.xlsx")
        normalized_event_path = os.path.abspath(event.src_path)
        normalized_canary_path = os.path.abspath(CANARY_FILE)

        # CRITICAL CHECK: Is the modified file our canary honeypot?
        if normalized_event_path == normalized_canary_path:
            # Record the exact timestamp for latency calculation
            start_time = time.time()

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
        
        This method simulates what an enterprise SOAR (Security Orchestration,
        Automation, and Response) platform does when receiving a critical alert:
        
        1. Enumerate all running processes on the system
        2. Identify the malicious process by matching command-line arguments
        3. Extract its Process ID (PID)
        4. Dispatch a hard SIGKILL signal to immediately terminate it
        5. Calculate and report the total detection-to-kill latency
        
        How psutil.process_iter() works internally:
            - On Linux:  Reads /proc/<pid>/cmdline for each running process
            - On Windows: Calls OpenProcess() + QueryFullProcessImageName() APIs
            - Returns a generator yielding Process objects with requested attributes
        
        How process.kill() works internally:
            - On Linux:  Sends SIGKILL (signal 9) via kill() syscall
            - On Windows: Calls TerminateProcess() via kernel32.dll
            - SIGKILL cannot be caught, blocked, or ignored by the target process
            - The process is terminated immediately at the kernel level
        
        Args:
            start_time (float): The time.time() value when the canary was triggered,
                               used to calculate total mitigation latency in milliseconds
        """
        # Set flag to prevent re-entry
        self.mitigated = True
        print("[HERMES] Dispatching process-mitigation protocols...")

        # Scan all active system processes to find the ransomware simulator
        attacker_pid = None
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                # proc.info['cmdline'] returns a list of command-line arguments
                # Example: ['python', 'attacker.py'] or ['python3', './attacker.py']
                cmd = proc.info['cmdline']
                if cmd and any('attacker.py' in part for part in cmd):
                    attacker_pid = proc.info['pid']
                    break
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                # NoSuchProcess:  Process ended between iteration and access
                # AccessDenied:   System process we don't have permission to read
                # ZombieProcess:  Process has terminated but hasn't been reaped
                continue

        if attacker_pid:
            try:
                # Get a handle to the malicious process
                process = psutil.Process(attacker_pid)

                # SIGKILL — Hard kill the ransomware process immediately
                # This is the most aggressive termination method available.
                # The process receives no chance to clean up, flush buffers,
                # or continue encrypting files.
                process.kill()

                # Calculate the total latency from canary trigger to process death
                # This is measured in milliseconds for precision
                latency = (time.time() - start_time) * 1000

                print(f"[SUCCESS] HERMES terminated process PID: {attacker_pid} (attacker.py)")
                print(f"[SUCCESS] Mitigation Latency: {latency:.2f} ms")
                print("[SYSTEM] Swarm active containment successful. Files preserved.")
            except Exception as e:
                print(f"[ERROR] Failed to terminate ransomware PID {attacker_pid}: {e}")
        else:
            # This case occurs if the attacker process already exited naturally
            # or if its name doesn't contain 'attacker.py'
            print("[WARNING] Anomaly flagged, but no active 'attacker.py' process was discovered.")

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


def main():
    """
    Main daemon entry point — orchestrates the complete defense system.
    
    Execution flow:
        1. Print system banner
        2. Call setup_environment() to create sandbox and place canary
        3. Create an AnomalyHandler instance (our FIM callback)
        4. Create a watchdog Observer and schedule it to watch SANDBOX_DIR
        5. Start the Observer (spawns a background thread)
        6. Enter an infinite sleep loop (the Observer thread does all the work)
        7. On Ctrl+C, gracefully stop the Observer and exit
    
    The Observer thread runs independently from the main thread:
        Main Thread:  Sleeps in while True loop (keeps process alive)
        Observer Thread: Watches for OS kernel file notifications
        
    When a file change occurs:
        OS Kernel → Observer Thread → AnomalyHandler.on_modified() → mitigate()
    """
    print("=" * 60)
    print("      AEGIS // MULTI-AGENT SWARM DEFENSE DEAMON ACTIVE      ")
    print("=" * 60)

    # Phase 1: ARGUS — Setup environment and deploy canary
    setup_environment()

    # Phase 2: PHINEAS — Initialize Wazuh FIM monitoring
    # Create the event handler that will receive file change notifications
    event_handler = AnomalyHandler()

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
