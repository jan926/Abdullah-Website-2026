// GameEditor Component - Form for adding/editing games
import React, { useState, useEffect } from 'react';
import { gameService, type Game, type CreateGameInput } from '@/services/gameService';
import { supabase } from '@/lib/supabaseClient';

interface GameEditorProps {
  gameId?: string;
  onSave?: (game: Game) => void;
  onCancel?: () => void;
}

/**
 * GameEditor
 * Form component for creating and editing games
 */
export default function GameEditor({ gameId, onSave, onCancel }: GameEditorProps) {
  const [isLoading, setIsLoading] = useState(!!gameId);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [game, setGame] = useState<Partial<Game>>({
    title: '',
    description: '',
    long_description: '',
    category_id: '',
    cover_image_url: '',
    developer: '',
    publisher: '',
    release_date: new Date().toISOString().split('T')[0],
    file_size_mb: 5000,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories
        const { data: cats } = await supabase.from('categories').select('*');
        setCategories(cats || []);

        // Load game if editing
        if (gameId) {
          const loadedGame = await gameService.getGameById(gameId);
          if (loadedGame) {
            setGame(loadedGame);
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [gameId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setGame((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate required fields
      if (
        !game.title ||
        !game.description ||
        !game.category_id ||
        !game.developer ||
        !game.publisher
      ) {
        setError('Please fill in all required fields');
        return;
      }

      setIsSaving(true);

      let savedGame: Game | null;

      if (gameId) {
        // Update existing game
        savedGame = await gameService.updateGame(gameId, {
          ...game,
          updated_at: new Date().toISOString(),
        });
      } else {
        // Create new game
        savedGame = await gameService.createGame(game as CreateGameInput);
      }

      if (!savedGame) {
        throw new Error('Failed to save game');
      }

      onSave?.(savedGame);
    } catch (err) {
      console.error('Error saving game:', err);
      setError(err instanceof Error ? err.message : 'Failed to save game');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin">⏳</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-text-secondary text-sm font-medium mb-2">
          Game Title *
        </label>
        <input
          type="text"
          name="title"
          value={game.title || ''}
          onChange={handleChange}
          placeholder="Enter game title"
          required
          className="glass-input w-full"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-text-secondary text-sm font-medium mb-2">
          Short Description *
        </label>
        <textarea
          name="description"
          value={game.description || ''}
          onChange={handleChange}
          placeholder="Enter short description (100-200 chars)"
          rows={3}
          required
          className="glass-input w-full"
        />
      </div>

      {/* Long Description */}
      <div>
        <label className="block text-text-secondary text-sm font-medium mb-2">
          Long Description
        </label>
        <textarea
          name="long_description"
          value={game.long_description || ''}
          onChange={handleChange}
          placeholder="Enter detailed game description"
          rows={5}
          className="glass-input w-full"
        />
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category */}
        <div>
          <label className="block text-text-secondary text-sm font-medium mb-2">
            Category *
          </label>
          <select
            name="category_id"
            value={game.category_id || ''}
            onChange={handleChange}
            required
            className="glass-input w-full"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Release Date */}
        <div>
          <label className="block text-text-secondary text-sm font-medium mb-2">
            Release Date
          </label>
          <input
            type="date"
            name="release_date"
            value={game.release_date?.split('T')[0] || ''}
            onChange={handleChange}
            className="glass-input w-full"
          />
        </div>

        {/* Developer */}
        <div>
          <label className="block text-text-secondary text-sm font-medium mb-2">
            Developer *
          </label>
          <input
            type="text"
            name="developer"
            value={game.developer || ''}
            onChange={handleChange}
            placeholder="Game developer name"
            required
            className="glass-input w-full"
          />
        </div>

        {/* Publisher */}
        <div>
          <label className="block text-text-secondary text-sm font-medium mb-2">
            Publisher *
          </label>
          <input
            type="text"
            name="publisher"
            value={game.publisher || ''}
            onChange={handleChange}
            placeholder="Game publisher name"
            required
            className="glass-input w-full"
          />
        </div>

        {/* File Size */}
        <div>
          <label className="block text-text-secondary text-sm font-medium mb-2">
            File Size (MB)
          </label>
          <input
            type="number"
            name="file_size_mb"
            value={game.file_size_mb || 0}
            onChange={handleChange}
            min="1"
            className="glass-input w-full"
          />
        </div>

        {/* Rating */}
        <div>
          <label className="block text-text-secondary text-sm font-medium mb-2">
            Initial Rating (0-10)
          </label>
          <input
            type="number"
            name="rating"
            value={game.rating || 4.5}
            onChange={handleChange}
            min="0"
            max="10"
            step="0.1"
            className="glass-input w-full"
          />
        </div>
      </div>

      {/* Cover Image URL */}
      <div>
        <label className="block text-text-secondary text-sm font-medium mb-2">
          Cover Image URL
        </label>
        <input
          type="url"
          name="cover_image_url"
          value={game.cover_image_url || ''}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          className="glass-input w-full"
        />
        {game.cover_image_url && (
          <div className="mt-2">
            <img
              src={game.cover_image_url}
              alt="Preview"
              className="w-32 h-48 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-6">
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-cyan text-white rounded-lg hover:shadow-lg hover:shadow-neon-purple/50 transition-all font-bold disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : gameId ? 'Update Game' : 'Create Game'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 border border-neon-purple/50 text-neon-purple rounded-lg hover:bg-neon-purple/10 transition-all font-bold"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
