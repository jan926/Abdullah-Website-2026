import { Copy, Download, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { toast } from "sonner";
import type { DownloadPart } from "../data/games";

interface DownloadPartsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameTitle: string;
  downloadParts: DownloadPart[];
  mainLink?: string;
  filePassword?: string;
}

export function DownloadPartsModal({
  open,
  onOpenChange,
  gameTitle,
  downloadParts,
  mainLink,
  filePassword,
}: DownloadPartsModalProps) {
  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  const handleDownload = (link: string) => {
    window.open(link, "_blank");
  };

  const validParts = downloadParts.filter(p => p.link);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[var(--card)] border-[var(--border)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--foreground)]">
            Download {gameTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {mainLink && (
            <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg">
              <p className="text-sm text-[var(--muted-foreground)] mb-3">Main Download</p>
              {filePassword && (
                <div className="mb-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 p-3 text-cyan-100">
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Password</p>
                  <p className="mt-1 text-sm font-semibold text-white">{filePassword}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownload(mainLink)}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Now
                </Button>
                <Button
                  onClick={() => handleCopyLink(mainLink)}
                  variant="outline"
                  className="border-cyan-500/30"
                  aria-label={`Copy main download link for ${gameTitle}`}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {validParts.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {validParts.length > 1 ? "Download Parts" : "Part"}
              </p>
              {validParts.map((part, index) => (
                <div
                  key={part.id}
                  className="p-4 bg-[rgba(255,255,255,0.04)] border border-[var(--border)] rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-[var(--foreground)]">
                        {part.name || `Part ${index + 1}`}
                      </h3>
                      {part.size && (
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          Size: {part.size}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDownload(part.link)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={() => handleCopyLink(part.link)}
                      variant="outline"
                      size="sm"
                      className="border-[var(--border)]"
                      aria-label={`Copy ${part.name || `part ${index + 1}`} download link`}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDownload(part.link)}
                      variant="outline"
                      size="sm"
                      className="border-[var(--border)]"
                      aria-label={`Open ${part.name || `part ${index + 1}`} download link`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!mainLink && validParts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-[var(--muted-foreground)]">No download links available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
