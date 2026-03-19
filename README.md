# Locard-Prensibi

**Digital Forensic & Footprint Simulator**

> *"Every Contact Leaves a Trace"* — *Her Temas İz Bırakır* — Edmond Locard

---

## Nedir?

Locard-Prensibi, dijital ayak izleri, adli bilişim metodolojisi ve veri bütünlüğü üzerine bir **farkındalık aracıdır**. Siber saldırı senaryolarını simüle ederek, gerçek dünyada kullanılan adli bilişim tekniklerini eğitim ortamında deneyimlemenizi sağlar.

---

## Özellikler

| Özellik | Açıklama |
|---------|----------|
| **Canlı Harita** | Leaflet tabanlı interaktif harita; saldırı izlerini coğrafi olarak görselleştirir |
| **Bank Heist Simülasyonu** | WebSocket ile saniyede 5 saldırı izi; dünya genelinden İstanbul'a akan saldırı vektörleri |
| **Deep Dive (File Carving)** | Silinen dosyalardan kurtarma simülasyonu; hex dump, magic bytes, kurtarılan dosya listesi |
| **Evidence Vault** | Delilleri SHA-256 ile mühürleme; Chain of Custody ve bütünlük kontrolü |
| **Forensic Wiki** | IP takibi, hex verisi, timestamp, Locard Prensibi gibi kavramların kısa açıklamaları |
| **Hukuki & Etik Panel** | KVKK, GDPR ve TCK 243-246 maddelerine atıf; eğitim amaçlı kullanım vurgusu |

---

## Kurulum

### Gereksinimler

- **Backend:** Python 3.9+, pip
- **Frontend:** Node.js 18+, npm

### Adım 1: Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend: **http://localhost:8000**

### Adım 2: Frontend

Yeni bir terminal açın:

```bash
cd frontend
npm install
npm run dev
```

Frontend: **http://localhost:3000**

### Adım 3: Test

1. Tarayıcıda http://localhost:3000 adresine gidin
2. Senaryo seçin (Banka Soygunu, Ransomware, Veri Sızıntısı, Phishing)
3. **SİMÜLASYONU BAŞLAT** butonuna tıklayın
4. Haritadaki saldırı izlerine tıklayarak Deep Dive ve Evidence Vault kullanın

---

## ⚖️ Hukuki Uyarı (Legal Disclaimer)

Bu proje **tamamen eğitim amaçlıdır**. Gerçek sistemler üzerinde izinsiz kullanımı suçtur.

### KVKK & GDPR

- Veri minimizasyonu: Bu simülasyon gerçek kişi verileri değil, sentetik üretilmiş veriler kullanır.
- Açık rıza: Gerçek bir ağ üzerinde izleme yapmadan önce, sistem sahiplerinden yazılı onay alınması zorunludur.

### TCK 243-246: Bilişim Suçları

- Sisteme izinsiz girme (TCK 243) hapis cezasıyla sonuçlanabilir.
- Verileri yok etme/değiştirme, adaleti yanıltma suçuna girer.

### Sorumluluk

Kullanıcılar, bu aracı yalnızca yasal ve etik sınırlar içinde, yetkili ortamlarda kullanmakla yükümlüdür.

---

## Lisans

MIT
