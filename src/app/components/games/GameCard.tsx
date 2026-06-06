// GameCard Component - Individual game card with glassmorphic design
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface GameCardProps {
  id: string;
  title: string;
  coverImage?: string;
  rating?: number;
  category?: string;
  downloads?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  onDownload?: () => void;
  onWishlist?: () => void;
}

/**
 * GameCard Component
 * Glassmorphic card with neon effects
 * Shows game info and quick actions
 */
export const GameCard: React.FC<GameCardProps> = ({
  id,
  title,
  coverImage,
  rating = 4.5,
  category = 'Action',
  downloads = 0,
  isNew = false,
  isFeatured = false,
  onDownload,
  onWishlist,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <Link
      to={`/game/${id}`}
      className="h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="glassmorphic-card h-full hover:scale-105 hover-lift">
        {/* Image Container */}
        <div className="relative w-full aspect-video overflow-hidden rounded-t-lg bg-bg-tertiary">
          {/* Cover Image */}
          {coverImage && (
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover"
            />
          )}

          {/* Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent transition-opacity ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          ></div>

          {/* Badges */}
          <div className="absolute top-3 right-3 flex gap-2">
            {isNew && (
              <span className="px-2 py-1 bg-neon-green/30 backdrop-blur-sm border border-neon-green/50 text-neon-green text-xs font-bold rounded">
                NEW
              </span>
            )}
            {isFeatured && (
              <span className="px-2 py-1 bg-neon-pink/30 backdrop-blur-sm border border-neon-pink/50 text-neon-pink text-xs font-bold rounded">
                ⭐ FEATURED
              </span>
            )}
          </div>

          {/* Quick Actions (on hover) */}
          {isHovered && (
            <div className="absolute inset-0 flex items-center justify-center gap-3 animate-fade-in">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDownload?.();
                }}
                className="px-6 py-2 bg-gradient-to-r from-neon-purple to-neon-cyan text-white rounded-lg hover:shadow-lg hover:shadow-neon-purple/50 transition-all hover-lift font-semibold"
              >
                Download
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsWishlisted(!isWishlisted);
                  onWishlist?.();
                }}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  isWishlisted
                    ? 'bg-neon-pink/20 border-neon-pink/50 text-neon-pink'
                    : 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/30'
                }`}
              >
                {isWishlisted ? '❤️' : '🖤'}
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="text-sm font-bold text-text-primary line-clamp-2 hover:text-neon-cyan transition-colors">
            {title}
          </h3>

          {/* Category Badge */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-neon-purple/20 backdrop-blur-sm border border-neon-purple/30 text-neon-purple text-xs rounded">
              {category}
            </span>
          </div>

          {/* Rating & Stats */}
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">⭐</span>
              <span className="text-neon-yellow">{rating}</span>
            </div>
            <div className="text-text-tertiary">
              {downloads > 1000
                ? `${(downloads / 1000).toFixed(1)}K`
                : downloads} downloads
            </div>
          </div>

          {/* Divider */}
          <div className="glass-divider"></div>

          {/* CTA Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onDownload?.();
            }}
            className="w-full py-2 bg-neon-purple/30 hover:bg-neon-purple/50 border border-neon-purple/50 text-neon-purple rounded-lg transition-all hover:shadow-md hover:shadow-neon-purple/30 text-xs font-semibold"
          >
            View Details
          </button>
        </div>

        {/* Glow effect */}
        {isHovered && (
          <div className="absolute inset-0 rounded-lg pointer-events-none opacity-20 animate-pulse border border-neon-cyan"></div>
        )}
      </div>
    </Link>
  );
};
