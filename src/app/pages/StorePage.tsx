import { useEffect, useState } from 'react';

type GameSummary = {
  id: string;
  title: string;
  description: string;
  icon: string;
  sizeMb: number;
};

export default function StorePage() {
  const [games, setGames] = useState<GameSummary[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/games')
      .then((response) => response.json())
      .then(setGames)
      .catch(() => setGames([]));
  }, []);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-slate-800 bg-[#07131e] p-8 shadow-xl shadow-slate-950/30">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-sky-400/70">Store</p>
            <h2 className="mt-3 text-4xl font-semibold text-white">Discover desktop releases.</h2>
            <p className="mt-4 max-w-2xl text-slate-400">Browse curated PC games, install with one click, and launch from the desktop platform.</p>
          </div>
          <div className="rounded-3xl bg-slate-900/70 px-6 py-4 text-slate-200 shadow-lg shadow-slate-950/20">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Featured</p>
            <p className="mt-3 text-2xl font-semibold text-white">New arrivals</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {games.map((game) => (
          <article key={game.id} className="rounded-[2rem] border border-slate-800 bg-[#07131e] p-6 transition hover:border-sky-500/40">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-3xl bg-slate-800" />
              <div>
                <h3 className="text-xl font-semibold text-white">{game.title}</h3>
                <p className="text-sm text-slate-400">{game.description}</p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between gap-3 text-sm text-slate-400">
              <span>{game.sizeMb} MB</span>
              <button className="rounded-full bg-sky-500 px-4 py-2 text-white transition hover:bg-sky-400">Download</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
