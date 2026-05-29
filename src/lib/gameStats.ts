/** Deterministic display stats per game (consistent across refreshes). */
export function getGameDisplayStats(gameId: string) {
  let hash = 0;
  for (let i = 0; i < gameId.length; i++) {
    hash = (hash << 5) - hash + gameId.charCodeAt(i);
    hash |= 0;
  }

  const seed = Math.abs(hash);
  const downloads = 4500 + (seed % 90500);
  const rating = Math.round((4.4 + (seed % 6) / 10) * 10) / 10;

  return { downloads, rating };
}

export function formatDownloadCount(downloads: number) {
  if (downloads >= 1000) {
    return `${(downloads / 1000).toFixed(1)}K`;
  }
  return downloads.toLocaleString();
}
