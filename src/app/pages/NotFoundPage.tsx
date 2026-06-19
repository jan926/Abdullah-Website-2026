import { useEffect } from "react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { removeJsonLd, setDocumentMeta, SITE_URL } from "../../lib/seo";

export default function NotFoundPage() {
  useEffect(() => {
    setDocumentMeta({
      title: "404 - Page Not Found | AQ Gaming Hub",
      description: "The page you requested was not found on AQ Gaming Hub.",
      url: `${SITE_URL}${window.location.pathname}`,
      robots: "noindex, follow",
    });
    removeJsonLd("site-jsonld");
    removeJsonLd("game-jsonld");
  }, []);

  return (
    <div className="min-h-[60vh] bg-[var(--background)] text-[var(--foreground)]">
      <div className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-bold">404 - Page not found</h1>
        <p className="mt-3 text-[var(--muted-foreground)]">
          The page you’re looking for doesn’t exist.
        </p>
        <div className="mt-6 flex justify-center">
          <Button asChild className="bg-cyan-500 hover:bg-cyan-600 text-white">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
