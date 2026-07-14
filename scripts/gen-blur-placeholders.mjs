// public/images 配下の写真から blur プレースホルダー（極小 base64 JPEG）を一括生成し、
// src/data/blurMap.ts に書き出す。ImageSlot が next/image の placeholder="blur" に使う。
// 画像を追加・差し替えたら `npm run gen:blur` で再生成すること。
// 除外: hero/（専用LQIPあり・ImageSlot経由でない）, og/, video/（ポスターは全面表示でCLSなし）
import sharp from "sharp";
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const IMAGES_ROOT = "public/images";
const OUT_FILE = "src/data/blurMap.ts";
const EXCLUDE_DIRS = new Set(["hero", "og", "video"]);
const EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function collect(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      files.push(...(await collect(full)));
    } else if (EXTS.has(path.extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

const files = (await collect(IMAGES_ROOT)).sort();
const entries = [];
for (const file of files) {
  // 20px幅・低品質JPEG（1枚 300B 前後）。next/image 側で拡大＋ブラー表示される。
  const buf = await sharp(file)
    .resize(20, 20, { fit: "inside" })
    .jpeg({ quality: 45 })
    .toBuffer();
  const publicPath = `/${path.relative("public", file).split(path.sep).join("/")}`;
  entries.push([publicPath, `data:image/jpeg;base64,${buf.toString("base64")}`]);
}

const body = entries
  .map(([key, value]) => `  ${JSON.stringify(key)}:\n    ${JSON.stringify(value)},`)
  .join("\n");

await writeFile(
  OUT_FILE,
  `// このファイルは scripts/gen-blur-placeholders.mjs による自動生成。直接編集しない。
// 再生成: npm run gen:blur
export const blurMap: Record<string, string> = {
${body}
};
`,
);

console.log(`generated ${OUT_FILE} (${entries.length} images)`);
