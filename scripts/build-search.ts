// npm run build 之後執行：用 Pagefind 為文章頁建立搜尋索引，輸出到 public/pagefind
import fs from "node:fs";
import path from "node:path";
import * as pagefind from "pagefind";

const SITE_DIR = ".next/server/app";
const POSTS_DIR = path.join(SITE_DIR, "posts");
const OUTPUT = "public/pagefind";

fs.rmSync(OUTPUT, { recursive: true, force: true });

const hasPosts = fs.existsSync(POSTS_DIR) && fs.readdirSync(POSTS_DIR).some((f) => f.endsWith(".html"));
if (!hasPosts) {
  // 例如所有文章都還是草稿；Pagefind 沒有頁面可索引時會報錯，所以直接略過
  console.log("○ 沒有已發布的文章，略過搜尋索引");
  process.exit(0);
}

const { index, errors } = await pagefind.createIndex({});
if (!index) throw new Error(`Pagefind 無法建立索引：${errors.join("; ")}`);

// 只索引文章頁，首頁與系列頁不出現在搜尋結果
const added = await index.addDirectory({ path: SITE_DIR, glob: "posts/**/*.html" });
if (added.errors.length) throw new Error(added.errors.join("; "));

const written = await index.writeFiles({ outputPath: OUTPUT });
if (written.errors.length) throw new Error(written.errors.join("; "));

await pagefind.close();
console.log(`✓ 搜尋索引完成：${added.page_count} 篇文章 → ${OUTPUT}`);
