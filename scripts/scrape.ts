import axios from "axios";
import * as cheerio from "cheerio";
import PQueue from "p-queue";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

type Yokai = {
  id: number;
  name: string;
  imageUrl: string | null;
  location: string | null;
  description: string | null;
  reading: string | null;
  sourcePage: string;
};

const TARGET_PAGES = [
  "https://mizuki.sakaiminato.net/road/road_pages/yokai_forest/",
  "https://mizuki.sakaiminato.net/road/road_pages/yokai_gods/",
  "https://mizuki.sakaiminato.net/road/road_pages/yokai_near/",
  "https://mizuki.sakaiminato.net/road/road_pages/yokai_home/",
];

async function fetchHtml(url: string): Promise<string> {
  const res = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9",
    },
    timeout: 30000,
  });
  return res.data as string;
}

function absoluteUrl(base: string, src?: string | null): string | null {
  if (!src) return null;
  try {
    return new URL(src, base).toString();
  } catch {
    return null;
  }
}

function normalizeName(rawName: string): string {
  // Unicode normalize and remove all kinds of spaces, then trim again
  const normalized = rawName.normalize("NFKC");
  const withoutSpaces = normalized.replace(/[\s\u3000]+/g, "");
  return withoutSpaces.trim();
}

function parseYokaiFromSection(
  $: cheerio.CheerioAPI,
  section: cheerio.Cheerio<any>,
  pageUrl: string,
): Yokai | null {
  const imgSrc = section.find("p.img_box img").attr("src") || null;
  const imageUrl = absoluteUrl(pageUrl, imgSrc);

  const titleText = String(section.find("div.text_area h3.simple").first().text() || "").trim();
  const asciiTitle = titleText.normalize("NFKC");
  // Extract id if present at start (works with full-width via NFKC)
  let id = NaN;
  const idMatch = asciiTitle.match(/^(\d+)/);
  if (idMatch && idMatch[1]) {
    id = parseInt(idMatch[1], 10);
  }
  // Remove up to 3 leading numbers (half/full width) each with optional punctuation and spaces
  const strippedTitle = titleText.replace(/^\s*(?:[0-9０-９]+\s*[\.:：:．、・]?\s*){1,3}/, "");
  let name = normalizeName(strippedTitle);

  const border = section.find("div.text_area p.border_text").first();
  const strongTexts = border.find("strong").toArray().map((el) => String($(el).text() || "").trim()).filter(Boolean);
  let location: string | null = null;
  if (strongTexts.length > 0) {
    // Prefer the last strong text as the location (sites often wrap the value in <strong>)
    location = strongTexts[strongTexts.length - 1] ?? null;
  } else {
    const locationRaw = String(border.text() || "").trim();
    // Normalize spaces and try multiple separators: full/half slashes and colons
    const condensed = locationRaw.replace(/\s+/g, "");
    const m = condensed.match(/出現地[／/:：](.+)/);
    location = (m?.[1] ?? null);
  }

  const descriptionText = String(section.find("div.text_area > p").not(".border_text").first().text() || "").trim();
  const description = descriptionText.length > 0 ? descriptionText : null;

  // Parse 読み (reading) if present in any border_text line
  let reading: string | null = null;
  section.find("div.text_area p.border_text").each((_, el) => {
    if (reading) return; // already found
    const border = $(el);
    const raw = String(border.text() || "").trim();
    const condensed = raw.replace(/\s+/g, "");
    if (/^(読み|よみ)/.test(condensed)) {
      const strongTexts = border
        .find("strong")
        .toArray()
        .map((s) => String($(s).text() || "").trim())
        .filter(Boolean);
      if (strongTexts.length > 0) {
        reading = strongTexts[strongTexts.length - 1] ?? null;
      } else {
        const m = condensed.match(/(?:読み|よみ)[／/:：](.+)/);
        reading = (m?.[1] ?? null);
      }
    }
  });

  if (!name) return null;

  return {
    id: Number.isNaN(id) ? -1 : id,
    name,
    imageUrl,
    location,
    description,
    reading,
    sourcePage: pageUrl,
  };
}

async function scrapePage(url: string): Promise<Yokai[]> {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const items: Yokai[] = [];
  $("section.section_box.common_box.statue_box").each((_, el) => {
    const section = $(el);
    const y = parseYokaiFromSection($, section, url);
    if (y) items.push(y);
  });
  return items;
}

async function main() {
  const queue = new PQueue({ concurrency: 2 });
  const all: Yokai[] = [];
  await queue.addAll(TARGET_PAGES.map((u) => async () => {
    const items = await scrapePage(u);
    all.push(...items);
    console.log(`Scraped ${items.length} entries from ${u}`);
  }));

  all.sort((a, b) => (a.id === -1 ? 1 : a.id) - (b.id === -1 ? 1 : b.id));

  mkdirSync(join(process.cwd(), "data"), { recursive: true });
  const outPath = join(process.cwd(), "data", "yokai.json");
  writeFileSync(outPath, JSON.stringify(all, null, 2), "utf8");
  console.log(`Wrote ${all.length} yokai to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


