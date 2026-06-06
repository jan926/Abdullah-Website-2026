import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { LibraryBig, Store, Tags, User, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { useAuth } from "@/hooks/useAuth";

type SidebarNavItem = {
  to: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: SidebarNavItem[] = [
  { to: "/", label: "Store", Icon: Store },
  { to: "/library", label: "My Library", Icon: LibraryBig },
  { to: "/categories", label: "Categories", Icon: Tags },
  { to: "/profile", label: "Profile", Icon: User },
];

export function Sidebar({
  className,
  defaultCollapsed = false,
}: {
  className?: string;
  defaultCollapsed?: boolean;
}) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const initials = useMemo(() => {
    const name = user?.username?.trim();
    if (!name) return "AQ";
    return name.slice(0, 2).toUpperCase();
  }, [user?.username]);

  return (
    <aside
      className={cn(
        "sticky top-0 h-dvh shrink-0",
        "border-r border-white/10",
        "bg-[rgba(26,26,26,0.72)] backdrop-blur-xl",
        "shadow-[0_0_0_1px_rgba(168,85,247,0.08),0_24px_70px_rgba(0,0,0,0.65)]",
        collapsed ? "w-[84px]" : "w-[280px]",
        "transition-[width] duration-300 ease-out",
        className,
      )}
      aria-label="Primary navigation"
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-3 px-4">
          <div
            className={cn(
              "grid size-10 place-items-center",
              "rounded-xl border border-white/10",
              "bg-[linear-gradient(135deg,rgba(168,85,247,0.25),rgba(0,255,204,0.18))]",
              "shadow-[0_0_22px_rgba(168,85,247,0.25)]",
            )}
          >
            <span className="text-sm font-black tracking-wide text-white">{initials}</span>
          </div>

          <div className={cn("min-w-0 flex-1", collapsed && "opacity-0 pointer-events-none")}>
            <p className="truncate text-sm font-bold text-white">AQ Gaming Hub</p>
            <p className="truncate text-xs text-white/60">steamfree.games</p>
          </div>

          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className={cn(
              "grid size-9 place-items-center",
              "rounded-lg border border-white/10",
              "bg-white/5 text-[#00ffcc]",
              "hover:bg-white/10 hover:shadow-[0_0_0_1px_rgba(0,255,204,0.25),0_0_28px_rgba(0,255,204,0.16)]",
              "transition",
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <div className="px-4">
          <div className="h-px w-full bg-[linear-gradient(90deg,transparent,rgba(168,85,247,0.35),transparent)]" />
        </div>

        <nav className="flex-1 px-2 py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map(({ to, label, Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5",
                      "transition",
                      isActive
                        ? "border border-[#00ffcc]/35 bg-[rgba(0,255,204,0.06)] shadow-[0_0_0_1px_rgba(0,255,204,0.25),0_0_30px_rgba(168,85,247,0.12)]"
                        : "border border-transparent hover:border-white/10 hover:bg-white/5",
                    )
                  }
                  title={collapsed ? label : undefined}
                >
                  <span
                    className={cn(
                      "grid size-10 place-items-center",
                      "rounded-xl border border-white/10",
                      "bg-white/5",
                      "shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
                      "transition",
                      "group-hover:border-[#a855f7]/25 group-hover:shadow-[0_0_24px_rgba(168,85,247,0.18)]",
                    )}
                    aria-hidden="true"
                  >
                    <Icon className="h-[18px] w-[18px] text-[#00ffcc]" />
                  </span>

                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-sm font-semibold",
                      "text-white/75 group-hover:text-white",
                      collapsed && "opacity-0 pointer-events-none",
                    )}
                  >
                    {label}
                  </span>

                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full bg-transparent transition",
                      "group-hover:bg-[#a855f7]",
                      collapsed && "hidden",
                    )}
                    aria-hidden="true"
                  />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-4 pb-5">
          <div className="h-px w-full bg-[linear-gradient(90deg,transparent,rgba(0,255,204,0.35),transparent)]" />

          <div
            className={cn(
              "mt-4 flex items-center gap-3 rounded-2xl border border-white/10",
              "bg-white/5 px-3 py-3",
              "shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
              collapsed && "justify-center",
            )}
          >
            <div
              className={cn(
                "grid size-10 place-items-center rounded-xl",
                "bg-[linear-gradient(135deg,rgba(0,255,204,0.18),rgba(168,85,247,0.24))]",
                "border border-white/10",
              )}
            >
              <span className="text-xs font-black tracking-wide text-white">{initials}</span>
            </div>

            <div className={cn("min-w-0 flex-1", collapsed && "hidden")}>
              <p className="truncate text-sm font-semibold text-white">
                {user?.username ?? "Guest"}
              </p>
              <p className="truncate text-xs text-white/60">Ad-free cyberpunk hub</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
