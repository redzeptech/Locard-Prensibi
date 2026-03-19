"""
Locard-Prensibi — Resmi Adli Bilişim Raporu Export
POST /export-report endpoint için rapor oluşturma modülü.
"""

import hashlib
import json
from datetime import datetime
from typing import List, Dict, Optional


# Rapor numarası sayacı (LP-2026-XXX)
_report_counter = 0


def _next_report_no() -> str:
    global _report_counter
    _report_counter += 1
    return f"LP-2026-{_report_counter:03d}"


def _build_markdown_report(
    ip: str,
    os_type: str,
    recovered_files: List[Dict],
    forensic_note: str,
    file_no: str,
) -> str:
    """Markdown formatında profesyonel rapor oluşturur."""
    lines = [
        "# DİJİTAL DELİL TUTANAĞI",
        "",
        f"**DOSYA NO:** {file_no}",
        f"**Tarih:** {datetime.now().strftime('%d.%m.%Y %H:%M')}",
        "",
        "---",
        "",
        "## 1. Genel Bilgiler",
        "",
        f"- **IP Adresi:** `{ip}`",
        f"- **İşletim Sistemi:** {os_type}",
        "",
        "## 2. Kurtarılan Dosyalar",
        "",
        "| Dosya | Tür | Kurtarılma | Forensic Note |",
        "|-------|-----|-------------|---------------|",
    ]
    for f in recovered_files:
        file_name = f.get("file", "-")
        ftype = f.get("type", "-")
        rate = f.get("recovery_rate") or f.get("status", "-")
        note = f.get("note", "") or f.get("adli_not", "")
        note_esc = note.replace("|", "\\|")[:80]
        lines.append(f"| {file_name} | {ftype} | {rate} | {note_esc} |")

    lines.extend([
        "",
        "## 3. Forensic Note",
        "",
        forensic_note,
        "",
        "---",
        "",
        "_Every contact leaves a trace — Her temas iz bırakır_",
        "",
    ])
    return "\n".join(lines)


def _build_json_report(
    ip: str,
    os_type: str,
    recovered_files: List[Dict],
    forensic_note: str,
    file_no: str,
) -> str:
    """JSON formatında profesyonel rapor oluşturur."""
    data = {
        "dosya_no": file_no,
        "baslik": "DİJİTAL DELİL TUTANAĞI",
        "tarih": datetime.now().isoformat(),
        "ip_adresi": ip,
        "isletim_sistemi": os_type,
        "kurtarilan_dosyalar": recovered_files,
        "forensic_note": forensic_note,
        "watermark": "Every contact leaves a trace — Her temas iz bırakır",
    }
    return json.dumps(data, ensure_ascii=False, indent=2)


def generate_forensic_report(
    ip: str,
    os_type: str,
    recovered_files: List[Dict],
    forensic_note: Optional[str] = None,
    format: str = "markdown",
) -> tuple:
    """
    Rapor içeriğini üretir.
    Returns: (content_bytes, sha256_hash, filename)
    """
    file_no = _next_report_no()
    default_note = (
        "Her temas bir iz bırakır. Fail bu dosyaları sildiğini sansa da "
        "disk plakalarındaki manyetik izler (veya SSD hücreleri) gerçeği fısıldar."
    )
    note = forensic_note or default_note

    if format.lower() == "json":
        content = _build_json_report(ip, os_type, recovered_files, note, file_no)
        ext = "json"
    else:
        content = _build_markdown_report(ip, os_type, recovered_files, note, file_no)
        ext = "md"

    content_bytes = content.encode("utf-8")
    sha256_hash = hashlib.sha256(content_bytes).hexdigest()
    filename = f"adli_rapor_{file_no.replace('-', '_')}.{ext}"
    return content_bytes, sha256_hash, filename
