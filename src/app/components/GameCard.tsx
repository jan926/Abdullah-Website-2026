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
}

export function GameCard({ game }: GameCardProps) {
  const displayStats = getGameDisplayStats(game.id);

  return (
    <Card className="group overflow-hidden border-[var(--border)] bg-[var(--card)] backdrop-blur card-3d reflection hover:border-cyan-400 hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300">
      <Link to={`/game/${game.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden">
          <LazyImage
            src={game.cover}
            alt={buildGameCoverAlt(game)}
            wrapperClassName="h-full w-full"
            className="transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          {game.featured && (
            <Badge className="absolute left-2 top-2 sm:left-3 sm:top-3 bg-cyan-500 text-white border-0 shadow-lg animate-pulse-glow z-10 text-[10px] sm:text-xs">
              Featured
            </Badge>
          )}

          {game.trending && (
            <Badge className="absolute right-2 top-2 sm:right-3 sm:top-3 bg-orange-500 text-white border-0 shadow-lg animate-float z-10 text-[10px] sm:text-xs">
              🔥 Trending
            </Badge>
          )}

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/70 backdrop-blur-sm">
            <div className="text-center space-y-3 sm:space-y-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <div className="flex items-center justify-center gap-2 text-yellow-400 text-xl sm:text-2xl font-bold">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
                <span>{displayStats.rating}</span>
              </div>
              <div className="px-4 sm:px-6 py-2 bg-cyan-500/20 border-2 border-cyan-400 rounded-lg backdrop-blur neon-glow-cyan">
                <p className="text-xs sm:text-sm text-gray-300 mb-1">File Size</p>
                <p className="text-base sm:text-lg font-bold text-white">{game.size}</p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 transform transition-all duration-300 group-hover:opacity-0 group-hover:pointer-events-none">
            <h3 className="mb-2 line-clamp-2 text-base sm:text-lg font-bold text-[var(--foreground)] drop-shadow-lg">
              {game.title}
            </h3>
            <div className="flex items-center justify-between opacity-100 group-hover:opacity-0 transition-opacity duration-300">
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-medium">{displayStats.rating}</span>
              </div>
              <Badge variant="secondary" className="bg-black/60 text-white border-0 backdrop-blur text-[10px] sm:text-xs">
                {getPrimaryCategory(game)}
              </Badge>
            </div>
          </div>

          {/* Neon border glow on hover */}
          <div className="absolute inset-0 border-2 border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-[0_0_20px_rgba(34,211,238,0.5)]" />
        </div>
      </Link>

      <div className="p-3 sm:p-4 bg-[var(--card)]">
        <div className="mb-3 flex items-center justify-between text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <Download className="h-4 w-4" />
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
}
