import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/app/components/ui/utils";

export type FeaturedSliderGame = {
  id: string;
  title: string;
  coverImageUrl?: string;
  heroImageUrl?: string;
  description?: string;
  tags?: string[];
  href?: string;
};

export function FeaturedSlider({
  games,
  autoPlay = true,
  intervalMs = 5200,
  className,
}: {
  games: FeaturedSliderGame[];
  autoPlay?: boolean;
  intervalMs?: number;
  className?: string;
}) {
  const items = useMemo(() => games.filter(Boolean), [games]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const count = items.length;

  useEffect(() => {
    if (!autoPlay || paused || count <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, intervalMs);
    return () => clearInterval(t);
  }, [autoPlay, paused, count, intervalMs]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  if (count === 0) return null;

  const go = (next: number, userInitiated = false) => {
    setIndex((prev) => {
      const normalized = ((next % count) + count) % count;
      return normalized === prev ? prev : normalized;
    });
    if (userInitiated && autoPlay) {
      setPaused(true);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => setPaused(false), intervalMs);
    }
  };

  const onPrev = () => go(index - 1, true);
  const onNext = () => go(index + 1, true);

  const active = items[index];
  const activeHref = active.href ?? `/game/${active.id}`;
  const activeImage = active.heroImageUrl ?? active.coverImageUrl;
  const tags = (active.tags ?? []).slice(0, 3);

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10",
        "bg-[rgba(26,26,26,0.58)] backdrop-blur-xl",
        "shadow-[0_0_0_1px_rgba(0,255,204,0.10),0_20px_70px_rgba(0,0,0,0.65)]",
        className,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Featured games"
    >
      <div className="relative h-[360px] w-full md:h-[420px]">
        <div className="absolute inset-0">
          {activeImage ? (
            <img
              src={activeImage}
              alt={active.title}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="h-full w-full bg-[linear-gradient(135deg,rgba(168,85,247,0.18),rgba(0,255,204,0.12),rgba(236,72,153,0.10))]" />
          )}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(0,255,204,0.16),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.18),transparent_50%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.92)_0%,rgba(10,10,10,0.45)_52%,rgba(10,10,10,0.92)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.40)_0%,rgba(10,10,10,0.62)_60%,rgba(10,10,10,0.94)_100%)]" />
        </div>

        <div className="relative h-full w-full">
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#00ffcc]/35 bg-[rgba(0,255,204,0.10)] px-3 py-1 text-[11px] font-extrabold tracking-[0.18em] text-[#00ffcc]">
                  TRENDING
                </span>
                {tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/75"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <h2 className="text-3xl font-black leading-tight text-white md:text-4xl">
                <span className="bg-[linear-gradient(135deg,#ffffff,rgba(0,255,204,0.92),rgba(168,85,247,0.95))] bg-clip-text text-transparent">
                  {active.title}
                </span>
              </h2>

              {active.description ? (
                <p className="max-w-2xl text-sm leading-relaxed text-white/70 md:text-[15px]">
                  {active.description}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to={activeHref}
                  className={cn(
                    "inline-flex items-center justify-center",
                    "rounded-xl px-5 py-3 text-sm font-extrabold text-black",
                    "bg-[#00ffcc]",
                    "shadow-[0_0_0_1px_rgba(0,255,204,0.35),0_0_30px_rgba(0,255,204,0.18)]",
                    "hover:shadow-[0_0_0_1px_rgba(0,255,204,0.55),0_0_45px_rgba(0,255,204,0.30)]",
                    "transition",
                  )}
                >
                  View Game
                </Link>

                <button
                  type="button"
                  onClick={() => go(index + 1, true)}
                  className={cn(
                    "inline-flex items-center justify-center",
                    "rounded-xl px-5 py-3 text-sm font-bold text-white",
                    "border border-[#a855f7]/35 bg-[rgba(168,85,247,0.12)]",
                    "hover:bg-[rgba(168,85,247,0.18)] hover:shadow-[0_0_38px_rgba(168,85,247,0.22)]",
                    "transition",
                  )}
                >
                  Next
                </button>

                <div className="ml-auto hidden items-center gap-2 text-xs text-white/55 md:flex">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      paused ? "bg-white/40" : "bg-[#00ffcc]",
                      !paused && "shadow-[0_0_18px_rgba(0,255,204,0.42)]",
                    )}
                  />
                  {paused ? "Paused" : "Auto"}
                </div>
              </div>
            </div>
          </div>

          {count > 1 ? (
            <>
              <button
                type="button"
                onClick={onPrev}
                className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2",
                  "grid size-11 place-items-center rounded-full",
                  "border border-white/10 bg-[rgba(10,10,10,0.45)] backdrop-blur",
                  "text-[#00ffcc]",
                  "shadow-[0_0_0_1px_rgba(0,255,204,0.15)]",
                  "hover:bg-[rgba(10,10,10,0.60)] hover:shadow-[0_0_45px_rgba(0,255,204,0.16)]",
                  "transition",
                )}
                aria-label="Previous featured game"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={onNext}
                className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2",
                  "grid size-11 place-items-center rounded-full",
                  "border border-white/10 bg-[rgba(10,10,10,0.45)] backdrop-blur",
                  "text-[#00ffcc]",
                  "shadow-[0_0_0_1px_rgba(0,255,204,0.15)]",
                  "hover:bg-[rgba(10,10,10,0.60)] hover:shadow-[0_0_45px_rgba(0,255,204,0.16)]",
                  "transition",
                )}
                aria-label="Next featured game"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[rgba(10,10,10,0.35)] px-3 py-2 backdrop-blur">
                  {items.map((g, i) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => go(i, true)}
                      className={cn(
                        "h-2 rounded-full transition-[width,background-color,box-shadow] duration-300",
                        i === index
                          ? "w-9 bg-[#00ffcc] shadow-[0_0_18px_rgba(0,255,204,0.40)]"
                          : "w-2 bg-white/30 hover:bg-white/50",
                      )}
                      aria-label={`Go to ${g.title}`}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : null}

          <div className="absolute left-0 top-0 h-[2px] w-full bg-white/10">
            <div
              className="h-full bg-[linear-gradient(90deg,#00ffcc,#a855f7)] transition-[width] duration-300"
              style={{ width: `${((index + 1) / count) * 100}%` }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

