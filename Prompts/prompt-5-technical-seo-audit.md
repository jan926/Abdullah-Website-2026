# Prompt 5 - Technical SEO audit (run first, report before fixing)

Audit why individual game pages on this site (e.g. the GTA V page) do not
appear in Google search at all, despite the homepage ranking for the brand
name "AQ Gaming Hub". Produce a findings report BEFORE making any code
changes.

Tasks:
1. Compare the raw server-returned HTML (e.g. via curl/view-source) of a
   game detail page vs. the rendered DOM after JavaScript executes. If the
   raw HTML's <title>, meta description, canonical, and main content (game
   name, description) are empty or generic while the rendered DOM has the
   real content, this is a client-side-rendering indexing problem - outline
   the steps needed to add server-side rendering or static pre-rendering for
   game pages.
2. Check robots.txt for any rule that disallows /games/ or any path that
   would block crawling of game pages.
3. Check every game page for a meta robots tag - flag and fix any page that
   unexpectedly has "noindex" or "nofollow".
4. Pull the <title>, <meta name="description">, and <link rel="canonical">
   from 5-10 different game pages and report whether they are identical
   across pages, or whether canonical tags incorrectly point to the
   homepage.
5. Confirm each game page has exactly one <h1> containing the game's name,
   and that the URL slug for each game is descriptive and static (e.g.
   /games/gta-5-download) rather than a query parameter or numeric ID
   (?id=123).
6. Output a short report listing which of the above are actual problems on
   this site, in priority order, before implementing any fixes.
