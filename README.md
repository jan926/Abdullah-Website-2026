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

## AI (Gemini) integration

The app includes a small Gemini wrapper under `src/lib/aiHelpers.ts`. To enable remote Gemini calls, set the following environment variables (on Vercel set them in the project Environment Variables):

- `VITE_GEMINI_API_KEY` — your Gemini API key
- `VITE_GEMINI_API_URL` — the POST endpoint that accepts `{ "prompt": "..." }` and returns JSON with a `text` or `output` field.

If these are not set, the app will fall back to local heuristic functions.

### Recommended: use server-side proxy (safer)

It's recommended to keep your API key server-side. The project includes a Vercel serverless proxy at `/api/gemini-proxy` that forwards requests to your Gemini endpoint using server-side environment variables. On Vercel set the following **server** environment variables (do not prefix with `VITE_` if you want them only server-side):

- `GEMINI_API_KEY` — your Gemini key (server-only)
- `GEMINI_API_URL` — the Gemini POST URL (server-only)

### Option: Google service account (recommended for Generative Language API)

For Google Cloud (Generative Language API) you can create a service account and provide its JSON key as a Vercel secret (base64-encoded). Add these variables in Vercel:

- `GOOGLE_SERVICE_ACCOUNT_BASE64` — base64(JSON service account key)
- `GEMINI_MODEL` — the model name, e.g. `models/gemini-1.0`

The project includes `/api/gemini-proxy-sa` which exchanges the service account JWT for an access token and calls the Generative Language API on your behalf. This keeps credentials server-side and is the most secure option.

The client will call `/api/gemini-proxy` which safely forwards the request.

## Admin toggles

To enable AI features from the site UI:
- Go to `/admin` (login required), open **Settings**, enable **AI Features**, and choose **Gemini Free** as `AI Model`.

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
