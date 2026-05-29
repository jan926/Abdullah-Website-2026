import { Outlet } from "react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Toaster } from "../components/ui/sonner";
import { SiteMeta } from "../components/SiteMeta";
import { ScrollToTop } from "../components/ScrollToTop";
import { AdSafetyBlur } from "../components/AdSafetyBlur";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <ScrollToTop />
      <SiteMeta />
      <AdSafetyBlur />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
