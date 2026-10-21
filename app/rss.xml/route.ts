import { getAllPosts } from "@/lib/content";
import { SITE, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

function escapeXml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/** RSS 2.0 要求 RFC 822 日期；文章只有日期，以台灣時間 00:00 計 */
function rfc822(date: string) {
  return new Date(`${date}T00:00:00+08:00`).toUTCString();
}

export function GET() {
  const posts = getAllPosts();
  const items = posts
    .map((p) => {
      const url = `${SITE_URL}/posts/${p.slug}`;
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${rfc822(p.date)}</pubDate>
      <category>${escapeXml(p.tag)}</category>
      <description>${escapeXml(p.excerpt)}</description>
    </item>`;
    })
    .join("\n");

  const lastBuild = posts[0] ? `\n    <lastBuildDate>${rfc822(posts[0].date)}</lastBuildDate>` : "";
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.title)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>zh-TW</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />${lastBuild}
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
