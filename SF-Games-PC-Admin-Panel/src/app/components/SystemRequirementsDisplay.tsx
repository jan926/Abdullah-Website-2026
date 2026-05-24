import { Card } from "./ui/card";
import { Cpu, HardDrive, Zap, Database, Monitor } from "lucide-react";

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
};

const getIcon = (key: string) => {
  const icons: Record<string, React.ReactNode> = {
    os: <Monitor className="w-5 h-5" />,
    processor: <Cpu className="w-5 h-5" />,
    memory: <Zap className="w-5 h-5" />,
    graphics: <Database className="w-5 h-5" />,
    storage: <HardDrive className="w-5 h-5" />,
  };
  return icons[key];
};

const getLabel = (key: string) => {
  const labels: Record<string, string> = {
    os: "Operating System",
    processor: "Processor",
    memory: "Memory",
    graphics: "Graphics",
    storage: "Storage",
  };
  return labels[key];
};

export function SystemRequirementsDisplay({ minimum, recommended }: Props) {
  const renderRequirement = (type: "minimum" | "recommended", req: SystemReq) => {
    return (
      <div className="space-y-3">
        {Object.entries(req).map(([key, value]) => {
          if (!value) return null;
          return (
            <div key={key} className="flex items-start gap-3 pb-3 border-b border-[rgba(226,232,240,0.08)] last:border-b-0">
              <div className="text-sky-400 mt-0.5 flex-shrink-0">
                {getIcon(key)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--muted-foreground)] uppercase font-semibold">
                  {getLabel(key)}
                </p>
                <p className="text-sm text-[var(--foreground)] mt-1 break-words">
                  {value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="rounded-3xl border border-[rgba(226,232,240,0.08)] bg-[var(--card)] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
      <h2 className="mb-6 text-xl font-semibold text-[var(--foreground)]">System Requirements</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="p-4 bg-[rgba(255,255,255,0.04)] border-0">
          <p className="text-sm font-semibold text-sky-400 mb-4">Minimum</p>
          {renderRequirement("minimum", minimum)}
        </Card>
        <Card className="p-4 bg-[rgba(255,255,255,0.04)] border-0">
          <p className="text-sm font-semibold text-emerald-400 mb-4">Recommended</p>
          {renderRequirement("recommended", recommended)}
        </Card>
      </div>
    </div>
  );
}
