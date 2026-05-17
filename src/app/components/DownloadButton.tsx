import { Download } from "lucide-react";
import { Button, type ButtonProps } from "./ui/button";
import { cn } from "./ui/utils";

interface DownloadButtonProps extends ButtonProps {
  label?: string;
  showIcon?: boolean;
}

export function DownloadButton({
  label = "Download",
  showIcon = true,
  className,
  children,
  asChild,
  ...props
}: DownloadButtonProps) {
  const classes = cn(
    "btn-download relative overflow-hidden bg-cyan-500 font-semibold text-white hover:bg-cyan-600",
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
      {showIcon && <Download className="mr-2 h-4 w-4 btn-download-icon" />}
      {children ?? label}
    </Button>
  );
}
