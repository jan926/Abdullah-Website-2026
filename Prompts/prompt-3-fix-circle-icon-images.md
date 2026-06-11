# Prompt 3 - Fix circular icon crop + image alt text

The site's global logo/icon (aq.png) does not display correctly when
platforms crop it into a CIRCLE - parts of the logo get cut off because the
artwork fills the entire square edge-to-edge with no padding. This affects
the Google search results favicon, Android home-screen icon, iOS share sheet,
and PWA icons.

Tasks:
1. Locate the source logo file (aq.png) and any existing favicon/manifest
   files (favicon.ico, site.webmanifest / manifest.json, apple-touch-icon).
2. Create a new square master icon (at least 512x512) where the logo content
   sits inside a centered safe zone occupying roughly the middle 70% of the
   canvas, with even padding on all sides, on a solid (non-transparent)
   background color matching the brand. A circular crop must never cut into
   the logo artwork.
3. From this master, generate and wire up the standard sizes:
   - favicon-16x16.png
   - favicon-32x32.png
   - apple-touch-icon.png (180x180)
   - android-chrome-192x192.png
   - android-chrome-512x512.png
   Update site.webmanifest/manifest.json and the <link rel="icon"> /
   <link rel="apple-touch-icon"> tags in the HTML head to reference these
   files.
4. Create a properly proportioned 1200x630 social preview image (the padded
   logo on a branded background, or a more descriptive site banner) and use
   it for og:image and twitter:image on the homepage instead of the raw
   square logo.
5. Separately, audit all <img> tags on game listing and game detail pages.
   Every game thumbnail/cover image must have a descriptive alt attribute in
   the format "{Game Name} free download for PC cover image". Fix any
   missing, empty, or generic ("image", "logo", "thumbnail") alt text.
