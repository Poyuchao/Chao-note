import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AuthorCard from "@/components/AuthorCard";
import { DraftBadge, TagBadge } from "@/components/Badges";
import Toc from "@/components/Toc";
import { getAdjacentPosts, getAllPosts, getPostBySlug, getSeriesById, type Post } from "@/lib/content";
import { renderPostBody } from "@/lib/mdx";
import { OG_BASE, SITE, formatDate } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/posts/[slug]">): Promise<Metadata> {
  const post = getPostBySlug((await params).slug);
  if (!post) return {};
  const url = `/posts/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      ...OG_BASE,
      type: "article",
      url,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      authors: [SITE.author],
      tags: [post.tag],
    },
  };
}

function AdjacentLink({ post, dir }: { post: Post | null; dir: "prev" | "next" }) {
  const label = dir === "prev" ? "上一篇" : "下一篇";
  const align = dir === "next" ? "sm:text-right" : "";
  if (!post) {
    return (
      <div className={`rounded-[14px] border border-dashed border-control-line px-[18px] py-4 text-[14px] leading-relaxed text-muted ${align}`}>
        <span className="block text-[13px]">{label}</span>
        {dir === "prev" ? "已經是第一篇" : "已經是最新一篇"}
      </div>
    );
  }
  return (
    <Link
      href={`/posts/${post.slug}`}
      rel={dir}
      className={`rounded-[14px] border border-line bg-surface px-[18px] py-4 text-[15px] leading-relaxed text-ink hover:border-ink-2 ${align}`}
    >
      <span className="block text-[13px] text-muted">{label}</span>
      <span className="font-bold">{post.title}</span>
    </Link>
  );
}

export default async function PostPage({ params }: PageProps<"/posts/[slug]">) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const series = post.series ? getSeriesById(post.series) : undefined;
  const { prev, next } = getAdjacentPosts(slug);
  const { content, headings } = await renderPostBody(post.body);

  return (
    <div className="container-content pt-7">
      <nav aria-label="麵包屑" className="text-[14px] text-muted">
        <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0">
          <li>
            <Link href="/" className="text-link underline-offset-4 hover:underline">首頁</Link>
          </li>
          {series && (
            <li className="flex items-center gap-1.5">
              <span aria-hidden="true">/</span>
              <Link href={`/series/${series.id}`} className="text-link underline-offset-4 hover:underline">
                {series.title}
              </Link>
            </li>
          )}
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true">/</span>
            <span aria-current="page">文章</span>
          </li>
        </ol>
      </nav>

      <header data-pagefind-body className="mx-auto mt-7 mb-10 flex max-w-[1036px] flex-col gap-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <TagBadge tag={post.tag} />
          {post.draft && <DraftBadge />}
        </div>
        <h1 data-pagefind-meta="title" className="text-[28px] leading-[1.3] md:text-[38px]">{post.title}</h1>
        <p className="m-0 text-[15px] text-muted">
          {SITE.author} · <time dateTime={post.date} className="num font-semibold">{formatDate(post.date)}</time>
          {post.project && <> · 專案：{post.project}</>}
        </p>
      </header>

      <div className="mx-auto grid max-w-[1036px] grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,760px)] lg:gap-14">
        <aside>
          <Toc headings={headings} />
        </aside>
        <div>
          <article data-pagefind-body className="prose">
            {content}
          </article>

          <nav aria-label="系列文章" className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AdjacentLink post={prev} dir="prev" />
            <AdjacentLink post={next} dir="next" />
          </nav>

          <div className="mt-5">
            <AuthorCard />
          </div>
        </div>
      </div>
    </div>
  );
}
