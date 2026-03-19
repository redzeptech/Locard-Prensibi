"""
Locard-Prensibi — File Carving Simülasyon Motoru
"""

import random
import string
import time
from typing import List, Dict


class ForensicAnalyzer:
    """Adli Bilişim Motoru — Deep Dive File Carving simülasyonu."""

    OS_RECOVERABLE_FILES = {
        "Pardus": [
            {"file": "bash_history.bak", "type": "bash", "magic_bytes": "23 20 21 2F 62 69 6E", "recovery_rate": "90%", "note": "Silinen komut geçmişi.", "adli_not": "Locard: Her temas iz bırakır."},
        ],
        "Windows": [
            {"file": "SAM_hive_backup", "type": "registry", "magic_bytes": "72 65 67 66", "recovery_rate": "45%", "note": "Kullanıcı şifre hashleri.", "adli_not": "Locard: Her temas iz bırakır."},
        ],
        "iOS": [
            {"file": "Library/SMS/sms.db", "type": "sqlite", "magic_bytes": "53 51 4C 69 74 65", "recovery_rate": "40%", "note": "SMS veritabanı parçası.", "adli_not": "Locard: Her temas iz bırakır."},
        ],
        "Kali Linux": [
            {"file": "ddos_script.sh.bak", "type": "script", "magic_bytes": "23 21 2F 62 69 6E 2F 62 61 73 68", "recovery_rate": "78%", "note": "Silinmiş DDoS saldırı scripti. Fail rm ile sildi.", "adli_not": "File Carving: Cluster uçlarından kurtarıldı."},
            {"file": "sqlmap_log.db", "type": "sqlite", "magic_bytes": "53 51 4C 69 74 65", "recovery_rate": "65%", "note": "SQL Injection aracı log kalıntısı.", "adli_not": "Locard: Her temas iz bırakır."},
        ],
        "Parrot OS": [
            {"file": "bruteforce.pyc.bak", "type": "bytecode", "magic_bytes": "03 F3 0D 0A", "recovery_rate": "72%", "note": "Silinmiş Brute Force scripti (derlenmiş).", "adli_not": "Unallocated space'den kurtarıldı."},
            {"file": "hydra_sessions.log", "type": "log", "magic_bytes": "48 59 44 52 41", "recovery_rate": "58%", "note": "Hydra oturum log kalıntısı.", "adli_not": "Fail izleri silmeye çalışmış."},
        ],
        "BlackArch": [
            {"file": "exploit_payload.bin", "type": "binary", "magic_bytes": "7F 45 4C 46", "recovery_rate": "55%", "note": "Silinmiş exploit payload.", "adli_not": "ELF header tespit edildi."},
        ],
    }

    @staticmethod
    def generate_raw_disk_chunk(size: int = 256) -> str:
        hex_chars = string.hexdigits.upper()
        return " ".join("".join(random.choice(hex_chars) for _ in range(2)) for _ in range(size))

    @classmethod
    def run_deep_dive(cls, os_type: str, ip: str = "") -> Dict:
        time.sleep(2)
        os_lower = os_type.lower()
        if "kali" in os_lower:
            os_key = "Kali Linux"
        elif "parrot" in os_lower:
            os_key = "Parrot OS"
        elif "blackarch" in os_lower:
            os_key = "BlackArch"
        elif "pardus" in os_lower:
            os_key = "Pardus"
        elif "windows" in os_lower:
            os_key = "Windows"
        elif "ios" in os_lower:
            os_key = "iOS"
        else:
            os_key = "Pardus"
        files = cls.OS_RECOVERABLE_FILES.get(os_key, cls.OS_RECOVERABLE_FILES["Pardus"])
        recovered = [dict(f) for f in random.sample(files, min(2, len(files)))]
        return {
            "os": os_type,
            "ip": ip,
            "scan_time_sec": 2,
            "raw_disk_head": cls.generate_raw_disk_chunk(256),
            "recovered_files": recovered,
        }
