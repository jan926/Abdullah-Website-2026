import { Skeleton } from "./ui/skeleton";
import { cn } from "./ui/utils";

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSkeleton() {
  return (
    <div
      className={cn(
        "relative w-full h-[min(60vh,700px)] min-h-[320px]",
        "bg-[var(--background)] animate-pulse overflow-hidden"
      )}
    >
      {/* Simulated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Content anchored to bottom-left like the real hero */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 space-y-4">
        {/* Title */}
        <Skeleton className="h-10 w-3/4 bg-slate-700" />
        {/* Two lines of body text */}
        <Skeleton className="h-4 w-2/3 bg-slate-700" />
        <Skeleton className="h-4 w-1/2 bg-slate-700" />
        {/* Two CTA buttons */}
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-10 w-36 rounded-md bg-slate-700" />
          <Skeleton className="h-10 w-36 rounded-md bg-slate-700" />
        </div>
      </div>
    </div>
  );
}

// ─── Category marquee ─────────────────────────────────────────────────────────

function CategoryMarqueeSkeleton() {
  return (
    <div className="w-full h-12 overflow-hidden">
      <Skeleton className="h-full w-full rounded-none bg-slate-800" />
    </div>
  );
}

// ─── Horizontal scroll row ────────────────────────────────────────────────────

function ScrollRowSkeleton({ count = 6, tall = false }: { count?: number; tall?: boolean }) {
  const imageHeight = tall
    ? "h-[260px] sm:h-[300px] md:h-[350px]"
    : "h-[220px] sm:h-[260px] md:h-[280px]";

  return (
    <section className="space-y-3 px-4 sm:px-6">
      {/* Section heading */}
      <Skeleton className="h-6 w-40 bg-slate-700" />

      {/* Scrollable card row */}
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex-none w-[180px] sm:w-[220px] md:w-[240px] space-y-2"
          >
            {/* Cover image */}
            <Skeleton className={cn("w-full rounded-md bg-slate-800", imageHeight)} />
            {/* Title line */}
            <Skeleton className="h-4 w-4/5 bg-slate-700" />
            {/* Download button */}
            <Skeleton className="h-9 w-full rounded-md bg-slate-800" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── All-games grid ───────────────────────────────────────────────────────────

function GameGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <section className="space-y-3 px-4 sm:px-6">
      {/* Section heading */}
      <Skeleton className="h-6 w-40 bg-slate-700" />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-2">
            {/* Cover image */}
            <Skeleton className="w-full h-[180px] sm:h-[220px] md:h-[260px] rounded-md bg-slate-800" />
            {/* Title line */}
            <Skeleton className="h-4 w-4/5 bg-slate-700" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Composed page skeleton ───────────────────────────────────────────────────

export function HomePageSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading games"
      className="space-y-8 pb-12"
    >
      {/* 1. Hero */}
      <HeroSkeleton />

      {/* 2. Category marquee */}
      <CategoryMarqueeSkeleton />

      {/* 3. Trending Games */}
      <ScrollRowSkeleton count={6} />

      {/* 4. Latest Games */}
      <ScrollRowSkeleton count={6} />

      {/* 5. Game of the Day */}
      <ScrollRowSkeleton count={5} tall />

      {/* 6. All Games grid */}
      <GameGridSkeleton count={12} />
    </div>
  );
}
