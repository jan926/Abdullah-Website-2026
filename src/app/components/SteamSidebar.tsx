import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Store', to: '/' },
  { label: 'Library', to: '/library' },
  { label: 'Downloads', to: '/downloads' },
  { label: 'Profile', to: '/profile' },
];

export function SteamSidebar() {
  return (
    <aside className="flex h-full min-h-screen w-72 flex-col border-r border-slate-800 bg-[#06101a] text-slate-100">
      <div className="flex h-24 items-center justify-center border-b border-slate-800 px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">SteamFree</p>
          <h1 className="text-2xl font-semibold text-white">Desktop</h1>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive ? 'bg-slate-800 text-white shadow-inner shadow-slate-950/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="rounded-t-3xl border-t border-slate-800 bg-[#07131e] p-5">
        <div className="mb-3 text-xs uppercase tracking-[0.3em] text-slate-500">Downloads Manager</div>
        <div className="rounded-3xl border border-slate-800 bg-[#0b1724] p-4 text-sm text-slate-300">
          <p className="font-medium text-white">Active download queue</p>
          <p className="mt-2 text-slate-500">Keep an eye on installation progress and launch games instantly.</p>
        </div>
      </div>
    </aside>
  );
}
