// AdminGamesPage Component - Game management interface
import React, { useState, useEffect } from 'react';
import { gameService, type Game } from '@/services/gameService';
import GameEditor from '@/app/components/admin/GameEditor';
import { LoadingSpinner } from '@/app/components/common/LoadingSpinner';

/**
 * AdminGamesPage
 * Admin interface for managing all games
 */
export default function AdminGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingGameId, setEditingGameId] = useState<string | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setIsLoading(true);
      const allGames = await gameService.getGames({ limit: 1000 });
      setGames(allGames);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (gameId: string) => {
    try {
      const success = await gameService.deleteGame(gameId);
      if (success) {
        setGames(games.filter((g) => g.id !== gameId));
        setConfirmDelete(null);
      }
    } catch (error) {
      console.error('Error deleting game:', error);
    }
  };

  const handleSave = (game: Game) => {
    if (editingGameId) {
      // Update existing
      setGames(games.map((g) => (g.id === game.id ? game : g)));
    } else {
      // Add new
      setGames([...games, game]);
    }
    setShowEditor(false);
    setEditingGameId(undefined);
  };

  const filteredGames = games.filter((game) =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showEditor) {
    return (
      <div className="p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary neon-glow">
              {editingGameId ? 'Edit Game' : 'Add New Game'}
            </h1>
            <p className="text-text-secondary mt-1">
              {editingGameId
                ? 'Modify game details'
                : 'Create a new game entry'}
            </p>
          </div>
          <GameEditor
            gameId={editingGameId}
            onSave={handleSave}
            onCancel={() => {
              setShowEditor(false);
              setEditingGameId(undefined);
            }}
          />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading games..." />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-4xl font-bold text-text-primary neon-glow">
            Manage Games
          </h1>
          <p className="text-text-secondary mt-1">
            Add, edit, or remove games from the store
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-4 flex-col sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input flex-1 sm:max-w-md"
          />
          <button
            onClick={() => {
              setEditingGameId(undefined);
              setShowEditor(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-cyan text-white rounded-lg hover:shadow-lg hover:shadow-neon-purple/50 transition-all font-bold"
          >
            + Add New Game
          </button>
        </div>
      </div>

      {/* Games Table */}
      <div className="glassmorphic-card overflow-hidden">
        {filteredGames.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-text-tertiary">
              {searchQuery ? 'No games found matching your search' : 'No games yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neon-purple/10 bg-neon-purple/5">
                  <th className="px-6 py-3 text-left text-sm font-bold text-text-primary">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-text-primary">
                    Developer
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-text-primary">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-text-primary">
                    Downloads
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-text-primary">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-text-primary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredGames.map((game) => (
                  <tr
                    key={game.id}
                    className="border-b border-neon-purple/10 hover:bg-neon-purple/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {game.cover_image_url && (
                          <img
                            src={game.cover_image_url}
                            alt={game.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-text-primary">
                            {game.title}
                          </p>
                          <p className="text-xs text-text-tertiary">
                            {game.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {game.developer || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-neon-yellow font-bold">
                        ⭐ {game.rating || 4.5}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {game.total_downloads?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {game.is_visible ? (
                          <span className="px-2 py-1 bg-neon-green/20 text-neon-green text-xs rounded">
                            Visible
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-neon-purple/20 text-neon-purple text-xs rounded">
                            Hidden
                          </span>
                        )}
                        {game.is_featured && (
                          <span className="px-2 py-1 bg-neon-pink/20 text-neon-pink text-xs rounded">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingGameId(game.id);
                            setShowEditor(true);
                          }}
                          className="px-3 py-1 bg-neon-cyan/20 text-neon-cyan rounded text-sm hover:bg-neon-cyan/30 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDelete(game.id)}
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur">
          <div className="glassmorphic-card p-6 max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-text-primary">
              Confirm Delete
            </h3>
            <p className="text-text-secondary">
              Are you sure you want to delete this game? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 border border-neon-purple/50 text-neon-purple rounded hover:bg-neon-purple/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
