// 建置前驗證 content/（npm run build 會先執行這支）
import { ContentError, loadPosts, loadSeries } from "../lib/content.ts";

try {
  const series = loadSeries();
  const posts = loadPosts({ includeDrafts: true });
  const drafts = posts.filter((p) => p.draft).length;
  console.log(`✓ content 驗證通過：${posts.length} 篇文章（其中 ${drafts} 篇草稿）、${series.length} 個系列`);
} catch (e) {
  if (e instanceof ContentError) {
    console.error(`✗ content 驗證失敗\n${e.message}`);
    process.exit(1);
  }
  throw e;
}
