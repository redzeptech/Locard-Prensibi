'use client';

interface WikiEntry {
  q: string;
  a: string;
  icon: string;
}

const WIKI_ENTRIES: WikiEntry[] = [
  {
    icon: '🌐',
    q: 'Neden 127.0.0.1 yerine gerçek IP peşindeyiz?',
    a: '127.0.0.1 (localhost) sadece kendi makineni işaret eder — adli bilişimde failin kimliğine ulaşmak için gerçek kaynak IP şart. NAT, proxy, VPN zincirini takip etmek zor; ama loglar, WHOIS, ISP işbirliği ile failin coğrafi konumu ve kimliği tespit edilebilir. Mahkemede "saldırı bu IP\'den geldi" demek için gerçek IP delildir.',
  },
  {
    icon: '📐',
    q: 'Hex verisi neden okunmalı?',
    a: 'Dosyalar diskte ham byte olarak durur. Hex dump, silinmiş verilerin kalıntılarını, dosya imzalarını (magic bytes), şifrelenmiş blokları ve manipülasyon izlerini gösterir. ASCII\'de görünmeyen NULL byte\'lar, bozuk header\'lar hex\'te ortaya çıkar. File carving tam da bu ham veriden dosya kurtarma sanatıdır.',
  },
  {
    icon: '🔐',
    q: 'SHA-256 neden delil bütünlüğü için kullanılır?',
    a: 'Hash fonksiyonu, dosyadaki tek bit değişikliğinde tamamen farklı bir çıktı üretir. Mahkemede "bu delil orijinal mi?" sorusuna cevap: mühürleme anındaki hash ile şimdiki hash aynıysa delil bozulmamıştır. Chain of Custody\'nin temel taşı.',
  },
  {
    icon: '⏱',
    q: 'Timestamp neden bu kadar kritik?',
    a: 'Siber saldırıda zaman çizelgesi (timeline) kurmak zorunludur. Log\'daki UTC timestamp, failin ne zaman bağlandığını, hangi sırayla komut çalıştırdığını gösterir. Saat dilimi farkları, NTP manipülasyonu — hepsi analiz edilir. "O saatte ben evdeydim" savunması timestamp ile çürütülebilir.',
  },
  {
    icon: '🖥',
    q: 'OS (İşletim Sistemi) parmak izi neden önemli?',
    a: 'Her OS, TTL, window size, TCP fingerprint gibi farklı davranışlar sergiler. Nmap, p0f gibi araçlar bu imzaları kullanarak uzaktan OS tespiti yapar. Failin Kali/Parrot kullandığını bilmek, saldırı aracı ve motivasyonu hakkında ipucu verir.',
  },
  {
    icon: '📂',
    q: 'File Carving nedir ve neden kullanılır?',
    a: 'Silinen dosyalar diskten "silinmez" — sadece FAT/NTFS tablosundaki kayıt kaldırılır. Ham disk sektörlerini tarayıp magic bytes (örn. PDF: %PDF, JPEG: FF D8 FF) ile başlayan blokları bulup çıkarma işlemidir. Fail silse bile delil kurtarılabilir.',
  },
  {
    icon: '🔗',
    q: 'Chain of Custody (Delil Zinciri) ne demek?',
    a: 'Delilin ele geçirilmesinden mahkemeye sunulmasına kadar her el değişiminin kayıt altına alınmasıdır. Kim, ne zaman, nerede aldı — her adım imzalı tutanakla belgelenir. Zincir kırılırsa delil reddedilebilir.',
  },
  {
    icon: '🕵',
    q: 'Locard Prensibi tam olarak ne diyor?',
    a: '"Her temas iz bırakır." Edmond Locard\'ın bu prensibi fiziksel adli tıptan siber dünyaya taşındı. Fail sisteme dokunduğunda log, cache, geçici dosya, registry — bir yerde mutlaka iz kalır. Biz o izleri topluyoruz.',
  },
];

interface ForensicWikiProps {
  open: boolean;
  onClose: () => void;
}

export default function ForensicWiki({ open, onClose }: ForensicWikiProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-cyber-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-cyber-border flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-cyber-cyan flex items-center gap-2">
            📚 Forensic Wiki
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white hover:bg-slate-700 rounded transition-colors"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-slate-500 text-sm">
            Uzmanlık gerektiren kısa bilgiler — merak edenler için.
          </p>
          {WIKI_ENTRIES.map((entry, i) => (
            <article
              key={i}
              className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 hover:border-cyan-500/40 transition-colors"
            >
              <h3 className="text-cyan-400 font-semibold text-sm mb-2 flex items-center gap-2">
                <span>{entry.icon}</span>
                {entry.q}
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">{entry.a}</p>
            </article>
          ))}
        </div>
        <div className="p-3 border-t border-cyber-border bg-slate-950/80 text-slate-500 text-xs text-center">
          Gerçek farkındalık sorularla başlar. Sorularınız için: adli bilişim toplulukları, üniversite laboratuvarları.
        </div>
      </div>
    </div>
  );
}
