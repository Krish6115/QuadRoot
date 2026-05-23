import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// SVG Icons for absolute premium custom UI (no external asset dependencies)
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="logo-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '1.15rem', height: '1.15rem' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const AttackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '1.15rem', height: '1.15rem' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21.75a8.25 8.25 0 0 1-6-12.75L12 3m0 0 1.5 1.5M12 3v18M5.25 9h13.5" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '1.15rem', height: '1.15rem' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" style={{ width: '0.9rem', height: '0.9rem' }}>
    <path d="M8 5.14v14l11-7-11-7z" />
  </svg>
);

const ResetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '0.9rem', height: '0.9rem' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const TermIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
  </svg>
);

const DatabaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="file-icon-svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0v3.75" />
  </svg>
);

const FileCodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="file-icon-svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
  </svg>
);

const FileSpreadsheetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="file-icon-svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5-13.5v13.5m16.5-13.5v13.5M9.75 5.25v13.5m4.5-13.5v13.5" />
  </svg>
);

const FilePdfIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="file-icon-svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="file-icon-svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const LockClosedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="file-icon-svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const FileDecoyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="file-icon-svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const FileGenericIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="file-icon-svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M5.625 18.075h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);

const INITIAL_FILES = [
  { id: 1, name: "financial_report.xlsx", path: "/home/user/documents/financial_report.xlsx", type: "user", status: "clean" },
  { id: 2, name: "customer_database.sql", path: "/home/user/documents/customer_database.sql", type: "user", status: "clean" },
  { id: 3, name: "product_roadmap.pdf", path: "/home/user/documents/product_roadmap.pdf", type: "user", status: "clean" },
  { id: 4, name: "intellectual_property.key", path: "/home/user/documents/intellectual_property.key", type: "user", status: "clean" },
  { id: 5, name: "api_secrets.env", path: "/home/user/documents/api_secrets.env", type: "user", status: "clean" },
  { id: 6, name: "corporate_headshot.png", path: "/home/user/pictures/corporate_headshot.png", type: "user", status: "clean" },
  { id: 7, name: "marketing_banner.svg", path: "/home/user/pictures/marketing_banner.svg", type: "user", status: "clean" },
  { id: 8, name: "contract_draft_v2.docx", path: "/home/user/downloads/contract_draft_v2.docx", type: "user", status: "clean" },
  { id: 9, name: "patch_notes.txt", path: "/home/user/downloads/patch_notes.txt", type: "user", status: "clean" },
];

function App() {
  // Config state
  const [architecture, setArchitecture] = useState('swarm'); // 'passive' | 'swarm'
  const [simSpeed, setSimSpeed] = useState(300); // ms delay
  const [simRunning, setSimRunning] = useState(false);
  const [pid, setPid] = useState('OFFLINE');
  const [sensitivity, setSensitivity] = useState('high'); // 'high' | 'medium' | 'low' | 'random'

  // Simulation state
  const [files, setFiles] = useState(INITIAL_FILES);
  const [agentStates, setAgentStates] = useState({
    ares: { status: 'IDLE', task: 'Agent offline', iops: 0, locked: 0 },
    argus: { status: 'IDLE', task: 'Agent offline', decoys: 0, latency: 'N/A' },
    phineas: { status: 'IDLE', task: 'Agent offline', alerts: 0, fimStatus: 'Inactive' },
    hermes: { status: 'IDLE', task: 'Agent offline', latency: 'N/A', kills: 0 },
  });

  // Telemetry Metrics
  const [metrics, setMetrics] = useState({
    scanned: 0,
    locked: 0,
    preserved: 0,
    latency: 'N/A',
    efficiency: 0,
    status: 'SYSTEM STANDBY'
  });

  // Log Streams
  const [elkLogs, setElkLogs] = useState([]);
  const [ipcLogs, setIpcLogs] = useState([]);

  // Loop references to strictly resolve React state closure issues in asynchronous setTimeout calls
  const loopRef = useRef(null);
  const filesRef = useRef(files);
  const agentStatesRef = useRef(agentStates);
  const elkLogsRef = useRef(elkLogs);
  const ipcLogsRef = useRef(ipcLogs);
  const currentIndexRef = useRef(0);
  const simRunningRef = useRef(false);
  const architectureRef = useRef(architecture);
  const simSpeedRef = useRef(simSpeed);
  const pidRef = useRef(pid);
  const sensitivityRef = useRef(sensitivity);
  const randomThresholdRef = useRef(1);

  // Synchronize refs with actual states
  useEffect(() => { filesRef.current = files; }, [files]);
  useEffect(() => { agentStatesRef.current = agentStates; }, [agentStates]);
  useEffect(() => { elkLogsRef.current = elkLogs; }, [elkLogs]);
  useEffect(() => { ipcLogsRef.current = ipcLogs; }, [ipcLogs]);
  useEffect(() => { simRunningRef.current = simRunning; }, [simRunning]);
  useEffect(() => { architectureRef.current = architecture; }, [architecture]);
  useEffect(() => { simSpeedRef.current = simSpeed; }, [simSpeed]);
  useEffect(() => { pidRef.current = pid; }, [pid]);
  useEffect(() => { sensitivityRef.current = sensitivity; }, [sensitivity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loopRef.current) clearTimeout(loopRef.current);
    };
  }, []);

  // Helper loggers
  const addElkLog = (level, source, message) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newLog = { timestamp, level, source, message };
    setElkLogs(prev => {
      const updated = [...prev, newLog];
      // Keep last 100 entries for stability
      return updated.slice(-100);
    });
  };

  const addIpcLog = (sender, message, colorClass) => {
    const newIpc = { sender, message, colorClass };
    setIpcLogs(prev => {
      const updated = [...prev, newIpc];
      return updated.slice(-100);
    });
  };

  // Scroll terminals to bottom when log updates
  const elkTerminalRef = useRef(null);
  const ipcTerminalRef = useRef(null);

  useEffect(() => {
    if (elkTerminalRef.current) {
      elkTerminalRef.current.scrollTop = elkTerminalRef.current.scrollHeight;
    }
  }, [elkLogs]);

  useEffect(() => {
    if (ipcTerminalRef.current) {
      ipcTerminalRef.current.scrollTop = ipcTerminalRef.current.scrollHeight;
    }
  }, [ipcLogs]);

  // Reset simulation to fresh state
  const resetSimulation = () => {
    if (loopRef.current) clearTimeout(loopRef.current);
    loopRef.current = null;
    
    setSimRunning(false);
    setPid('OFFLINE');
    setFiles(INITIAL_FILES);
    setElkLogs([]);
    setIpcLogs([]);
    currentIndexRef.current = 0;
    
    setAgentStates({
      ares: { status: 'IDLE', task: 'Agent offline', iops: 0, locked: 0 },
      argus: { status: 'IDLE', task: 'Agent offline', decoys: 0, latency: 'N/A' },
      phineas: { status: 'IDLE', task: 'Agent offline', alerts: 0, fimStatus: 'Inactive' },
      hermes: { status: 'IDLE', task: 'Agent offline', latency: 'N/A', kills: 0 },
    });

    setMetrics({
      scanned: 0,
      locked: 0,
      preserved: 0,
      latency: 'N/A',
      efficiency: 0,
      status: 'SYSTEM STANDBY'
    });
  };

  // Run Multi-Agent Defense / Attack Simulation Loop
  const startSimulation = () => {
    resetSimulation();
    
    randomThresholdRef.current = Math.floor(Math.random() * 3) + 1; // random value between 1 and 3

    const randomPID = Math.floor(Math.random() * 8000) + 1024;
    setPid(randomPID.toString());
    setSimRunning(true);

    // Initial logs for Phase 1: Arming & Setup
    setTimeout(() => {
      addElkLog('INFO', 'SYSTEM', 'Initializing cybersecurity simulation kernel...');
      addElkLog('INFO', 'SYSTEM', `FIM Audit engine configured under ${architectureRef.current === 'swarm' ? 'ACTIVE SWARM' : 'PASSIVE EDR'} policy.`);
      addElkLog('INFO', 'SYSTEM', `Virtual Sandbox sandbox active. Target system simulated process boundary: PID ${randomPID}`);
      
      addIpcLog('SYSTEM', `Bootstrapping Inter-Process Communication bus on channel IPC://PORT-9092`, 'text-muted');
      addIpcLog('ARES', `Ransomware agent armed and targeting local system documents. Process context: PID ${randomPID}.`, 'ares-color');
      
      if (architectureRef.current === 'swarm') {
        addIpcLog('ARGUS', 'Moving Target Defense daemon active. Watching filesystem I/O bursts.', 'argus-color');
        addIpcLog('PHINEAS', 'Wazuh FIM active. Direct read/write auditing established on protected namespaces.', 'phineas-color');
        addIpcLog('HERMES', `Mitigation interceptor active. Holding SIGKILL vector targeting PID ${randomPID}.`, 'hermes-color');

        setAgentStates(prev => ({
          ...prev,
          ares: { status: 'ACTIVE', task: 'Enumerating document file system', iops: 5, locked: 0 },
          argus: { status: 'MONITORING', task: 'Auditing sequential document operations', decoys: 0, latency: 'N/A' },
          phineas: { status: 'MONITORING', task: 'Wazuh FIM active on protected directory', alerts: 0, fimStatus: 'FIM Active' },
          hermes: { status: 'MONITORING', task: 'Standing by for execution mitigation', latency: 'N/A', kills: 0 },
        }));
      } else {
        setAgentStates(prev => ({
          ...prev,
          ares: { status: 'ACTIVE', task: 'Enumerating document file system', iops: 12, locked: 0 },
          argus: { status: 'IDLE', task: 'Agent offline (Passive Architecture)', decoys: 0, latency: 'N/A' },
          phineas: { status: 'MONITORING', task: 'Wazuh EDR in log-only passive mode', alerts: 0, fimStatus: 'Log-Only' },
          hermes: { status: 'IDLE', task: 'Agent offline (Passive Architecture)', latency: 'N/A', kills: 0 },
        }));
      }

      setMetrics(prev => ({
        ...prev,
        status: 'ATTACK RUNNING'
      }));

      // Start sequential attack traversal
      currentIndexRef.current = 0;
      loopRef.current = setTimeout(() => {
        runStep(0, randomPID);
      }, simSpeedRef.current);
    }, 200);
  };

  // Sequential execution step
  const runStep = (index, currentPid) => {
    if (!simRunningRef.current) return;

    const currentFiles = [...filesRef.current];
    
    // Attacker reached the end of directory (Passive Mode case or very fast attack)
    if (index >= currentFiles.length) {
      addElkLog('ERROR', 'ARES', `Directory traversal completed. Virtual documents fully compromised.`);
      addElkLog('ERROR', 'SYSTEM', `CRITICAL INTRUSION IMPACT: 100% of local file structures locked (T1486).`);
      addIpcLog('ARES', `Traversal finished. All documents locked. Exiting thread context.`, 'ares-color');
      
      setAgentStates(prev => ({
        ...prev,
        ares: { ...prev.ares, status: 'IDLE', task: 'Attack cycle complete. Target compromised.', iops: 0 }
      }));

      setSimRunning(false);
      
      // Calculate Passive Metrics
      const totalLocked = currentFiles.filter(f => f.status === 'locked').length;
      setMetrics(prev => ({
        ...prev,
        scanned: currentFiles.length,
        locked: totalLocked,
        preserved: 0,
        latency: 'N/A',
        efficiency: 0,
        status: 'SYSTEM BREACHED (100% LOST)'
      }));
      return;
    }

    const currentFile = currentFiles[index];

    // Check if Attacker hits the newly spliced ARGUS Canary file
    if (currentFile.type === 'canary') {
      // PHASE 4: DETECTION & MITIGATION
      const detectLatency = (Math.random() * 5 + 3).toFixed(1); // simulated 3.0ms - 8.0ms latency
      
      // Update File Integrity Monitor (PHINEAS) Alert
      addElkLog('ERROR', 'Wazuh EDR', `ALERT [Level 15] FIM integrity violation at Canary path: ${currentFile.path}`);
      addElkLog('ERROR', 'Wazuh EDR', `FIM flagged abnormal metadata change on trap canary by process ID: ${currentPid}`);
      addIpcLog('PHINEAS', `ALERT! Canary file modified at logical index ${index}. Triggering swarming intrusion event!`, 'phineas-color');
      
      // Trigger HERMES Killer Agent
      addElkLog('SUCCESS', 'HERMES', `EDR interrupt caught. Executing task: psutil.kill(${currentPid}, SIGKILL)`);
      addElkLog('SUCCESS', 'HERMES', `Malicious Process ID ${currentPid} terminated successfully. Detection Latency: ${detectLatency}ms.`);
      addElkLog('SUCCESS', 'SYSTEM', `Intrusion successfully mitigated. Containment actions active.`);
      
      addIpcLog('HERMES', `SIGKILL dispatched to process ${currentPid}. Threat vector closed in ${detectLatency}ms.`, 'hermes-color');
      addIpcLog('ARES', `SIGKILL interrupt caught. Process context destroyed. Core dumped.`, 'ares-color');
      addIpcLog('ARGUS', `Decoy canary engagement successful. Threat isolated successfully.`, 'argus-color');

      // Clear execution loop instantly
      if (loopRef.current) clearTimeout(loopRef.current);
      
      // Update all remaining clean files to PRESERVED state
      const mitigatedFiles = currentFiles.map((file, idx) => {
        if (idx === index) {
          // The canary file itself gets preserved as it absorbed the shock and saved others!
          return { ...file, status: 'preserved' };
        } else if (file.status === 'clean' || file.status === 'encrypting') {
          return { ...file, status: 'preserved' };
        }
        return file;
      });

      setFiles(mitigatedFiles);

      // Set agent states to completed mitigation
      setAgentStates({
        ares: { status: 'TERMINATED', task: 'Process SIGKILLed', iops: 0, locked: index - 1 },
        argus: { status: 'COMPLETED', task: 'Canary trap successfully triggered', decoys: 1, latency: '3.1ms' },
        phineas: { status: 'SECURED', task: 'EDR Alert fired, process isolated', alerts: 1, fimStatus: 'Threat Quarantined' },
        hermes: { status: 'COMPLETED', task: 'Executed SIGKILL on malware PID', latency: `${detectLatency}ms`, kills: 1 },
      });

      setSimRunning(false);

      // Post-Process Metrics
      const finalLocked = mitigatedFiles.filter(f => f.status === 'locked').length;
      const finalPreserved = mitigatedFiles.filter(f => f.status === 'preserved').length;
      const finalEfficiency = Math.round((finalPreserved / (INITIAL_FILES.length)) * 100);

      setMetrics({
        scanned: index + 1,
        locked: finalLocked,
        preserved: finalPreserved,
        latency: `${detectLatency}ms`,
        efficiency: finalEfficiency,
        status: `ACTIVE DEFENSE SUCCESSFUL (${finalEfficiency}% SECURED)`
      });
      return;
    }

    // PHASE 2: THE ATTACK (ARES)
    // Mark file as encrypting
    const filesWithEncrypting = [...currentFiles];
    filesWithEncrypting[index] = { ...currentFile, status: 'encrypting' };
    setFiles(filesWithEncrypting);
    
    addElkLog('INFO', 'ARES', `Process traversing path: ${currentFile.path}`);
    addIpcLog('ARES', `Targeting file handle: ${currentFile.name} for write operations`, 'ares-color');

    // Wait a brief simulated speed offset to mark file as locked
    setTimeout(() => {
      if (!simRunningRef.current) return;

      const latestFiles = [...filesRef.current];
      // Check if file status has already been overridden (e.g. by mitigation)
      if (latestFiles[index] && latestFiles[index].status === 'encrypting') {
        const lockedName = `${currentFile.name}.locked`;
        latestFiles[index] = {
          ...currentFile,
          name: lockedName,
          status: 'locked'
        };
        setFiles(latestFiles);

        addElkLog('WARNING', 'ARES', `T1486 Data Encrypted for Impact: ${currentFile.path} -> ${lockedName}`);
        addElkLog('INFO', 'Wazuh EDR', `File write anomaly: file extension modified on ${currentFile.path}`);

        setAgentStates(prev => ({
          ...prev,
          ares: { ...prev.ares, locked: prev.ares.locked + 1, iops: architectureRef.current === 'swarm' ? 6 : 14 }
        }));

        // PHASE 3: THE NOVELTY DECEPTION (ARGUS)
        // ARGUS triggers based on selected EDR sensitivity policy
        let threshold = 1; // 'high' sensitivity (locks 2 files, index === 1)
        if (sensitivityRef.current === 'medium') threshold = 2; // 'medium' sensitivity (locks 3 files, index === 2)
        else if (sensitivityRef.current === 'low') threshold = 4; // 'low' sensitivity (locks 5 files, index === 4)
        else if (sensitivityRef.current === 'random') threshold = randomThresholdRef.current; // 'random' sensitivity (between 1 and 3)

        if (architectureRef.current === 'swarm' && index === threshold) {
          addElkLog('WARNING', 'ARGUS', `Sequential document write rate anomaly: High file entropy detected!`);
          
          const decoyFile = {
            id: 999,
            name: "000_urgent_salary_audit.xlsx",
            path: "/home/user/documents/000_urgent_salary_audit.xlsx",
            type: "canary",
            status: "clean"
          };

          // Splice canary file right in front of the next index (which is threshold + 1)
          const splicedFiles = [...latestFiles];
          splicedFiles.splice(threshold + 1, 0, decoyFile);
          
          setFiles(splicedFiles);

          addElkLog('SUCCESS', 'ARGUS', `Deploying preemptive moving target decoy: ${decoyFile.path}`);
          addIpcLog('ARGUS', `Alert: Sequential folder modification burst detected. Deploying Honey-pot Canary trap at documents path: ${decoyFile.name}`, 'argus-color');
          
          setAgentStates(prev => ({
            ...prev,
            argus: { status: 'DEPLOYED', task: 'Decoy injected directly into threat path', decoys: 1, latency: '4.2ms' },
            phineas: { ...prev.phineas, task: 'Decoy armed. Monitoring integrity.' }
          }));
        }

        // Schedule next logical index iteration
        const nextIndex = index + 1;
        currentIndexRef.current = nextIndex;
        loopRef.current = setTimeout(() => {
          runStep(nextIndex, currentPid);
        }, simSpeedRef.current);
      }
    }, simSpeedRef.current / 2);
  };

  // Helper icon selection
  const getFileIcon = (file) => {
    if (file.status === 'locked') return <LockClosedIcon />;
    if (file.type === 'canary') return <FileDecoyIcon />;
    
    const ext = file.name.split('.').pop();
    switch (ext) {
      case 'xlsx': return <FileSpreadsheetIcon />;
      case 'sql': return <DatabaseIcon />;
      case 'pdf': return <FilePdfIcon />;
      case 'png':
      case 'svg': return <ImageIcon />;
      case 'env':
      case 'txt': return <FileCodeIcon />;
      default: return <FileGenericIcon />;
    }
  };

  return (
    <div id="root">
      {/* Premium Header UI */}
      <header className="app-header">
        <div className="logo-section">
          <ShieldIcon />
          <div className="app-title-container">
            <h1 className="app-title">AEGIS // SWARM</h1>
            <div className="app-subtitle">
              <span className={`status-indicator ${simRunning ? 'alerting' : ''}`}></span>
              Autonomous Multi-Agent Defense Simulator
            </div>
          </div>
        </div>
        
        {/* Quick Diagnostics HUD */}
        <div className="stats-pill-container">
          <span className="stats-pill">SOC CORE: ONLINE</span>
          <span className="stats-pill">IPC LINK: 9092/TCP</span>
          <span className="stats-pill">MALWARE PID: {pid}</span>
          <span className="stats-pill">ATTACK TYPE: MITRE T1486</span>
        </div>
      </header>

      {/* Real-time metrics summary */}
      <section className="metrics-summary-banner">
        <div className="metrics-info-block">
          <h2 className="metrics-title">
            <SearchIcon />
            SYSTEM TELEMETRY ENGINE
          </h2>
          <p className="metrics-subtitle">Telemetry results processing real-time defensive feedback loops</p>
        </div>
        <div className="metrics-stats-strip">
          <div className="metric-strip-item">
            <span className="metric-strip-lbl">Simulation State</span>
            <span className={`metric-strip-val ${simRunning ? 'cyan' : metrics.efficiency > 0 ? 'green' : metrics.locked > 0 ? 'red' : ''}`}>
              {metrics.status}
            </span>
          </div>
          <div className="metric-strip-item">
            <span className="metric-strip-lbl">Files Protected</span>
            <span className="metric-strip-val green">{metrics.preserved} / {INITIAL_FILES.length}</span>
          </div>
          <div className="metric-strip-item">
            <span className="metric-strip-lbl">Files Compromised</span>
            <span className="metric-strip-val red">{metrics.locked}</span>
          </div>
          <div className="metric-strip-item">
            <span className="metric-strip-lbl">Mitigation Latency</span>
            <span className="metric-strip-val cyan">{metrics.latency}</span>
          </div>
          <div className="metric-strip-item">
            <span className="metric-strip-lbl">Swarm Integrity</span>
            <span className="metric-strip-val green">{metrics.efficiency}%</span>
          </div>
        </div>
      </section>

      {/* Main Workspace Layout */}
      <div className="dashboard-grid">
        
        {/* Left Side Cockpit Controls */}
        <aside className="control-sidebar">
          
          {/* Defense Architecture Cockpit Card */}
          <div className="pane-card">
            <h3 className="pane-title">
              <ShieldIcon />
              SYSTEM ARCHITECTURE
            </h3>
            <div className="control-group">
              <label className="control-label">Select Active Mode</label>
              <div className="toggle-container">
                <button 
                  className={`toggle-btn passive ${architecture === 'passive' ? 'active' : ''}`}
                  onClick={() => !simRunning && setArchitecture('passive')}
                  disabled={simRunning}
                >
                  Passive EDR
                </button>
                <button 
                  className={`toggle-btn swarm ${architecture === 'swarm' ? 'active' : ''}`}
                  onClick={() => !simRunning && setArchitecture('swarm')}
                  disabled={simRunning}
                >
                  Swarm Active
                </button>
              </div>
            </div>
            <p className="telemetry-subtext" style={{ fontSize: '0.65rem', lineHeight: '1.3' }}>
              {architecture === 'swarm' 
                ? "Swarm Mode enables Argus's Honeypot Injection, Phineas's Canary Monitor, and Hermes's automated process termination."
                : "Passive Mode represents conventional logging, allowing ransomware (ARES) to complete encrypting your storage."
              }
            </p>
          </div>

          {/* EDR Sensitivity Policy Card */}
          <div className="pane-card">
            <h3 className="pane-title">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1rem', height: '1rem', color: 'var(--color-phineas)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
              </svg>
              DECEPTION TRIGGER POLICY
            </h3>
            <div className="control-group">
              <label className="control-label">Sensitivity Level</label>
              <div className="toggle-container" style={{ flexWrap: 'wrap', gap: '0.25rem' }}>
                <button 
                  className={`toggle-btn ${sensitivity === 'high' ? 'active swarm' : ''}`}
                  onClick={() => !simRunning && setSensitivity('high')}
                  disabled={simRunning}
                  style={{ fontSize: '0.6rem', padding: '0.4rem 0.25rem' }}
                >
                  High
                </button>
                <button 
                  className={`toggle-btn ${sensitivity === 'medium' ? 'active swarm' : ''}`}
                  onClick={() => !simRunning && setSensitivity('medium')}
                  disabled={simRunning}
                  style={{ fontSize: '0.6rem', padding: '0.4rem 0.25rem' }}
                >
                  Medium
                </button>
                <button 
                  className={`toggle-btn ${sensitivity === 'low' ? 'active swarm' : ''}`}
                  onClick={() => !simRunning && setSensitivity('low')}
                  disabled={simRunning}
                  style={{ fontSize: '0.6rem', padding: '0.4rem 0.25rem' }}
                >
                  Low
                </button>
                <button 
                  className={`toggle-btn ${sensitivity === 'random' ? 'active swarm' : ''}`}
                  onClick={() => !simRunning && setSensitivity('random')}
                  disabled={simRunning}
                  style={{ fontSize: '0.6rem', padding: '0.4rem 0.25rem' }}
                >
                  Random
                </button>
              </div>
            </div>
            <p className="telemetry-subtext" style={{ fontSize: '0.65rem', lineHeight: '1.3' }}>
              {sensitivity === 'high' && "High Policy triggers deception instantly after 2 standard files are locked."}
              {sensitivity === 'medium' && "Medium Policy triggers decoy canary placement after 3 standard files are locked."}
              {sensitivity === 'low' && "Low Policy monitors longer, placing decoy canaries after 5 standard files are locked."}
              {sensitivity === 'random' && "Random Policy emulates real-world dynamic network trigger anomalies (1-3 files locked)."}
            </p>
          </div>

          {/* Speed Controller Card */}
          <div className="pane-card">
            <h3 className="pane-title">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1rem', height: '1rem', color: 'var(--color-argus)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              ATTACK PROPAGATION SPEED
            </h3>
            <div className="control-group slider-wrapper">
              <div className="slider-values">
                <span>Fast</span>
                <span>{simSpeed}ms</span>
                <span>Slow</span>
              </div>
              <input 
                type="range" 
                min="100" 
                max="800" 
                step="50"
                value={simSpeed} 
                onChange={(e) => setSimSpeed(Number(e.target.value))}
                className="custom-range"
                disabled={simRunning}
              />
            </div>
          </div>

          {/* Execution triggers */}
          <div className="pane-card" style={{ border: 'none', padding: '0', backgroundColor: 'transparent', boxShadow: 'none' }}>
            {!simRunning ? (
              <button 
                className="action-btn primary-trigger"
                onClick={startSimulation}
              >
                <PlayIcon />
                RUN CYBER-SWARM DEFENSE
              </button>
            ) : (
              <button 
                className="action-btn stop-trigger"
                onClick={resetSimulation}
              >
                <ResetIcon />
                ABORT SIMULATION
              </button>
            )}

            <button 
              className="action-btn"
              onClick={resetSimulation}
              disabled={simRunning && !metrics.locked}
            >
              <ResetIcon />
              INITIALIZE & RESET SYSTEM
            </button>
          </div>

          {/* Simulation Diagnostics Pane */}
          <div className="pane-card">
            <h3 className="pane-title">
              <UserIcon />
              DIAGNOSTICS HUD
            </h3>
            <div className="system-hud-list">
              <div className="hud-item">
                <span className="hud-label">Canary Trap Status</span>
                <span className={`hud-value ${architecture === 'swarm' ? 'glow-green' : 'text-muted'}`}>
                  {architecture === 'swarm' ? 'ARMED & WAITING' : 'DISABLED'}
                </span>
              </div>
              <div className="hud-item">
                <span className="hud-label">Audit Engine</span>
                <span className="hud-value" style={{ color: 'var(--color-phineas)' }}>
                  WAZUH FIM DAEMON
                </span>
              </div>
              <div className="hud-item">
                <span className="hud-label">Offensive Routine</span>
                <span className="hud-value" style={{ color: 'var(--color-ares)' }}>
                  ATOMIC RED TEAM T1486
                </span>
              </div>
              <div className="hud-item">
                <span className="hud-label">IPC Bus Status</span>
                <span className="hud-value glow-green">SOCKET CONNECTED</span>
              </div>
            </div>
          </div>

        </aside>

        {/* Center Panel (Swarm State Cards and Virtual File Explorer) */}
        <main className="sim-viewport">
          
          {/* Swarm Agent Cards Grid */}
          <div className="swarm-grid">
            
            {/* Agent ARES */}
            <div className={`agent-card ares ${agentStates.ares.status !== 'IDLE' ? 'active' : ''}`}>
              <div className="agent-pulse"></div>
              <div className="agent-header">
                <div className="agent-identity">
                  <div className="agent-avatar"><AttackIcon /></div>
                  <div className="agent-meta">
                    <span className="agent-name">ARES</span>
                    <span className="agent-role">Atomic Red-Team</span>
                  </div>
                </div>
                <span className="agent-status-badge">{agentStates.ares.status}</span>
              </div>
              <p className="agent-task">{agentStates.ares.task}</p>
              <div className="agent-stats-grid">
                <div className="agent-stat-box">
                  <span className="agent-stat-lbl">Anomalous IOPS</span>
                  <span className="agent-stat-val" style={{ color: 'var(--color-ares)' }}>{agentStates.ares.iops} IOPS</span>
                </div>
                <div className="agent-stat-box">
                  <span className="agent-stat-lbl">Files Locked</span>
                  <span className="agent-stat-val">{agentStates.ares.locked} files</span>
                </div>
              </div>
            </div>

            {/* Agent ARGUS */}
            <div className={`agent-card argus ${agentStates.argus.status !== 'IDLE' ? 'active' : ''}`}>
              <div className="agent-pulse"></div>
              <div className="agent-header">
                <div className="agent-identity">
                  <div className="agent-avatar"><SearchIcon /></div>
                  <div className="agent-meta">
                    <span className="agent-name">ARGUS</span>
                    <span className="agent-role">Sentinel Deception</span>
                  </div>
                </div>
                <span className="agent-status-badge">{agentStates.argus.status}</span>
              </div>
              <p className="agent-task">{agentStates.argus.task}</p>
              <div className="agent-stats-grid">
                <div className="agent-stat-box">
                  <span className="agent-stat-lbl">Canaries Deployed</span>
                  <span className="agent-stat-val" style={{ color: 'var(--color-argus)' }}>{agentStates.argus.decoys} traps</span>
                </div>
                <div className="agent-stat-box">
                  <span className="agent-stat-lbl">Deception Latency</span>
                  <span className="agent-stat-val">{agentStates.argus.latency}</span>
                </div>
              </div>
            </div>

            {/* Agent PHINEAS */}
            <div className={`agent-card phineas ${agentStates.phineas.status !== 'IDLE' ? 'active' : ''}`}>
              <div className="agent-pulse"></div>
              <div className="agent-header">
                <div className="agent-identity">
                  <div className="agent-avatar"><SearchIcon /></div>
                  <div className="agent-meta">
                    <span className="agent-name">PHINEAS</span>
                    <span className="agent-role">Wazuh FIM Auditor</span>
                  </div>
                </div>
                <span className="agent-status-badge">{agentStates.phineas.status}</span>
              </div>
              <p className="agent-task">{agentStates.phineas.task}</p>
              <div className="agent-stats-grid">
                <div className="agent-stat-box">
                  <span className="agent-stat-lbl">FIM Audits</span>
                  <span className="agent-stat-val" style={{ color: 'var(--color-phineas)' }}>{agentStates.phineas.fimStatus}</span>
                </div>
                <div className="agent-stat-box">
                  <span className="agent-stat-lbl">Critical Alerts</span>
                  <span className="agent-stat-val">{agentStates.phineas.alerts} alarms</span>
                </div>
              </div>
            </div>

            {/* Agent HERMES */}
            <div className={`agent-card hermes ${agentStates.hermes.status !== 'IDLE' ? 'active' : ''}`}>
              <div className="agent-pulse"></div>
              <div className="agent-header">
                <div className="agent-identity">
                  <div className="agent-avatar"><ShieldIcon /></div>
                  <div className="agent-meta">
                    <span className="agent-name">HERMES</span>
                    <span className="agent-role">Mitigation Engine</span>
                  </div>
                </div>
                <span className="agent-status-badge">{agentStates.hermes.status}</span>
              </div>
              <p className="agent-task">{agentStates.hermes.task}</p>
              <div className="agent-stats-grid">
                <div className="agent-stat-box">
                  <span className="agent-stat-lbl">Kill Signal</span>
                  <span className="agent-stat-val" style={{ color: 'var(--color-hermes)' }}>psutil.SIGKILL</span>
                </div>
                <div className="agent-stat-box">
                  <span className="agent-stat-lbl">Kill Latency</span>
                  <span className="agent-stat-val">{agentStates.hermes.latency}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Virtual File Explorer Display */}
          <section className="file-explorer-pane pane-card">
            <h3 className="pane-title">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.15rem', height: '1.15rem', color: 'var(--color-phineas)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.008 1.24l.885 1.77a2.25 2.25 0 0 0 2.007 1.24h1.98a2.25 2.25 0 0 0 2.007-1.24l.885-1.77a2.25 2.25 0 0 1 2.007-1.24h3.86m-18 0h18M2.25 13.5l1.05-7.05A2.25 2.25 0 0 1 5.522 4.5h12.956a2.25 2.25 0 0 1 2.222 1.95l1.05 7.05m-18 0v6A2.25 2.25 0 0 0 4.25 21.5h15.5A2.25 2.25 0 0 0 22 19.5v-6" />
              </svg>
              VIRTUAL SECURITY SANDBOX FILE EXPLORER
            </h3>
            
            <div className="explorer-grid">
              {files.map((file) => (
                <div key={file.id} className={`file-item ${file.status} ${file.type === 'canary' ? 'canary' : ''}`}>
                  <div className="file-icon">
                    {getFileIcon(file)}
                  </div>
                  <div className="file-name" title={file.name}>
                    {file.name}
                  </div>
                  <div className="file-path" title={file.path}>
                    {file.path}
                  </div>
                  <span className="file-badge">
                    {file.status === 'encrypting' ? 'Encrypting...' : file.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Double Terminals Panels */}
          <section className="terminal-row">
            
            {/* Terminal 1: ELK Stack Log Ingest */}
            <div className="terminal-pane">
              <div className="terminal-header">
                <span className="terminal-title elk">
                  <TermIcon />
                  ELK STACK BLUE-TEAM LOG INGESTION
                </span>
                <div className="terminal-controls">
                  <span className="terminal-dot close"></span>
                  <span className="terminal-dot minimize"></span>
                  <span className="terminal-dot maximize"></span>
                </div>
              </div>
              <div className="terminal-body" ref={elkTerminalRef}>
                {elkLogs.length === 0 && (
                  <div className="log-entry" style={{ color: 'var(--text-muted)' }}>
                    ELK Stack socket ready. Trigger the simulation attack script...
                  </div>
                )}
                {elkLogs.map((log, index) => (
                  <div key={index} className={`log-entry ${log.level === 'ERROR' ? 'error' : log.level === 'WARNING' ? 'warning' : log.level === 'SUCCESS' ? 'success' : 'info'}`}>
                    <span className="log-timestamp">[{log.timestamp}]</span>
                    <span style={{ fontWeight: 700, marginRight: '0.4rem' }}>[{log.source}]</span>
                    {log.message}
                  </div>
                ))}
              </div>
            </div>

            {/* Terminal 2: Inter-Agent IPC Socket */}
            <div className="terminal-pane">
              <div className="terminal-header">
                <span className="terminal-title ipc">
                  <TermIcon />
                  SWARM INTER-PROCESS IPC SOCKET FEED
                </span>
                <div className="terminal-controls">
                  <span className="terminal-dot close"></span>
                  <span className="terminal-dot minimize"></span>
                  <span className="terminal-dot maximize"></span>
                </div>
              </div>
              <div className="terminal-body" ref={ipcTerminalRef}>
                {ipcLogs.length === 0 && (
                  <div className="log-entry" style={{ color: 'var(--text-muted)' }}>
                    Inter-Agent IPC Socket listening on PORT-9092/TCP...
                  </div>
                )}
                {ipcLogs.map((ipc, index) => (
                  <div key={index} className="ipc-entry">
                    <span className={`ipc-sender ${ipc.colorClass}`}>
                      {ipc.sender} ➔
                    </span>
                    <span className="ipc-msg">{ipc.message}</span>
                  </div>
                ))}
              </div>
            </div>

          </section>

        </main>
      </div>
    </div>
  );
}

export default App;
