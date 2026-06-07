import ElectronStore from 'electron-store';

export type InstalledGame = {
  id: string;
  title: string;
  path: string;
  installedAt: number;
  status: 'installed' | 'downloading' | 'ready';
};

const schema = {
  installedGames: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        path: { type: 'string' },
        installedAt: { type: 'number' },
        status: { type: 'string' },
      },
      required: ['id', 'title', 'path', 'installedAt', 'status'],
    },
    default: [] as InstalledGame[],
  },
};

const store = new ElectronStore({
  name: 'steamfree-desktop-store',
  schema,
});

export function getInstalledGames(): InstalledGame[] {
  return store.get('installedGames', []) as InstalledGame[];
}

export function saveInstalledGame(game: InstalledGame) {
  const existingGames = getInstalledGames().filter((item) => item.id !== game.id);
  store.set('installedGames', [...existingGames, game]);
}
