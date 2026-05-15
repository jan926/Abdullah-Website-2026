import { useState, useRef, useEffect } from "react";
import { GameCard } from "../components/GameCard";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Button } from "../components/ui/button";
import { Link } from "react-router";
import { Game } from "../data/games";
import { loadGames, loadSiteSettings, SiteSettings, loadCategories } from "../../lib/gameStore";
import { ChevronLeft, ChevronRight, Play, Download } from "lucide-react";

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(loadSiteSettings());
  const trendingScrollRef = useRef<HTMLDivElement>(null);
  const latestScrollRef = useRef<HTMLDivElement>(null);
  const gameOfDayScrollRef = useRef<HTMLDivElement>(null);

  const heroGames = games.slice(0, 5);
  const trendingGames = games.filter((game) => game.trending).slice(0, 5);
  const latestGames = [...games]
    .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
    .slice(0, 12);
  const gameOfTheDay = games.filter((game) => game.gameOfTheDay).slice(0, 5);

  const categoryColorMap: Record<string, { color: string; icon: string }> = {
    "Action": { color: "bg-blue-500 hover:bg-blue-600", icon: "⚔️" },
    "Adventure": { color: "bg-orange-500 hover:bg-orange-600", icon: "🗺️" },
    "RPG": { color: "bg-purple-500 hover:bg-purple-600", icon: "🎮" },
    "Racing": { color: "bg-green-500 hover:bg-green-600", icon: "🏎️" },
    "Survival": { color: "bg-red-500 hover:bg-red-600", icon: "🔥" },
    "Shooter": { color: "bg-cyan-500 hover:bg-cyan-600", icon: "🎯" },
    "Sports": { color: "bg-yellow-500 hover:bg-yellow-600", icon: "⚽" },
    "Strategy": { color: "bg-pink-500 hover:bg-pink-600", icon: "♟️" },
  };

  const categoryColors = categories.map(cat => ({
    name: cat,
    color: categoryColorMap[cat]?.color || "bg-gray-500 hover:bg-gray-600",
    icon: categoryColorMap[cat]?.icon || "🎯",
  }));

  const isYouTubeUrl = (url: string) => /youtube\.com|youtu\.be/.test(url);
  const getYouTubeId = (url: string) => {
    const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  };

  const isVideoUrl = (url: string) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
  const normalizeMediaUrl = (url: string) => {
    if (url.includes("drive.google.com")) {
      const idMatch = url.match(/(?:file\/d\/|id=)([A-Za-z0-9_-]+)/);
      if (idMatch) {
        return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
      }
    }
    if (url.includes("dropbox.com")) {
      return url.replace("www.dropbox.com", "dl.dropboxusercontent.com").replace("?dl=0", "?raw=1");
    }

    return url;
  };

  const renderHeroMedia = (src: string, alt: string) => {
    const mediaUrl = normalizeMediaUrl(src);

    if (isYouTubeUrl(mediaUrl)) {
      const id = getYouTubeId(mediaUrl) || "";
      return (
        <iframe
          title={alt}
          src={`https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}`}
          className="w-full h-full object-cover"
          allow="autoplay; encrypted-media"
        />
      );
    }

    if (isVideoUrl(mediaUrl)) {
      return (
        <video
          src={mediaUrl}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      );
    }

    return <ImageWithFallback src={mediaUrl} alt={alt} className="w-full h-full object-cover" />;
  };

  const nextSlide = () => {
    if (heroGames.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % heroGames.length);
  };

  const prevSlide = () => {
    if (heroGames.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + heroGames.length) % heroGames.length);
  };

  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 400;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const loadedGames = loadGames();
    const loadedSettings = loadSiteSettings();
    setGames(loadedGames);
    setSettings(loadedSettings);
    setCategories(loadCategories());
    document.documentElement.classList.toggle("dark", loadedSettings.theme === "dark");
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [heroGames.length]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        {heroGames.map((game, index) => (
          <div
            key={game.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100 pointer-events-auto z-10" : "opacity-0 pointer-events-none"
            }`}
          >
            {renderHeroMedia(game.backgroundImage || game.cover, game.title)}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-6">
                <div className="max-w-2xl space-y-4">
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-cyan-500 text-white text-xs font-bold rounded-full">
                      NEW
                    </span>
                    <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                      🔥 TRENDING
                    </span>
                  </div>
                  <h1 className="text-5xl font-bold text-white leading-tight">
                    {game.title}
                  </h1>
                  <p className="line-clamp-3 text-gray-300 text-lg leading-relaxed">
                    {game.description}
                  </p>
                  <div className="flex items-center gap-3 pt-4">
                    <Button
                      asChild
                      className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-5 text-base font-semibold rounded-lg neon-glow-cyan"
                    >
                      <Link to={`/game/${game.id}`}>
                        <Download className="mr-2 h-5 w-5" />
                        Download
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="border-2 border-white/30 bg-white/10 hover:bg-white/20 text-white px-6 py-5 text-base font-semibold rounded-lg backdrop-blur"
                    >
                      <Link to={`/game/${game.id}`}>
                        <Play className="mr-2 h-5 w-5" />
                        More
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {heroGames.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSlide ? "w-8 bg-cyan-500" : "w-2 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Arrow buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur transition hover:bg-black/70"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur transition hover:bg-black/70"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </section>

      {/* Categories Section - Auto Scrolling */}
      <section className="py-8 bg-[var(--card)] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#06091a] via-transparent to-[#06091a] z-10 pointer-events-none" />
        <div className="flex gap-3 animate-scroll">
          <div className="flex gap-3 animate-marquee">
            {[...categoryColors, ...categoryColors].map((cat, idx) => (
              <Link
                key={`${cat.name}-${idx}`}
                to={`/category/${cat.name.toLowerCase()}`}
                onClick={(e) => {
                  setActiveCategory(cat.name);
                }}
                className={`flex items-center gap-2 px-6 py-3 ${cat.color} text-white font-bold rounded-full whitespace-nowrap transition-all hover:scale-105 hover:shadow-lg ${
                  activeCategory === cat.name ? 'ring-2 ring-white shadow-[0_0_20px_rgba(255,255,255,0.5)]' : ''
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: flex;
            animation: marquee 30s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>
      </section>

      <div className="container mx-auto px-6 py-8 space-y-12">
        {/* Trending Games */}
        {settings.showMostViewed && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Trending Games</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => scroll(trendingScrollRef, 'left')}
                  className="p-2 rounded-full bg-[var(--card)] text-cyan-400 hover:bg-[var(--background)] transition"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => scroll(trendingScrollRef, 'right')}
                  className="p-2 rounded-full bg-[var(--card)] text-cyan-400 hover:bg-[var(--background)] transition"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div
              ref={trendingScrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
            >
              {trendingGames.map((game) => (
                <div key={game.id} className="flex-none w-[200px]">
                  <div className="group block">
                    <Link to={`/game/${game.id}`} className="block">
                      <div className="relative overflow-hidden rounded-lg mb-2 card-hover-shine card-3d">
                        <img
                          src={game.cover}
                          alt={game.title}
                          className="w-full h-[280px] object-cover transition-transform duration-300 group-hover:scale-110 animate-shine"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-0 p-4 w-full">
                            <div className="flex items-center gap-1 text-yellow-400 mb-2">
                              <span className="text-sm font-bold">★ {game.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <h3 className="text-[var(--foreground)] font-bold text-sm line-clamp-2 group-hover:text-cyan-400 transition">
                        {game.title}
                      </h3>
                    </Link>
                    <div className="mt-3">
                      <Button asChild className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 text-sm font-semibold rounded-lg">
                        <Link to={`/game/${game.id}`}>
                          <Download className="mr-2 h-4 w-4 inline-block" />
                          Download
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Latest Games */}
        {settings.showLatestGames && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Latest Games</h2>
              <div className="flex gap-2">
              <button
                onClick={() => scroll(latestScrollRef, 'left')}
                className="p-2 rounded-full bg-[var(--card)] text-cyan-400 hover:bg-[var(--background)] transition"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scroll(latestScrollRef, 'right')}
                className="p-2 rounded-full bg-[var(--card)] text-cyan-400 hover:bg-[var(--background)] transition"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div
            ref={latestScrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          >
            {latestGames.map((game, index) => (
              <div key={game.id} className="flex-none w-[200px] stagger-item" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="group block">
                  <Link to={`/game/${game.id}`} className="block">
                    <div className="relative overflow-hidden rounded-lg mb-2 card-hover-shine card-3d">
                      <img
                        src={game.cover}
                        alt={game.title}
                        className="w-full h-[280px] object-cover transition-transform duration-300 group-hover:scale-110 animate-shine"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 p-4 w-full">
                          <div className="flex items-center gap-1 text-yellow-400 mb-2">
                            <span className="text-sm font-bold">★ {game.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-[var(--foreground)] font-bold text-sm line-clamp-2 group-hover:text-cyan-400 transition">
                      {game.title}
                    </h3>
                  </Link>
                  <div className="mt-3">
                    <Button asChild className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 text-sm font-semibold rounded-lg">
                      <Link to={`/game/${game.id}`}>
                        <Download className="mr-2 h-4 w-4 inline-block" />
                        Download
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>)}

        {/* Game of the Day */}
        {settings.showGameOfTheDay && (
          <section>
            <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-600 to-red-700 dark:from-yellow-400 dark:via-orange-500 dark:to-red-500">
                🏆 Game of the Day
              </h2>
              <p className="text-gray-400 text-sm mt-1">Hand-picked favorites from our collection</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scroll(gameOfDayScrollRef, 'left')}
                className="p-2 rounded-full bg-[var(--card)] text-orange-400 hover:bg-[var(--background)] transition"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scroll(gameOfDayScrollRef, 'right')}
                className="p-2 rounded-full bg-[var(--card)] text-orange-400 hover:bg-[var(--background)] transition"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div
            ref={gameOfDayScrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          >
            {gameOfTheDay.map((game, index) => (
              <div key={game.id} className="flex-none w-[280px] stagger-item" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="group block">
                  <Link to={`/game/${game.id}`} className="block">
                    <div className="relative overflow-hidden rounded-xl mb-3 card-hover-shine card-3d border-2 border-orange-500/30 hover:border-orange-500">
                      <img
                        src={game.cover}
                        alt={game.title}
                        className="w-full h-[350px] object-cover transition-transform duration-300 group-hover:scale-110 animate-shine"
                      />
                      <div className="absolute top-3 left-3">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          ⭐ Featured Today
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 p-4 w-full">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1 text-yellow-400">
                              <span className="text-lg font-bold">★ {game.rating}</span>
                            </div>
                            <span className="text-white text-sm font-semibold">{game.size}</span>
                          </div>
                        </div>
                      </div>
                      {/* Animated glow border */}
                      <div className="absolute inset-0 border-2 border-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-[0_0_30px_rgba(251,146,60,0.6)] animate-pulse-glow" />
                    </div>
                    <h3 className="text-[var(--foreground)] font-bold text-base line-clamp-2 group-hover:text-orange-400 transition">
                      {game.title}
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">{game.category}</p>
                  </Link>
                  <div className="mt-3">
                    <Button asChild className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 text-sm font-semibold rounded-lg">
                      <Link to={`/game/${game.id}`}>
                        <Download className="mr-2 h-4 w-4 inline-block" />
                        Download
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>)}

        {/* All Games Grid */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">All Games</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {games.map((game, index) => (
              <Link key={game.id} to={`/game/${game.id}`} className="group block stagger-item" style={{ animationDelay: `${(index % 12) * 0.05}s` }}>
                <div className="relative overflow-hidden rounded-lg mb-2 card-3d reflection">
                  <img
                    src={game.cover}
                    alt={game.title}
                    className="w-full h-[220px] object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 p-3 w-full">
                      <div className="flex items-center gap-1 text-yellow-400 mb-1">
                        <span className="text-xs font-bold">★ {game.rating}</span>
                      </div>
                      <span className="text-xs text-gray-300">{game.category}</span>
                    </div>
                  </div>
                  {/* Neon border on hover */}
                  <div className="absolute inset-0 border-2 border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
                <h3 className="text-[var(--foreground)] font-bold text-sm line-clamp-2 group-hover:text-cyan-400 transition">
                  {game.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}