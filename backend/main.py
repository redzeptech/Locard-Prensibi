"""
Locard-Prensibi — FastAPI Backend
Dijital adli bilişim ve ayak izi analizi API.
"""

import asyncio
import json
import random
from datetime import datetime

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Dict, Optional

from export_report import generate_forensic_report
from forensic_engine import ForensicAnalyzer

app = FastAPI(title="Locard Prensibi OSINT & Forensic Project")

# Bank Heist — Saldırı kaynak lokasyonları (dünya geneli)
ATTACK_ORIGINS = [
    (39.9042, 116.4074),   # Pekin, Çin
    (55.7558, 37.6173),    # Moskova, Rusya
    (40.7128, -74.0060),   # New York, ABD
    (-23.5505, -46.6333),  # São Paulo, Brezilya
    (35.6762, 139.6503),   # Tokyo, Japonya
    (51.5074, -0.1278),    # Londra, UK
    (48.8566, 2.3522),     # Paris, Fransa
    (52.5200, 13.4050),    # Berlin, Almanya
    (37.7749, -122.4194),  # San Francisco, ABD
    (19.4326, -99.1332),   # Mexico City
    (-33.8688, 151.2093),  # Sidney, Avustralya
]
BANK_SERVER = (41.0082, 28.9784)  # İstanbul
ATTACK_TYPES = ["DDoS", "SQL Injection", "Brute Force", "Phishing", "Zero-Day"]
ATTACK_OS = ["Kali Linux", "Parrot OS", "BlackArch", "BackBox"]
ATTACK_VECTORS = [
    "SQL Injection", "SSH Brute Force", "Log Forgery", "XSS Payload",
    "RCE Exploit", "Credential Stuffing", "Session Hijacking", "Buffer Overflow",
]
ATTACK_TOOLS = [
    "Metasploit", "Nmap", "Custom Python Script", "Sqlmap", "Hydra",
    "Burp Suite", "Cobalt Strike", "Mimikatz", "John the Ripper",
]
RECOVERED_FILES = [
    ("exploit.py", 72, 95), ("payload.sh", 65, 88), ("inject.sql", 80, 98),
    ("bruteforce.py", 55, 82), ("keylogger.c", 70, 90), ("backdoor.ps1", 60, 85),
    ("cred_dump.py", 75, 92), ("shell.elf", 45, 78), ("config.json", 90, 99),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ExportReportRequest(BaseModel):
    ip: str = ""
    os_type: str = "Windows"
    recovered_files: List[Dict] = []
    forensic_note: Optional[str] = None


@app.post("/export-report")
async def export_report(
    body: ExportReportRequest,
    format: str = "markdown",
):
    """
    Resmi Adli Bilişim Raporu oluşturur.
    DOSYA NO: LP-2026-XXX, DİJİTAL DELİL TUTANAĞI başlıkları ile.
    Query: ?format=markdown | json
    """
    content_bytes, sha256_hash, filename = generate_forensic_report(
        ip=body.ip,
        os_type=body.os_type,
        recovered_files=body.recovered_files,
        forensic_note=body.forensic_note,
        format=format,
    )
    media_type = "application/json" if format.lower() == "json" else "text/markdown"
    return Response(
        content=content_bytes,
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-SHA256-Hash": sha256_hash,
        },
    )


@app.get("/deep-dive")
async def deep_dive_scan(os_type: str = "Windows", ip: str = ""):
    """Derin File Carving taraması."""
    result = ForensicAnalyzer.run_deep_dive(os_type, ip)
    return {"status": "Deep Dive Complete", **result}


@app.websocket("/ws/bank-heist")
async def bank_heist_websocket(websocket: WebSocket):
    """Siber Banka Soygunu Simülasyonu — saniyede 5 saldırı izi (enlem, boylam, IP, OS), dünya geneli."""
    await websocket.accept()
    try:
        trace_id = 0
        while True:
            count = 5
            for _ in range(count):
                trace_id += 1
                origin = random.choice(ATTACK_ORIGINS)
                # Silinmiş saldırı kodlarından kurtarılan deliller (1-3 dosya)
                num_recovered = random.randint(1, 3)
                recovered = []
                for fname, lo, hi in random.sample(RECOVERED_FILES, min(num_recovered, len(RECOVERED_FILES))):
                    rate = random.randint(lo, hi)
                    recovered.append({"file": fname, "recovery_rate": f"{rate}%", "note": "Silinmiş saldırı kodu kurtarıldı"})
                trace = {
                    "id": trace_id,
                    "os": random.choice(ATTACK_OS),
                    "ip": f"{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}",
                    "location": list(origin),
                    "target": list(BANK_SERVER),
                    "trace_type": random.choice(ATTACK_TYPES),
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                    "attack": True,
                    "threat_level": random.choice(["Critical", "High", "Medium"]),
                    "attack_vector": random.choice(ATTACK_VECTORS),
                    "attack_tool": random.choice(ATTACK_TOOLS),
                    "recovered_evidence": recovered,
                }
                await websocket.send_text(json.dumps(trace))
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        pass


@app.get("/")
async def root():
    return {"message": "Locard Prensibi API", "docs": "/docs"}
