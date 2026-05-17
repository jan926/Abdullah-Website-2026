import { Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import type { DownloadPart } from "../../data/games";

type Props = {
  useMultiPart: boolean;
  downloadLink: string;
  downloadParts: DownloadPart[];
  filePassword: string;
  onChange: (patch: {
    useMultiPart?: boolean;
    downloadLink?: string;
    downloadParts?: DownloadPart[];
    filePassword?: string;
  }) => void;
};

export function DownloadPartsEditor({
  useMultiPart,
  downloadLink,
  downloadParts,
  filePassword,
  onChange,
}: Props) {
  const addPart = () => {
    onChange({
      downloadParts: [
        ...downloadParts,
        {
          id: `part-${Date.now()}`,
          name: `Part ${downloadParts.length + 1}`,
          link: "",
          size: "",
        },
      ],
    });
  };

  const updatePart = (index: number, patch: Partial<DownloadPart>) => {
    const next = [...downloadParts];
    next[index] = { ...next[index], ...patch };
    onChange({ downloadParts: next });
  };

  const removePart = (index: number) => {
    onChange({ downloadParts: downloadParts.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={!useMultiPart ? "default" : "outline"}
          className={!useMultiPart ? "bg-sky-500 text-white hover:bg-sky-600" : ""}
          onClick={() => onChange({ useMultiPart: false })}
        >
          Single Download Link
        </Button>
        <Button
          type="button"
          variant={useMultiPart ? "default" : "outline"}
          className={useMultiPart ? "bg-sky-500 text-white hover:bg-sky-600" : ""}
          onClick={() =>
            onChange({
              useMultiPart: true,
              downloadParts:
                downloadParts.length > 0
                  ? downloadParts
                  : [{ id: "part-1", name: "Part 1", link: "", size: "" }],
            })
          }
        >
          Multi-Part Download
        </Button>
      </div>

      {!useMultiPart ? (
        <div className="space-y-2">
          <Label>Download Link</Label>
          <Input
            type="url"
            value={downloadLink}
            onChange={(e) => onChange({ downloadLink: e.target.value })}
            placeholder="magnet:?xt=... or https://..."
            className="border-[var(--border)]"
            required
          />
        </div>
      ) : (
        <div className="space-y-3 rounded-lg border border-[var(--border)] bg-slate-50/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-[var(--foreground)]">Download parts table</span> — fill name, size, and link for each part
            </p>
            <Button type="button" size="sm" className="bg-sky-500 text-white hover:bg-sky-600" onClick={addPart}>
              <Plus className="mr-2 h-4 w-4" /> Add Part
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part Name</TableHead>
                <TableHead className="w-[110px]">Size</TableHead>
                <TableHead>Download Link</TableHead>
                <TableHead className="w-[70px] text-right">Remove</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {downloadParts.map((part, i) => (
                <TableRow key={part.id}>
                  <TableCell>
                    <Input
                      value={part.name}
                      onChange={(e) => updatePart(i, { name: e.target.value })}
                      placeholder="Part 1"
                      className="border-[var(--border)]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={part.size || ""}
                      onChange={(e) => updatePart(i, { size: e.target.value })}
                      placeholder="5 GB"
                      className="border-[var(--border)]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="url"
                      value={part.link}
                      onChange={(e) => updatePart(i, { link: e.target.value })}
                      placeholder="https://..."
                      className="border-[var(--border)]"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={downloadParts.length <= 1}
                      onClick={() => removePart(i)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="space-y-2">
        <Label>File Password (optional)</Label>
        <Input
          value={filePassword}
          onChange={(e) => onChange({ filePassword: e.target.value })}
          placeholder="e.g. www.example.com"
          className="border-[var(--border)]"
        />
      </div>
    </div>
  );
}
