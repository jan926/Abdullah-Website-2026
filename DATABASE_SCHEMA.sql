-- ============================================================================
-- AQ Gaming Hub - Complete PostgreSQL Database Schema
-- ============================================================================
-- This schema is designed for Supabase (PostgreSQL 13+)
-- Includes Row-Level Security (RLS) policies for multi-tenant safety
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN DEFAULT TRUE,
    is_banned BOOLEAN DEFAULT FALSE,
    banned_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- 2. CATEGORIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    color_hex VARCHAR(7),
    display_order INT DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_display_order ON categories(display_order);

-- ============================================================================
-- 3. GAMES - Core Game Data
-- ============================================================================

CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    long_description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Media
    cover_image_url TEXT,
    gallery_images TEXT[] DEFAULT ARRAY[]::TEXT[], -- Array of image URLs
    thumbnail_url TEXT,
    
    -- Game Info
    developer VARCHAR(255),
    publisher VARCHAR(255),
    release_date DATE,
    rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 5),
    is_featured BOOLEAN DEFAULT FALSE,
    featured_position INT,
    
    -- Download Info
    total_downloads INT DEFAULT 0,
    file_size_mb INT,
    
    -- Visibility
    is_visible BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_games_category_id ON games(category_id);
CREATE INDEX idx_games_slug ON games(slug);
CREATE INDEX idx_games_is_featured ON games(is_featured);
CREATE INDEX idx_games_title ON games USING GIN (to_tsvector('english', title));
CREATE INDEX idx_games_visible ON games(is_visible) WHERE is_visible = TRUE;

-- ============================================================================
-- 4. SYSTEM REQUIREMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    
    -- Minimum Requirements
    min_os VARCHAR(255),
    min_processor VARCHAR(255),
    min_memory_gb INT,
    min_storage_gb INT,
    min_gpu VARCHAR(255),
    
    -- Recommended Requirements
    rec_os VARCHAR(255),
    rec_processor VARCHAR(255),
    rec_memory_gb INT,
    rec_storage_gb INT,
    rec_gpu VARCHAR(255),
    
    -- Additional
    other_requirements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_system_requirements_game_id ON system_requirements(game_id);

-- ============================================================================
-- 5. DOWNLOAD PARTS - Multi-part Download Support
-- ============================================================================

CREATE TABLE IF NOT EXISTS download_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    part_number INT NOT NULL,
    part_name VARCHAR(255),
    file_size_mb INT,
    download_url TEXT NOT NULL,
    file_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_game_part UNIQUE(game_id, part_number)
);

CREATE INDEX idx_download_parts_game_id ON download_parts(game_id);
CREATE INDEX idx_download_parts_active ON download_parts(is_active);

-- ============================================================================
-- 6. USER DOWNLOADS & LIBRARY - Track User's Downloaded Games
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    
    download_status VARCHAR(50) DEFAULT 'completed' CHECK (download_status IN ('pending', 'downloading', 'completed', 'failed')),
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_played_at TIMESTAMP WITH TIME ZONE,
    play_time_minutes INT DEFAULT 0,
    
    -- Track parts for multi-part downloads
    parts_completed INT[] DEFAULT ARRAY[]::INT[], -- Array of completed part numbers
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_game UNIQUE(user_id, game_id)
);

CREATE INDEX idx_user_downloads_user_id ON user_downloads(user_id);
CREATE INDEX idx_user_downloads_game_id ON user_downloads(game_id);
CREATE INDEX idx_user_downloads_status ON user_downloads(download_status);

-- ============================================================================
-- 7. USER WISHLIST - Track Saved Games
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_wishlist_entry UNIQUE(user_id, game_id)
);

CREATE INDEX idx_wishlist_user_id ON user_wishlist(user_id);
CREATE INDEX idx_wishlist_game_id ON user_wishlist(game_id);

-- ============================================================================
-- 8. ADMIN AUDIT LOG - Track All Admin Actions
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    
    action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'publish', 'unpublish', 'ban_user', 'unban_user')),
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('game', 'category', 'user', 'system_requirements')),
    entity_id UUID,
    entity_name VARCHAR(255),
    
    -- Store before/after state for auditing
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX idx_audit_log_entity ON admin_audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created_at ON admin_audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action ON admin_audit_log(action);

-- ============================================================================
-- 9. FEATURED GAMES CAROUSEL - Configuration for Homepage Slider
-- ============================================================================

CREATE TABLE IF NOT EXISTS featured_carousel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    
    position INT NOT NULL UNIQUE,
    title_override VARCHAR(255),
    description_override TEXT,
    banner_image_url TEXT,
    
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE,
    end_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_featured_carousel_active ON featured_carousel(is_active);
CREATE INDEX idx_featured_carousel_position ON featured_carousel(position);
CREATE INDEX idx_featured_carousel_dates ON featured_carousel(start_date, end_date);

-- ============================================================================
-- 10. GAME REVIEWS (Future Expansion)
-- ============================================================================

CREATE TABLE IF NOT EXISTS game_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    helpful_count INT DEFAULT 0,
    unhelpful_count INT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_review UNIQUE(game_id, user_id)
);

CREATE INDEX idx_game_reviews_game_id ON game_reviews(game_id);
CREATE INDEX idx_game_reviews_user_id ON game_reviews(user_id);

-- ============================================================================
-- 11. ACTIVITY LOG - Track User Actions (non-admin)
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50),
    entity_type VARCHAR(50),
    entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);

-- ============================================================================
-- 12. ANALYTICS SNAPSHOTS - Daily/Weekly Stats
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    
    total_users INT DEFAULT 0,
    new_users INT DEFAULT 0,
    total_downloads INT DEFAULT 0,
    active_users INT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_daily_date ON analytics_daily(date);

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_carousel ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS - RLS Policies
-- ============================================================================

-- Users can view all other user profiles (but not sensitive data)
CREATE POLICY "Users can view profiles" ON users
    FOR SELECT USING (TRUE);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins can view all user data
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'admin' OR
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

-- Admins can update any user
CREATE POLICY "Admins can update users" ON users
    FOR UPDATE USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- GAMES - RLS Policies
-- ============================================================================

-- Everyone can view visible games
CREATE POLICY "Anyone can view visible games" ON games
    FOR SELECT USING (is_visible = TRUE AND is_deleted = FALSE);

-- Only admins can insert games
CREATE POLICY "Only admins can create games" ON games
    FOR INSERT WITH CHECK (
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

-- Only admins can update games
CREATE POLICY "Only admins can update games" ON games
    FOR UPDATE USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

-- Only admins can delete games
CREATE POLICY "Only admins can delete games" ON games
    FOR DELETE USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- USER_DOWNLOADS - RLS Policies
-- ============================================================================

-- Users can view their own downloads
CREATE POLICY "Users can view own downloads" ON user_downloads
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create download records for themselves
CREATE POLICY "Users can create downloads" ON user_downloads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own download records
CREATE POLICY "Users can update own downloads" ON user_downloads
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all downloads
CREATE POLICY "Admins can view all downloads" ON user_downloads
    FOR SELECT USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- USER_WISHLIST - RLS Policies
-- ============================================================================

-- Users can view their own wishlist
CREATE POLICY "Users can view own wishlist" ON user_wishlist
    FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own wishlist
CREATE POLICY "Users can manage own wishlist" ON user_wishlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist" ON user_wishlist
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- ADMIN_AUDIT_LOG - RLS Policies
-- ============================================================================

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" ON admin_audit_log
    FOR SELECT USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

-- Only admins can insert audit logs
CREATE POLICY "Only admins can create audit logs" ON admin_audit_log
    FOR INSERT WITH CHECK (
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- CATEGORIES - RLS Policies
-- ============================================================================

-- Everyone can view visible categories
CREATE POLICY "Anyone can view visible categories" ON categories
    FOR SELECT USING (is_visible = TRUE);

-- Only admins can manage categories
CREATE POLICY "Only admins can manage categories" ON categories
    FOR INSERT WITH CHECK (
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Only admins can update categories" ON categories
    FOR UPDATE USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- SYSTEM_REQUIREMENTS - RLS Policies
-- ============================================================================

-- Everyone can view system requirements
CREATE POLICY "Anyone can view requirements" ON system_requirements
    FOR SELECT USING (TRUE);

-- Only admins can manage requirements
CREATE POLICY "Only admins can manage requirements" ON system_requirements
    FOR INSERT WITH CHECK (
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Only admins can update requirements" ON system_requirements
    FOR UPDATE USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- FEATURED_CAROUSEL - RLS Policies
-- ============================================================================

-- Everyone can view active featured carousel
CREATE POLICY "Anyone can view featured carousel" ON featured_carousel
    FOR SELECT USING (is_active = TRUE);

-- Only admins can manage featured carousel
CREATE POLICY "Only admins can manage featured" ON featured_carousel
    FOR INSERT WITH CHECK (
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Only admins can update featured" ON featured_carousel
    FOR UPDATE USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- ACTIVITY_LOG - RLS Policies
-- ============================================================================

-- Users can view their own activity
CREATE POLICY "Users can view own activity" ON activity_log
    FOR SELECT USING (auth.uid() = user_id);

-- System can insert activity logs
CREATE POLICY "System can log activity" ON activity_log
    FOR INSERT WITH CHECK (TRUE);

-- ============================================================================
-- ANALYTICS - RLS Policies
-- ============================================================================

-- Only admins can view analytics
CREATE POLICY "Only admins can view analytics" ON analytics_daily
    FOR SELECT USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_requirements_updated_at BEFORE UPDATE ON system_requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_featured_carousel_updated_at BEFORE UPDATE ON featured_carousel
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_downloads_updated_at BEFORE UPDATE ON user_downloads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA (Optional - Remove before production)
-- ============================================================================

-- Insert sample categories
INSERT INTO categories (name, slug, description, color_hex, display_order, is_visible)
VALUES 
    ('Action', 'action', 'Fast-paced action games', '#ff0000', 1, TRUE),
    ('RPG', 'rpg', 'Role-playing games', '#9900ff', 2, TRUE),
    ('Strategy', 'strategy', 'Strategy and simulation games', '#00ff00', 3, TRUE),
    ('Puzzle', 'puzzle', 'Puzzle and brain teasers', '#ffff00', 4, TRUE),
    ('Adventure', 'adventure', 'Adventure and exploration', '#ff6600', 5, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Total Tables: 12
-- Total Indexes: 30+
-- RLS Policies: 25+
-- Triggers: 6
-- Functions: 1
-- ============================================================================
