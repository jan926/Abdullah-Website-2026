export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-slate-800 bg-[#07131e] p-8 shadow-xl shadow-slate-950/30">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Profile</p>
            <h2 className="mt-3 text-4xl font-semibold text-white">Welcome back, Commander</h2>
            <p className="mt-4 max-w-2xl text-slate-400">Manage your desktop library, download queue, and local settings from the SteamFree desktop shell.</p>
          </div>
          <div className="rounded-3xl bg-slate-900/80 px-6 py-4 text-slate-200 shadow-lg shadow-slate-950/20">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Status</p>
            <p className="mt-2 text-2xl font-semibold text-white">Offline</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-800 bg-[#07131e] p-8">
          <h3 className="text-xl font-semibold text-white">Account</h3>
          <div className="mt-5 space-y-3 text-slate-400">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span>Email</span>
              <span className="text-slate-200">player@steamfree.local</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span>Library size</span>
              <span className="text-slate-200">12 games</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Install folder</span>
              <span className="text-slate-200">C:/Games/SteamFree</span>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-800 bg-[#07131e] p-8">
          <h3 className="text-xl font-semibold text-white">System</h3>
          <div className="mt-5 grid gap-3 text-slate-400">
            <div className="rounded-3xl bg-slate-900/70 p-4">
              <p className="text-sm">GPU</p>
              <p className="mt-1 text-slate-200">NVIDIA GeForce RTX 4070</p>
            </div>
            <div className="rounded-3xl bg-slate-900/70 p-4">
              <p className="text-sm">CPU</p>
              <p className="mt-1 text-slate-200">Intel Core i9</p>
            </div>
            <div className="rounded-3xl bg-slate-900/70 p-4">
              <p className="text-sm">RAM</p>
              <p className="mt-1 text-slate-200">32 GB</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
