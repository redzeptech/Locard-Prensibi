'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import CryptoJS from 'crypto-js';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type ThreatLevel = 'Critical' | 'High' | 'Medium';

interface RecoveredEvidence {
  file: string;
  recovery_rate: string;
  note?: string;
}

interface TraceData {
  id: number;
  os: string;
  ip: string;
  location: [number, number];
  target?: [number, number];
  trace_type: string;
  timestamp: string;
  attack?: boolean;
  threat_level?: ThreatLevel;
  attack_vector?: string;
  attack_tool?: string;
  recovered_evidence?: RecoveredEvidence[];
}

interface RecoveredFile {
  file: string;
  type: string;
  status: string;
  recovery_rate?: string;
  note: string;
  magic_bytes?: string;
  adli_not?: string;
}

interface SealedEvidence {
  id: string;
  fileName: string;
  fileSize?: string;
  timestamp: string;
  hash: string;
  recoveryRate?: string;
  note?: string;
  sourceIp?: string;
  sourceOs?: string;
}

interface DeepDiveResult {
  os: string;
  scan_time_sec: number;
  raw_disk_head: string;
  recovered_files: RecoveredFile[];
}

const OS_ICONS: Record<string, string> = {
  'Windows 11': '🪟',
  'Linux (Pardus)': '🇹🇷',
  'MacOS': '🍎',
  'Android 14': '📱',
  'iOS 17': '📱',
  'ChromeOS': '🌐',
};

const DARK_WEB_LEAK_TEMPLATES = [
  (n: number, btc: string) => `${n.toLocaleString()} Credit Cards from Istanbul Bank for sale - ${btc} BTC`,
  (n: number, btc: string) => `[LEAK] ${n} Turkish Bank credentials - ${btc} BTC - Escrow`,
  (n: number, btc: string) => `Fresh dump: Istanbul Bank DB - ${n} accounts - ${btc} BTC`,
  (n: number, btc: string) => `Bank heist logs + card dumps - ${n} records - ${btc} BTC`,
  (n: number, btc: string) => `[TOR] SWIFT logs Istanbul - ${n} transactions - ${btc} BTC`,
  (n: number, btc: string) => `Fullz from Istanbul Bank breach - ${n} - ${btc} BTC`,
  (n: number, btc: string) => `SQL dump Istanbul Bank - ${n} rows - ${btc} BTC`,
  (n: number, btc: string) => `[VENDOR] Bank credentials TR - ${n} - ${btc} BTC`,
  (n: number, btc: string) => `Istanbul Bank API keys + credentials - ${btc} BTC`,
  (n: number, btc: string) => `[EXCLUSIVE] ${n} CC from Istanbul breach - ${btc} BTC`,
];

function generateDarkWebLeak(): string {
  const tpl = DARK_WEB_LEAK_TEMPLATES[Math.floor(Math.random() * DARK_WEB_LEAK_TEMPLATES.length)];
  const count = Math.floor(Math.random() * 50000) + 1000;
  const btc = (Math.random() * 5 + 0.5).toFixed(1);
  return tpl(count, btc);
}

function getOSIcon(os: string): string {
  return OS_ICONS[os] || '💻';
}

function generateHexLine(): string {
  const hex = '0123456789ABCDEF';
  return Array.from({ length: 16 }, () =>
    '0x' + hex[Math.floor(Math.random() * 16)] + hex[Math.floor(Math.random() * 16)]
  ).join(' ');
}

function FlyingCompleteHandler({ onComplete, duration }: { onComplete: () => void; duration: number }) {
  useEffect(() => {
    const t = setTimeout(onComplete, duration);
    return () => clearTimeout(t);
  }, [onComplete, duration]);
  return null;
}

function isIstanbul(loc: [number, number] | undefined): boolean {
  if (!loc) return false;
  const [lat, lon] = loc;
  return lat >= 40.8 && lat <= 41.2 && lon >= 28.7 && lon <= 29.3;
}

/** Benzersiz parmak izi — dosya içeriği aynı kalsa bile hash değişmezliğini korur */
function generateSealHash(fileName: string, fileSize: string, timestamp: string): string {
  const payload = `${fileName}|${fileSize}|${timestamp}`;
  return CryptoJS.SHA256(payload).toString(CryptoJS.enc.Hex);
}

/** Bütünlük doğrulama — saldırgan değiştirirse hash bozulur */
function verifyEvidenceIntegrity(e: SealedEvidence): boolean {
  const payload = `${e.fileName}|${e.fileSize || '0 KB'}|${e.timestamp}`;
  const computed = CryptoJS.SHA256(payload).toString(CryptoJS.enc.Hex);
  return computed === e.hash;
}

function DeepDiveModal({
  os,
  ip,
  location,
  loading,
  data,
  attack_vector,
  attack_tool,
  recovered_evidence,
  trace,
  onAddToEvidenceBag,
  isInEvidenceVault,
  onSealAndVault,
  sealedFileIds,
  onClose,
}: {
  os: string;
  ip: string;
  location?: [number, number];
  loading: boolean;
  data: DeepDiveResult | null;
  attack_vector?: string;
  attack_tool?: string;
  recovered_evidence?: RecoveredEvidence[];
  trace?: TraceData;
  onAddToEvidenceBag?: () => void;
  isInEvidenceVault?: boolean;
  onSealAndVault?: (file: { fileName: string; fileSize?: string; recoveryRate?: string; note?: string }, event?: React.MouseEvent) => void;
  sealedFileIds?: Set<string>; // Set of fileName that are already sealed
  onClose: () => void;
}) {
  const [hexStream, setHexStream] = useState('');
  const [progress, setProgress] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<{ hash: string } | null>(null);
  const hexContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading) {
      setProgress(100);
      if (data?.raw_disk_head) {
        const formatted = data.raw_disk_head
          .split(/\s+/)
          .filter(Boolean)
          .map((b) => '0x' + b)
          .join(' ');
        setHexStream(formatted);
      }
      return;
    }
    setProgress(0);
    const interval = setInterval(() => {
      setHexStream((prev) => prev + generateHexLine() + '\n');
      setProgress((p) => Math.min(p + 2, 98));
    }, 20);
    return () => clearInterval(interval);
  }, [loading, data?.raw_disk_head]);

  useEffect(() => {
    if (loading && hexContainerRef.current) {
      hexContainerRef.current.scrollTop = hexContainerRef.current.scrollHeight;
    }
  }, [hexStream, loading]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleExportReport = useCallback(async () => {
    if (!data) return;
    setExporting(true);
    setExportSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/export-report?format=markdown`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip,
          os_type: os,
          recovered_files: data.recovered_files,
          forensic_note:
            'Her temas bir iz bırakır. Fail bu dosyaları sildiğini sansa da disk plakalarındaki manyetik izler (veya SSD hücreleri) gerçeği fısıldar.',
        }),
      });
      const hash = res.headers.get('X-SHA256-Hash') || '';
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `adli_rapor_${Date.now()}.md`;
      a.click();
      URL.revokeObjectURL(url);
      setExportSuccess({ hash });
    } catch {
      setExportSuccess(null);
    } finally {
      setExporting(false);
    }
  }, [data, ip, os]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-amber-500/50 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-amber-500/30 flex items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-amber-400">🔬 Deep Dive Analysis</h2>
          <div className="flex items-center gap-2">
            {onAddToEvidenceBag && (
              <button
                onClick={onAddToEvidenceBag}
                disabled={isInEvidenceVault}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  isInEvidenceVault
                    ? 'bg-green-500/30 text-green-400 cursor-default'
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
              >
                {isInEvidenceVault ? '✓ Delil Torbasında' : '👜 Delil Torbasına Ekle'}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-sm"
            >
              Kapat
            </button>
          </div>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="text-cyan-400"><strong>OS:</strong> {os}</span>
            <span className="text-cyan-400 font-mono"><strong>IP:</strong> {ip}</span>
            {attack_vector && <span className="text-red-400"><strong>Saldırı Vektörü:</strong> {attack_vector}</span>}
            {attack_tool && <span className="text-amber-400"><strong>Araç:</strong> {attack_tool}</span>}
          </div>
          {recovered_evidence && recovered_evidence.length > 0 && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4">
              <h3 className="text-red-400 font-bold text-sm mb-3">🔓 Silinmiş Saldırı Kodları — Kurtarılan Deliller</h3>
              <div className="space-y-2">
                {recovered_evidence.map((ev, i) => {
                  const isSealed = sealedFileIds?.has(ev.file);
                  return (
                    <div key={i} className="flex items-center justify-between gap-2 bg-slate-900/60 rounded px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <span className="font-mono text-cyan-400">{ev.file}</span>
                        <span className="text-green-400 font-bold ml-2">{ev.recovery_rate} Recovered</span>
                      </div>
                      {onSealAndVault && (
                        <button
                          onClick={(e) => !isSealed && onSealAndVault({
                            fileName: ev.file,
                            fileSize: `${Math.floor(Math.random() * 200) + 20} KB`,
                            recoveryRate: ev.recovery_rate,
                            note: ev.note,
                          }, e)}
                          disabled={isSealed}
                          className={`shrink-0 px-2 py-1 rounded text-xs font-medium transition-all seal-vault-btn ${
                            isSealed ? 'bg-green-500/30 text-green-400' : 'bg-amber-600 hover:bg-amber-500 text-white'
                          }`}
                        >
                          {isSealed ? '✓ Mühürlü' : '🔒 Seal & Vault'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-slate-400 text-xs mt-2">Adli bilişim: Disk carving ile silinmiş exploit dosyaları kurtarıldı.</p>
            </div>
          )}
          <div>
            <h3 className="text-amber-400/90 font-semibold text-sm mb-2">Raw Hex Data</h3>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-cyan-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-cyan-400 text-xs font-mono mb-2">%{progress} Disk Scanning...</p>
            <div
              ref={hexContainerRef}
              className="bg-slate-950 rounded p-3 font-mono text-xs text-cyan-400/80 overflow-auto max-h-32"
              style={{ whiteSpace: 'pre' }}
            >
              {hexStream || '0x4A 0x66 0x2B ...'}
            </div>
          </div>
          {!loading && data && !recovered_evidence?.length && (
            <div>
              <h3 className="text-amber-400/90 font-semibold text-sm mb-2">Kurtarılan Dosyalar</h3>
              <div className="border border-slate-600 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-800/80 text-cyan-400">
                      <th className="text-left p-2">Dosya</th>
                      <th className="text-left p-2">Magic Bytes</th>
                      <th className="text-left p-2">Kurtarılma</th>
                      <th className="text-left p-2">Adli Not</th>
                      {onSealAndVault && <th className="text-left p-2 w-28">İşlem</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {data.recovered_files.map((f, i) => {
                      const isSealed = sealedFileIds?.has(f.file);
                      return (
                        <tr key={i} className="border-t border-slate-700 hover:bg-slate-800/50">
                          <td className="p-2 font-mono text-slate-200">{f.file}</td>
                          <td className="p-2 font-mono text-amber-400/80 text-xs">{f.magic_bytes || '—'}</td>
                          <td className="p-2 text-green-400">{f.recovery_rate || f.status}</td>
                          <td className="p-2 text-slate-400 text-xs">{f.note}</td>
                          {onSealAndVault && (
                            <td className="p-2">
                              <button
                                onClick={(e) => !isSealed && onSealAndVault({
                                  fileName: f.file,
                                  fileSize: `${Math.floor(Math.random() * 300) + 50} KB`,
                                  recoveryRate: f.recovery_rate || f.status,
                                  note: f.note,
                                }, e)}
                                disabled={isSealed}
                                className={`px-2 py-1 rounded text-xs font-medium seal-vault-btn ${
                                  isSealed ? 'bg-green-500/30 text-green-400' : 'bg-amber-600 hover:bg-amber-500 text-white'
                                }`}
                              >
                                {isSealed ? '✓ Mühürlü' : '🔒 Seal & Vault'}
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <button
                onClick={handleExportReport}
                disabled={exporting}
                className="mt-3 w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {exporting ? (
                  <>
                    <span className="animate-spin">🔒</span>
                    Mühürleniyor...
                  </>
                ) : (
                  <>📄 ADLİ RAPORU OLUŞTUR</>
                )}
              </button>
              {exportSuccess && (
                <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <p className="text-green-400 text-sm">
                    Delil bütünlüğü korunarak rapor oluşturuldu. Hash Değeri: SHA-256 {exportSuccess.hash.slice(0, 16)}...
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/40">
            <p className="text-red-500 text-xs leading-relaxed font-semibold animate-pulse">
              ADLİ BİLİŞİMCİ RAPORU: Her temas bir iz bırakır. Fail bu dosyaları sildiğini sansa da disk plakalarındaki manyetik izler (veya SSD hücreleri) gerçeği fısıldar.
            </p>
          </div>
          {isIstanbul(location) && (
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <h4 className="text-cyan-400 font-bold text-sm mb-2">📍 Adli Bilişimci Perspektifi: Neden İstanbul?</h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                Analiz: İstanbul lokasyonundan bir {os.includes('Pardus') || os.includes('Linux') ? 'Linux (Pardus)' : os} teması yakalandı. Bu iz, 127.0.0.1 üzerinden geliyor olabilir ancak gerçek dünyada failin ISP (İnternet Servis Sağlayıcı) verileriyle eşleştiğinde ev adresine kadar uzanan bir delil zinciri oluşturur.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ForensicMapInner = dynamic(() => import('../components/ForensicMapInner'), { ssr: false });
const BankHeistMapInner = dynamic(() => import('../components/BankHeistMapInner'), { ssr: false });
const RansomwareMapInner = dynamic(() => import('../components/RansomwareMapInner'), { ssr: false });
const DataLeakMapInner = dynamic(() => import('../components/DataLeakMapInner'), { ssr: false });
const PhishingMapInner = dynamic(() => import('../components/PhishingMapInner'), { ssr: false });
const LegalEthics = dynamic(() => import('../components/LegalEthics'), { ssr: false });
const ForensicWiki = dynamic(() => import('../components/ForensicWiki'), { ssr: false });

type ScenarioType = 'bank-heist' | 'ransomware' | 'data-leak' | 'phishing';

const SCENARIO_LABELS: Record<ScenarioType, string> = {
  'bank-heist': 'Banka Soygunu',
  'ransomware': 'Ransomware Saldırısı',
  'data-leak': 'Veri Sızıntısı (Insider)',
  'phishing': 'Phishing Kampanyası',
};

const BANK_SERVER: [number, number] = [41.0082, 28.9784];
const ATTACK_ORIGINS: [number, number][] = [
  [39.9042, 116.4074], [55.7558, 37.6173], [40.7128, -74.006], [-23.5505, -46.6333],
  [35.6762, 139.6503], [51.5074, -0.1278], [48.8566, 2.3522], [52.52, 13.405],
  [37.7749, -122.4194], [19.4326, -99.1332], [-33.8688, 151.2093],
];
const ATTACK_OS = ['Kali Linux', 'Parrot OS', 'BlackArch', 'BackBox'];
const ATTACK_TYPES = ['DDoS', 'SQL Injection', 'Brute Force', 'Phishing', 'Zero-Day'];
const ATTACK_VECTORS = ['SQL Injection', 'SSH Brute Force', 'Log Forgery', 'XSS Payload', 'RCE Exploit'];
const ATTACK_TOOLS = ['Metasploit', 'Nmap', 'Custom Python Script', 'Sqlmap', 'Hydra'];

function generateFallbackTrace(id: number): TraceData {
  const origin = ATTACK_ORIGINS[Math.floor(Math.random() * ATTACK_ORIGINS.length)];
  return {
    id,
    os: ATTACK_OS[Math.floor(Math.random() * ATTACK_OS.length)],
    ip: `${Math.floor(Math.random() * 255) + 1}.${Math.floor(Math.random() * 255) + 1}.${Math.floor(Math.random() * 255) + 1}.${Math.floor(Math.random() * 255) + 1}`,
    location: [...origin],
    target: BANK_SERVER,
    trace_type: ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)],
    timestamp: new Date().toISOString(),
    attack: true,
    threat_level: (['Critical', 'High', 'Medium'] as const)[Math.floor(Math.random() * 3)],
    attack_vector: ATTACK_VECTORS[Math.floor(Math.random() * ATTACK_VECTORS.length)],
    attack_tool: ATTACK_TOOLS[Math.floor(Math.random() * ATTACK_TOOLS.length)],
    recovered_evidence: [
      { file: 'exploit.py', recovery_rate: `${Math.floor(Math.random() * 30) + 70}%` },
      { file: 'payload.sh', recovery_rate: `${Math.floor(Math.random() * 25) + 65}%` },
    ].slice(0, Math.floor(Math.random() * 2) + 1),
  };
}

const DEMO_TRACES: TraceData[] = [
  { id: 1, os: 'Windows 11', ip: '192.168.1.42', location: [41.0082, 28.9784], trace_type: 'SSH Denemesi', timestamp: new Date().toISOString() },
  { id: 2, os: 'Linux (Pardus)', ip: '10.0.0.15', location: [52.52, 13.405], trace_type: 'Dosya Erişimi', timestamp: new Date(Date.now() - 60000).toISOString() },
  { id: 3, os: 'Android 14', ip: '172.16.0.88', location: [40.7128, -74.006], trace_type: 'API Çağrısı', timestamp: new Date(Date.now() - 120000).toISOString() },
  { id: 4, os: 'MacOS', ip: '192.168.0.101', location: [35.6895, 139.6917], trace_type: 'Login Attempt', timestamp: new Date(Date.now() - 180000).toISOString() },
  { id: 5, os: 'iOS 17', ip: '10.10.10.5', location: [51.5074, -0.1278], trace_type: 'Network Scan', timestamp: new Date(Date.now() - 240000).toISOString() },
];

export default function HomePage() {
  const [traces, setTraces] = useState<TraceData[]>(DEMO_TRACES);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    os: string; ip: string; location?: [number, number];
    data: DeepDiveResult | null; loading: boolean;
    attack_vector?: string; attack_tool?: string; recovered_evidence?: RecoveredEvidence[];
    trace?: TraceData;
  } | null>(null);
  const [scenario, setScenario] = useState<ScenarioType>('bank-heist');
  const [bankHeistMode, setBankHeistMode] = useState(false);
  const [bankHeistWs, setBankHeistWs] = useState<WebSocket | null>(null);
  const [sealingOverlay, setSealingOverlay] = useState(false);
  const [wikiOpen, setWikiOpen] = useState(false);
  const [evidenceVault, setEvidenceVault] = useState<TraceData[]>([]);
  const [vaultSealHash, setVaultSealHash] = useState<string | null>(null);
  const [darkWebLeaks, setDarkWebLeaks] = useState<{ text: string; time: string }[]>([]);
  const [sealedEvidence, setSealedEvidence] = useState<SealedEvidence[]>([]);
  const [flyingEvidence, setFlyingEvidence] = useState<{
    from: { x: number; y: number };
    to: { x: number; y: number };
    fileName: string;
    newSeal: SealedEvidence;
  } | null>(null);
  const vaultRef = useRef<HTMLDivElement>(null);
  const fallbackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!bankHeistMode || scenario !== 'bank-heist') return;
    const interval = setInterval(() => {
      setDarkWebLeaks((prev) => [{
        text: generateDarkWebLeak(),
        time: new Date().toLocaleTimeString('tr-TR', { hour12: false }),
      }, ...prev].slice(0, 20));
    }, 2000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [bankHeistMode, scenario]);

  useEffect(() => {
    if (bankHeistMode) return;
    const base = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000/ws/traces';
    const wsUrl = base.replace(/^http/, 'ws');
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (e) => {
        try {
          const d = JSON.parse(e.data);
          setTraces((prev) => [{ ...d, location: d.location as [number, number] }, ...prev].slice(0, 20));
        } catch {}
      };
    } catch {}
    return () => { ws?.close(); };
  }, [bankHeistMode]);

  const startSimulation = useCallback(() => {
    setBankHeistMode(true);
    setTraces([]);
    setEvidenceVault([]);
    setDarkWebLeaks([]);
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }
    if (scenario === 'bank-heist') {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const wsUrl = base.replace(/^http/, 'ws') + '/ws/bank-heist';
      let traceId = 0;

      const addTracesFromBackend = (d: Record<string, unknown>) => {
        const t: TraceData = {
          id: (d.id as number) ?? traceId,
          os: (d.os as string) ?? 'Unknown',
          ip: (d.ip as string) ?? '0.0.0.0',
          location: (d.location as [number, number]) ?? ATTACK_ORIGINS[0],
          target: (d.target as [number, number]) || BANK_SERVER,
          trace_type: (d.trace_type as string) ?? 'Unknown',
          timestamp: (d.timestamp as string) ?? new Date().toISOString(),
          attack: d.attack as boolean | undefined,
          threat_level: (d.threat_level as ThreatLevel) || (['Critical', 'High', 'Medium'] as const)[Math.floor(Math.random() * 3)],
          attack_vector: d.attack_vector as string | undefined,
          attack_tool: d.attack_tool as string | undefined,
          recovered_evidence: (d.recovered_evidence as RecoveredEvidence[] | undefined) ?? [],
        };
        setTraces((prev) => [t, ...prev].slice(0, 80));
      };

      const startFallback = () => {
        if (fallbackIntervalRef.current) return;
        fallbackIntervalRef.current = setInterval(() => {
          for (let i = 0; i < 5; i++) {
            traceId += 1;
            const t = generateFallbackTrace(traceId);
            addTracesFromBackend(t as unknown as Record<string, unknown>);
          }
        }, 1000);
      };

      try {
        const ws = new WebSocket(wsUrl);
        const connectTimeout = setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            ws.close();
            startFallback();
          }
        }, 3000);
        ws.onopen = () => clearTimeout(connectTimeout);
        ws.onmessage = (e) => {
          try {
            const d = JSON.parse(e.data);
            addTracesFromBackend(d);
          } catch {}
        };
        ws.onerror = () => startFallback();
        ws.onclose = () => {
          if (fallbackIntervalRef.current) {
            clearInterval(fallbackIntervalRef.current);
            fallbackIntervalRef.current = null;
          }
        };
        setBankHeistWs(ws);
      } catch {
        startFallback();
      }
    }
  }, [scenario]);

  const stopSimulation = useCallback(async () => {
    bankHeistWs?.close();
    setBankHeistWs(null);
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }
    setBankHeistMode(false);
    setTraces(DEMO_TRACES);
    setSealingOverlay(true);
    if (evidenceVault.length > 0) {
      const payload = JSON.stringify(evidenceVault.map((t) => ({
        id: t.id, ip: t.ip, os: t.os, trace_type: t.trace_type,
        attack_vector: t.attack_vector, attack_tool: t.attack_tool,
        recovered_evidence: t.recovered_evidence, timestamp: t.timestamp,
      })));
      const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
      const hash = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0')).join('');
      setVaultSealHash(hash);
    } else {
      setVaultSealHash(null);
    }
  }, [bankHeistWs, evidenceVault]);

  const dismissSealingOverlay = useCallback(() => {
    setSealingOverlay(false);
    setVaultSealHash(null);
    setEvidenceVault([]);
  }, []);

  const addToEvidenceVault = useCallback((trace: TraceData) => {
    setEvidenceVault((prev) => {
      const key = `${trace.id}-${trace.timestamp}`;
      if (prev.some((t) => `${t.id}-${t.timestamp}` === key)) return prev;
      return [...prev, { ...trace, addedAt: Date.now() } as TraceData & { addedAt?: number }];
    });
  }, []);

  const isInEvidenceVault = useCallback((trace: TraceData) => {
    const key = `${trace.id}-${trace.timestamp}`;
    return evidenceVault.some((t) => `${t.id}-${t.timestamp}` === key);
  }, [evidenceVault]);

  const sealAndVault = useCallback((
    file: { fileName: string; fileSize?: string; recoveryRate?: string; note?: string },
    context?: { ip?: string; os?: string },
    fromRect?: { x: number; y: number }
  ) => {
    const timestamp = new Date().toISOString();
    const fileSize = file.fileSize || '0 KB';
    const hash = generateSealHash(file.fileName, fileSize, timestamp);
    const newSeal: SealedEvidence = {
      id: `seal-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      fileName: file.fileName,
      fileSize,
      timestamp,
      hash,
      recoveryRate: file.recoveryRate,
      note: file.note,
      sourceIp: context?.ip,
      sourceOs: context?.os,
    };
    if (fromRect && vaultRef.current) {
      const toRect = vaultRef.current.getBoundingClientRect();
      setFlyingEvidence({
        from: fromRect,
        to: { x: toRect.left + toRect.width / 2, y: toRect.top + 40 },
        fileName: file.fileName,
        newSeal,
      });
    } else {
      setSealedEvidence((prev) => [...prev, newSeal]);
    }
  }, []);

  const onFlyingComplete = useCallback(() => {
    if (flyingEvidence) {
      setSealedEvidence((prev) => [...prev, flyingEvidence.newSeal]);
      setFlyingEvidence(null);
    }
  }, [flyingEvidence]);

  const sealedFileNames = new Set(sealedEvidence.map((e) => e.fileName));

  const downloadForensicCaseFile = useCallback(() => {
    const lines = [
      '# FORENSIC CASE FILE — DİJİTAL DELİL TUTANAĞI',
      '',
      `**Oluşturulma:** ${new Date().toLocaleString('tr-TR')}`,
      `**Delil Sayısı:** ${sealedEvidence.length}`,
      '',
      '---',
      '',
      '## Mühürlü Deliller (Evidence Vault)',
      '',
    ];
    sealedEvidence.forEach((e, i) => {
      lines.push(`### ${i + 1}. ${e.fileName}`);
      lines.push(`- **Zaman:** ${new Date(e.timestamp).toLocaleString('tr-TR')}`);
      lines.push(`- **SHA-256:** \`${e.hash}\``);
      if (e.fileSize) lines.push(`- **Boyut:** ${e.fileSize}`);
      if (e.recoveryRate) lines.push(`- **Kurtarılma:** ${e.recoveryRate}`);
      if (e.sourceIp) lines.push(`- **Kaynak IP:** ${e.sourceIp}`);
      if (e.sourceOs) lines.push(`- **Kaynak OS:** ${e.sourceOs}`);
      if (e.note) lines.push(`- **Not:** ${e.note}`);
      lines.push('- 🔒 *Bu delil dijital olarak mühürlenmiştir*');
      lines.push('');
    });
    lines.push('---');
    lines.push('');
    lines.push('*Every contact leaves a trace — Her temas iz bırakır*');
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forensic_case_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sealedEvidence]);

  const downloadForensicReportPDF = useCallback(() => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    let y = 20;

    doc.setFontSize(18);
    doc.setTextColor(251, 191, 36);
    doc.text('FORENSIC REPORT — DİJİTAL DELİL TUTANAĞI', pageW / 2, y, { align: 'center' });
    y += 12;

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Locard Prensibi Analizi • ${new Date().toLocaleString('tr-TR')}`, pageW / 2, y, { align: 'center' });
    y += 12;

    doc.setDrawColor(251, 191, 36);
    doc.setLineWidth(0.5);
    doc.line(20, y, pageW - 20, y);
    y += 15;

    doc.setFontSize(12);
    doc.setTextColor(34, 211, 238);
    doc.text('Mühürlü Deliller (Evidence Vault)', 20, y);
    y += 10;

    sealedEvidence.forEach((e, i) => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(12);
      doc.setTextColor(241, 245, 249);
      doc.text(`${i + 1}. ${e.fileName}`, 20, y);
      y += 7;
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(`SHA-256: ${e.hash.slice(0, 16)}...${e.hash.slice(-8)}`, 25, y);
      y += 6;
      doc.text(`Zaman: ${new Date(e.timestamp).toLocaleString('tr-TR')}`, 25, y);
      y += 6;
      if (e.fileSize) { doc.text(`Boyut: ${e.fileSize}`, 25, y); y += 6; }
      if (e.sourceIp) { doc.text(`Kaynak IP: ${e.sourceIp}`, 25, y); y += 6; }
      doc.setTextColor(34, 197, 94);
      doc.text('🔒 Bu delil dijital olarak mühürlenmiştir', 25, y);
      y += 12;
    });

    y += 10;
    doc.setDrawColor(251, 191, 36);
    doc.line(20, y, pageW - 20, y);
    y += 10;
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('Every contact leaves a trace — Her temas iz bırakır', pageW / 2, y, { align: 'center' });

    doc.save(`forensic_report_${Date.now()}.pdf`);
  }, [sealedEvidence]);

  const openDeepDive = useCallback(async (trace: TraceData) => {
    setModalOpen(true);
    const isBankHeist = trace.attack && (trace.recovered_evidence?.length || trace.attack_vector || trace.attack_tool);
    if (isBankHeist) {
      setModalData({
        os: trace.os,
        ip: trace.ip,
        location: trace.location,
        data: null,
        loading: false,
        attack_vector: trace.attack_vector,
        attack_tool: trace.attack_tool,
        recovered_evidence: trace.recovered_evidence,
        trace,
      });
      return;
    }
    setModalData({ os: trace.os, ip: trace.ip, location: trace.location, data: null, loading: true, trace });
    try {
      const res = await fetch(`${API_BASE}/deep-dive?os_type=${encodeURIComponent(trace.os)}&ip=${encodeURIComponent(trace.ip)}`);
      const data = await res.json();
      setModalData({
        os: data.os || trace.os,
        ip: data.ip || trace.ip,
        location: trace.location,
        data: {
          os: data.os,
          scan_time_sec: data.scan_time_sec,
          raw_disk_head: data.raw_disk_head,
          recovered_files: data.recovered_files || [],
        },
        loading: false,
        trace,
      });
    } catch {
      setModalData((p) => p ? { ...p, data: null, loading: false } : null);
    }
  }, []);

  const closeDeepDive = useCallback(() => {
    setModalOpen(false);
    setModalData(null);
  }, []);

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };


  return (
    <div className="min-h-screen bg-cyber-dark font-terminal flex">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-cyber-border bg-cyber-card/50 backdrop-blur-sm sticky top-0 z-20 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-cyber-cyan">Locard Prensibi — Live Forensic Map</h1>
            <div className="flex items-center gap-3">
              {!bankHeistMode && (
                <select
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value as ScenarioType)}
                  className="px-3 py-2 bg-slate-800 border border-cyber-border rounded text-cyber-cyan text-sm"
                >
                  <option value="bank-heist">Banka Soygunu</option>
                  <option value="ransomware">Ransomware Saldırısı</option>
                  <option value="data-leak">Veri Sızıntısı (Insider)</option>
                  <option value="phishing">Phishing Kampanyası</option>
                </select>
              )}
              {bankHeistMode ? (
                <button
                  onClick={stopSimulation}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded"
                >
                  Durdur
                </button>
              ) : (
                <button
                  onClick={startSimulation}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded animate-forensic-blink"
                >
                  SİMÜLASYONU BAŞLAT
                </button>
              )}
              <button
                onClick={() => setWikiOpen(true)}
                className="px-3 py-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50 rounded text-sm transition-colors flex items-center gap-1.5"
              >
                📚 Forensic Wiki
              </button>
              <Link href="/map" className="text-slate-400 hover:text-cyber-cyan text-sm">Harita</Link>
            </div>
          </div>
        </header>
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 relative">
            {!bankHeistMode ? (
              <ForensicMapInner traces={traces} getOSIcon={getOSIcon} onMarkerClick={openDeepDive} />
            ) : scenario === 'bank-heist' ? (
              <BankHeistMapInner traces={traces} onTraceClick={openDeepDive} />
            ) : scenario === 'ransomware' ? (
              <RansomwareMapInner />
            ) : scenario === 'data-leak' ? (
              <DataLeakMapInner onTraceClick={(t) => openDeepDive({
                id: t.id, os: t.os, ip: t.ip, location: t.location,
                trace_type: 'Data Leak (Insider)', timestamp: t.timestamp, attack: true,
                attack_vector: 'Insider Threat', attack_tool: 'Pardus → External',
              })} />
            ) : (
              <PhishingMapInner onMarkerClick={(m) => openDeepDive({
                id: m.id, os: 'Unknown', ip: '0.0.0.0', location: m.location,
                trace_type: 'Phishing Email', timestamp: m.timestamp, attack: true,
                attack_vector: 'Phishing', attack_tool: 'Email Campaign',
              })} />
            )}
          </div>
          {bankHeistMode && scenario === 'bank-heist' && (
            <div className="h-28 shrink-0 border-t border-red-500/30 bg-slate-950/95 overflow-hidden">
              <div className="px-3 py-2 border-b border-red-500/20 flex items-center gap-2">
                <span className="text-red-500 text-xs font-bold">🕸 DARK WEB LEAKS</span>
                <span className="text-slate-500 text-[10px]">Off-site takip • Failin veriyi sızdırdığı forumlar</span>
              </div>
              <div className="h-20 overflow-y-auto p-2 font-mono text-xs space-y-1">
                {darkWebLeaks.length === 0 ? (
                  <p className="text-slate-600 text-[11px]">Monitoring... Tor exit nodes scanning...</p>
                ) : (
                  darkWebLeaks.map((msg, i) => (
                    <div key={i} className="text-red-400/90 hover:text-red-300 truncate" title={msg.text}>
                      [{msg.time}] {msg.text}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <LegalEthics />
      </div>
      <aside className="w-80 shrink-0 border-l border-cyber-border bg-cyber-card/80 flex flex-col">
        {bankHeistMode && evidenceVault.length > 0 && (
          <div className="p-3 border-b border-amber-500/30 bg-amber-500/5">
            <h3 className="text-amber-400 font-bold flex items-center gap-2 text-sm">
              👜 Delil Kasası
              <span className="bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded text-xs">
                {evidenceVault.length} delil
              </span>
            </h3>
            <p className="text-slate-500 text-xs mt-1">Simülasyon sonunda SHA-256 ile mühürlenecek</p>
          </div>
        )}
        <div className="p-4 border-b border-cyber-border">
          <h3 className="text-cyber-green font-bold flex items-center gap-2">
            {bankHeistMode ? (
              scenario === 'ransomware' ? '🔒 Ransomware' :
              scenario === 'data-leak' ? '📤 Insider Sızıntı' :
              scenario === 'phishing' ? '📧 Phishing' : '⚔ Saldırı İzleri'
            ) : '📋 Son Yakalanan İzler'}
          </h3>
          <p className="text-slate-500 text-xs mt-1">
            {bankHeistMode ? (
              scenario === 'ransomware' ? 'Harita kilitleniyor...' :
              scenario === 'data-leak' ? 'Pardus → Dış sızıntı' :
              scenario === 'phishing' ? 'E-posta ikonları yayılıyor' : 'Saldırı Türü • Kullanılan OS'
            ) : 'OS • IP • Tarih'}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
          {traces.length === 0 ? (
            <p className="text-slate-500 text-sm p-4">
              {bankHeistMode && scenario !== 'bank-heist'
                ? `${SCENARIO_LABELS[scenario]} simülasyonu çalışıyor...`
                : 'İz bekleniyor...'}
            </p>
          ) : (
            traces.slice(0, 25).map((trace) => (
              <div
                key={`${trace.id}-${trace.timestamp}`}
                className="p-3 bg-slate-900/60 rounded border border-cyber-border hover:border-red-500/50 transition-colors cursor-pointer"
                onClick={() => openDeepDive(trace)}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{bankHeistMode ? '⚔' : getOSIcon(trace.os)}</span>
                  <div className="min-w-0 flex-1">
                    {bankHeistMode ? (
                      <>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-red-400 font-medium text-sm truncate">{trace.trace_type}</p>
                          {trace.threat_level && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                              trace.threat_level === 'Critical' ? 'bg-red-500/30 text-red-400' :
                              trace.threat_level === 'High' ? 'bg-orange-500/30 text-orange-400' :
                              'bg-amber-500/30 text-amber-400'
                            }`}>
                              Threat Level: {trace.threat_level}
                            </span>
                          )}
                        </div>
                        {trace.attack_vector && <p className="text-amber-400/90 text-xs">Vektör: {trace.attack_vector}</p>}
                        {trace.attack_tool && <p className="text-slate-500 text-xs">Araç: {trace.attack_tool}</p>}
                        <p className="text-cyber-cyan text-xs truncate">{trace.os}</p>
                        <p className="text-slate-400 text-xs font-mono">{trace.ip}</p>
                        <p className="text-slate-500 text-xs mt-1">{formatDate(trace.timestamp)}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-cyber-cyan font-medium text-sm truncate">{trace.os}</p>
                        <p className="text-slate-400 text-xs font-mono">{trace.ip}</p>
                        <p className="text-slate-500 text-xs mt-1">{formatDate(trace.timestamp)}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div ref={vaultRef} className="border-t border-cyber-border p-4 shrink-0">
          <h3 className="text-amber-400 font-bold flex items-center gap-2 text-sm mb-2">
            🔒 Evidence Vault (Mühürlü Deliller)
          </h3>
          <p className="text-slate-500 text-[10px] mb-2">
            Adli Not: Hash değeri değişmezliğini korur. Saldırgan dosyayı değiştirirse hash bozulur ve Delil Karartma alarmı verilir.
          </p>
          {sealedEvidence.length === 0 ? (
            <p className="text-slate-500 text-xs">Henüz mühürlenmiş delil yok</p>
          ) : (
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {sealedEvidence.map((e) => {
                const isTampered = !verifyEvidenceIntegrity(e);
                return (
                <div
                  key={e.id}
                  className={`p-3 rounded border evidence-fly-in cursor-default group ${
                    isTampered ? 'bg-red-950/80 border-red-500/50' : 'bg-slate-900/80 border-amber-500/30'
                  }`}
                  title={isTampered ? '⚠️ Delil Karartma Tespit Edildi!' : 'Dijital Delil Zinciri (Chain of Custody) Korunuyor'}
                >
                  <div className="flex items-start gap-2">
                    <span className={`${isTampered ? 'text-red-400' : 'text-amber-400'} shrink-0`}>🔒</span>
                    <div className="min-w-0 flex-1">
                      {isTampered && (
                        <p className="text-red-400 text-[10px] font-bold mb-1">⚠️ DELİL KARARTMA ALARMI</p>
                      )}
                      <p className="font-mono text-cyan-400 text-xs truncate">{e.fileName}</p>
                      <p className="font-mono text-slate-500 text-[10px] mt-1 break-all">
                        SHA-256: {e.hash.slice(0, 8)}...{e.hash.slice(-4)}
                      </p>
                      <p className="text-slate-600 text-[10px] mt-1 group-hover:text-slate-400 transition-colors">
                        Dijital Delil Zinciri (Chain of Custody) Korunuyor
                      </p>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          )}
          {sealedEvidence.length > 0 && (
            <div className="mt-3 space-y-2">
              <button
                onClick={downloadForensicReportPDF}
                className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded flex items-center justify-center gap-2"
              >
                📥 Download Forensic Report (PDF)
              </button>
              <button
                onClick={downloadForensicCaseFile}
                className="w-full py-1.5 px-3 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded flex items-center justify-center gap-2"
              >
                Markdown olarak indir
              </button>
            </div>
          )}
        </div>
      </aside>
      {sealingOverlay && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md overflow-y-auto py-8"
          onClick={dismissSealingOverlay}
        >
          <div
            className="text-center px-8 py-12 max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-7xl mb-6 animate-pulse">🔒</div>
            <h2 className="text-4xl md:text-5xl font-black text-amber-400 tracking-wider mb-2 drop-shadow-[0_0_24px_rgba(251,191,36,0.6)]">
              TÜM DELİLLER MÜHÜRLENDİ
            </h2>
            <p className="text-2xl md:text-3xl font-bold text-cyan-400 tracking-wide mb-8">
              ANALİZ RAPORU HAZIR
            </p>
            {evidenceVault.length > 0 && vaultSealHash && (
              <div className="text-left bg-slate-900/80 rounded-xl border border-amber-500/40 p-6 mb-6">
                <h3 className="text-amber-400 font-bold mb-3">👜 Delil Kasası — Chain of Custody</h3>
                <p className="text-slate-400 text-sm mb-4">
                  {evidenceVault.length} delil mahkeme için SHA-256 ile damgalandı.
                </p>
                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                  {evidenceVault.map((t, i) => (
                    <div key={i} className="text-xs font-mono text-cyan-400/90 flex gap-2">
                      <span>#{i + 1}</span>
                      <span>{t.ip}</span>
                      <span>—</span>
                      <span>{t.trace_type}</span>
                      {t.attack_vector && <span className="text-amber-400">({t.attack_vector})</span>}
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-700">
                  <p className="text-slate-500 text-xs mb-1">SHA-256 Hash (Delil Bütünlüğü)</p>
                  <p className="font-mono text-green-400 text-xs break-all">{vaultSealHash}</p>
                </div>
              </div>
            )}
            <p className="text-slate-500 text-sm">Tıklayarak kapat</p>
          </div>
        </div>
      )}
      {flyingEvidence && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[200] pointer-events-none"
          style={{
            left: flyingEvidence.from.x,
            top: flyingEvidence.from.y,
            transform: 'translate(-50%, -50%)',
            animation: 'fly-to-vault 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
          }}
        >
          <div
            className="w-12 h-12 rounded-lg bg-amber-500/90 border-2 border-amber-400 flex items-center justify-center text-2xl shadow-lg"
            style={{ '--vault-x': `${flyingEvidence.to.x}px`, '--vault-y': `${flyingEvidence.to.y}px` } as React.CSSProperties}
          >
            📄
          </div>
        </div>,
        document.body
      )}
      {flyingEvidence && (
        <style>{`
          @keyframes fly-to-vault {
            0% {
              left: ${flyingEvidence.from.x}px !important;
              top: ${flyingEvidence.from.y}px !important;
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
            100% {
              left: ${flyingEvidence.to.x}px !important;
              top: ${flyingEvidence.to.y}px !important;
              opacity: 0.3;
              transform: translate(-50%, -50%) scale(0.5);
            }
          }
        `}</style>
      )}
      {flyingEvidence && (
        <FlyingCompleteHandler onComplete={onFlyingComplete} duration={700} />
      )}
      <ForensicWiki open={wikiOpen} onClose={() => setWikiOpen(false)} />
      {modalOpen && modalData && (
        <DeepDiveModal
          os={modalData.os}
          ip={modalData.ip}
          location={modalData.location}
          loading={modalData.loading}
          data={modalData.data}
          attack_vector={modalData.attack_vector}
          attack_tool={modalData.attack_tool}
          recovered_evidence={modalData.recovered_evidence}
          trace={modalData.trace}
          onAddToEvidenceBag={modalData.trace ? addToEvidenceVault.bind(null, modalData.trace) : undefined}
          isInEvidenceVault={modalData.trace ? isInEvidenceVault(modalData.trace) : false}
          onSealAndVault={(file, ev) => {
            const fromRect = ev?.currentTarget ? (() => {
              const r = ev.currentTarget.getBoundingClientRect();
              return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
            })() : undefined;
            sealAndVault(file, { ip: modalData.ip, os: modalData.os }, fromRect);
          }}
          sealedFileIds={sealedFileNames}
          onClose={closeDeepDive}
        />
      )}
    </div>
  );
}
