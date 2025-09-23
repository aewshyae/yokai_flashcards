# Context (compact)

- Goal: Flashcards from Mizuki Shigeru Road pages (image, name, location, description).
- Scraper: `scripts/scrape.ts` (axios+cheerio). Names normalized (NFKC, no spaces). Output: `data/yokai.json` (119).
- Web: Vite React TS app in `web/`. Data served from `web/public/yokai.json`.
- UI: One card at a time. First view hides name+reading+image; click flips; next click advances. Square image container. Footer license block (JA/EN with links).
- Search: Simple substring over name/location/description.
- Masking: Name + aliases from `web/public/aliases.json`; handles spaces; Unicode-aware; preserves whitespace.
- Extras: Shuffle button for current filtered deck.
 - Reading: Scraped when available; shown after flip.
