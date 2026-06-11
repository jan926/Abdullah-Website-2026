# Prompt 1 - Unique per-page SEO meta tags for game pages

Find the template/component that renders a single game's page (e.g. a
[slug] route, GameDetail page, or similar). Currently every game page may
share the homepage's <title>, meta description, canonical URL, and Open
Graph tags, which causes duplicate-content issues and prevents game pages
from ranking for searches like "AQ Gaming Hub GTA V" or "GTA V for PC
download".

Tasks:
1. For each game page, dynamically generate UNIQUE values from that game's
   data:
   - <title>: "{Game Name} Free Download for PC (Full Version) | AQ Gaming Hub"
   - <meta name="description">: 150-160 characters, including the game name,
     "free download", "PC", and genre/file size if available
   - <link rel="canonical">: must point to that game's OWN URL, not the
     homepage
   - og:title, og:description, og:url matching the above
   - og:image: the game's own cover/screenshot image, NOT the global site
     logo
   - twitter:card=summary_large_image plus matching twitter:title,
     twitter:description, twitter:image
2. Set the page's main <h1> to the game's title (e.g. "GTA V Free Download
   for PC"), not a generic site-wide heading.
3. Apply this through the shared template/layout so it works automatically
   for every existing game AND any new game added later (no per-game manual
   edits).
4. Verify by comparing the rendered <title>, <meta name="description">, and
   <link rel="canonical"> across at least 3 different game pages - they must
   all be different from each other and from the homepage.
