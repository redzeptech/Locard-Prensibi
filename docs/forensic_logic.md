# Adli Bilişimcinin "Nereye Baktığı" — Projenin Ruhu

Bu belge, Locard-Prensibi projesindeki adli bilişim mantığının **neden** ve **nasıl** kısmını açıklar. Her platform için analizcinin neden belirli yerlere baktığını anlamak, projenin ruhunu kavramak için kritiktir.

---

## Windows Analizi

**Neden Prefetch'e bakıyoruz?**

Çünkü bir programın en son ne zaman ve kaç kez çalıştırıldığının tek kanıtı oradadır. Prefetch dosyaları (`C:\Windows\Prefetch\`), Windows'un uygulama başlatma performansını artırmak için tuttuğu kayıtlardır. Fail bir programı "hiç çalıştırmadım" dese bile, Prefetch sayacı ve son erişim zamanı gerçeği fısıldar. Her temas iz bırakır — programın diske teması da bu izi bırakır.

---

## Pardus (Linux) Analizi

**Neden /var/log/syslog?**

Çünkü sistemdeki her donanımsal temas (USB takılması, ağ bağlantısı, disk mount edilmesi vb.) burada iz bırakır. Syslog, kernel ve sistem servislerinin tüm önemli olaylarını kaydeder. Fail "o USB'yi hiç takmadım" dese bile, syslog'daki kernel mesajları cihazın takıldığı anı ve sürücü bilgisini ortaya çıkarır. Her temas iz bırakır — donanımın sisteme teması da bu izi bırakır.

---

## Android Analizi

**Neden SQLite?**

Çünkü silinen mesajlar veritabanı sayfasından hemen silinmez, sadece "boş" olarak işaretlenir. SQLite, silme işleminde veriyi fiziksel olarak silmek yerine sayfayı free list'e ekler. File Carving ve unallocated space analizi ile bu "silinmiş" mesajların kalıntıları kurtarılabilir. Fail "o mesajları sildim" dese bile, disk hücrelerindeki manyetik izler gerçeği fısıldar. Her temas iz bırakır — verinin diske teması da bu izi bırakır.

---

## Lokasyon Analizi: Neden İstanbul?

**Adli Bilişimci Perspektifi**

İstanbul lokasyonundan bir Linux (Pardus) teması yakalandı. Bu iz, 127.0.0.1 üzerinden geliyor olabilir ancak gerçek dünyada failin ISP (İnternet Servis Sağlayıcı) verileriyle eşleştiğinde ev adresine kadar uzanan bir delil zinciri oluşturur. Coğrafi konum verisi, IP adresi ile birleştiğinde failin fiziksel hareket alanını daraltır.

---

## Locard Prensibi Özeti

> *"Every contact leaves a trace" — Her temas iz bırakır.*

Adli bilişimci, failin "temas ettiği" her dijital ve donanımsal noktaya bakar: Prefetch, syslog, SQLite, Registry, bash_history, SMS veritabanı... Fail izleri silmeye çalışsa bile, disk plakalarındaki manyetik izler veya SSD hücreleri gerçeği fısıldar.
