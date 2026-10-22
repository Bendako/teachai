import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const evidenceDir = process.env.EVIDENCE_DIR;
if (!evidenceDir) {
  console.error("Set EVIDENCE_DIR before driving the public landing page.");
  process.exit(1);
}

const outDir = path.join(evidenceDir, "public-landing");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

try {
  const response = await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  const status = response?.status() ?? 0;
  if (status !== 200) {
    throw new Error(`GET / returned ${status}`);
  }

  const hero = page.getByRole("heading", {
    name: "Transform Your English Teaching with AI",
  });
  await hero.waitFor();
  await page.screenshot({ path: path.join(outDir, "hero.png") });
  fs.writeFileSync(path.join(outDir, "hero.aria.txt"), await page.locator("body").ariaSnapshot());

  await page.getByRole("navigation").getByRole("link", { name: "Features" }).click();
  await page.getByRole("heading", { name: "Everything you need to teach effectively" }).waitFor();
  const url = page.url();
  if (!url.endsWith("#features")) {
    throw new Error(`Expected URL to end with #features, got ${url}`);
  }
  await page.screenshot({ path: path.join(outDir, "features.png") });
  fs.writeFileSync(
    path.join(outDir, "features.aria.txt"),
    await page.locator("body").ariaSnapshot(),
  );
  fs.writeFileSync(
    path.join(outDir, "action.log"),
    `feature=public-landing\nentry=/\naction=click link Features\nstatus=${status}\nurl=${url}\n`,
  );
  console.log(`public-landing proof written to ${outDir}`);
} finally {
  await browser.close();
}
