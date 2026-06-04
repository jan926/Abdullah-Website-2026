import { useState, useEffect, useRef } from "react";
import { cn } from "../app/components/ui/utils";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
  priority?: boolean;
}

export function LazyImage({
  className,
  wrapperClassName,
  alt,
  src,
  priority = false,
  ...props
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(priority);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Reset state when src changes
  useEffect(() => {
    setLoaded(false);
    setError(false);
    setInView(priority);
  }, [src, priority]);

  // IntersectionObserver for non-priority images
  useEffect(() => {
    if (priority) return;

    const el = wrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [priority, src]);

  const showError = error || !src;

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "relative overflow-hidden bg-[var(--muted)]",
        wrapperClassName,
      )}
    >
      {!loaded && !showError && (
        <div className="animate-shimmer absolute inset-0" />
      )}

      {inView && !showError && (
        <img
          {...props}
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          // @ts-ignore
          fetchpriority={priority ? "high" : "auto"}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            className,
          )}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}

      {showError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-slate-600"
          >
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M8 12h4" />
            <path d="M10 10v4" />
            <circle cx="17" cy="11" r="1" />
            <circle cx="17" cy="13" r="1" />
          </svg>
          <span className="text-[10px] font-medium text-slate-600 uppercase tracking-wider">
            No Preview
          </span>
        </div>
      )}
    </div>
  );
}
