# AQ Gaming Hub - Optimized Folder Structure

## Complete Directory Layout

```
d:/project/
├── 📄 package.json
├── 📄 vite.config.ts
├── 📄 tsconfig.json
├── 📄 tailwind.config.ts
├── 📄 postcss.config.mjs
├── 📄 README.md
├── 📄 .env.example
├── 📄 .env (gitignored)
├── 📄 vercel.json
│
├── 📁 public/
│   ├── 📄 robots.txt
│   ├── 📄 sitemap.xml
│   ├── 📁 images/
│   │   ├── 📁 games/          # Game cover images
│   │   ├── 📁 categories/      # Category icons
│   │   └── 📁 brand/           # Logo, favicon, etc.
│   └── 📁 icons/               # SVG icons (game genres, ratings)
│
├── 📁 src/
│   ├── 📄 main.tsx
│   ├── 📄 env.d.ts
│   │
│   ├── 📁 app/
│   │   ├── 📄 App.tsx
│   │   ├── 📄 routes.tsx       # Main routing config
│   │   │
│   │   ├── 📁 components/
│   │   │   ├── 📄 Navbar.tsx          # Top navbar (optional/minimal)
│   │   │   ├── 📄 Sidebar.tsx         # NEW: Main left sidebar navigation
│   │   │   ├── 📄 Footer.tsx
│   │   │   ├── 📄 ThemeToggle.tsx
│   │   │   │
│   │   │   ├── 📁 layout/
│   │   │   │   ├── 📄 MainLayout.tsx       # NEW: Main app layout (sidebar + content)
│   │   │   │   ├── 📄 AdminLayout.tsx      # Admin panel layout
│   │   │   │   └── 📄 AuthLayout.tsx       # NEW: Auth layout (login/register)
│   │   │   │
│   │   │   ├── 📁 common/
│   │   │   │   ├── 📄 LoadingSpinner.tsx
│   │   │   │   ├── 📄 ErrorBoundary.tsx
│   │   │   │   ├── 📄 EmptyState.tsx
│   │   │   │   └── 📄 ConfirmDialog.tsx    # NEW: Reusable confirmation modal
│   │   │   │
│   │   │   ├── 📁 games/
│   │   │   │   ├── 📄 GameCard.tsx         # Glassmorphic game card
│   │   │   │   ├── 📄 GameCardGrid.tsx     # Asymmetric grid layout
│   │   │   │   ├── 📄 FeaturedSlider.tsx   # NEW: Horizontal featured games slider
│   │   │   │   ├── 📄 GameFilters.tsx      # NEW: Filter sidebar for discovery
│   │   │   │   └── 📄 GameQuickView.tsx    # NEW: Quick preview modal
│   │   │   │
│   │   │   ├── 📁 download/
│   │   │   │   ├── 📄 DownloadButton.tsx
│   │   │   │   ├── 📄 DownloadPartsModal.tsx
│   │   │   │   ├── 📄 DownloadProgress.tsx # NEW: Download progress tracker
│   │   │   │   └── 📄 DownloadHistory.tsx  # NEW: User download history view
│   │   │   │
│   │   │   ├── 📁 admin/
│   │   │   │   ├── 📄 AdminDashboard.tsx   # Admin overview
│   │   │   │   ├── 📄 GameEditor.tsx       # NEW: Add/edit games
│   │   │   │   ├── 📄 CategoryEditor.tsx   # NEW: Manage categories
│   │   │   │   ├── 📄 UserManager.tsx      # NEW: User management
│   │   │   │   ├── 📄 FeaturedManager.tsx  # NEW: Featured games configuration
│   │   │   │   ├── 📄 AdminAuditLog.tsx    # NEW: Admin activity log
│   │   │   │   └── 📁 forms/
│   │   │   │       ├── 📄 GameForm.tsx
│   │   │   │       ├── 📄 CategoryForm.tsx
│   │   │   │       └── 📄 SystemRequirementsForm.tsx
│   │   │   │
│   │   │   └── 📁 ui/
│   │   │       ├── 📄 button.tsx
│   │   │       ├── 📄 card.tsx
│   │   │       ├── 📄 input.tsx
│   │   │       ├── 📄 badge.tsx
│   │   │       ├── 📄 modal.tsx
│   │   │       ├── 📄 tabs.tsx
│   │   │       ├── 📄 dropdown-menu.tsx
│   │   │       ├── 📄 tooltip.tsx
│   │   │       ├── 📄 skeleton.tsx
│   │   │       └── 📄 GlassmorphicCard.tsx # NEW: Custom glassmorphic component
│   │   │
│   │   ├── 📁 pages/
│   │   │   ├── 📄 HomePage.tsx             # Main dashboard with featured slider
│   │   │   ├── 📄 GameDetailPage.tsx       # Individual game page
│   │   │   ├── 📄 GameLibraryPage.tsx      # NEW: User's game library
│   │   │   ├── 📄 DiscoveryPage.tsx        # NEW: Game discovery/search
│   │   │   ├── 📄 CategoryPage.tsx         # Category browsing
│   │   │   ├── 📄 CategoriesPage.tsx       # All categories list
│   │   │   ├── 📄 SearchPage.tsx           # Search results
│   │   │   ├── 📄 UserProfilePage.tsx      # NEW: User profile & settings
│   │   │   ├── 📄 AdminDashboardPage.tsx   # NEW: Main admin page
│   │   │   ├── 📄 AdminGamesPage.tsx       # NEW: Admin game management
│   │   │   ├── 📄 AdminUsersPage.tsx       # NEW: Admin user management
│   │   │   ├── 📄 AdminLoginPage.tsx       # Admin login (separate from user)
│   │   │   ├── 📄 NotFoundPage.tsx
│   │   │   └── 📄 UnauthorizedPage.tsx     # NEW: 403 access denied
│   │   │
│   │   ├── 📁 data/
│   │   │   ├── 📄 games.ts                 # Game sample data
│   │   │   └── 📄 categories.ts            # Category data
│   │   │
│   │   └── 📁 layouts/
│   │       ├── 📄 RootLayout.tsx
│   │       └── 📄 AdminLayout.tsx
│   │
│   ├── 📁 hooks/
│   │   ├── 📄 useDebouncedValue.ts
│   │   ├── 📄 useAuth.ts                   # NEW: Authentication hook
│   │   ├── 📄 useUser.ts                   # NEW: User context hook
│   │   ├── 📄 useGames.ts                  # NEW: Games data hook
│   │   ├── 📄 useUserLibrary.ts            # NEW: User library management
│   │   ├── 📄 useAdminActions.ts           # NEW: Admin CRUD operations
│   │   └── 📄 useApi.ts                    # NEW: Generic API hook
│   │
│   ├── 📁 context/
│   │   ├── 📄 AuthContext.tsx              # NEW: Auth state management
│   │   ├── 📄 UserContext.tsx              # NEW: User data context
│   │   ├── 📄 ThemeContext.tsx             # Theme management
│   │   └── 📄 NotificationContext.tsx      # NEW: Toast notifications
│   │
│   ├── 📁 services/
│   │   ├── 📄 supabaseClient.ts            # Supabase initialization
│   │   ├── 📄 gameService.ts               # NEW: Game CRUD operations
│   │   ├── 📄 userService.ts               # NEW: User operations
│   │   ├── 📄 authService.ts               # NEW: Auth logic
│   │   ├── 📄 adminService.ts              # NEW: Admin operations
│   │   ├── 📄 downloadService.ts           # NEW: Download management
│   │   └── 📄 analyticsService.ts          # NEW: Tracking/metrics
│   │
│   ├── 📁 lib/
│   │   ├── 📄 categoryStyles.ts
│   │   ├── 📄 gameDatabase.ts
│   │   ├── 📄 gameCategories.ts
│   │   ├── 📄 gameRequirementsDb.ts
│   │   ├── 📄 gameStats.ts
│   │   ├── 📄 gameStore.ts
│   │   ├── 📄 seo.ts
│   │   ├── 📄 constants.ts                 # NEW: App-wide constants
│   │   ├── 📄 validators.ts                # NEW: Form validation schemas
│   │   ├── 📄 formatters.ts                # NEW: Data formatting utilities
│   │   └── 📄 permissions.ts               # NEW: Role-based permissions
│   │
│   ├── 📁 types/
│   │   ├── 📄 index.ts                     # NEW: Centralized type definitions
│   │   ├── 📄 game.ts                      # Game types
│   │   ├── 📄 user.ts                      # User types
│   │   ├── 📄 admin.ts                     # Admin types
│   │   ├── 📄 auth.ts                      # Auth types
│   │   └── 📄 api.ts                       # API response types
│   │
│   ├── 📁 styles/
│   │   ├── 📄 globals.css
│   │   ├── 📄 index.css
│   │   ├── 📄 tailwind.css
│   │   ├── 📄 theme.css
│   │   ├── 📄 fonts.css
│   │   ├── 📄 glassmorphism.css            # NEW: Glass effect styles
│   │   ├── 📄 neon.css                     # NEW: Neon glow effects
│   │   ├── 📄 animations.css               # NEW: Custom animations
│   │   └── 📄 cyberpunk-theme.css          # NEW: Cyberpunk color palette
│   │
│   ├── 📁 utils/
│   │   ├── 📄 cn.ts                        # Class name utility
│   │   ├── 📄 dateUtils.ts                 # NEW: Date formatting
│   │   ├── 📄 fileUtils.ts                 # NEW: File handling
│   │   ├── 📄 apiUtils.ts                  # NEW: API request helpers
│   │   └── 📁 supabase/
│   │       ├── 📄 info.tsx
│   │       └── 📄 queries.ts               # NEW: Reusable Supabase queries
│   │
│   └── 📁 middleware/
│       ├── 📄 auth.ts                      # NEW: Auth middleware
│       ├── 📄 roleGuard.ts                 # NEW: Role-based access control
│       └── 📄 errorHandler.ts              # NEW: Error handling middleware
│
├── 📁 api/
│   ├── 📄 games.ts
│   ├── 📄 sitemap.ts
│   ├── 📄 steam-search.ts
│   ├── 📄 auth.ts                          # NEW: Auth endpoints
│   ├── 📄 admin.ts                         # NEW: Admin endpoints
│   └── 📄 analytics.ts                     # NEW: Analytics tracking
│
├── 📁 supabase/
│   ├── 📄 schema.sql                       # PostgreSQL schema (UPDATED)
│   ├── 📁 migrations/                      # NEW: Migration files
│   │   ├── 📄 001_initial_schema.sql
│   │   ├── 📄 002_add_audit_logs.sql
│   │   └── 📄 ... (other migrations)
│   ├── 📁 functions/
│   │   └── 📁 server/
│   │       ├── 📄 index.tsx
│   │       ├── 📄 kv_store.tsx
│   │       ├── 📄 authFunctions.ts         # NEW: Auth edge functions
│   │       └── 📄 adminFunctions.ts        # NEW: Admin edge functions
│   └── 📁 policies/
│       ├── 📄 games_policies.sql           # NEW: Game table RLS
│       ├── 📄 users_policies.sql           # NEW: User table RLS
│       └── 📄 admin_policies.sql           # NEW: Admin action RLS
│
├── 📁 scripts/
│   ├── 📄 fix-games.mjs
│   ├── 📄 fix-games2.mjs
│   ├── 📄 merge-games.mjs
│   ├── 📄 patch_admin.py
│   ├── 📄 patch_admin_download.py
│   ├── 📄 remove_visibility.py
│   ├── 📄 repair-games.mjs
│   ├── 📄 seed-database.mjs                # NEW: Database seeding
│   ├── 📄 backup-database.mjs              # NEW: Database backup
│   └── 📄 generate-sitemap.mjs             # NEW: Sitemap generation
│
├── 📁 tests/                               # NEW: Test files
│   ├── 📁 unit/
│   │   ├── 📄 auth.test.ts
│   │   ├── 📄 gameService.test.ts
│   │   └── 📄 validators.test.ts
│   ├── 📁 integration/
│   │   ├── 📄 authFlow.test.ts
│   │   └── 📄 adminOperations.test.ts
│   └── 📁 e2e/
│       ├── 📄 userJourney.test.ts
│       └── 📄 adminPanel.test.ts
│
├── 📁 docs/                                # NEW: Documentation
│   ├── 📄 API.md
│   ├── 📄 DATABASE.md
│   ├── 📄 ADMIN_GUIDE.md
│   ├── 📄 DEPLOYMENT.md
│   └── 📄 ARCHITECTURE.md
│
├── 📁 .github/                             # NEW: GitHub workflows
│   └── 📁 workflows/
│       ├── 📄 test.yml
│       └── 📄 deploy.yml
│
├── 📄 .env.example
├── 📄 .gitignore
├── 📄 .eslintrc.json                      # NEW: ESLint config
├── 📄 prettier.config.js                  # NEW: Prettier config
├── 📄 tsconfig.json
└── 📄 PROJECT_ROADMAP.md                  # THIS FILE
```

---

## 🔑 Key Structural Improvements

### New Directories/Files

| Path | Purpose |
|------|---------|
| `src/context/` | Global state management (Auth, User, Notifications) |
| `src/services/` | Business logic and API calls (Game CRUD, User ops, etc.) |
| `src/types/` | Centralized TypeScript type definitions |
| `src/middleware/` | Auth guards, error handling |
| `src/components/layout/` | Layout wrapper components |
| `src/components/games/` | Game-specific components |
| `src/components/admin/` | Admin panel components |
| `src/styles/` | NEW CSS files (glassmorphism, neon, cyberpunk theme) |
| `supabase/migrations/` | Database versioning |
| `supabase/policies/` | Row-Level Security definitions |
| `tests/` | Unit, integration, and E2E tests |
| `docs/` | Project documentation |
| `.github/workflows/` | CI/CD pipelines |

### Component Organization

- **By Feature**: `games/`, `admin/`, `download/` (easier to maintain)
- **Shared Components**: `common/`, `ui/` (reusable across features)
- **Layout Components**: `layout/` (page structure)

### Service Layer

Separates business logic from UI:
- `gameService.ts` - All game-related API calls
- `authService.ts` - Authentication logic
- `adminService.ts` - Admin operations
- `userService.ts` - User profile operations

### Type Safety

- Centralized types in `src/types/`
- Shared types prevent duplication
- Better autocomplete in IDE

---

## 📊 File Count Summary

- **Components**: 40+ (UI + Layout + Feature-specific)
- **Pages**: 12+
- **Services**: 7+
- **Hooks**: 8+
- **Types**: 5+
- **CSS Files**: 6+ (theme, animations, glass effects)
- **Total**: 200+ organized, maintainable files

