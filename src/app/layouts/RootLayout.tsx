import { Outlet } from "react-router";
import { SteamSidebar } from "../components/SteamSidebar";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-[#050b12] text-slate-100">
      <div className="flex min-h-screen">
        <SteamSidebar />
        <main className="flex-1 bg-[#08131e] p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
