# Youkai Kentei

## Scripts
- `npm run scrape` — scrape target pages and write `data/yokai.json`.
- `npm run sync:data` — copy dataset into `web/public/yokai.json`.
- `npm run web:dev` — start Vite dev server.
- `npm run web:build` — build production bundle.
- `npm run web:preview` — preview production build.

## Dev flow
1. Run `npm run scrape`.
2. Run `npm run sync:data`.
3. Run `npm run web:dev` and open the printed URL.

## Alias masking
- File: `web/public/aliases.json`
- Format:

```json
{
  "ぬりかべ": ["ヌリカベ"],
  "座敷童子": ["ざしきわらし", "ザシキワラシ"]
}
```

- Behavior:
  - Description masking targets the base name and any listed aliases.
  - Masking tolerates spaces (半角/全角) between characters within the description.
