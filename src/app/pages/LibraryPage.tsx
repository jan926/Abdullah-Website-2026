import { useEffect, useState } from 'react';

type InstalledGame = {
  id: string;
  title: string;
  path: string;
  installedAt: number;
  status: string;
};

export default function LibraryPage() {
  const [installedGames, setInstalledGames] = useState<InstalledGame[]>([]);

  useEffect(() => {
    if ('electronAPI' in window) {
      window.electronAPI.getInstalledGames().then(setInstalledGames).catch(() => setInstalledGames([]));
    }
  }, []);

  return (
    <div className="space-y-8">
      <header className="rounded-[2rem] border border-slate-800 bg-[#07131e] p-8 shadow-xl shadow-slate-950/30">
        <h2 className="text-3xl font-semibold text-white">Your Library</h2>
        <p className="mt-2 text-slate-400">All installed desktop games are tracked locally for instant launch.</p>
      </header>

      <div className="grid gap-4">
        {installedGames.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-800 bg-[#07131e] p-8 text-slate-400">
            No games installed yet. Visit Store to download and install your first title.
          </div>
        ) : (
          installedGames.map((game) => (
            <article key={game.id} className="rounded-[2rem] border border-slate-800 bg-[#07131e] p-6 transition hover:border-sky-500/40">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">{game.title}</h3>
                  <p className="text-sm text-slate-400">Installed on {new Date(game.installedAt).toLocaleDateString()}</p>
                </div>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-sm text-slate-300">{game.status}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
