# Download Your Games — Local Setup & Vercel Deployment

This project is a Vite + React site for listing downloadable games. Below are quick steps to run locally and deploy to Vercel, plus how to enable the AI (Gemini Free) integration.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy the example env:

```bash
cp .env.example .env
# then edit .env with your keys
```

3. Run dev server:

```bash
npm run dev
```

Open http://localhost:5173 (vite default) to view.

## Vercel deployment

1. Create a new project on Vercel and link your Git repository.
2. In Vercel Project Settings → Environment Variables, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY` (optional)
   - `VITE_GEMINI_API_URL` (optional)

3. Build & Output settings (defaults usually work):
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. Deploy — Vercel will run the build and publish the site.

## Notes
- Do not commit secret keys to source control. Use Vercel's environment variables or a secure secret manager.
- If you want a server-side proxy (recommended for private keys), create a serverless endpoint that stores the key and proxies requests from the client. I can scaffold that for you if you prefer.
