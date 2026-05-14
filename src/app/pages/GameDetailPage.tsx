import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { Game } from "../data/games";
import { getGameById, saveGames, loadGames, incrementGameView, incrementGameDownload, incrementSiteViews } from "../../lib/gameStore";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { GameCard } from "../components/GameCard";
import {
  Download,
  Star,
  Calendar,
  HardDrive,
  User,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export default function GameDetailPage() {
  const { id } = useParams();
  const [game, setGame] = useState<Game | null>(null);
  const [currentScreenshot, setCurrentScreenshot] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showMinimum, setShowMinimum] = useState(true);

  useEffect(() => {
    if (!id) return;
    const currentGame = getGameById(id);
    if (!currentGame) {
      setGame(null);
      return;
    }
    const updatedGame = incrementGameView(id);
    setGame(updatedGame || currentGame);
    incrementSiteViews();
  }, [id]);

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

  const renderBackgroundMedia = () => {
    if (!game.backgroundImage) {
      return <div className="h-[420px] w-full bg-gradient-to-br from-slate-800 to-slate-900" />;
    }

    const mediaUrl = normalizeMediaUrl(game.backgroundImage);

    if (isYouTubeUrl(mediaUrl)) {
      const id = getYouTubeId(mediaUrl) || "";
      return (
        <iframe
          title="Game background video"
          src={`https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}`}
          className="h-[420px] w-full object-cover"
          allow="autoplay; encrypted-media"
        />
      );
    }

    if (isVideoUrl(mediaUrl)) {
      return (
        <video
          src={mediaUrl}
          className="h-[420px] w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      );
    }

    return <ImageWithFallback src={mediaUrl} alt={game.title} className="h-[420px] w-full object-cover" />;
  };

  if (!game) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="mb-4 text-2xl text-[var(--foreground)]">Game not found</h1>
        <Button asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  const relatedGames = loadGames()
    .filter((g) => g.category === game.category && g.id !== game.id)
    .slice(0, 4);

  const nextScreenshot = () => {
    if (game.screenshots.length === 0) return;
    setCurrentScreenshot((prev) => (prev + 1) % game.screenshots.length);
  };

  const prevScreenshot = () => {
    if (game.screenshots.length === 0) return;
    setCurrentScreenshot((prev) => (prev - 1 + game.screenshots.length) % game.screenshots.length);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newComment = {
      id: Date.now().toString(),
      user: "Guest",
      text: comment.trim(),
      rating: userRating || 5,
      date: new Date().toISOString().split("T")[0],
    };

    const updatedGame = {
      ...game,
      comments: [...game.comments, newComment],
    };

    const updatedGames = loadGames().map((g) => (g.id === game.id ? updatedGame : g));
    saveGames(updatedGames);
    setGame(updatedGame);
    setComment("");
    setUserRating(0);
  };

  const handleDownloadClick = () => {
    if (!game?.downloadLink) return;
    const updatedGame = incrementGameDownload(game.id);
    if (updatedGame) {
      setGame(updatedGame);
    }
    window.open(game.downloadLink, "_blank");
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="relative overflow-hidden">
        {renderBackgroundMedia()}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,23,42,0.95)] via-[rgba(15,23,42,0.65)] to-transparent" />
      </div>

      <div className="container mx-auto px-6 pb-16 pt-8">
        <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-[rgba(226,232,240,0.08)] bg-[var(--card)] shadow-[0_18px_60px_rgba(15,23,42,0.35)]">
              <ImageWithFallback src={game.cover} alt={game.title} className="h-96 w-full object-cover" />
              <div className="p-6">
                <h1 className="text-3xl font-bold text-white">{game.title}</h1>
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">{game.category} • {game.developer}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge className="bg-cyan-500/15 text-cyan-200 border-cyan-500/20">{game.category}</Badge>
                  {game.featured && <Badge className="bg-yellow-500/10 text-yellow-300 border-yellow-500/20">Featured</Badge>}
                  {game.trending && <Badge className="bg-pink-500/10 text-pink-300 border-pink-500/20">Popular</Badge>}
                  {game.gameOfTheDay && <Badge className="bg-orange-500/10 text-orange-300 border-orange-500/20">Game of the Day</Badge>}
                </div>
                <div className="mt-6">
                  <Button onClick={handleDownloadClick} className="bg-cyan-500 hover:bg-cyan-600 text-white">
                    <Download className="mr-2 h-4 w-4" /> Download Now
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[rgba(226,232,240,0.08)] bg-[var(--card)] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Quick Stats</h2>
              <div className="grid gap-3">
                <div className="rounded-3xl bg-[rgba(255,255,255,0.04)] p-4">
                  <p className="text-sm text-[var(--muted-foreground)]">Rating</p>
                  <p className="mt-2 text-2xl font-bold text-[var(--foreground)]">{game.rating} / 5</p>
                </div>
                <div className="rounded-3xl bg-[rgba(255,255,255,0.04)] p-4">
                  <p className="text-sm text-[var(--muted-foreground)]">Downloads</p>
                  <p className="mt-2 text-2xl font-bold text-[var(--foreground)]">{game.downloads.toLocaleString()}</p>
                </div>
                <div className="rounded-3xl bg-[rgba(255,255,255,0.04)] p-4">
                  <p className="text-sm text-[var(--muted-foreground)]">Size</p>
                  <p className="mt-2 text-2xl font-bold text-[var(--foreground)]">{game.size}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-3xl border border-[rgba(226,232,240,0.08)] bg-[var(--card)] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-sm text-cyan-200">Daily Highlight</span>
                <span className="rounded-full bg-[rgba(255,255,255,0.04)] px-3 py-1 text-sm text-[var(--muted-foreground)]">Released {new Date(game.releaseDate).toLocaleDateString()}</span>
              </div>
              <p className="text-base leading-relaxed text-[var(--foreground)]">{game.description}</p>
            </div>

            <div className="rounded-3xl border border-[rgba(226,232,240,0.08)] bg-[var(--card)] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
              <div className="mb-4 flex flex-wrap items-center gap-4">
                <h2 className="text-xl font-semibold text-[var(--foreground)]">Screenshots</h2>
                <span className="text-sm text-[var(--muted-foreground)]">Swipe through the gallery or use arrows.</span>
              </div>
              <div className="relative overflow-hidden rounded-3xl bg-black/30">
                {game.screenshots.length > 0 ? (
                  <ImageWithFallback
                    src={game.screenshots[currentScreenshot]}
                    alt={`Screenshot ${currentScreenshot + 1}`}
                    className="h-[280px] w-full object-cover"
                  />
                ) : (
                  <div className="flex h-[280px] items-center justify-center text-[var(--muted-foreground)]">No screenshots available</div>
                )}
                {game.screenshots.length > 1 && (
                  <>
                    <button
                      onClick={prevScreenshot}
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-[rgba(15,23,42,0.7)] p-3 text-white transition hover:bg-[rgba(15,23,42,0.9)]"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextScreenshot}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-[rgba(15,23,42,0.7)] p-3 text-white transition hover:bg-[rgba(15,23,42,0.9)]"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {game.screenshots.map((screenshot, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentScreenshot(index)}
                    className={`overflow-hidden rounded-3xl border transition ${
                      index === currentScreenshot ? "border-cyan-500" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <ImageWithFallback src={screenshot} alt={`Thumbnail ${index + 1}`} className="h-20 w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {game.trailer && (
              <div className="rounded-3xl border border-[rgba(226,232,240,0.08)] bg-[var(--card)] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
                <h2 className="mb-4 text-xl font-semibold text-[var(--foreground)]">Trailer</h2>
                {isYouTubeUrl(game.trailer) ? (
                  (() => {
                    const id = getYouTubeId(game.trailer || "") || "";
                    return (
                      <div className="w-full rounded-3xl overflow-hidden">
                        <iframe
                          src={`https://www.youtube.com/embed/${id}`}
                          title="Trailer"
                          className="w-full aspect-video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      </div>
                    );
                  })()
                ) : (
                  <video controls src={game.trailer} className="w-full rounded-3xl bg-black" poster={game.cover} />
                )}
              </div>
            )}

            <div className="rounded-3xl border border-[rgba(226,232,240,0.08)] bg-[var(--card)] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
              <h2 className="mb-4 text-xl font-semibold text-[var(--foreground)]">System Requirements</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-[rgba(255,255,255,0.04)] p-4">
                  <p className="text-sm text-[var(--muted-foreground)]">Minimum</p>
                  <ul className="mt-3 space-y-2 text-[var(--foreground)]">
                    {Object.entries(game.systemRequirements.minimum).map(([key, value]) => (
                      <li key={key} className="flex justify-between border-b border-[rgba(226,232,240,0.08)] pb-2 text-sm">
                        <span className="uppercase text-[var(--muted-foreground)]">{key}</span>
                        <span>{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-3xl bg-[rgba(255,255,255,0.04)] p-4">
                  <p className="text-sm text-[var(--muted-foreground)]">Recommended</p>
                  <ul className="mt-3 space-y-2 text-[var(--foreground)]">
                    {Object.entries(game.systemRequirements.recommended).map(([key, value]) => (
                      <li key={key} className="flex justify-between border-b border-[rgba(226,232,240,0.08)] pb-2 text-sm">
                        <span className="uppercase text-[var(--muted-foreground)]">{key}</span>
                        <span>{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="rounded-3xl border border-[rgba(226,232,240,0.08)] bg-[var(--card)] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
            <h2 className="mb-4 text-xl font-semibold text-[var(--foreground)]">Comments</h2>
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-[var(--muted-foreground)]">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="transition hover:scale-110"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= userRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-[var(--muted-foreground)]"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Textarea
                  placeholder="Share your thoughts about this game..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[120px] bg-[var(--background)] border-[rgba(226,232,240,0.12)] text-[var(--foreground)]"
                />
              </div>
              <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white">
                <MessageSquare className="mr-2 h-4 w-4" /> Post Comment
              </Button>
            </form>

            <div className="mt-10 space-y-4">
              {game.comments.map((comment) => (
                <Card key={comment.id} className="border-[rgba(226,232,240,0.08)] bg-[rgba(255,255,255,0.04)] p-6">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">{comment.user}</p>
                      <div className="flex gap-1 text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < comment.rating ? "fill-yellow-400" : "text-[var(--muted-foreground)]"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-[var(--muted-foreground)]">{new Date(comment.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[var(--foreground)]">{comment.text}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {relatedGames.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 text-3xl font-bold text-[var(--foreground)]">More {game.category} Games</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedGames.map((relatedGame) => (
                <GameCard key={relatedGame.id} game={relatedGame} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
