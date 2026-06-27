import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { Game } from "../data/games";
import { getGameById, saveGames, loadGames, incrementGameView, incrementGameDownload, incrementSiteViews, getGamesSync } from "../../lib/gameStore";
import { buildGameJsonLd, buildGameMetaKeywords, buildGameCoverAlt, buildGameScreenshotAlt, buildGameMetaDescription, buildGamePageTitle, buildGamePageH1, injectJsonLd, removeJsonLd, setDocumentMeta, SITE_URL } from "../../lib/seo";
import { getGameDisplayStats } from "../../lib/gameStats";
import { loadSiteSettings } from "../../lib/gameStore";
import { DownloadPartsModal } from "../components/DownloadPartsModal";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";
import { DownloadButton } from "../components/DownloadButton";
import { formatCategoryList, getGameCategories } from "../../lib/gameCategories";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { GameCard } from "../components/GameCard";
import { SystemRequirementsDisplay } from "../components/SystemRequirementsDisplay";
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
  const [relatedGames, setRelatedGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadOpen, setDownloadOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    let active = true;
    const cached = getGamesSync().find((g) => g.id === id);
    if (cached) {
      setGame(cached);
      setLoading(false);
    } else {
      setLoading(true);
      setGame(null);
    }

    (async () => {
      try {
        const currentGame = await getGameById(id);
        if (!active) return;

        if (!currentGame) {
          setGame(null);
          return;
        }

        setGame(currentGame);

        const siteSettings = await loadSiteSettings().catch(() => ({
          siteName: "AQ Gaming Hub",
        }));
        const siteName = siteSettings.siteName || "AQ Gaming Hub";

        setDocumentMeta({
          title: buildGamePageTitle(currentGame, siteName),
          description: buildGameMetaDescription(currentGame, siteName),
          keywords: buildGameMetaKeywords(currentGame, siteName),
          image: currentGame.cover,
          url: `${SITE_URL}/game/${currentGame.id}`,
          type: "website",
          siteName,
          imageAlt: buildGameCoverAlt(currentGame),
        });
        removeJsonLd("site-jsonld");
        injectJsonLd("game-jsonld", buildGameJsonLd(currentGame, siteName));

        incrementGameView(id).then((updated) => {
          if (active && updated) setGame(updated);
        });
        incrementSiteViews().catch(() => undefined);
      } catch (error) {
        console.error("Failed to load game:", error);
        if (active) setGame(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!game) return;
    loadGames()
      .then((all) =>
        setRelatedGames(
          all
            .filter(
              (g) =>
                g.id !== game.id &&
                getGameCategories(g).some((c) => getGameCategories(game).includes(c))
            )
            .slice(0, 4)
        )
      )
      .catch((error) => console.error("Failed to load related games:", error));
  }, [game?.id, game?.category]);

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
      return <div className="h-[260px] sm:h-[340px] md:h-[420px] w-full bg-gradient-to-br from-slate-800 to-slate-900" />;
    }

    const mediaUrl = normalizeMediaUrl(game.backgroundImage);

    if (isYouTubeUrl(mediaUrl)) {
      const id = getYouTubeId(mediaUrl) || "";
      return (
        <iframe
          title="Game background video"
          src={`https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}`}
          className="h-[260px] sm:h-[340px] md:h-[420px] w-full object-cover"
          allow="autoplay; encrypted-media"
        />
      );
    }

    if (isVideoUrl(mediaUrl)) {
      return (
        <video
          src={mediaUrl}
          className="h-[260px] sm:h-[340px] md:h-[420px] w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      );
    }

    return <ImageWithFallback src={mediaUrl} alt={buildGameHeroAlt(game)} className="h-[260px] sm:h-[340px] md:h-[420px] w-full object-cover" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Skeleton className="h-[260px] sm:h-[340px] md:h-[420px] w-full rounded-none" />
        <div className="container mx-auto grid gap-8 px-3 sm:px-6 py-10 lg:grid-cols-[320px_1fr]">
          <Skeleton className="h-[520px] w-full rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

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

  const hasDownloadParts = (game.downloadParts?.filter((p) => p.link).length ?? 0) > 0;
  const displayStats = getGameDisplayStats(game.id);

  const nextScreenshot = () => {
    if (game.screenshots.length === 0) return;
    setCurrentScreenshot((prev) => (prev + 1) % game.screenshots.length);
  };

  const prevScreenshot = () => {
    if (game.screenshots.length === 0) return;
    setCurrentScreenshot((prev) => (prev - 1 + game.screenshots.length) % game.screenshots.length);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !game) return;

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

    try {
      const allGames = await loadGames();
      const updatedGames = allGames.map((g) => (g.id === game.id ? updatedGame : g));
      await saveGames(updatedGames);
      setGame(updatedGame);
      setComment("");
      setUserRating(0);
    } catch (error) {
      console.error("Failed to save comment:", error);
    }
  };

  const handleDownloadClick = () => {
    if (!game) return;

    if (hasDownloadParts) {
      setDownloadOpen(true);
      return;
    }

    if (!game.downloadLink) return;

    window.open(game.downloadLink, "_blank", "noopener,noreferrer");
    incrementGameDownload(game.id)
      .then((updated) => {
        if (updated) setGame(updated);
      })
      .catch((error) => console.error("Failed to update download count:", error));
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="relative overflow-hidden">
        {renderBackgroundMedia()}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,23,42,0.95)] via-[rgba(15,23,42,0.65)] to-transparent" />
      </div>

      <div className="container mx-auto px-3 sm:px-4 md:px-6 pb-12 md:pb-16 pt-6 md:pt-8">
        <h1 className="mb-6 text-2xl sm:text-3xl md:text-4xl font-bold text-white">{buildGamePageH1(game)}</h1>

        <div className="lg:hidden relative z-10 -mt-14 sm:-mt-16 mb-6">
          <div className="rounded-2xl border border-[rgba(226,232,240,0.10)] bg-[rgba(15,23,42,0.85)] backdrop-blur p-3">
            <div className="flex gap-3">
              <ImageWithFallback
                src={game.cover}
                alt={buildGameCoverAlt(game)}
                className="h-24 w-20 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-white line-clamp-2">{game.title}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)] line-clamp-1">
                  {formatCategoryList(game)} • {game.developer}
                </p>
                <div className="mt-3">
                  <DownloadButton
                    onClick={handleDownloadClick}
                    className="w-full neon-glow-cyan text-sm"
                    label="Download Now"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:gap-8 lg:gap-10 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr]">
          <div className="space-y-4 md:space-y-6 order-2 lg:order-1">
            <div className="hidden lg:block overflow-hidden rounded-2xl md:rounded-3xl border border-[rgba(226,232,240,0.08)] bg-[var(--card)] shadow-[0_18px_60px_rgba(15,23,42,0.35)]">
              <ImageWithFallback src={game.cover} alt={buildGameCoverAlt(game)} className="h-72 xl:h-96 w-full object-cover" />
              <div className="p-4 md:p-6">
                <p className="text-2xl md:text-3xl font-bold text-white line-clamp-2">{game.title}</p>
                <p className="mt-2 md:mt-3 text-xs md:text-sm text-[var(--muted-foreground)] line-clamp-2">{formatCategoryList(game)} • {game.developer}</p>
                <div className="mt-3 md:mt-4 flex flex-wrap gap-2">
                  {getGameCategories(game).map((cat) => (
                    <Badge key={cat} className="bg-cyan-500/15 text-cyan-200 border-cyan-500/20 text-xs">{cat}</Badge>
                  ))}
                  {game.featured && <Badge className="bg-yellow-500/10 text-yellow-300 border-yellow-500/20 text-xs">Featured</Badge>}
                  {game.trending && <Badge className="bg-pink-500/10 text-pink-300 border-pink-500/20 text-xs">Popular</Badge>}
                  {game.gameOfTheDay && <Badge className="bg-orange-500/10 text-orange-300 border-orange-500/20 text-xs">Game of the Day</Badge>}
                </div>
                <div className="mt-4 md:mt-6 space-y-3 md:space-y-4">
                  <DownloadButton onClick={handleDownloadClick} className="w-full neon-glow-cyan text-sm md:text-base" label="Download Now" />
                  {game.filePassword && (
                    <div className="rounded-xl md:rounded-2xl border-2 border-amber-400/60 bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-red-500/10 p-3 md:p-4 text-center shadow-lg shadow-amber-500/10">
                      <p className="text-xs font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] text-amber-200">Download Password</p>
                      <p className="mt-1 md:mt-2 text-xl md:text-2xl font-black text-amber-300 break-all">{game.filePassword}</p>
                      <p className="mt-1 text-xs text-amber-100/80">Use this password when the host asks for extraction</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl md:rounded-3xl border border-[rgba(226,232,240,0.08)] bg-[var(--card)] p-4 md:p-6 shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
              <h2 className="text-lg md:text-xl font-semibold text-[var(--foreground)] mb-3 md:mb-4">Quick Stats</h2>
              <div className="grid gap-2 md:gap-3">
                <div className="rounded-xl md:rounded-3xl bg-[rgba(255,255,255,0.04)] p-3 md:p-4">
                  <p className="text-xs md:text-sm text-[var(--muted-foreground)]">Rating</p>
                  <p className="mt-1 md:mt-2 text-xl md:text-2xl font-bold text-[var(--foreground)]">{displayStats.rating} / 5</p>
                </div>
                <div className="rounded-xl md:rounded-3xl bg-[rgba(255,255,255,0.04)] p-3 md:p-4">
                  <p className="text-xs md:text-sm text-[var(--muted-foreground)]">Downloads</p>
                  <p className="mt-1 md:mt-2 text-xl md:text-2xl font-bold text-[var(--foreground)]">{displayStats.downloads.toLocaleString()}</p>
                </div>
                <div className="rounded-xl md:rounded-3xl bg-[rgba(255,255,255,0.04)] p-3 md:p-4">
                  <p className="text-xs md:text-sm text-[var(--muted-foreground)]">Size</p>
                  <p className="mt-1 md:mt-2 text-xl md:text-2xl font-bold text-[var(--foreground)]">{game.size}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 md:space-y-8 order-1 lg:order-2">
            <div className="rounded-2xl md:rounded-3xl border border-[rgba(226,232,240,0.08)] bg-[var(--card)] p-4 md:p-6 shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
              <div className="mb-4 md:mb-6 flex flex-wrap items-center gap-2 md:gap-3">
                <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs md:text-sm text-cyan-200">Daily Highlight</span>
                <span className="rounded-full bg-[rgba(255,255,255,0.04)] px-3 py-1 text-xs md:text-sm text-[var(--muted-foreground)]">Released {new Date(game.releaseDate).toLocaleDateString()}</span>
              </div>
              <p className="text-sm md:text-base leading-relaxed text-[var(--foreground)]">{game.description}</p>
            </div>

            <div className="rounded-2xl md:rounded-3xl border border-[rgba(226,232,240,0.08)] bg-[var(--card)] p-4 md:p-6 shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
              <div className="mb-3 md:mb-4 flex flex-wrap items-center gap-2 md:gap-4">
                <h2 className="text-lg md:text-xl font-semibold text-[var(--foreground)]">Screenshots</h2>
                <span className="text-xs md:text-sm text-[var(--muted-foreground)]">Swipe or use arrows.</span>
              </div>
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-black/50">
                {game.screenshots.length > 0 ? (
                  <ImageWithFallback
                    src={game.screenshots[currentScreenshot]}
                    alt={buildGameScreenshotAlt(game, currentScreenshot)}
                    className="mx-auto min-h-[160px] sm:min-h-[260px] md:min-h-[320px] max-h-[420px] w-full object-contain"
                  />
                ) : (
                  <div className="flex min-h-[160px] sm:min-h-[260px] md:min-h-[320px] items-center justify-center text-[var(--muted-foreground)]">No screenshots available</div>
                )}
                {game.screenshots.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevScreenshot}
                      aria-label="Show previous screenshot"
                      className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 rounded-full bg-[rgba(15,23,42,0.7)] p-2 md:p-3 text-white transition hover:bg-[rgba(15,23,42,0.9)]"
                    >
                      <ChevronLeft className="h-4 md:h-5 w-4 md:w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={nextScreenshot}
                      aria-label="Show next screenshot"
                      className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 rounded-full bg-[rgba(15,23,42,0.7)] p-2 md:p-3 text-white transition hover:bg-[rgba(15,23,42,0.9)]"
                    >
                      <ChevronRight className="h-4 md:h-5 w-4 md:w-5" />
                    </button>
                  </>
                )}
              </div>
              <div className="mt-3 md:mt-4 grid grid-cols-3 gap-2 md:gap-3">
                {game.screenshots.map((screenshot, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentScreenshot(index)}
                    aria-label={`Show screenshot ${index + 1} for ${game.title}`}
                    className={`overflow-hidden rounded-lg md:rounded-3xl border transition ${
                      index === currentScreenshot ? "border-cyan-500" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <ImageWithFallback src={screenshot} alt={buildGameScreenshotAlt(game, index)} className="h-16 sm:h-20 md:h-24 w-full object-contain bg-black/40" />
                  </button>
                ))}
              </div>
            </div>

            {game.trailer && (
              <div className="rounded-2xl md:rounded-3xl border border-[rgba(226,232,240,0.08)] bg-[var(--card)] p-4 md:p-6 shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
                <h2 className="mb-3 md:mb-4 text-lg md:text-xl font-semibold text-[var(--foreground)]">Trailer</h2>
                {isYouTubeUrl(game.trailer) ? (
                  (() => {
                    const id = getYouTubeId(game.trailer || "") || "";
                    return (
                      <div className="w-full rounded-2xl md:rounded-3xl overflow-hidden">
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
                  <video controls src={game.trailer} className="w-full rounded-2xl md:rounded-3xl bg-black" poster={game.cover} />
                )}
              </div>
            )}

            <div className="rounded-2xl md:rounded-3xl border border-[rgba(226,232,240,0.08)] bg-[var(--card)] p-4 md:p-6 shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
              <h2 className="mb-4 md:mb-6 text-lg md:text-xl font-semibold text-[var(--foreground)]">System Requirements</h2>
              <div className="grid gap-4 md:gap-6 sm:grid-cols-2">
                <div className="rounded-xl md:rounded-3xl bg-[rgba(255,255,255,0.04)] p-3 md:p-4">
                  <h3 className="text-xs md:text-sm text-[var(--muted-foreground)] font-semibold">Minimum</h3>
                  <ul className="mt-2 md:mt-3 space-y-2 text-[var(--foreground)]">
                    {Object.entries(game.systemRequirements.minimum).map(([key, value]) => (
                      <li key={key} className="flex flex-col sm:flex-row sm:justify-between border-b border-[rgba(226,232,240,0.08)] pb-2 text-xs md:text-sm">
                        <span className="uppercase text-[var(--muted-foreground)] font-semibold">{key}</span>
                        <span className="text-[var(--foreground)]">{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl md:rounded-3xl bg-[rgba(255,255,255,0.04)] p-3 md:p-4">
                  <h3 className="text-xs md:text-sm text-[var(--muted-foreground)] font-semibold">Recommended</h3>
                  <ul className="mt-2 md:mt-3 space-y-2 text-[var(--foreground)]">
                    {Object.entries(game.systemRequirements.recommended).map(([key, value]) => (
                      <li key={key} className="flex flex-col sm:flex-row sm:justify-between border-b border-[rgba(226,232,240,0.08)] pb-2 text-xs md:text-sm">
                        <span className="uppercase text-[var(--muted-foreground)] font-semibold">{key}</span>
                        <span className="text-[var(--foreground)]">{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 md:mt-12">
          <div className="rounded-2xl md:rounded-3xl border border-[rgba(226,232,240,0.08)] bg-[var(--card)] p-4 md:p-6 shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
            <h2 className="mb-4 md:mb-6 text-lg md:text-xl font-semibold text-[var(--foreground)]">Comments</h2>
            <form onSubmit={handleCommentSubmit} className="space-y-3 md:space-y-4">
              <div>
                <label className="mb-2 block text-xs md:text-sm text-[var(--muted-foreground)]">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      aria-label={`Rate ${star} out of 5`}
                      className="transition hover:scale-110"
                    >
                      <Star
                        className={`h-5 md:h-6 w-5 md:w-6 ${
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
                  className="min-h-[100px] md:min-h-[120px] bg-[var(--background)] border-[rgba(226,232,240,0.12)] text-[var(--foreground)] text-sm"
                />
              </div>
              <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm md:text-base">
                <MessageSquare className="mr-2 h-4 w-4" /> Post Comment
              </Button>
            </form>

            <div className="mt-8 md:mt-10 space-y-3 md:space-y-4">
              {game.comments.map((comment) => (
                <Card key={comment.id} className="border-[rgba(226,232,240,0.08)] bg-[rgba(255,255,255,0.04)] p-4 md:p-6">
                  <div className="mb-2 md:mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 md:gap-3">
                    <div>
                      <p className="font-semibold text-[var(--foreground)] text-sm md:text-base">{comment.user}</p>
                      <div className="flex gap-1 text-yellow-400 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 md:h-4 w-3 md:w-4 ${i < comment.rating ? "fill-yellow-400" : "text-[var(--muted-foreground)]"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs md:text-sm text-[var(--muted-foreground)]">{new Date(comment.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[var(--foreground)] text-sm md:text-base">{comment.text}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {relatedGames.length > 0 && (
          <section className="mt-8 md:mt-12">
            <h2 className="mb-4 md:mb-6 text-2xl md:text-3xl font-bold text-[var(--foreground)]">More {game.category} Games</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {relatedGames.map((relatedGame) => (
                <GameCard key={relatedGame.id} game={relatedGame} />
              ))}
            </div>
          </section>
        )}
      </div>

      <DownloadPartsModal
        open={downloadOpen}
        onOpenChange={setDownloadOpen}
        gameTitle={game.title}
        downloadParts={game.downloadParts || []}
        mainLink={game.downloadLink}
        filePassword={game.filePassword}
      />
    </div>
  );
}
