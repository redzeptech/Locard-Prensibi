'use client';

import { useState } from 'react';

export default function LegalEthics() {
  const [expanded, setExpanded] = useState(false);

  return (
    <footer className="border-t border-cyber-border bg-slate-950/95 mt-auto">
      {/* Compact disclaimer bar - always visible */}
      <div
        className="px-4 py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/50 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <span className="text-amber-500/90">⚖️</span>
          <span>
            Bu proje tamamen <strong className="text-slate-400">eğitim amaçlıdır</strong>. Gerçek sistemler üzerinde izinsiz kullanımı suçtur.
          </span>
        </div>
        <span className="text-slate-600 text-xs shrink-0">
          {expanded ? '▲ Kapat' : '▼ Hukuki Notlar'}
        </span>
      </div>

      {/* Expandable Legal & Ethics panel */}
      {expanded && (
        <div className="px-4 pb-6 pt-2 space-y-6 border-t border-slate-800/80">
          <h3 className="text-amber-400/90 font-bold text-sm flex items-center gap-2">
            ⚖️ Bilişim Hukuku & Etik Uyumluluk Paneli
          </h3>

          <div className="grid gap-4 text-xs text-slate-400">
            {/* KVKK & GDPR */}
            <section>
              <h4 className="text-cyan-400/90 font-semibold mb-2 flex items-center gap-2">
                🇪🇺 🇹🇷 KVKK ve GDPR Uyumu
              </h4>
              <ul className="space-y-1.5 pl-2">
                <li>
                  <strong className="text-slate-300">Veri Minimizasyonu:</strong> Bu simülasyon, gerçek kişilerin verilerini değil, eğitim amaçlı üretilmiş sentetik (sahte) verileri kullanır.
                </li>
                <li>
                  <strong className="text-slate-300">Açık Rıza:</strong> Gerçek bir ağ üzerinde izleme yapmadan önce, sistem sahiplerinden yazılı onay alınması zorunludur. Unutma; izinsiz &quot;temas&quot;, KVKK kapsamında suç teşkil edebilir.
                </li>
              </ul>
            </section>

            {/* TCK */}
            <section>
              <h4 className="text-cyan-400/90 font-semibold mb-2 flex items-center gap-2">
                📜 TCK 243-246: Bilişim Suçları Kapsamı
              </h4>
              <ul className="space-y-1.5 pl-2">
                <li>
                  <strong className="text-slate-300">Sisteme İzinsiz Girme:</strong> &quot;Merak ettim, sadece baktım&quot; demek hukuki bir savunma değildir. TCK 243 uyarınca bir bilişim sistemine hukuka aykırı girmek hapis cezasıyla sonuçlanabilir.
                </li>
                <li>
                  <strong className="text-slate-300">Verileri Yok Etme/Değiştirme:</strong> Simülasyonda yaptığımız &quot;File Carving&quot; gerçek dünyada bir delili karartmak için kullanılırsa, adaleti yanıltma suçuna girer.
                </li>
              </ul>
            </section>

            {/* USOM/BTK */}
            <section>
              <h4 className="text-cyan-400/90 font-semibold mb-2 flex items-center gap-2">
                🛡️ Siber Güvenlik Başkanlığı (USOM/BTK) Perspektifi
              </h4>
              <ul className="space-y-1.5 pl-2">
                <li>
                  Bu proje, &quot;Beyaz Şapkalı Hacker&quot; (Ethical Hacker) yetiştirmek, saldırı vektörlerini anlayarak savunma hattını (Blue Team) güçlendirmek için tasarlanmıştır.
                </li>
                <li>
                  Gerçek bir siber olayda, müdahale yetkisi sadece yetkili adli bilişim uzmanlarına ve kolluk kuvvetlerine aittir.
                </li>
              </ul>
            </section>

            {/* Golden Rule */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <h4 className="text-amber-400 font-semibold mb-2 flex items-center gap-2">
                🎓 Öğrenciler ve Üniversiteler İçin Altın Kural
              </h4>
              <p className="text-slate-300 italic">
                &quot;Bu araç bir silah değil, bir mikroskoptur. Mikroskopla mikrobu inceleyebilirsin ama mikrobu birine bulaştırmak suçtur.&quot;
              </p>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
