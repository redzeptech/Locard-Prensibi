<div align="center">

# 🔬 Locard-Prensibi

## **Digital Forensic Simulator**

### *Every contact leaves a trace* — *Her temas iz bırakır*

[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

---

## 📋 İçindekiler

- [Nedir?](#-nedir)
- [🔄 İnfografik Akış](#-infografik-akış-visual-flow)
- [🖥️ İşletim Sistemi Spesifik İzler](#️-işletim-sistemi-spesifik-izler-os-footprints)
- [⚙️ Teknik Mimari](#️-teknik-mimari-tech-stack)
- [🚀 Kurulum Rehberi](#-kurulum-rehberi-installation)
- [⚖️ Hukuki Farkındalık](#️-hukuki-farkındalık-legal-awareness)
- [📸 Ekran Görüntüleri](#-ekran-görüntüleri-screenshots)

---

## 🎯 Nedir?

**Locard-Prensibi**, dijital ayak izleri, adli bilişim metodolojisi ve veri bütünlüğü üzerine tasarlanmış bir **farkındalık ve eğitim aracıdır**. Edmond Locard'ın ünlü prensibinden ilham alarak, siber saldırı senaryolarını simüle eder ve gerçek dünyada kullanılan adli bilişim tekniklerini güvenli bir ortamda deneyimlemenizi sağlar.

| Özellik | Açıklama |
|:-------:|----------|
| 🗺️ | **Canlı Harita** — Leaflet tabanlı interaktif coğrafi görselleştirme |
| ⚔️ | **Bank Heist Simülasyonu** — WebSocket ile gerçek zamanlı saldırı izleri |
| 🔍 | **Deep Dive** — File Carving, hex dump, magic bytes analizi |
| 💾 | **Evidence Vault** — SHA-256 mühürleme ve Chain of Custody |
| 📚 | **Forensic Wiki** — Uzmanlık gerektiren kavramların açıklamaları |

---

## 🔄 İnfografik Akış (Visual Flow)

Projenin çalışma mantığı — adım adım siber adli bilişim süreci:

| Adım | Aşama | Açıklama | İkon |
|:----:|-------|----------|:----:|
| **1** | **Saldırı** | Dünya genelinden hedefe (İstanbul) akan saldırı vektörleri; IP, OS, koordinat verileri | 🛡️ |
| **2** | **Tespit** | Harita üzerinde saldırı çizgileri ve marker'larla görsel tespit; Dark Web Leaks paneli | 🔍 |
| **3** | **Derin Analiz** | Deep Dive modal: File Carving, hex dump, kurtarılan dosyalar, attack vector/tool bilgisi | ⚖️ |
| **4** | **Mühürleme** | Evidence Vault'a ekleme; SHA-256 hash ile delil bütünlüğü; PDF rapor indirme | 💾 |

```
🛡️ Saldırı  →  🔍 Tespit  →  ⚖️ Derin Analiz  →  💾 Mühürleme
```

---

## 🖥️ İşletim Sistemi Spesifik İzler (OS Footprints)

Simülasyonda her işletim sistemi için farklı adli kanıt türleri modellenir:

| İşletim Sistemi | Adli Kanıt Türü | Açıklama |
|-----------------|------------------|----------|
| **🇹🇷 Pardus (TR)** | `bash_history`, `~/.bashrc`, syslog, package logs | Türkiye'nin milli işletim sistemi; Linux tabanlı, kamu ve eğitim ortamlarında yaygın. SSH logları, komut geçmişi kritik delildir. |
| **🪟 Windows** | Registry, Event Logs, Prefetch, `%TEMP%`, Recycle Bin | NTUSER.DAT, SYSTEM, SECURITY logları; uygulama izleri ve kullanıcı aktivitesi. |
| **🍎 MacOS** | Plist dosyaları, `~/Library/`, system.log, Spotlight metadata | Property List dosyaları; uygulama tercihleri ve kullanım izleri. |
| **📱 Android / iOS** | Log files, SQLite DB, cache, backup artifacts | Uygulama veritabanları, konum geçmişi, cihaz logları. |

> **💡 Pardus Vurgusu:** Proje, Türkiye'de kamu kurumları ve üniversitelerde kullanılan **Pardus** işletim sisteminin adli izlerini özellikle simüle eder. Veri Sızıntısı (Insider) senaryosunda Ankara → dış hedeflere Pardus tabanlı sızıntı akışı gösterilir.

---

## ⚙️ Teknik Mimari (Tech Stack)

### Backend

| Teknoloji | Kullanım |
|-----------|----------|
| **FastAPI** | REST API, WebSocket endpoint'leri |
| **WebSockets** | Gerçek zamanlı saldırı izi akışı (`/ws/bank-heist`) |
| **Python 3.8+** | Adli bilişim motoru, rapor üretimi |

### Frontend

| Teknoloji | Kullanım |
|-----------|----------|
| **Next.js 14** | React framework, App Router |
| **React-Leaflet** | Harita görselleştirme, marker'lar, Polyline/Curve |
| **Tailwind CSS** | Styling, cyber-dark tema |
| **crypto-js** | SHA-256 hashing (delil mühürleme) |
| **jsPDF** | Forensic rapor PDF export |

### Security & Forensics

| Bileşen | Açıklama |
|---------|----------|
| **SHA-256 Hashing** | Delil bütünlüğü; `fileName\|fileSize\|timestamp` ile benzersiz mühür |
| **File Carving Simulation** | Magic bytes, hex dump, kurtarılan dosya listesi |
| **Chain of Custody** | Evidence Vault ile delil zinciri takibi |

---

## 🚀 Kurulum Rehberi (Installation)

### Gereksinimler

| Bileşen | Versiyon |
|---------|----------|
| **Python** | 3.8+ |
| **Node.js** | 18+ |
| **npm** | 9+ |

### 🛠️ Kurulum ve Gereksinimler Notu

| Ortam | Komutlar |
|-------|----------|
| **Backend** | `pip install -r requirements.txt` ve `uvicorn main:app --reload` |
| **Frontend** | `npm install` ve `npm run dev` |

### Adım 1: Repoyu Klonla

```bash
git clone https://github.com/YOUR_USERNAME/Locard-Prensibi.git
cd Locard-Prensibi
```

### Adım 2: Backend'i Çalıştır

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

✅ Backend: **http://localhost:8000**

### Adım 3: Frontend'i Çalıştır

Yeni bir terminal açın:

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend: **http://localhost:3000**

### Adım 4: Test Et

1. Tarayıcıda **http://localhost:3000** adresine gidin
2. Senaryo seçin: **Banka Soygunu** | Ransomware | Veri Sızıntısı | Phishing
3. **SİMÜLASYONU BAŞLAT** butonuna tıklayın
4. Haritadaki saldırı çizgilerine tıklayarak **Deep Dive** açın
5. **Delil Kasası**na ekleyip **Mühürle & Kasaya At** ile SHA-256 mühürleyin

---

## ⚖️ Hukuki Farkındalık (Legal Awareness)

> ⚠️ **Bu proje tamamen eğitim amaçlıdır.** Gerçek sistemler üzerinde izinsiz kullanımı suçtur.

### 🇪🇺 🇹🇷 KVKK & GDPR Uyumu

| Prensip | Açıklama |
|---------|----------|
| **Veri Minimizasyonu** | Bu simülasyon gerçek kişi verileri değil, **sentetik üretilmiş** veriler kullanır. |
| **Açık Rıza** | Gerçek bir ağ üzerinde izleme yapmadan önce, sistem sahiplerinden **yazılı onay** alınması zorunludur. İzinsiz "temas", KVKK kapsamında suç teşkil edebilir. |

### 📜 TCK 243-246: Bilişim Suçları

| Madde | İçerik |
|-------|--------|
| **TCK 243** | Bilişim sistemine hukuka aykırı girme — hapis cezası |
| **TCK 244** | Sistemi engelleme, bozma |
| **TCK 245** | Verileri yok etme, değiştirme |
| **TCK 246** | Banka veya kredi kartlarının kötüye kullanılması |

> **"Merak ettim, sadece baktım"** hukuki bir savunma değildir. Bu araç bir **mikroskoptur** — mikrobu inceleyebilirsin, ama birine bulaştırmak suçtur.

---

## 📸 Ekran Görüntüleri (Screenshots)

### Canlı Harita — Saldırı İzleri

<!-- Harita ekran görüntüsü buraya eklenecek -->
<!-- ![Live Map](docs/screenshots/live-map.png) -->

> 📌 **Harita görseli:** `docs/screenshots/live-map.png` — Saldırı çizgileri, İstanbul hedefi, Dark Web Leaks paneli

### Deep Dive — File Carving Modal

<!-- Deep Dive ekran görüntüsü buraya eklenecek -->
<!-- ![Deep Dive](docs/screenshots/deep-dive.png) -->

> 📌 **Deep Dive görseli:** `docs/screenshots/deep-dive.png` — Hex dump, kurtarılan dosyalar, Mühürle & Kasaya At butonu

### Evidence Vault — Mühürlü Deliller

<!-- Evidence Vault ekran görüntüsü buraya eklenecek -->
<!-- ![Evidence Vault](docs/screenshots/evidence-vault.png) -->

> 📌 **Vault görseli:** `docs/screenshots/evidence-vault.png` — SHA-256 hash, delil listesi, PDF rapor

---

<div align="center">

**Locard-Prensibi** — *Every contact leaves a trace*

[⬆ Başa Dön](#-locard-prensibi)

</div>
