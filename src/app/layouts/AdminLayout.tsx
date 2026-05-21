import { Outlet } from "react-router";
import { Toaster } from "../components/ui/sonner";
import { ScrollToTop } from "../components/ScrollToTop";

export function AdminLayout() {
  return (
    <div className="admin-theme flex h-screen flex-col overflow-hidden font-sans">
      <ScrollToTop />
      <style dangerouslySetInnerHTML={{__html: `
        .admin-theme {
          --background: #f8fafc;
          --foreground: #0f172a;
          --card: #ffffff;
          --card-foreground: #0f172a;
          --popover: #ffffff;
          --popover-foreground: #0f172a;
          --primary: #0ea5e9;
          --primary-foreground: #ffffff;
          --secondary: #f1f5f9;
          --secondary-foreground: #0f172a;
          --muted: #f1f5f9;
          --muted-foreground: #64748b;
          --accent: #f1f5f9;
          --accent-foreground: #0f172a;
          --destructive: #ef4444;
          --destructive-foreground: #ffffff;
          --border: #e2e8f0;
          --input: #e2e8f0;
          --input-background: #ffffff;
          --ring: #0ea5e9;
        }
        .admin-theme {
          background-color: var(--background);
          color: var(--foreground);
        }
        .admin-main-scroll {
          -webkit-overflow-scrolling: touch;
          scrollbar-gutter: stable;
        }
        .admin-main-scroll::-webkit-scrollbar {
          width: 10px;
        }
        .admin-main-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .admin-main-scroll::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 5px;
        }
        .admin-main-scroll::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}} />
      <main className="min-h-0 flex-1">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
