import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Chip, DraftBadge, TagBadge } from "@/components/Badges";
import { getSeriesById, getSeriesPosts, loadSeries } from "@/lib/content";
import { OG_BASE, formatDate } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return loadSeries().map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: PageProps<"/series/[id]">): Promise<Metadata> {
  const series = getSeriesById((await params).id);
  if (!series) return {};
  const url = `/series/${series.id}`;
  return {
    title: series.title,
    description: series.desc,
    alternates: { canonical: url },
    openGraph: { ...OG_BASE, type: "website", url, title: series.title, description: series.desc },
  };
}

export default async function SeriesPage({ params }: PageProps<"/series/[id]">) {
  const { id } = await params;
  const series = getSeriesById(id);
  if (!series) notFound();
  const posts = getSeriesPosts(id);

  return (
    <div className="container-content pt-7">
      <nav aria-label="麵包屑" className="text-[14px] text-muted">
        <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0">
          <li>
            <Link href="/" className="text-link underline-offset-4 hover:underline">首頁</Link>
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true">/</span>
            <span aria-current="page">系列</span>
          </li>
        </ol>
      </nav>

      <header className="mt-7 mb-10 flex max-w-[760px] flex-col gap-3.5">
        <span className="self-start rounded-full border border-control-line px-2.5 text-[13px] font-medium leading-6 text-ink-2">
          {series.status}
        </span>
        <h1 className="text-[28px] md:text-[38px]">{series.title}</h1>
        <p className="m-0 text-ink-2">{series.desc}</p>
        <div className="flex flex-wrap gap-1.5">
          {series.chips.map((c) => (
            <Chip key={c}>{c}</Chip>
          ))}
        </div>
      </header>

      <section aria-labelledby="series-posts-title" className="max-w-[760px]">
        <h2 id="series-posts-title" className="mb-4 text-[22px]">
          閱讀順序
        </h2>
        {posts.length === 0 ? (
          <p className="m-0 rounded-[16px] border border-line bg-surface px-6 py-8 text-center text-[15px] text-muted">
            這個系列還沒有文章。
          </p>
        ) : (
          <ol className="m-0 list-none rounded-[16px] border border-line bg-surface p-0 px-6">
            {posts.map((p, i) => (
              <li key={p.slug} className="border-b border-line-2 last:border-b-0">
                <Link href={`/posts/${p.slug}`} className="group flex gap-5 py-[22px] text-ink">
                  <span className="num w-8 flex-none text-[22px] text-muted" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <time dateTime={p.date} className="num text-[14px] font-semibold text-muted">
                        {formatDate(p.date)}
                      </time>
                      <TagBadge tag={p.tag} />
                      {p.draft && <DraftBadge />}
                    </div>
                    <h3 className="mt-1.5 text-[19px] group-hover:text-link">{p.title}</h3>
                    <p className="m-0 mt-1.5 text-[15px] leading-[1.7] text-ink-2">{p.excerpt}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
