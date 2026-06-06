// Game Service - Handle all game-related operations
import { supabase } from './supabaseClient';
import type { User } from '@/types/auth';

export interface Game {
  id: string;
  title: string;
  slug: string;
  description: string;
  long_description?: string;
  category_id?: string;
  cover_image_url?: string;
  gallery_images?: string[];
  thumbnail_url?: string;
  developer?: string;
  publisher?: string;
  release_date?: string;
  rating?: number;
  is_featured?: boolean;
  featured_position?: number;
  total_downloads?: number;
  file_size_mb?: number;
  is_visible?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GameFilters {
  category?: string;
  search?: string;
  sortBy?: 'newest' | 'popular' | 'rating';
  page?: number;
  limit?: number;
}

export interface CreateGameInput {
  title: string;
  description: string;
  long_description?: string;
  category_id: string;
  cover_image_url: string;
  developer: string;
  publisher: string;
  release_date: string;
  file_size_mb: number;
}

export const gameService = {
  /**
   * Get all visible games with optional filters
   */
  async getGames(filters?: GameFilters): Promise<Game[]> {
    try {
      let query = supabase
        .from('games')
        .select('*')
        .eq('is_visible', true)
        .eq('is_deleted', false);

      // Apply category filter
      if (filters?.category) {
        query = query.eq('category_id', filters.category);
      }

      // Apply search
      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      // Apply sorting
      if (filters?.sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (filters?.sortBy === 'popular') {
        query = query.order('total_downloads', { ascending: false });
      } else if (filters?.sortBy === 'rating') {
        query = query.order('rating', { ascending: false });
      }

      // Apply pagination
      const limit = filters?.limit || 20;
      const page = filters?.page || 1;
      const offset = (page - 1) * limit;

      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching games:', error);
      return [];
    }
  },

  /**
   * Get featured games for carousel
   */
  async getFeaturedGames(): Promise<Game[]> {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('is_featured', true)
        .eq('is_visible', true)
        .eq('is_deleted', false)
        .order('featured_position', { ascending: true })
        .limit(8);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching featured games:', error);
      return [];
    }
  },

  /**
   * Get single game by ID
   */
  async getGameById(id: string): Promise<Game | null> {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching game:', error);
      return null;
    }
  },

  /**
   * Search games
   */
  async searchGames(query: string): Promise<Game[]> {
    return this.getGames({
      search: query,
      sortBy: 'rating',
      limit: 20,
    });
  },

  /**
   * Get games by category
   */
  async getGamesByCategory(categoryId: string, limit = 20): Promise<Game[]> {
    return this.getGames({
      category: categoryId,
      sortBy: 'popular',
      limit,
    });
  },

  /**
   * Create new game (admin only)
   */
  async createGame(input: CreateGameInput): Promise<Game | null> {
    try {
      const { data, error } = await supabase
        .from('games')
        .insert([
          {
            title: input.title,
            slug: input.title.toLowerCase().replace(/\s+/g, '-'),
            description: input.description,
            long_description: input.long_description,
            category_id: input.category_id,
            cover_image_url: input.cover_image_url,
            developer: input.developer,
            publisher: input.publisher,
            release_date: input.release_date,
            file_size_mb: input.file_size_mb,
            is_visible: true,
            is_deleted: false,
            rating: 4.5,
            total_downloads: 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating game:', error);
      return null;
    }
  },

  /**
   * Update game (admin only)
   */
  async updateGame(id: string, updates: Partial<Game>): Promise<Game | null> {
    try {
      const { data, error } = await supabase
        .from('games')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating game:', error);
      return null;
    }
  },

  /**
   * Delete game (soft delete - admin only)
   */
  async deleteGame(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('games')
        .update({ is_deleted: true })
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting game:', error);
      return false;
    }
  },

  /**
   * Toggle featured status
   */
  async toggleFeatured(id: string, featured: boolean): Promise<Game | null> {
    try {
      const { data, error } = await supabase
        .from('games')
        .update({ is_featured: featured })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error toggling featured:', error);
      return null;
    }
  },

  /**
   * Increment download count
   */
  async incrementDownloadCount(id: string): Promise<void> {
    try {
      const game = await this.getGameById(id);
      if (!game) return;

      await supabase
        .from('games')
        .update({ total_downloads: (game.total_downloads || 0) + 1 })
        .eq('id', id);
    } catch (error) {
      console.error('Error incrementing downloads:', error);
    }
  },
};
