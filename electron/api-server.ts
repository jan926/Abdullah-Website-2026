import express from 'express';
import cors from 'cors';

const sampleGames = [
  {
    id: 'alien-dusk',
    title: 'Alien Dusk',
    description: 'A spacepunk shooter with online leaderboards and cloud saves.',
    icon: '/icons/alien-dusk.png',
    downloadUrl: 'https://example.com/downloads/alien-dusk.exe',
    sizeMb: 1024,
  },
  {
    id: 'neon-odyssey',
    title: 'Neon Odyssey',
    description: 'A cyberpunk RPG adventure built for PC desktop.',
    icon: '/icons/neon-odyssey.png',
    downloadUrl: 'https://example.com/downloads/neon-odyssey.exe',
    sizeMb: 1792,
  },
];

export async function startApiServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/games', (_req, res) => {
    res.json(sampleGames.map(({ downloadUrl, ...game }) => game));
  });

  app.get('/api/games/:id', (req, res) => {
    const game = sampleGames.find((item) => item.id === req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  });

  app.get('/api/games/:id/download-url', (req, res) => {
    const game = sampleGames.find((item) => item.id === req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json({ downloadUrl: game.downloadUrl });
  });

  return new Promise<void>((resolve, reject) => {
    const server = app.listen(3001, () => {
      console.log('Electron API server listening on http://localhost:3001');
      resolve();
    });

    server.on('error', reject);
  });
}
