# AQ Gaming Hub (steamfree.games) - SEO Audit Summary

## Symptom
- Site ranks #1 for brand search "AQ Gaming Hub".
- Searching "aq gaming hub gta v" or "gta v for pc download" -> site does NOT appear.
- `site:steamfree.games gta v` returns nothing -> individual game pages are not indexed.

## Likely root causes
1. **Duplicate/templated meta tags**: every game page may share the homepage's
   <title>, meta description, OG tags, and canonical URL. Google treats these
   as duplicates and only keeps the homepage.
2. **No structured data**: no schema.org VideoGame / BreadcrumbList JSON-LD on
   game pages, weakening relevance for "X for PC download" queries and
   removing rich-result eligibility.
3. **Static sitemap**: new games added via the admin panel are not
   automatically added to sitemap.xml. Resubmitting in GSC does nothing if the
   URL was never listed.
4. **Possible CSR-only rendering**: if game pages render content client-side
   with no SSR/pre-render, Googlebot may see an empty/generic shell for
   /games/... routes.
5. **Possible non-crawlable links**: if "view game" buttons use JS onClick
   without a real href, Googlebot cannot discover game pages.

## Image / icon issue ("doesn't fit in the circle")
- aq.png (global site icon / logo) fills the entire square with no padding.
- Platforms that apply a CIRCULAR mask (Google SERP favicon, Android home
  screen icon, iOS share sheet, PWA icon) crop into the artwork.
- Fix: create a 512x512 master icon with the logo centered in ~70% of the
  canvas, solid background, then regenerate favicon/apple-touch-icon/manifest
  icons from it. Also create a proper 1200x630 og:image/twitter:image.

## Order of operations recommended
1. Run Prompt 5 (audit) first - get a findings report.
2. Run Prompt 1 (unique per-page meta tags) - fixes duplicate-content issue.
3. Run Prompt 2 (structured data) - improves relevance + rich results.
4. Run Prompt 3 (icon/image fixes).
5. Run Prompt 4 (auto sitemap on new game add).
