# Phase 1 Implementation Guide - Database Setup & Authentication

This guide walks you through setting up Phase 1 of the AQ Gaming Hub project.

## Prerequisites

- ✅ Supabase account (https://supabase.com)
- ✅ Node.js installed
- ✅ Git installed
- ✅ A text editor or IDE

---

## Step 1: Set Up Supabase Project

### 1.1 Create a New Supabase Project

1. Go to https://supabase.com and log in
2. Click **"New Project"**
3. Fill in:
   - **Project name**: `aq-gaming-hub`
   - **Database password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
4. Wait for project initialization (2-3 minutes)

### 1.2 Get Your Credentials

Once the project is ready:

1. Go to **Settings → API** (or **Settings → API Keys**)
2. Copy and save:
   - **Project URL** (under `Project URL`)
   - **Anon Key** (under `API KEYS - anon (public)`)
3. Also copy the **Service Role Key** for admin operations (keep this secure!)

---

## Step 2: Initialize Database Schema

### 2.1 Run the SQL Schema

1. In Supabase, go to **SQL Editor**
2. Click **"New Query"**
3. Paste the entire contents of `DATABASE_SCHEMA.sql`
4. Click **"Run"** (⏵ button)
5. Wait for execution (should complete in 10-30 seconds)

**What this does:**
- Creates 12 core tables (users, games, categories, etc.)
- Sets up indexes for performance
- Enables Row-Level Security (RLS)
- Creates RLS policies for access control
- Adds sample categories

### 2.2 Verify Tables Were Created

In Supabase:
1. Go to **Table Editor**
2. Confirm you see these tables:
   - ✅ `users`
   - ✅ `games`
   - ✅ `categories`
   - ✅ `system_requirements`
   - ✅ `download_parts`
   - ✅ `user_downloads`
   - ✅ `user_wishlist`
   - ✅ `admin_audit_log`
   - ✅ `featured_carousel`
   - ✅ `game_reviews`
   - ✅ `activity_log`
   - ✅ `analytics_daily`

---

## Step 3: Configure Authentication

### 3.1 Enable Email Auth in Supabase

1. Go to **Authentication → Providers**
2. Ensure **Email** is toggled ON (should be by default)
3. Go to **Settings → Auth**
4. Configure:
   - **Site URL**: `http://localhost:5173` (for development)
   - **Redirect URLs**: Add `http://localhost:5173/auth/callback`
   - **JWT Expiration**: `3600` (1 hour)
   - **JWT Secret**: (auto-generated, don't modify)

### 3.2 Create Your First Admin User

For **development only**, manually create an admin:

1. Go to **Table Editor → users**
2. Click **"Insert"** → **"Insert row"**
3. Fill in:
   ```
   id: (leave blank - it will auto-generate)
   email: admin@aqgaminghub.com
   username: admin
   role: admin
   is_active: true
   is_banned: false
   ```
4. Click **"Save"**

**For production**, create admin through a secure setup script (not covered in this guide).

### 3.3 Manually Create Auth User

Since we can't programmatically create auth users in Supabase directly:

1. Go to **Authentication → Users**
2. Click **"Invite"** (or **"Create new user"**)
3. Enter email: `admin@aqgaminghub.com`
4. Set password: `AdminPass123!` (strong password)
5. Click **"Send invite"** or **"Create user"**

Now your admin user can log in with:
- **Email**: `admin@aqgaminghub.com`
- **Password**: `AdminPass123!`

---

## Step 4: Environment Variables

### 4.1 Create `.env` File

In your project root (`d:/project`):

```bash
# Copy the example file
cp .env.example .env
```

### 4.2 Update `.env` with Supabase Credentials

Edit `.env` and add:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: For local development
VITE_API_URL=http://localhost:5173
VITE_ADMIN_SECRET=your_admin_secret_here
```

**Get these values from:**
- **URL**: Supabase → Settings → API → Project URL
- **ANON_KEY**: Supabase → Settings → API → anon (public)

⚠️ **Never commit `.env` to Git!** (already in .gitignore)

---

## Step 5: Install Dependencies & Run App

### 5.1 Install Dependencies

```bash
npm install
```

### 5.2 Run Development Server

```bash
npm run dev
```

Expected output:
```
VITE v6.3.5  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

## Step 6: Test Authentication Flow

### 6.1 Test User Signup

1. Open http://localhost:5173
2. You should be redirected to `/login`
3. Click **"Create Account"**
4. Fill in:
   - **Email**: `user@example.com`
   - **Username**: `testuser`
   - **Password**: `SecurePass123!`
   - **Confirm Password**: `SecurePass123!`
   - Check Terms checkbox
5. Click **"Create Account"**

**Expected**: User should be created and redirected to verification page

### 6.2 Test User Login

1. Go to `/login`
2. Enter credentials you just created
3. Click **"Sign In"**

**Expected**: Logged in user sees dashboard

### 6.3 Test Admin Login

1. Go to `/admin/login`
2. Enter admin credentials:
   - **Email**: `admin@aqgaminghub.com`
   - **Password**: `AdminPass123!`
3. Click **"Access Admin Panel"**

**Expected**: Redirected to admin dashboard

### 6.4 Test Access Control

1. Log in as regular user
2. Try to access `/admin` directly
3. Should be redirected to `/unauthorized`

**Expected**: Regular users cannot access admin routes

---

## Step 7: Database Verification

### 7.1 Check RLS Policies Are Active

In Supabase:

1. Go to **SQL Editor**
2. Run this query:
   ```sql
   SELECT table_name, is_insertable_into 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND is_insertable_into = 'YES'
   ORDER BY table_name;
   ```
3. You should see all 12 tables

### 7.2 Check Sample Data

Run this query:
```sql
SELECT id, name, slug FROM categories ORDER BY display_order;
```

Should return your 5 sample categories (Action, RPG, Strategy, Puzzle, Adventure)

### 7.3 Verify User Was Created

```sql
SELECT id, email, username, role, is_active FROM users;
```

Should show your test user and admin user

---

## Step 8: Security Checklist

### Development Environment

- ✅ `.env` file in `.gitignore` ✓
- ✅ Supabase RLS policies enabled ✓
- ✅ Admin user created ✓
- ✅ Sample categories seeded ✓
- ✅ Email auth configured ✓

### Production Deployment (Later)

- [ ] Set strong admin passwords (12+ chars, mixed case, numbers, symbols)
- [ ] Enable email verification
- [ ] Configure rate limiting on auth endpoints
- [ ] Set up HTTPS only
- [ ] Enable 2FA for admin accounts
- [ ] Configure Vercel environment variables
- [ ] Set up database backups

---

## Troubleshooting

### Issue: "Cannot find module '@/services/supabaseClient'"

**Solution**: Ensure path alias is configured in `vite.config.ts`:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### Issue: "Auth error: INVALID_CREDENTIALS"

**Solution**: 
- Double-check email and password
- Ensure user was created in Supabase Auth table
- Check RLS policies aren't blocking access

### Issue: "CORS error when logging in"

**Solution**:
- Go to Supabase → Settings → Auth
- Add your Vercel domain to **Redirect URLs**
- Restart dev server

### Issue: "Table users doesn't exist"

**Solution**:
- Re-run `DATABASE_SCHEMA.sql`
- Check for SQL errors in output
- Ensure you're viewing the correct database

---

## Next Steps

Once Phase 1 is complete:

### Phase 2 (UI/UX Framework)
- Build glassmorphic component library
- Create cyberpunk color variables
- Design sidebar navigation
- Build featured games slider

### Phase 3 (Public Platform)
- Build game discovery pages
- Create user library/downloads
- User profile pages
- Game detail pages

### Phase 4 (Admin Panel)
- Game CRUD operations
- Category management
- User management
- Audit logs

---

## File Summary

| File | Purpose |
|------|---------|
| `src/types/auth.ts` | Auth TypeScript types |
| `src/services/authService.ts` | Supabase auth operations |
| `src/context/AuthContext.tsx` | Global auth state management |
| `src/hooks/useAuth.ts` | Hook to access auth context |
| `src/middleware/ProtectedRoute.tsx` | Route access control |
| `src/app/pages/LoginPage.tsx` | User login form |
| `src/app/pages/SignupPage.tsx` | User registration form |
| `src/app/pages/AdminLoginPage.tsx` | Admin login form |
| `src/app/pages/UnauthorizedPage.tsx` | 403 error page |
| `DATABASE_SCHEMA.sql` | PostgreSQL schema |
| `.env` | Environment variables (DO NOT COMMIT) |

---

## Summary

✅ **Phase 1 Complete!**

You now have:

1. **Secure Database** - PostgreSQL with RLS policies
2. **Authentication System** - Email/password signup and login
3. **Role-Based Access** - Admin and user roles with route protection
4. **Type Safety** - Full TypeScript auth types
5. **Clean Architecture** - Services, context, hooks pattern
6. **Production-Ready Code** - Input validation, error handling, security best practices

Ready for Phase 2: UI/UX Framework & Design System! 🚀
