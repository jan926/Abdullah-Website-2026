// FeaturedSlider Component - Horizontal carousel for featured games
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface FeaturedGame {
  id: string;
  title: string;
  description: string;
  bannerImage: string;
  category: string;
  rating: number;
  featured?: boolean;
}

interface FeaturedSliderProps {
  games: FeaturedGame[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

/**
 * FeaturedSlider Component
 * Horizontal carousel showcasing featured games
 * Auto-plays with manual controls
 */
export const FeaturedSlider: React.FC<FeaturedSliderProps> = ({
  games,
  autoPlay = true,
  autoPlayInterval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play logic
  useEffect(() => {
    if (!autoPlay || isPaused || games.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % games.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, isPaused, games.length, autoPlayInterval]);

  if (games.length === 0) return null;

  const currentGame = games[currentIndex];

  const goToSlide = (index: number) => {
    setCurrentIndex(index % games.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % games.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), autoPlayInterval);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + games.length) % games.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), autoPlayInterval);
  };

  return (
    <div
      className="relative w-full h-96 rounded-2xl overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slider Container */}
      <div className="relative w-full h-full">
        {/* Banner Image */}
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${currentGame.bannerImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-transparent to-bg-primary"></div>
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-8">
          <div className="max-w-2xl space-y-4 animate-slide-in-left">
            {/* Category Badge */}
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-neon-purple/30 backdrop-blur-sm border border-neon-purple/50 text-neon-purple text-xs font-bold rounded-full">
                {currentGame.category}
              </span>
              {currentGame.featured && (
                <span className="px-3 py-1 bg-neon-pink/30 backdrop-blur-sm border border-neon-pink/50 text-neon-pink text-xs font-bold rounded-full">
                  ⭐ FEATURED
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-4xl font-bold text-text-primary neon-glow">
              {currentGame.title}
            </h2>

            {/* Description */}
            <p className="text-text-secondary line-clamp-2">
              {currentGame.description}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4">
              <Link
                to={`/game/${currentGame.id}`}
                className="px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-cyan text-white rounded-lg hover:shadow-lg hover:shadow-neon-purple/50 transition-all hover-lift font-bold"
              >
                Play Now
              </Link>
              <button className="px-6 py-3 border-2 border-neon-cyan text-neon-cyan rounded-lg hover:bg-neon-cyan/10 transition-all hover-lift font-bold">
                Add to Wishlist
              </button>

              {/* Rating */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-2xl">⭐</span>
                <span className="text-xl font-bold text-neon-yellow">
                  {currentGame.rating}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-neon-purple/20 backdrop-blur-md hover:bg-neon-purple/40 text-neon-cyan rounded-full transition-all opacity-0 group-hover:opacity-100 hover-lift"
        aria-label="Previous slide"
      >
        ◀
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-neon-purple/20 backdrop-blur-md hover:bg-neon-purple/40 text-neon-cyan rounded-full transition-all opacity-0 group-hover:opacity-100 hover-lift"
        aria-label="Next slide"
      >
        ▶
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {games.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-neon-cyan'
                : 'w-2 bg-text-tertiary/50 hover:bg-text-secondary'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Play indicator */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 text-text-secondary text-sm bg-bg-primary/50 backdrop-blur-md px-3 py-1 rounded-full">
        <span className={`inline-block w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-400' : 'bg-neon-green animate-pulse'}`}></span>
        {isPaused ? 'Paused' : 'Auto-playing'}
      </div>
    </div>
  );
};
