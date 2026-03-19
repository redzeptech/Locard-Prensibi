'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface TraceData {
  id: number;
  os: string;
  ip: string;
  location: [number, number];
  trace_type: string;
  timestamp: string;
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

function getOSIcon(os: string): string {
  return OS_ICONS[os] || '💻';
}

function generateHexLine(): string {
  const hex = '0123456789ABCDEF';
  return Array.from({ length: 16 }, () =>
    '0x' + hex[Math.floor(Math.random() * 16)] + hex[Math.floor(Math.random() * 16)]
  ).join(' ');
}

function DeepDiveModal({
  os,
  ip,
  loading,
  data,
  onClose,
  onExportReport,
}: {
  os: string;
  ip: string;
  loading: boolean;
  data: DeepDiveResult | null;
  onClose: () => void;
  onExportReport: (hash: string) => void;
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
      onExportReport(hash);
    } catch {
      setExportSuccess(null);
    } finally {
      setExporting(false);
    }
  }, [data, ip, os, onExportReport]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-amber-500/50 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-amber-500/30 flex items-center justify-between">
          <h2 className="text-xl font-bold text-amber-400">🔬 Deep Dive Analysis</h2>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-sm"
          >
            Kapat
          </button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div className="flex gap-4 text-sm">
            <span className="text-cyan-400"><strong>OS:</strong> {os}</span>
            <span className="text-cyan-400 font-mono"><strong>IP:</strong> {ip}</span>
          </div>
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
          {!loading && data && (
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
                    </tr>
                  </thead>
                  <tbody>
                    {data.recovered_files.map((f, i) => (
                      <tr key={i} className="border-t border-slate-700 hover:bg-slate-800/50">
                        <td className="p-2 font-mono text-slate-200">{f.file}</td>
                        <td className="p-2 font-mono text-amber-400/80 text-xs">{f.magic_bytes || '—'}</td>
                        <td className="p-2 text-green-400">{f.recovery_rate || f.status}</td>
                        <td className="p-2 text-slate-400 text-xs">{f.note}</td>
                      </tr>
                    ))}
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
        </div>
      </div>
    </div>
  );
}

const ForensicMapInner = dynamic(() => import('@/components/ForensicMapInner'), { ssr: false });
const LegalEthics = dynamic(() => import('@/components/LegalEthics'), { ssr: false });
const ForensicWiki = dynamic(() => import('@/components/ForensicWiki'), { ssr: false });

export default function MapPage() {
  const [traces, setTraces] = useState<TraceData[]>([]);
  const [connected, setConnected] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [wikiOpen, setWikiOpen] = useState(false);
  const [modalData, setModalData] = useState<{ os: string; ip: string; data: DeepDiveResult | null; loading: boolean } | null>(null);

  const openDeepDive = useCallback(async (trace: TraceData) => {
    setModalOpen(true);
    setModalData({ os: trace.os, ip: trace.ip, data: null, loading: true });
    try {
      const res = await fetch(`${API_BASE}/deep-dive?os_type=${encodeURIComponent(trace.os)}&ip=${encodeURIComponent(trace.ip)}`);
      const data = await res.json();
      setModalData({
        os: data.os || trace.os,
        ip: data.ip || trace.ip,
        data: {
          os: data.os,
          scan_time_sec: data.scan_time_sec,
          raw_disk_head: data.raw_disk_head,
          recovered_files: data.recovered_files || [],
        },
        loading: false,
      });
    } catch {
      setModalData((p) => p ? { ...p, data: null, loading: false } : null);
    }
  }, []);

  const closeDeepDive = useCallback(() => {
    setModalOpen(false);
    setModalData(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 font-mono flex flex-col">
      <header className="border-b border-slate-700 bg-slate-900/80 sticky top-0 z-20 p-4 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-cyan-400">Live Forensic Map</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWikiOpen(true)}
              className="px-3 py-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50 rounded text-sm transition-colors"
            >
              📚 Forensic Wiki
            </button>
            <Link href="/" className="text-slate-400 hover:text-cyan-400 text-sm">← Dashboard</Link>
          </div>
        </div>
      </header>
      <div className="flex-1 min-h-0 relative">
        <ForensicMapInner traces={traces} getOSIcon={getOSIcon} onMarkerClick={openDeepDive} />
      </div>
      <LegalEthics />
      <ForensicWiki open={wikiOpen} onClose={() => setWikiOpen(false)} />
      {modalOpen && modalData && (
        <DeepDiveModal
          os={modalData.os}
          ip={modalData.ip}
          loading={modalData.loading}
          data={modalData.data}
          onClose={closeDeepDive}
          onExportReport={() => {}}
        />
      )}
    </div>
  );
}
