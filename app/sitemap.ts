import type { MetadataRoute } from "next";
import { getAllPosts, getSeriesPosts, loadSeries } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  return [
    { url: SITE_URL, lastModified: posts[0]?.date },
    ...loadSeries().map((s) => ({
      url: `${SITE_URL}/series/${s.id}`,
      // 系列內依 order 排序，不一定是日期順序，所以另外取最新日期
      lastModified: getSeriesPosts(s.id)
        .map((p) => p.date)
        .sort()
        .at(-1),
    })),
    ...posts.map((p) => ({ url: `${SITE_URL}/posts/${p.slug}`, lastModified: p.date })),
  ];
}
