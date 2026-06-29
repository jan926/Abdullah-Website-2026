import { Download } from "lucide-react";
import { Button, type ButtonProps } from "./ui/button";
import { cn } from "./ui/utils";

interface DownloadButtonProps extends ButtonProps {
  label?: string;
  showIcon?: boolean;
  animated?: boolean;
}

export function DownloadButton({
  label = "Download",
  showIcon = true,
  animated = false,
  className,
  children,
  asChild,
  ...props
}: DownloadButtonProps) {
  const classes = cn(
    "relative overflow-hidden bg-cyan-500 font-semibold text-white hover:bg-cyan-600",
    animated && "btn-download",
    className
  );

  if (asChild) {
    return (
      <Button asChild className={classes} {...props}>
        {children}
      </Button>
    );
  }

  return (
    <Button className={classes} {...props}>
      {showIcon && <Download className={cn("mr-2 h-4 w-4", animated && "btn-download-icon")} />}
      {children ?? label}
    </Button>
  );
}
