import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const scrapeDir = resolve(__dirname, "../data/raw-scrapes");
const allUrls = new Set<string>();

for (let i = 1; i <= 32; i++) {
  const file = resolve(scrapeDir, `shanghai-no-page${i}.md`);
  if (!existsSync(file)) {
    console.log(`MISSING: page ${i}`);
    continue;
  }
  const content = readFileSync(file, "utf-8");
  const matches = content.matchAll(/https:\/\/riftdecks\.com\/riftbound-metagame\/deck-[^\s)\]]+/g);
  for (const m of matches) {
    allUrls.add(m[0]);
  }
}

const urls = [...allUrls].sort();
console.log(`Extracted ${urls.length} unique deck URLs from 32 pages`);

const outFile = resolve(scrapeDir, "shanghai-no-urls.txt");
writeFileSync(outFile, urls.join("\n") + "\n");
console.log(`Written to ${outFile}`);
