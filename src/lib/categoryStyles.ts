export interface CategoryStyle {
  color: string;
  icon: string;
  gradient: string;
}

const PALETTE: CategoryStyle[] = [
  { color: "bg-blue-500 hover:bg-blue-600", icon: "⚔️", gradient: "from-blue-500 to-blue-700" },
  { color: "bg-orange-500 hover:bg-orange-600", icon: "🗺️", gradient: "from-orange-500 to-orange-700" },
  { color: "bg-purple-500 hover:bg-purple-600", icon: "🎮", gradient: "from-purple-500 to-purple-700" },
  { color: "bg-green-500 hover:bg-green-600", icon: "🏎️", gradient: "from-green-500 to-green-700" },
  { color: "bg-red-500 hover:bg-red-600", icon: "🔥", gradient: "from-red-500 to-red-700" },
  { color: "bg-cyan-500 hover:bg-cyan-600", icon: "🎯", gradient: "from-cyan-500 to-cyan-700" },
  { color: "bg-yellow-500 hover:bg-yellow-600", icon: "⚽", gradient: "from-yellow-500 to-yellow-700" },
  { color: "bg-pink-500 hover:bg-pink-600", icon: "♟️", gradient: "from-pink-500 to-pink-700" },
  { color: "bg-indigo-500 hover:bg-indigo-600", icon: "🕹️", gradient: "from-indigo-500 to-indigo-700" },
  { color: "bg-teal-500 hover:bg-teal-600", icon: "🧩", gradient: "from-teal-500 to-teal-700" },
  { color: "bg-rose-500 hover:bg-rose-600", icon: "👊", gradient: "from-rose-500 to-rose-700" },
  { color: "bg-amber-500 hover:bg-amber-600", icon: "🏆", gradient: "from-amber-500 to-amber-700" },
];

const NAMED: Record<string, CategoryStyle> = {
  All: { color: "bg-indigo-500 hover:bg-indigo-600", icon: "🎮", gradient: "from-indigo-500 to-purple-700" },
  Action: PALETTE[0],
  Adventure: PALETTE[1],
  RPG: PALETTE[2],
  Racing: PALETTE[3],
  Survival: PALETTE[4],
  Shooter: PALETTE[5],
  Sports: PALETTE[6],
  Strategy: PALETTE[7],
};

const hash = (value: string) => {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h << 5) - h + value.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

export const getCategoryStyle = (name: string): CategoryStyle => {
  if (NAMED[name]) return NAMED[name];
  return PALETTE[hash(name) % PALETTE.length];
};

export const getCategoryPath = (name: string) =>
  name.toLowerCase() === "all" ? "/category/all" : `/category/${encodeURIComponent(name.toLowerCase())}`;
