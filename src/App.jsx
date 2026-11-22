import { useState, useEffect, useRef } from 'react';
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

const API = 'http://127.0.0.1:5000';

async function api(path, body) {
  const res = await fetch(API + path, body === undefined ? {} : {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

const EMPTY = {
  status: 'MONITORING', mode: 'swarm', policy: 'canary+behaviour', pid: 'OFFLINE',
  attackerRunning: false, latencyMs: null, detectSource: null, canaryHit: null,
  alerts: 0, kills: 0, fimEvents: 0, totalUser: 0, locked: 0, preserved: 0,
  canaries: 0, files: [], logs: [], ipc: [],
};

function App() {
  const [snap, setSnap] = useState(EMPTY);
  const [online, setOnline] = useState(false);
  const [profile, setProfile] = useState('standard');
  const [delay, setDelay] = useState(0.8);
  const [busy, setBusy] = useState(false);

  // Single source of truth: poll the Python daemon. No client-side simulation.
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const res = await fetch(API + '/api/state');
        const data = await res.json();
        if (alive) { setSnap(data); setOnline(true); }
      } catch {
        if (alive) setOnline(false);
      }
    };
    poll();
    const t = setInterval(poll, 300);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const files = snap.files;
  const elkLogs = snap.logs;
  const ipcLogs = snap.ipc;
  const pid = snap.pid;
  const simRunning = snap.status === 'ATTACK' || (snap.status === 'ALERTING' && snap.attackerRunning);
  const architecture = snap.mode;
  const latency = snap.latencyMs == null ? 'N/A' : `${snap.latencyMs.toFixed(2)}ms`;
  const protectedPct = snap.totalUser ? Math.round((snap.preserved / snap.totalUser) * 100) : 0;

  const statusText = {
    MONITORING: 'ARMED - MONITORING', ATTACK: 'ATTACK IN PROGRESS', ALERTING: 'FIM ALERT - RESPONDING',
    MITIGATED: `THREAT MITIGATED (${protectedPct}% DATA SAVED)`,
    BREACHED: `BREACHED (${snap.locked}/${snap.totalUser} FILES ENCRYPTED)`,
  }[snap.status] || snap.status;

  const run = async (fn) => { setBusy(true); try { await fn(); } finally { setBusy(false); } };
  const launchAttack = () => run(() => api('/api/attack', { profile, delay }));
  const resetSystem = () => run(() => api('/api/reset', {}));
  const setConfig = (cfg) => api('/api/config', cfg);

  const agentStates = {
    ares: {
      status: simRunning ? 'ACTIVE' : snap.status === 'MITIGATED' ? 'TERMINATED' : snap.status === 'BREACHED' ? 'COMPLETED' : 'IDLE',
      task: simRunning ? `Encrypting sandbox (PID ${pid})` : snap.status === 'MITIGATED' ? `PID ${pid} killed by HERMES` : snap.status === 'BREACHED' ? 'Sweep finished' : 'Standing by',
      locked: snap.locked,
    },
    argus: { status: 'DEPLOYED', task: 'Canary decoys armed in protected path', decoys: snap.canaries, hit: snap.canaryHit || 'none' },
    phineas: {
      status: snap.alerts ? 'ALERTING' : 'MONITORING',
      task: snap.alerts ? `Detected via ${snap.detectSource}` : 'FIM watching sandbox',
      alerts: snap.alerts, events: snap.fimEvents,
    },
    hermes: {
      status: snap.kills ? 'COMPLETED' : snap.mode === 'swarm' ? 'MONITORING' : 'IDLE',
      task: snap.kills ? 'SIGKILL verified' : snap.mode === 'swarm' ? 'Ready to terminate' : 'Disabled (passive EDR)',
      kills: snap.kills,
    },
  };

  const elkTerminalRef = useRef(null);
  const ipcTerminalRef = useRef(null);
  useEffect(() => {
    if (elkTerminalRef.current) elkTerminalRef.current.scrollTop = elkTerminalRef.current.scrollHeight;
  }, [elkLogs]);
  useEffect(() => {
    if (ipcTerminalRef.current) ipcTerminalRef.current.scrollTop = ipcTerminalRef.current.scrollHeight;
  }, [ipcLogs]);

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
              Ransomware Canary-File Detection &amp; Response
            </div>
          </div>
        </div>
        
        {/* Quick Diagnostics HUD */}
        <div className="stats-pill-container">
          {online ? (
            <span className="stats-pill stats-pill-live" style={{ border: '1px solid var(--color-green)', color: 'var(--color-green)', fontWeight: 'bold' }}>
              DAEMON: CONNECTED
            </span>
          ) : (
            <span className="stats-pill" style={{ border: '1px solid var(--color-ares)', color: 'var(--color-ares)', fontWeight: 'bold' }}>
              DAEMON OFFLINE - run: python defense.py
            </span>
          )}
          <span className="stats-pill">API: 127.0.0.1:5000</span>
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
            <span className="metric-strip-lbl">System State</span>
            <span className={`metric-strip-val ${snap.status === 'MITIGATED' ? 'green' : snap.status === 'BREACHED' ? 'red' : 'cyan'}`}>{statusText}</span>
          </div>
          <div className="metric-strip-item">
            <span className="metric-strip-lbl">Files Protected</span>
            <span className="metric-strip-val green">{snap.preserved} / {snap.totalUser}</span>
          </div>
          <div className="metric-strip-item">
            <span className="metric-strip-lbl">Files Encrypted</span>
            <span className="metric-strip-val red">{snap.locked}</span>
          </div>
          <div className="metric-strip-item">
            <span className="metric-strip-lbl">Detect-to-Kill Latency</span>
            <span className="metric-strip-val cyan">{latency}</span>
          </div>
          <div className="metric-strip-item">
            <span className="metric-strip-lbl">Data Saved</span>
            <span className="metric-strip-val green">{protectedPct}%</span>
          </div>
        </div>
      </section>

      {/* Main Workspace Layout */}
      <div className="dashboard-grid">
        
        {/* Left Side Cockpit Controls */}
        <aside className="control-sidebar">
          
          <div className="pane-card">
            <h3 className="pane-title"><ShieldIcon />DEFENCE MODE</h3>
            <div className="control-group">
              <div className="toggle-container">
                <button className={`toggle-btn passive ${architecture === 'passive' ? 'active' : ''}`}
                  onClick={() => setConfig({ mode: 'passive' })} disabled={simRunning}>Passive EDR</button>
                <button className={`toggle-btn swarm ${architecture === 'swarm' ? 'active' : ''}`}
                  onClick={() => setConfig({ mode: 'swarm' })} disabled={simRunning}>Swarm Active</button>
              </div>
            </div>
            <p className="telemetry-subtext" style={{ fontSize: '0.65rem', lineHeight: '1.3' }}>
              {architecture === 'swarm'
                ? 'Detect canary tampering and automatically SIGKILL the attacking process.'
                : 'Detect and log only - no response. The attack runs to completion.'}
            </p>
          </div>

          <div className="pane-card">
            <h3 className="pane-title"><SearchIcon />DETECTION POLICY</h3>
            <div className="toggle-container">
              <button className={`toggle-btn ${snap.policy === 'canary' ? 'active swarm' : ''}`}
                onClick={() => setConfig({ policy: 'canary' })} disabled={simRunning}
                style={{ fontSize: '0.6rem' }}>Canary only</button>
              <button className={`toggle-btn ${snap.policy === 'canary+behaviour' ? 'active swarm' : ''}`}
                onClick={() => setConfig({ policy: 'canary+behaviour' })} disabled={simRunning}
                style={{ fontSize: '0.6rem' }}>Canary + Behaviour</button>
            </div>
            <p className="telemetry-subtext" style={{ fontSize: '0.65rem', lineHeight: '1.3' }}>
              Behaviour = 3+ files renamed to .locked within 3 s (catches attackers that avoid canaries).
            </p>
          </div>

          <div className="pane-card">
            <h3 className="pane-title"><AttackIcon />ATTACK PROFILE</h3>
            <div className="toggle-container">
              <button className={`toggle-btn ${profile === 'standard' ? 'active passive' : ''}`}
                onClick={() => setProfile('standard')} disabled={simRunning} style={{ fontSize: '0.6rem' }}>Standard</button>
              <button className={`toggle-btn ${profile === 'stealth' ? 'active passive' : ''}`}
                onClick={() => setProfile('stealth')} disabled={simRunning} style={{ fontSize: '0.6rem' }}>Stealth (skips canaries)</button>
            </div>
            <div className="control-group slider-wrapper">
              <div className="slider-values"><span>Fast</span><span>{delay}s / file</span><span>Slow</span></div>
              <input type="range" min="0.2" max="2" step="0.1" value={delay}
                onChange={(e) => setDelay(Number(e.target.value))} className="custom-range" disabled={simRunning} />
            </div>
          </div>

          <div className="pane-card" style={{ border: 'none', padding: 0, background: 'transparent', boxShadow: 'none' }}>
            <button className="action-btn primary-trigger" onClick={launchAttack}
              disabled={!online || busy || simRunning}>
              <PlayIcon />LAUNCH REAL ATTACK (attacker.py)
            </button>
            <button className="action-btn" onClick={resetSystem} disabled={!online || busy}>
              <ResetIcon />KILL / RESTORE SANDBOX
            </button>
          </div>

          {/* Simulation Diagnostics Pane */}
          <div className="pane-card">
            <h3 className="pane-title">
              <UserIcon />
              DIAGNOSTICS HUD
            </h3>
            <div className="system-hud-list">
              <div className="hud-item"><span className="hud-label">Canaries armed</span>
                <span className="hud-value glow-green">{snap.canaries}</span></div>
              <div className="hud-item"><span className="hud-label">FIM events seen</span>
                <span className="hud-value" style={{ color: 'var(--color-phineas)' }}>{snap.fimEvents}</span></div>
              <div className="hud-item"><span className="hud-label">Detected by</span>
                <span className="hud-value" style={{ color: 'var(--color-ares)' }}>{snap.detectSource || '-'}</span></div>
              <div className="hud-item"><span className="hud-label">Canary tripped</span>
                <span className="hud-value">{snap.canaryHit || '-'}</span></div>
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
                  <span className="agent-stat-lbl">Process</span>
                  <span className="agent-stat-val" style={{ color: 'var(--color-ares)' }}>{simRunning ? 'ACTIVE' : 'IDLE'}</span>
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
                  <span className="agent-stat-lbl">Last Canary Hit</span>
                  <span className="agent-stat-val">{agentStates.argus.hit}</span>
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
                  <span className="agent-stat-lbl">FS Events</span>
                  <span className="agent-stat-val" style={{ color: 'var(--color-phineas)' }}>{agentStates.phineas.events}</span>
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
                  <span className="agent-stat-val">{latency}</span>
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
              LIVE SANDBOX FILE EXPLORER (read from disk)
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
                    {file.status}
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
                    ELK Stack socket ready. Waiting for daemon events...
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
