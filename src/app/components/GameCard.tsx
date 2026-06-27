import { memo } from "react";
import { Link } from "react-router";
import { Download, Star } from "lucide-react";
import { DownloadButton } from "./DownloadButton";
import { getPrimaryCategory } from "../../lib/gameCategories";
import { buildGameCoverAlt } from "../../lib/seo";
import { getGameDisplayStats, formatDownloadCount } from "../../lib/gameStats";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { LazyImage } from "../../components/LazyImage";
import type { Game } from "../data/games";

interface GameCardProps {
  game: Game;
  /** Lighter card for large grids (category pages) */
  compact?: boolean;
}

export const GameCard = memo(function GameCard({ game, compact = false }: GameCardProps) {
  const displayStats = getGameDisplayStats(game.id);

  return (
    <Card
      className={`group overflow-hidden border-[var(--border)] bg-[var(--card)] transition-all duration-200 hover:border-cyan-400/80 hover:shadow-lg hover:shadow-cyan-500/15 flex flex-col h-full ${
        compact ? "" : "backdrop-blur card-3d reflection hover:shadow-cyan-500/30"
      }`}
    >
      <Link to={`/game/${game.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden">
          <LazyImage
            src={game.cover}
            alt={buildGameCoverAlt(game)}
            wrapperClassName="h-full w-full"
            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              compact ? "" : "group-hover:brightness-110"
            }`}
            width={300}
            height={400}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          {game.featured && (
            <Badge
              className={`absolute left-2 top-2 sm:left-3 sm:top-3 bg-cyan-500 text-white border-0 shadow-lg z-10 text-[10px] sm:text-xs ${
                compact ? "" : "animate-pulse-glow"
              }`}
            >
              Featured
            </Badge>
          )}

          {game.trending && !compact && (
            <Badge className="absolute right-2 top-2 sm:right-3 sm:top-3 bg-orange-500 text-white border-0 shadow-lg z-10 text-[10px] sm:text-xs">
              🔥 Trending
            </Badge>
          )}

          {!compact && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/60">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-yellow-400 text-lg font-bold">
                  <Star className="h-5 w-5 fill-current" />
                  <span>{displayStats.rating}</span>
                </div>
                <p className="text-sm font-bold text-white">{game.size}</p>
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
            <h3 className="mb-1 line-clamp-2 text-sm sm:text-base font-bold text-white drop-shadow-lg group-hover:text-cyan-300 transition-colors">
              {game.title}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="text-xs font-medium">{displayStats.rating}</span>
              </div>
              <Badge variant="secondary" className="bg-black/60 text-white border-0 text-[10px]">
                {getPrimaryCategory(game)}
              </Badge>
            </div>
          </div>
        </div>
      </Link>

      <div className="p-3 sm:p-4 bg-[var(--card)] mt-auto">
        <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Download className="h-3.5 w-3.5" />
            {formatDownloadCount(displayStats.downloads)}
          </span>
          <span>{game.size}</span>
        </div>

        <DownloadButton asChild className="w-full">
          <Link to={`/game/${game.id}`}>
            <Download className="mr-2 h-4 w-4 btn-download-icon" />
            Download
          </Link>
        </DownloadButton>
      </div>
    </Card>
  );
});
