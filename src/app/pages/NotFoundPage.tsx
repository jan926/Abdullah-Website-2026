import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050b12] px-6 text-slate-100">
      <div className="max-w-xl rounded-[2rem] border border-slate-800 bg-[#08131e] p-10 shadow-2xl shadow-slate-950/40">
        <p className="text-sm uppercase tracking-[0.35em] text-sky-400/80">Page not found</p>
        <h1 className="mt-4 text-5xl font-semibold text-white">404</h1>
        <p className="mt-4 text-slate-400">That route does not exist in the SteamFree desktop experience.</p>
        <Link className="mt-8 inline-flex rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400" to="/">
          Return to Store
        </Link>
      </div>
    </div>
  );
}
