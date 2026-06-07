import { useEffect, useState } from 'react';

type DownloadState = {
  id: string;
  path: string;
  percent: number;
  totalBytes: number;
  status: string;
  speedMbps: number;
};

export default function DownloadsPage() {
  const [progress, setProgress] = useState<DownloadState | null>(null);

  useEffect(() => {
    if ('electronAPI' in window) {
      window.electronAPI.onDownloadProgress((payload) => setProgress(payload));
    }
  }, []);

  return (
    <div className="space-y-8">
      <header className="rounded-[2rem] border border-slate-800 bg-[#07131e] p-8 shadow-xl shadow-slate-950/30">
        <h2 className="text-3xl font-semibold text-white">Downloads</h2>
        <p className="mt-2 text-slate-400">Track progress and launch installed .exe titles directly from the desktop client.</p>
      </header>

      {progress ? (
        <section className="rounded-[2rem] border border-slate-800 bg-[#07131e] p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Active job</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">{progress.id}</h3>
            </div>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-sm text-slate-300">{progress.status}</span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="h-4 overflow-hidden rounded-full bg-slate-900">
              <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${progress.percent}%` }} />
            </div>
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>{progress.percent}%</span>
              <span>{(progress.totalBytes / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <p className="text-sm text-slate-400">Transfer speed: {progress.speedMbps} MB/s</p>
            <p className="text-sm text-slate-400">Destination: {progress.path}</p>
          </div>
        </section>
      ) : (
        <div className="rounded-[2rem] border border-slate-800 bg-[#07131e] p-8 text-slate-400">
          No active downloads yet. Start a game download from the Store page to watch progress here.
        </div>
      )}
    </div>
  );
}
