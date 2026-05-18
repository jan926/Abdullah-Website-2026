import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Cpu, HardDrive, Zap, Database } from "lucide-react";

type SystemReq = {
  os: string;
  processor: string;
  memory: string;
  graphics: string;
  storage: string;
};

type Props = {
  minimum: SystemReq;
  recommended: SystemReq;
  onChange: (patch: { minimum?: SystemReq; recommended?: SystemReq }) => void;
};

const FIELDS = [
  { key: "os", label: "Operating System", icon: null },
  { key: "processor", label: "Processor (CPU)", icon: Cpu },
  { key: "memory", label: "Memory (RAM)", icon: Zap },
  { key: "graphics", label: "Graphics (GPU)", icon: Database },
  { key: "storage", label: "Storage Space", icon: HardDrive },
];

export function SystemRequirementsEditor({ minimum, recommended, onChange }: Props) {
  const updateField = (type: "minimum" | "recommended", key: string, value: string) => {
    if (type === "minimum") {
      onChange({ minimum: { ...minimum, [key]: value } });
    } else {
      onChange({ recommended: { ...recommended, [key]: value } });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Minimum Requirements */}
        <Card className="p-6 border-[var(--border)] shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Minimum Requirements
          </h3>
          <div className="space-y-4">
            {FIELDS.map(({ key, label, icon: Icon }) => (
              <div key={`min-${key}`} className="space-y-2">
                <Label className="text-[var(--foreground)] flex items-center gap-2">
                  {Icon && <Icon className="w-4 h-4" />}
                  {label}
                </Label>
                <Input
                  value={minimum[key as keyof SystemReq]}
                  onChange={(e) => updateField("minimum", key, e.target.value)}
                  className="border-[var(--border)]"
                  placeholder={`e.g., ${getPlaceholder(key)}`}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Recommended Requirements */}
        <Card className="p-6 border-[var(--border)] shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Recommended Requirements
          </h3>
          <div className="space-y-4">
            {FIELDS.map(({ key, label, icon: Icon }) => (
              <div key={`rec-${key}`} className="space-y-2">
                <Label className="text-[var(--foreground)] flex items-center gap-2">
                  {Icon && <Icon className="w-4 h-4" />}
                  {label}
                </Label>
                <Input
                  value={recommended[key as keyof SystemReq]}
                  onChange={(e) => updateField("recommended", key, e.target.value)}
                  className="border-[var(--border)]"
                  placeholder={`e.g., ${getPlaceholder(key)}`}
                />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function getPlaceholder(key: string): string {
  const placeholders: Record<string, string> = {
    os: "Windows 10 64-bit",
    processor: "Intel Core i5-8400",
    memory: "8 GB RAM",
    graphics: "NVIDIA GTX 1060 6GB",
    storage: "100 GB SSD",
  };
  return placeholders[key] || "";
}
