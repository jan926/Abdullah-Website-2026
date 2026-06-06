# Phase 1 - Quick Start Guide

Get the authentication system running in **5 minutes**.

---

## 1️⃣ Setup Supabase

```bash
1. Go to https://supabase.com → Create Project
2. Project name: "aq-gaming-hub"
3. Copy Project URL and Anon Key
```

## 2️⃣ Initialize Database

```bash
1. In Supabase → SQL Editor → New Query
2. Paste contents of: DATABASE_SCHEMA.sql
3. Click Run
4. Wait for completion (should show "0 rows returned")
```

## 3️⃣ Configure Environment

```bash
# In project root:
cp .env.example .env

# Edit .env:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4️⃣ Install & Run

```bash
npm install
npm run dev

# Opens: http://localhost:5173
```

## 5️⃣ Create Admin User

**In Supabase → Authentication → Users:**
- Click "Invite" or "Create user"
- Email: `admin@aqgaminghub.com`
- Password: `AdminPass123!`

**In Supabase → Table Editor → users:**
- Insert row with:
  - email: `admin@aqgaminghub.com`
  - username: `admin`
  - role: `admin`

## 6️⃣ Test It

```bash
# User signup
→ http://localhost:5173/signup

# User login
→ http://localhost:5173/login

# Admin login
→ http://localhost:5173/admin/login
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `PHASE_1_SETUP.md` | Detailed step-by-step guide |
| `AUTH_SYSTEM_REFERENCE.md` | Technical deep-dive |
| `PHASE_1_COMPLETE.md` | Full implementation summary |
| `DATABASE_SCHEMA.sql` | SQL schema |
| `PROJECT_ROADMAP.md` | 10-week project plan |

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `src/services/authService.ts` | Auth logic |
| `src/context/AuthContext.tsx` | Global state |
| `src/hooks/useAuth.ts` | Easy access |
| `src/middleware/ProtectedRoute.tsx` | Route guards |
| `src/app/pages/LoginPage.tsx` | User login UI |
| `src/app/pages/AdminLoginPage.tsx` | Admin login UI |

---

## ✨ What You Get

✅ Secure authentication system  
✅ User & admin roles  
✅ Protected routes  
✅ Beautiful UI forms  
✅ Type-safe code  
✅ Production-ready  

---

## 🚀 Next Step

**Phase 2**: Build UI/UX Framework with glassmorphic components and cyberpunk theme

---

## ❓ Troubleshooting

**"Cannot find module '@/services/supabaseClient'"**
→ Check vite.config.ts has path alias configured

**"Auth error: INVALID_CREDENTIALS"**
→ Double-check email exists in Supabase Auth

**"Table users doesn't exist"**
→ Re-run DATABASE_SCHEMA.sql

**"CORS error"**
→ Add your URL to Supabase → Settings → Auth → Redirect URLs

---

For detailed help, see `PHASE_1_SETUP.md`
