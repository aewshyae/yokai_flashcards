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
  // Pattern like: "149. ばけぞうり" → id=149, name=ばけぞうり
  let id = NaN;
  let name = titleText;
  const m = titleText.match(/^(\d+)\.\s*(.+)$/);
  if (m && m[1] && m[2]) {
    id = parseInt(m[1], 10);
    name = m[2].trim();
  }
  name = normalizeName(name);

  const locationRaw = String(section.find("div.text_area p.border_text").first().text() || "").trim();
  // e.g. "出現地／伊勢（三重県）"
  let location: string | null = null;
  const locMatch = locationRaw.replace(/\s+/g, "").match(/出現地／(.+)/);
  if (locMatch) location = locMatch[1] ?? null;

  const descriptionText = String(section.find("div.text_area > p").not(".border_text").first().text() || "").trim();
  const description = descriptionText.length > 0 ? descriptionText : null;

  if (!name) return null;

  return {
    id: Number.isNaN(id) ? -1 : id,
    name,
    imageUrl,
    location,
    description,
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


