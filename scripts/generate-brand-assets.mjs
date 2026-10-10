// scripts/generate-brand-assets.mjs
// One-shot generator for the social image and the favicon set.
// Run: node scripts/generate-brand-assets.mjs
// Output goes to public/. Commit the output. The build does not run this file.
// Text uses the site fonts, Bebas Neue and DM Sans. The script reads the woff2
// files in src/assets/fonts and draws each letter as a vector path. This needs
// no font on the computer that runs the script.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { create as openFont } from "fontkitten"; // installed with Astro
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = (f) => path.join(root, "public", f);
const fonts = (f) => path.join(root, "src", "assets", "fonts", f);
const icons = (f) => path.join(root, "src", "assets", "icons", f);

const INK = "#141210";
const PAPER = "#f0ede3";
const GREEN = "#72d6aa";
const VIOLET = "#b186f1";

// ── Social image, 1200x630 ──────────────────────────────────────────────
const W = 1200;
const H = 630;

const wordmark = await sharp(await readFile(icons("rockcruit-white-title.svg")), {
  density: 600,
})
  .resize({ width: 640 })
  .png()
  .toBuffer();
const wordmarkMeta = await sharp(wordmark).metadata();

const bebas = openFont(await readFile(fonts("bebas-neue-400.woff2")));
// The DM Sans file is a variable font. Its default weight is 400.
const dmSans = openFont(await readFile(fonts("dm-sans.woff2")));

// Draw a line of text as one SVG path. Shrink the text to fit maxWidth.
function textPath(font, text, { x, y, size, fill, opacity = 1, tracking = 0, maxWidth = Infinity }) {
  const unit = (g) => g.advanceWidth + tracking * font.unitsPerEm;
  const glyphs = [...text].map((ch) => font.glyphForCodePoint(ch.codePointAt(0)));
  const total = glyphs.reduce((sum, g) => sum + unit(g), 0);
  const scale = Math.min(size, (maxWidth * font.unitsPerEm) / total) / font.unitsPerEm;
  let pen = 0;
  const d = glyphs
    .map((g) => {
      const part = `<path transform="translate(${pen} 0)" d="${g.path.toSVG()}"/>`;
      pen += unit(g);
      return part;
    })
    .join("");
  return `<g transform="translate(${x} ${y}) scale(${scale} ${-scale})" fill="${fill}" fill-opacity="${opacity}">${d}</g>`;
}

const background = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g1" cx="85%" cy="10%" r="60%">
      <stop offset="0" stop-color="${VIOLET}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${VIOLET}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="8%" cy="100%" r="55%">
      <stop offset="0" stop-color="${GREEN}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${GREEN}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${INK}"/>
  <rect width="${W}" height="${H}" fill="url(#g1)"/>
  <rect width="${W}" height="${H}" fill="url(#g2)"/>
  <rect x="80" y="300" width="72" height="6" rx="3" fill="${GREEN}"/>
  ${textPath(bebas, "TECH HEADHUNTERS · LATAM", { x: 80, y: 418, size: 112, fill: PAPER, tracking: 0.02, maxWidth: 1040 })}
  ${textPath(dmSans, "First candidate in 5 days. No per-hire fees on RaaS.", { x: 80, y: 474, size: 32, fill: PAPER, opacity: 0.75 })}
  ${textPath(dmSans, "rockcruit.com", { x: 80, y: 566, size: 28, fill: GREEN })}
</svg>`);

await sharp(background)
  .composite([{ input: wordmark, left: 80, top: 150 + 0 * wordmarkMeta.height }])
  .png({ compressionLevel: 9 })
  .toFile(pub("og-image.png"));

// ── Favicon set, from the lilac icon (63x57) ────────────────────────────
const iconSvg = await readFile(pub("rockcruit-lila-icon.svg"));

async function square(size, bg, padRatio) {
  const inner = Math.round(size * (1 - padRatio * 2));
  const glyph = await sharp(iconSvg, { density: 1200 })
    .resize({ width: inner, height: inner, fit: "inside" })
    .png()
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: bg },
  })
    .composite([{ input: glyph, gravity: "center" }])
    .png()
    .toBuffer();
}

const clear = { r: 0, g: 0, b: 0, alpha: 0 };
const ink = { r: 20, g: 18, b: 16, alpha: 1 };

const png32 = await square(32, clear, 0.04);
const png48 = await square(48, clear, 0.04);
await writeFile(pub("favicon-32.png"), png32);
await writeFile(pub("apple-touch-icon.png"), await square(180, ink, 0.18));
await writeFile(pub("icon-192.png"), await square(192, ink, 0.18));
await writeFile(pub("icon-512.png"), await square(512, ink, 0.18));

// favicon.ico: a PNG-in-ICO container with the 32 and 48 px images.
function ico(images) {
  const head = Buffer.alloc(6);
  head.writeUInt16LE(0, 0);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const dirs = [];
  for (const { size, data } of images) {
    const d = Buffer.alloc(16);
    d.writeUInt8(size, 0);
    d.writeUInt8(size, 1);
    d.writeUInt16LE(1, 4);
    d.writeUInt16LE(32, 6);
    d.writeUInt32LE(data.length, 8);
    d.writeUInt32LE(offset, 12);
    offset += data.length;
    dirs.push(d);
  }
  return Buffer.concat([head, ...dirs, ...images.map((i) => i.data)]);
}
await writeFile(
  pub("favicon.ico"),
  ico([
    { size: 32, data: png32 },
    { size: 48, data: png48 },
  ]),
);

console.log("Brand assets written to public/");
