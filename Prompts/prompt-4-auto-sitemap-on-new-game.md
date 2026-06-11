# Prompt 4 - Auto-update sitemap.xml when a new game is added

When a new game is added via the admin panel, it appears correctly on the
live site, but it is NOT automatically added to sitemap.xml, so Google never
discovers the new game page without manual resubmission - and resubmission
alone does nothing if the URL was never listed.

Tasks:
1. Find where game records are created in the backend (the admin panel's
   "add game" API endpoint/controller).
2. Determine how sitemap.xml is currently generated: a static file, generated
   at build time, or generated dynamically on request?
3. If it's static or build-time, convert it to a DYNAMIC route (e.g.
   /sitemap.xml served by the backend) that queries the games database and
   outputs a <url> entry for every game page (loc, lastmod = the game's
   updated_at date, changefreq, priority), plus the existing static pages
   (home, about, etc.) - so the sitemap is always current with zero manual
   steps.
4. If a fully dynamic sitemap isn't feasible, instead hook into the "add
   game" creation logic so it appends a new <url> entry for that game
   directly into the existing sitemap.xml file on disk immediately after the
   game is saved.
5. Confirm every game is reachable via a real, crawlable
   <a href="/games/{slug}"> link from the games listing/grid (not a JS-only
   onClick with no href), so Googlebot can discover pages even before the
   sitemap updates.
6. Add a short confirmation log/message ("sitemap updated") after each new
   game is added. Note for the user: with a dynamic or auto-appended
   sitemap, manual resubmission in Google Search Console is no longer
   required for discovery - it only speeds up the recrawl.
