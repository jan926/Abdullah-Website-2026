# AQ Gaming Hub - Architecture & Technical Specifications

## Overview

This document provides detailed technical specifications for building the premium gaming platform. It covers design decisions, implementation patterns, and integration strategies.

---

## 1. Authentication & Authorization Architecture

### 1.1 Authentication Flow

```
User → Supabase Auth → JWT Token → Store in localStorage
          ↓
    Email/Password
    OAuth (Google/GitHub)
          ↓
    Verify Email → Access Token + Refresh Token
          ↓
    Token stored with expiry (60 min access, 7 day refresh)
```

### 1.2 Role-Based Access Control (RBAC)

```typescript
// Two role types:
type UserRole = 'admin' | 'user';

// Permission matrix:
Permissions: {
  admin: [
    'create_game',
    'edit_game',
    'delete_game',
    'manage_categories',
    'manage_users',
    'view_analytics',
    'access_audit_log'
  ],
  user: [
    'download_game',
    'view_games',
    'manage_library',
    'write_review'
  ]
}
```

### 1.3 Implementation

- Supabase Auth handles credential storage securely
- JWT tokens include `role` claim for client-side checks
- Row-Level Security (RLS) policies enforce server-side access
- Protected routes check token validity before rendering

---

## 2. Database Architecture Details

### 2.1 Entity Relationships

```
users (1) ←→ (many) user_downloads ←→ (many) games
users (1) ←→ (many) user_wishlist ←→ (many) games
users (1) ←→ (many) game_reviews ←→ (many) games

games (1) ←→ (many) system_requirements
games (1) ←→ (many) download_parts
games (many) ←→ (1) categories

users (1) ←→ (many) admin_audit_log
featured_carousel (many) ←→ (1) games
```

### 2.2 Key Design Decisions

#### Soft Deletes for Games
```sql
-- Instead of hard DELETE, use is_deleted flag
UPDATE games SET is_deleted = TRUE WHERE id = $1;

-- Queries filter deleted games
SELECT * FROM games WHERE is_deleted = FALSE;
```
**Reason**: Preserves referential integrity, audit trail, and allows recovery.

#### Multi-part Downloads
```sql
-- Games can have multiple download parts
download_parts table stores:
- part_number (1, 2, 3, etc.)
- download_url (direct link)
- file_size_mb
- file_hash (for verification)

-- Track completion per part
user_downloads.parts_completed = ARRAY[1, 2, 3]
```
**Reason**: Supports large games split across multiple files.

#### JSONB for Audit Changes
```sql
-- admin_audit_log.changes stores:
{
  "before": {"title": "Old Game", "rating": 4.5},
  "after": {"title": "New Game", "rating": 4.8}
}
```
**Reason**: Flexible change tracking without separate columns.

### 2.3 Indexing Strategy

| Table | Index | Purpose |
|-------|-------|---------|
| games | (category_id) | Fast category lookups |
| games | (title) USING GIN | Full-text search |
| games | (is_featured) | Featured carousel queries |
| users | (email) | Login lookups |
| user_downloads | (user_id, game_id) | User library access |
| admin_audit_log | (created_at DESC) | Timeline queries |

---

## 3. Frontend Architecture

### 3.1 State Management Pattern

```typescript
// Context-based state (lightweight):
- AuthContext (user, token, login, logout)
- UserContext (profile, library, wishlist)
- NotificationContext (toasts, alerts)

// Custom hooks for data fetching:
- useAuth() → Auth state + methods
- useUser() → User profile + methods
- useGames() → Games list + filtering
- useUserLibrary() → Downloads/wishlist

// Local state for UI:
- React.useState for form inputs, modals, etc.
```

### 3.2 Component Hierarchy

```
App.tsx
├── AuthProvider
├── UserProvider
├── NotificationProvider
└── Router
    ├── Layout
    │   ├── Sidebar (sticky left)
    │   ├── MainContent
    │   └── Footer
    ├── Pages
    │   ├── HomePage
    │   │   ├── FeaturedSlider
    │   │   ├── GameCardGrid
    │   │   └── CategoriesSection
    │   ├── GameDetailPage
    │   ├── AdminDashboardPage
    │   │   ├── AdminGameManager
    │   │   ├── AdminUserManager
    │   │   └── AdminAuditLog
    │   └── UserProfilePage
```

### 3.3 Data Flow Pattern

```
User Action
    ↓
Component calls Hook (e.g., useGames())
    ↓
Hook calls Service (e.g., gameService.getGames())
    ↓
Service makes API call to Supabase
    ↓
RLS policy checks permission
    ↓
Data returned to Hook
    ↓
Hook updates Context
    ↓
Component re-renders with new data
```

### 3.4 Error Handling Pattern

```typescript
// Global error boundary catches crashes
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Service-level error handling
try {
  const data = await gameService.getGames();
} catch (error) {
  if (error.status === 403) {
    // Permission denied
    router.push('/unauthorized');
  } else if (error.status === 404) {
    // Not found
    showNotification('Game not found');
  } else {
    // Server error
    showNotification('Something went wrong');
  }
}

// Component-level loading states
{isLoading ? <Skeleton /> : <GameCard />}
```

---

## 4. Design System & Cyberpunk Theme

### 4.1 Color Palette

```css
/* Cyberpunk Dark Base */
--bg-primary: #0a0a0a      /* Nearly black */
--bg-secondary: #1a1a1a    /* Dark gray */
--bg-tertiary: #2a2a2a     /* Medium dark gray */

/* Neon Accents */
--neon-purple: #a855f7      /* Primary interactive */
--neon-cyan: #06b6d4        /* Secondary interactive */
--neon-green: #22c55e       /* Success states */
--neon-pink: #ec4899        /* Warnings/Featured */
--neon-yellow: #eab308      /* Highlights */

/* Text */
--text-primary: #ffffff     /* Main text */
--text-secondary: #b0b0b0   /* Secondary text */
--text-tertiary: #808080    /* Tertiary text */

/* States */
--success: #22c55e
--warning: #f59e0b
--error: #ef4444
```

### 4.2 Glassmorphic Card Component

```css
/* Base Glass Effect */
.glassmorphic-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  box-shadow: 
    0 8px 32px 0 rgba(168, 85, 247, 0.1),  /* Purple shadow */
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

/* Hover effect with neon glow */
.glassmorphic-card:hover {
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 8px 32px 0 rgba(168, 85, 247, 0.3),
    0 0 20px rgba(6, 182, 212, 0.4),      /* Cyan glow */
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Border glow effect */
.glassmorphic-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  padding: 1px;
  background: linear-gradient(135deg, #a855f7, #06b6d4);
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 300ms;
}

.glassmorphic-card:hover::before {
  opacity: 1;
}
```

### 4.3 Neon Button Variants

```css
/* Primary Button (Purple Neon) */
.btn-primary {
  background: linear-gradient(135deg, #a855f7, #9333ea);
  color: white;
  border: 1px solid #a855f7;
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.3);
  transition: all 300ms;
}

.btn-primary:hover {
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.6),
              inset 0 0 10px rgba(255, 255, 255, 0.1);
  transform: scale(1.02);
}

.btn-primary:active {
  box-shadow: inset 0 0 10px rgba(168, 85, 247, 0.6);
}

/* Secondary Button (Cyan Neon) */
.btn-secondary {
  background: transparent;
  color: #06b6d4;
  border: 2px solid #06b6d4;
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
}

.btn-secondary:hover {
  background: rgba(6, 182, 212, 0.1);
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.6);
}

/* Ghost Button (No bg, text only) */
.btn-ghost {
  background: transparent;
  color: #b0b0b0;
  border: 1px solid transparent;
}

.btn-ghost:hover {
  color: #a855f7;
  border-color: #a855f7;
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.2);
}
```

### 4.4 Animation Library

```css
/* Neon Glow Pulse */
@keyframes neon-glow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(168, 85, 247, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(168, 85, 247, 0.6);
  }
}

/* Slide In from Left */
@keyframes slideInLeft {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Float (subtle y-movement) */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
```

---

## 5. API & Service Layer

### 5.1 Service Architecture

```typescript
// gameService.ts
export const gameService = {
  // READ operations
  getGames: async (filters?: GameFilters) => Supabase query,
  getGameById: async (id: UUID) => Game,
  searchGames: async (query: string) => Game[],
  
  // CREATE operations (admin only)
  createGame: async (data: CreateGameDTO) => Game,
  
  // UPDATE operations (admin only)
  updateGame: async (id: UUID, data: UpdateGameDTO) => Game,
  
  // DELETE operations (admin only)
  deleteGame: async (id: UUID) => void,
  
  // Additional actions
  toggleFeatured: async (id: UUID, featured: boolean) => Game,
  incrementDownloadCount: async (id: UUID) => void,
};

// userService.ts
export const userService = {
  getProfile: async () => UserProfile,
  updateProfile: async (data: UpdateProfileDTO) => UserProfile,
  getUserLibrary: async () => Game[],
  getUserWishlist: async () => Game[],
  addToWishlist: async (gameId: UUID) => void,
  removeFromWishlist: async (gameId: UUID) => void,
};

// adminService.ts
export const adminService = {
  // User management
  getAllUsers: async (page?: number) => User[],
  banUser: async (userId: UUID, reason: string) => void,
  unbanUser: async (userId: UUID) => void,
  
  // Analytics
  getAnalytics: async (dateRange: DateRange) => Analytics,
  getAuditLog: async (filters?: AuditFilters) => AuditLog[],
  
  // Category management
  createCategory: async (data: CreateCategoryDTO) => Category,
  updateCategory: async (id: UUID, data: UpdateCategoryDTO) => Category,
  deleteCategory: async (id: UUID) => void,
};
```

### 5.2 Request/Response Types

```typescript
// DTOs (Data Transfer Objects)
interface CreateGameDTO {
  title: string;
  description: string;
  category_id: UUID;
  cover_image_url: string;
  developer: string;
  publisher: string;
  release_date: Date;
  system_requirements: SystemRequirementsDTO;
  download_parts: DownloadPartDTO[];
}

interface GameFilters {
  category?: UUID;
  search?: string;
  sort_by?: 'newest' | 'popular' | 'rating';
  page?: number;
  limit?: number;
}

// API Responses
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
```

---

## 6. Security Best Practices

### 6.1 RLS (Row-Level Security) Strategy

```sql
-- All tables have RLS enabled
-- Every query is restricted by user role

-- Example: Only admins can modify games
CREATE POLICY "admins_can_update_games" ON games
  FOR UPDATE USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );
```

### 6.2 Client-side Security

```typescript
// Never expose sensitive data
// Always validate on server-side even if validated on client

// Sanitize user input
const sanitize = (input: string) => 
  input.replace(/[<>]/g, '').trim();

// Rate limit API calls
const withRateLimit = (fn, delay = 1000) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall < delay) return;
    lastCall = now;
    return fn(...args);
  };
};

// Securely store tokens
localStorage.setItem('auth_token', token); // Acceptable for Supabase JWT
// Better: Use httpOnly cookies (requires backend proxy)
```

### 6.3 Environment Variables

```env
# .env.example
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Do NOT commit actual keys
# Use Vercel environment variables for production
```

---

## 7. Performance Optimization Strategy

### 7.1 Bundle Size Optimization

```typescript
// Code splitting by route
const HomePage = lazy(() => import('./pages/HomePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

// Tree-shaking unused code
import { specific } from 'lodash-es'; // not import from 'lodash'

// Compression
// Vite handles automatically
```

### 7.2 Image Optimization

```typescript
// Use optimized image service
import { LazyImage } from '@/components/LazyImage';

<LazyImage 
  src="/images/game-cover.jpg"
  alt="Game Title"
  loading="lazy"
  width={400}
  height={600}
/>

// Serve multiple formats
srcset="/image.webp 1x, /image@2x.webp 2x"
```

### 7.3 Database Query Optimization

```typescript
// Use pagination for large datasets
const games = await supabase
  .from('games')
  .select('*')
  .range(0, 19); // Fetch 20 at a time

// Use select() to fetch only needed columns
.select('id, title, cover_image_url')

// Add indexes for frequently queried columns
CREATE INDEX idx_games_category_id ON games(category_id);
```

### 7.4 Caching Strategy

```typescript
// Browser cache for images (via Vercel CDN)
// Cache-Control: public, max-age=31536000, immutable

// Stale-while-revalidate for game list
const games = await fetchGames();
// Data shown immediately from cache, updates in background

// Local storage for user preferences
localStorage.setItem('theme', 'dark');
```

---

## 8. Deployment Strategy

### 8.1 Vercel Deployment

```yaml
# vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {"key": "Cache-Control", "value": "max-age=0, s-maxage=60"}
      ]
    },
    {
      "source": "/images/(.*)",
      "headers": [
        {"key": "Cache-Control", "value": "public, max-age=31536000"}
      ]
    }
  ],
  "redirects": [
    {"source": "/", "destination": "/home", "permanent": true}
  ]
}
```

### 8.2 Environment Setup

```bash
# Production Environment Variables (in Vercel)
VITE_SUPABASE_URL=https://prod.supabase.co
VITE_SUPABASE_ANON_KEY=prod_key_xxx

# Build command
npm run build

# Output directory
dist/
```

### 8.3 Database Backups

```bash
# Supabase handles automated daily backups
# Manual backup via:
pg_dump postgresql://user:pass@host:5432/db > backup.sql

# Restore:
psql postgresql://user:pass@host:5432/db < backup.sql
```

---

## 9. Testing Strategy

### 9.1 Unit Tests

```typescript
// Test isolated functions
describe('gameService', () => {
  it('should filter games by category', async () => {
    const games = await gameService.getGames({ 
      category: 'action' 
    });
    expect(games).toHaveLength(5);
  });
});
```

### 9.2 Integration Tests

```typescript
// Test service + database interaction
describe('Admin Game Management', () => {
  it('should allow admin to create game', async () => {
    const game = await adminService.createGame({...});
    expect(game.id).toBeDefined();
  });
});
```

### 9.3 E2E Tests

```typescript
// Test complete user workflows
describe('User Download Flow', () => {
  it('should allow user to download game', async () => {
    await page.goto('/game/123');
    await page.click('[data-testid="download-btn"]');
    await expect(page).toHaveURL('/download/123');
  });
});
```

---

## 10. Monitoring & Logging

### 10.1 Error Tracking

```typescript
// Use Sentry or similar for production
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your_sentry_dsn",
  environment: process.env.NODE_ENV,
});
```

### 10.2 Analytics

```typescript
// Track user events
trackEvent('game_downloaded', {
  gameId: '123',
  timestamp: new Date(),
});

// Track page views
trackPageView('/game/123', { gameTitle: 'Game Name' });
```

### 10.3 Audit Logging

All admin actions automatically logged to `admin_audit_log` table via triggers and service methods.

---

## Summary

This architecture provides:

✅ **Security**: RLS policies, JWT auth, role-based access  
✅ **Performance**: Query optimization, code splitting, caching  
✅ **Scalability**: Microservice-like service layer, context-based state  
✅ **Maintainability**: Clear folder structure, typed services, separation of concerns  
✅ **UX**: Cyberpunk dark theme, glassmorphic cards, neon effects  
✅ **DevOps**: Vercel deployment, automated backups, monitoring  

