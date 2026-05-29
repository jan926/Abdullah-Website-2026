import { useEffect, useState } from "react";

const MIN_ONLINE = 800;
const MAX_ONLINE = 1200;
const TICK_MS = 3500;

function randomInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function useOnlineUsersCounter() {
  const [onlineUsers, setOnlineUsers] = useState(() => randomInRange(MIN_ONLINE, MAX_ONLINE));

  useEffect(() => {
    const interval = window.setInterval(() => {
      setOnlineUsers((prev) => {
        const delta = randomInRange(2, 5) * (Math.random() > 0.5 ? 1 : -1);
        const next = prev + delta;
        return Math.min(5000, Math.max(650, next));
      });
    }, TICK_MS);

    return () => window.clearInterval(interval);
  }, []);

  return onlineUsers;
}
