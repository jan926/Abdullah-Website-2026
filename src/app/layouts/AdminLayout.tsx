import { Outlet } from "react-router";
import { Toaster } from "../components/ui/sonner";

export function AdminLayout() {
  return (
    <div className="admin-theme min-h-screen font-sans">
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
      `}} />
      <main>
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
