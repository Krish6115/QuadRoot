# Threat Model Write-up
### AEGIS // Ransomware Behaviour Simulation & Canary File Detection System
**Team QuadRoot** | Problem Statement #24 | FoSC 23CSE313 Hackathon

---

## Table of Contents

1. [Threat Model Overview](#1-threat-model-overview)
2. [System Under Analysis](#2-system-under-analysis)
3. [Threat Actors & Motivation](#3-threat-actors--motivation)
4. [Attack Surface Analysis](#4-attack-surface-analysis)
5. [MITRE ATT&CK Mapping](#5-mitre-attck-mapping)
6. [STRIDE Threat Analysis](#6-stride-threat-analysis)
7. [Attack Tree](#7-attack-tree)
8. [Kill Chain Analysis](#8-kill-chain-analysis)
9. [Data Flow Diagram & Trust Boundaries](#9-data-flow-diagram--trust-boundaries)
10. [Defense Mechanisms & Mitigations](#10-defense-mechanisms--mitigations)
11. [Residual Risks](#11-residual-risks)
12. [Risk Assessment Matrix](#12-risk-assessment-matrix)
13. [Recommendations](#13-recommendations)

---

## 1. Threat Model Overview

This document provides a formal threat model analysis of the simulated ransomware attack scenario and the corresponding multi-agent canary-based defense system. The model identifies threat actors, attack vectors, data flows, trust boundaries, and quantifies residual risk after defense controls are applied.

### Methodology Used

| Framework | Application |
|-----------|-------------|
| **MITRE ATT&CK** | Mapping adversary techniques to industry-standard taxonomy |
| **STRIDE** | Categorizing threat types (Spoofing, Tampering, Repudiation, Information Disclosure, DoS, Elevation of Privilege) |
| **Attack Trees** | Visualizing hierarchical attack pathways |
| **Cyber Kill Chain** | Analysing the adversary's lifecycle from reconnaissance to impact |
| **Risk Matrix** | Scoring threats by likelihood × impact |

---

## 2. System Under Analysis

### 2.1 Asset Inventory

The following assets exist within the simulated environment:

| Asset ID | Asset Description | Classification | Value |
|----------|------------------|----------------|-------|
| A-001 | User documents (`.xlsx`, `.sql`, `.pdf`, `.key`, `.env`) | Confidential | HIGH |
| A-002 | Canary honeypot file (`000_urgent_salary_audit.xlsx`) | Deception Trap | MEDIUM |
| A-003 | AES-128 symmetric encryption key (hardcoded in simulator) | Secret | CRITICAL |
| A-004 | Defense daemon process (`defense.py`) | Infrastructure | HIGH |
| A-005 | Wazuh Agent FIM baseline database | Integrity Data | HIGH |
| A-006 | Sandbox directory (`./sandbox/`) | Containment Zone | MEDIUM |
| A-007 | ELK Stack / IPC log streams | Audit Trail | MEDIUM |

### 2.2 System Boundaries

```
┌──────────────────────── TRUST BOUNDARY 1: Host OS ─────────────────────────┐
│                                                                             │
│  ┌──── TRUST BOUNDARY 2: Python venv ────┐   ┌── TRUST BOUNDARY 3: ──────┐│
│  │                                        │   │  React SPA (Browser)       ││
│  │  ┌─────────────┐   ┌──────────────┐   │   │                            ││
│  │  │ attacker.py │   │ defense.py   │   │   │  Dashboard UI              ││
│  │  │ (Untrusted) │   │ (Trusted)    │   │   │  (Trusted, Read-Only)      ││
│  │  └──────┬──────┘   └──────┬───────┘   │   └────────────────────────────┘│
│  │         │                  │            │                                 │
│  │         ▼                  ▼            │                                 │
│  │  ┌────────────────────────────────┐    │                                 │
│  │  │     sandbox/ directory         │    │                                 │
│  │  │     (Containment Zone)         │    │                                 │
│  │  └────────────────────────────────┘    │                                 │
│  └────────────────────────────────────────┘                                 │
│                                                                             │
│  ┌───── TRUST BOUNDARY 4: Wazuh Agent Service ──────┐                      │
│  │  wazuh-agentd (System Service)                     │                      │
│  │  syscheck FIM engine (Kernel-level hooks)          │                      │
│  └────────────────────────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Threat Actors & Motivation

### 3.1 Primary Threat Actor: Ransomware Operator (Simulated by ARES)

| Attribute | Detail |
|-----------|--------|
| **Actor Type** | External, Automated |
| **Skill Level** | Intermediate to Advanced |
| **Motivation** | Financial gain through extortion |
| **Capabilities** | File enumeration, symmetric encryption, extension manipulation, shadow copy deletion |
| **Tools Used** | AES-128 CBC encryption, sequential directory traversal |
| **MITRE Classification** | T1486 (Data Encrypted for Impact) |

### 3.2 Attack Objectives

1. **Primary Goal:** Encrypt all user documents in the target directory, rendering them inaccessible
2. **Secondary Goal:** Ensure encryption is irreversible without the attacker's decryption key
3. **Tertiary Goal:** Complete encryption before any detection or response mechanism activates

---

## 4. Attack Surface Analysis

### 4.1 Entry Points

| Entry Point | Description | Exposure Level |
|-------------|-------------|----------------|
| `sandbox/` directory | The virtual filesystem containing user documents | HIGH — directly accessible by the attacker process |
| File I/O handles | Standard OS file read/write operations | HIGH — ransomware operates through standard APIs |
| Process execution context | Python process with user-level privileges | MEDIUM — no elevation required for sandbox access |

### 4.2 Attack Vectors

| Vector ID | Vector Description | Exploited By |
|-----------|-------------------|--------------|
| AV-001 | Sequential file enumeration and encryption | ARES (attacker.py) |
| AV-002 | File extension manipulation (appending `.locked`) | ARES (attacker.py) |
| AV-003 | Original plaintext file deletion after encryption | ARES (attacker.py) |
| AV-004 | High-speed I/O burst to outrun detection | ARES (time-based race condition) |

---

## 5. MITRE ATT&CK Mapping

The simulated ransomware attack maps to the following ATT&CK techniques:

### 5.1 Technique Mapping Table

| Tactic | Technique ID | Technique Name | Implementation |
|--------|-------------|----------------|----------------|
| **Discovery** | T1083 | File and Directory Discovery | `os.listdir()` enumerates sandbox contents |
| **Collection** | T1005 | Data from Local System | `open(file, 'rb')` reads plaintext file bytes |
| **Impact** | T1486 | Data Encrypted for Impact | AES-128 CBC encryption via `cryptography` library |
| **Impact** | T1485 | Data Destruction | `os.remove()` deletes original plaintext files |
| **Defense Evasion** | T1036.008 | Masquerading: File Type Changes | Appends `.locked` extension to encrypted files |

### 5.2 ATT&CK Kill Chain Visualization

```
┌───────────┐  ┌───────────────┐  ┌──────────────┐  ┌─────────────┐  ┌──────────┐
│  Initial  │  │   Discovery   │  │  Collection  │  │  Encryption │  │  Impact  │
│  Access   │──│  T1083: File  │──│ T1005: Read  │──│ T1486: AES  │──│ T1485:   │
│ (Assumed) │  │  Enumeration  │  │  Plaintext   │  │ CBC Encrypt │  │ Delete   │
└───────────┘  └───────────────┘  └──────────────┘  └─────────────┘  └──────────┘
                      │
              DETECTION POINT ←── ARGUS canary injection occurs here
```

---

## 6. STRIDE Threat Analysis

### 6.1 Threat Categorization

| STRIDE Category | Threat Description | Applies? | Mitigation |
|-----------------|-------------------|----------|------------|
| **Spoofing** | Attacker impersonates a legitimate process to avoid detection | Partial | Process name matching via `psutil` command-line inspection |
| **Tampering** | Attacker modifies file contents (encryption) and metadata (extension) | **YES — Primary Threat** | FIM detects unauthorized modifications via checksum comparison |
| **Repudiation** | Attacker denies performing the encryption | Partial | Comprehensive logging in ELK Stack terminal with timestamps |
| **Information Disclosure** | Encrypted data becomes inaccessible but is not exfiltrated | No | Data remains on local disk (ransomware, not data theft) |
| **Denial of Service** | Files become unusable after encryption | **YES — Primary Impact** | Canary detection + process kill preserves remaining files |
| **Elevation of Privilege** | Attacker escalates to admin to bypass defenses | No | Simulation runs within user-level sandbox context |

### 6.2 Primary Threat Focus

The dominant threats are **Tampering** (T) and **Denial of Service** (D):
- **Tampering:** The ransomware tampers with file integrity by replacing plaintext content with ciphertext
- **DoS:** Encrypted files are rendered permanently inaccessible, constituting a denial of service against the data owner

---

## 7. Attack Tree

```
                    ┌────────────────────────────────┐
                    │  GOAL: Encrypt All User Files   │
                    │  (Data Encrypted for Impact)    │
                    └──────────────┬─────────────────┘
                                   │
                    ┌──────────────┴─────────────────┐
                    │                                  │
            ┌───────▼────────┐              ┌─────────▼──────────┐
            │  Enumerate      │              │  Evade Detection    │
            │  Target Files   │              │  Systems            │
            └───────┬────────┘              └─────────┬──────────┘
                    │                                  │
          ┌─────────┴──────────┐             ┌────────┴───────────┐
          │                    │             │                     │
   ┌──────▼──────┐   ┌────────▼───────┐  ┌──▼────────────┐  ┌────▼──────────┐
   │ os.listdir  │   │ Filter by      │  │ Speed-based   │  │ Avoid canary  │
   │ traversal   │   │ extension      │  │ race (encrypt │  │ files         │
   │             │   │ (.xlsx,.sql)   │  │ before detect)│  │               │
   └─────────────┘   └────────────────┘  └───────────────┘  └───────────────┘
                                                │                    │
                                           ┌────▼────┐        ┌─────▼──────┐
                                           │ PARTIAL │        │  BLOCKED   │
                                           │ SUCCESS │        │  by ARGUS  │
                                           │ (2 files│        │  canary    │
                                           │ locked) │        │  injection │
                                           └─────────┘        └────────────┘
```

**Analysis:** The attacker achieves partial success (encrypting 2 files) but is blocked from completing the full directory sweep by the canary deception mechanism, reducing total impact from 100% to approximately 22%.

---

## 8. Kill Chain Analysis

Mapping the attack lifecycle against the Lockheed Martin Cyber Kill Chain:

| Kill Chain Phase | Simulated Activity | Defense Response |
|-----------------|-------------------|------------------|
| **1. Reconnaissance** | Attacker identifies `sandbox/` as the target directory | *Not applicable (simulated environment)* |
| **2. Weaponisation** | AES-128 key and IV vectors are hardcoded in `attacker.py` | *Not applicable (pre-built simulator)* |
| **3. Delivery** | `python attacker.py` is manually executed | *Manual trigger for safe demonstration* |
| **4. Exploitation** | Attacker reads file bytes via `open(file, 'rb')` | Wazuh FIM detects file access patterns |
| **5. Installation** | Not applicable (no persistence mechanism) | N/A |
| **6. Command & Control** | Not applicable (standalone local process) | N/A |
| **7. Actions on Objectives** | Sequential AES encryption + `.locked` rename + original deletion | **ARGUS** injects canary → **PHINEAS** fires FIM alert → **HERMES** dispatches SIGKILL |

**Key Insight:** Our defense system breaks the kill chain at **Phase 7** by placing the canary decoy between the attacker's first successful encryptions and the remaining uncompromised files.

---

## 9. Data Flow Diagram & Trust Boundaries

### 9.1 Data Flow During Active Defense

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         HOST OPERATING SYSTEM                          │
│                                                                         │
│  ┌───────────────┐     read/write     ┌───────────────────────────┐    │
│  │  attacker.py  │ ──────────────────>│      sandbox/ directory   │    │
│  │  (UNTRUSTED)  │                    │                           │    │
│  │  PID: 8412    │                    │  user_files[]             │    │
│  └───────┬───────┘                    │  canary_file (injected)   │    │
│          │                            └────────────┬──────────────┘    │
│          │ SIGKILL                                  │                   │
│          │                                          │ write event       │
│  ┌───────┴───────┐                    ┌─────────────▼──────────────┐   │
│  │  defense.py   │<───── callback ────│  watchdog Observer         │   │
│  │  (TRUSTED)    │                    │  (ReadDirectoryChangesW)   │   │
│  │  psutil.kill()│                    └────────────────────────────┘   │
│  └───────────────┘                                                     │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Wazuh Agent (syscheck)                                           │ │
│  │  Baseline DB: SHA-256 checksums of sandbox/ files                 │ │
│  │  Real-time: Kernel-level file change notifications                │ │
│  │  Output: ossec.log → FIM alerts                                   │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Trust Boundary Violations

| Boundary Crossing | Source | Destination | Data | Risk |
|-------------------|--------|-------------|------|------|
| TB-1 | attacker.py (Untrusted) | sandbox/ (Protected) | File write operations | **HIGH** — this is the attack vector |
| TB-2 | watchdog (Trusted) | OS Kernel API | Event registration | LOW — standard API usage |
| TB-3 | defense.py (Trusted) | Process Table (OS) | PID query + kill signal | MEDIUM — requires process permissions |

---

## 10. Defense Mechanisms & Mitigations

### 10.1 Defense Controls Matrix

| Control ID | Control Type | Mechanism | Agent | Effectiveness |
|------------|-------------|-----------|-------|---------------|
| C-001 | **Deception** | Dynamic canary file injection in attacker's path | ARGUS | HIGH — forces attacker to interact with tripwire |
| C-002 | **Detection** | OS kernel-level file write event monitoring | PHINEAS (watchdog + Wazuh FIM) | HIGH — event-driven, zero-latency |
| C-003 | **Response** | Automated process termination via SIGKILL | HERMES (psutil) | HIGH — terminates in < 5ms |
| C-004 | **Containment** | Sandbox directory isolation (Docker optional) | System Design | MEDIUM — limits blast radius to sandbox |
| C-005 | **Audit** | Comprehensive logging to ELK Stack + IPC streams | Logger Module | MEDIUM — provides forensic trail |
| C-006 | **Integrity** | SHA-256 baseline comparison (Wazuh syscheck) | Wazuh Agent | HIGH — detects any file mutation |

### 10.2 Defense Depth Analysis

```
Layer 1 (Prevention):    Docker container isolation limits filesystem access
Layer 2 (Deception):     ARGUS places canary decoy in attacker's traversal path
Layer 3 (Detection):     watchdog + Wazuh FIM detect write event on canary
Layer 4 (Response):      HERMES scans process table and dispatches SIGKILL
Layer 5 (Recovery):      Remaining clean files marked PRESERVED
Layer 6 (Audit):         Full event log preserved in ELK terminal stream
```

---

## 11. Residual Risks

Even after applying all defense controls, the following residual risks remain:

| Risk ID | Description | Likelihood | Impact | Mitigation Gap |
|---------|-------------|------------|--------|----------------|
| R-001 | Files encrypted BEFORE canary detection (2 files in high sensitivity mode) | **HIGH** | MEDIUM | Inherent latency between attack start and deception trigger |
| R-002 | Attacker process uses a name other than `attacker.py` | LOW | HIGH | Defense currently matches process by command-line string |
| R-003 | Attacker encrypts files in non-alphabetical order, bypassing canary position | LOW | HIGH | Canary placement assumes alphabetical directory traversal |
| R-004 | Attacker achieves kernel-level privileges and disables watchdog observer | VERY LOW | CRITICAL | Requires separate host-level hardening (beyond project scope) |
| R-005 | AES key is hardcoded; compromised key allows decryption | LOW | LOW | Simulation-only concern; real ransomware uses unique keys |

---

## 12. Risk Assessment Matrix

```
                        IMPACT
              Low      Medium     High     Critical
         ┌──────────┬──────────┬──────────┬──────────┐
 HIGH     │          │  R-001   │          │          │
          │          │ (2 files │          │          │
LIKELIHOOD│          │  lost)   │          │          │
         ├──────────┼──────────┼──────────┼──────────┤
 MEDIUM   │          │          │          │          │
          │          │          │          │          │
         ├──────────┼──────────┼──────────┼──────────┤
 LOW      │  R-005   │          │ R-002    │          │
          │ (key     │          │ R-003    │          │
          │ hardcode)│          │ (evasion)│          │
         ├──────────┼──────────┼──────────┼──────────┤
 V.LOW    │          │          │          │  R-004   │
          │          │          │          │ (kernel  │
          │          │          │          │  escape) │
         └──────────┴──────────┴──────────┴──────────┘
```

**Overall Risk Rating:** **MEDIUM** — The system successfully mitigates the primary attack vector (mass file encryption) but accepts a small, bounded data loss window (2 files at high sensitivity) as an inherent trade-off for behavioral detection latency.

---

## 13. Recommendations

### 13.1 Short-Term Improvements

1. **Process Detection Hardening:** Instead of matching process names by string, monitor for *any* process exhibiting high-entropy sequential write operations using filesystem I/O rate analysis
2. **Multi-Path Canary Deployment:** Place canary files in multiple subdirectories and at varying sort positions to counter non-alphabetical traversal strategies
3. **Encrypted Backup Snapshots:** Before any defense activation, create immediate copy-on-write snapshots of all sandbox files to enable full recovery

### 13.2 Long-Term Enterprise Recommendations

1. **Machine Learning Anomaly Detection:** Train a classifier on normal vs. ransomware I/O patterns (file entropy, write frequency, extension mutation rate) to detect novel variants without canary dependency
2. **Network Segmentation:** If ransomware is detected on one host, automatically quarantine the machine at the network switch level to prevent lateral movement
3. **SIEM Correlation:** Forward all FIM alerts to a centralized SIEM (Splunk / Elastic SIEM) for cross-host correlation and automated incident response playbook execution
4. **Immutable Backups:** Maintain air-gapped or write-once backup infrastructure that cannot be reached by any process on the primary filesystem
