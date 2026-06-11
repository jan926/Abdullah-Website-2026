# Prompt 2 - VideoGame structured data (JSON-LD) on game pages

On every individual game page, add schema.org structured data so the page
becomes eligible for rich results and gains a stronger relevance signal for
"download for PC" type queries.

Tasks:
1. Inject a <script type="application/ld+json"> block using the VideoGame
   schema (https://schema.org/VideoGame), populated dynamically from the
   game's database record:
   - name
   - description
   - image (the game's cover image URL)
   - genre
   - operatingSystem: "Windows"
   - applicationCategory: "Game"
   - offers: { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
2. Also add a BreadcrumbList JSON-LD block for the same page:
   Home > Games > {Game Name}
3. This JSON-LD must be present in the server-rendered/initial HTML
   response, not injected only after client-side JS runs.
4. Apply this through the shared game-page template so every current and
   future game automatically gets correct structured data with no manual
   per-game work.
5. Double-check no required field is left empty/null - if a field (e.g.
   genre) is missing in the database for some games, omit that field rather
   than outputting an empty string.
