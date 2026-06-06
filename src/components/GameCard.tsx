import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Check } from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { LazyImage } from "@/components/LazyImage";

export type GameCardGame = {
  id: string;
  title: string;
  coverImageUrl?: string;
  genres?: string[];
  href?: string;
};

const LIBRARY_KEY = "aq_gaming_hub_library_v1";

function readLibraryIds(): string[] {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => typeof x === "string");
  } catch {
    return [];
  }
}

function writeLibraryIds(ids: string[]) {
  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(Array.from(new Set(ids))));
  } catch {
    return;
  }
}

export function GameCard({
  game,
  onAddToLibrary,
  className,
}: {
  game: GameCardGame;
  onAddToLibrary?: (game: GameCardGame) => Promise<void> | void;
  className?: string;
}) {
  const [inLibrary, setInLibrary] = useState(false);

  useEffect(() => {
    const ids = readLibraryIds();
    setInLibrary(ids.includes(game.id));
  }, [game.id]);

  const href = game.href ?? `/game/${game.id}`;
  const tags = useMemo(() => (game.genres ?? []).filter(Boolean).slice(0, 4), [game.genres]);

  const handleAdd = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const ids = readLibraryIds();
    if (ids.includes(game.id)) return;
    writeLibraryIds([game.id, ...ids]);
    setInLibrary(true);
    await onAddToLibrary?.(game);
  };

  return (
    <Link to={href} className={cn("block h-full", className)} aria-label={game.title}>
      <article
        className={cn(
          "group relative h-full overflow-hidden",
          "border border-white/10 bg-[rgba(26,26,26,0.62)]",
          "backdrop-blur-xl",
          "rounded-md",
          "shadow-[0_0_0_1px_rgba(168,85,247,0.08),0_14px_50px_rgba(0,0,0,0.55)]",
          "transition-[transform,box-shadow,border-color] duration-300",
          "hover:-translate-y-1 hover:border-[#00ffcc]/25",
          "hover:shadow-[0_0_0_1px_rgba(0,255,204,0.22),0_0_55px_rgba(0,255,204,0.10),0_24px_70px_rgba(0,0,0,0.72)]",
        )}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <LazyImage
            src={game.coverImageUrl}
            alt={game.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            wrapperClassName="h-full w-full"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.05)_0%,rgba(10,10,10,0.55)_65%,rgba(10,10,10,0.88)_100%)]" />
          <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_25%_10%,rgba(0,255,204,0.22),transparent_45%),radial-gradient(circle_at_85%_0%,rgba(168,85,247,0.22),transparent_55%)]" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className="rounded border border-white/10 bg-[rgba(10,10,10,0.35)] px-2 py-1 text-[10px] font-semibold tracking-wide text-white/80 backdrop-blur"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3 p-4">
          <div className="space-y-2">
            <h3 className="line-clamp-2 text-[15px] font-extrabold leading-snug text-white">
              {game.title}
            </h3>

            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold text-white/70"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="h-px w-full bg-[linear-gradient(90deg,transparent,rgba(168,85,247,0.30),rgba(0,255,204,0.28),transparent)]" />

          <button
            type="button"
            onClick={handleAdd}
            disabled={inLibrary}
            className={cn(
              "inline-flex w-full items-center justify-center gap-2",
              "rounded-md px-4 py-2.5 text-sm font-extrabold",
              "transition",
              inLibrary
                ? "cursor-default border border-white/10 bg-white/5 text-white/70"
                : "border border-[#00ffcc]/30 bg-[rgba(0,255,204,0.10)] text-[#00ffcc] hover:bg-[rgba(0,255,204,0.16)] hover:shadow-[0_0_38px_rgba(0,255,204,0.18)]",
            )}
            aria-label={inLibrary ? "Already in library" : "Add to library"}
          >
            {inLibrary ? (
              <>
                <Check className="h-4 w-4" />
                In Library
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add to Library
              </>
            )}
          </button>
        </div>

        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,#00ffcc,rgba(168,85,247,0.9),#00ffcc)]" />
          <div className="absolute inset-0 border border-[#00ffcc]/10" />
        </div>
      </article>
    </Link>
  );
}

