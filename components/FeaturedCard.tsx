import Link from "next/link";
import type { Post } from "@/lib/content";
import { ArrowIcon, DraftBadge, TagBadge } from "./Badges";
import CallsBarChart from "./mdx/CallsBarChart";
import { TONE_CLASS } from "./mdx/StatCards";

/** 首頁右側的精選實驗卡 */
export default function FeaturedCard({ post }: { post: Post }) {
  return (
    <article aria-labelledby="featured-title" className="flex flex-col gap-[18px] rounded-[16px] border border-line bg-surface p-6 sm:p-7">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-[13px] font-medium text-muted">精選實驗</span>
        <TagBadge tag={post.tag} />
        {post.draft && <DraftBadge />}
      </div>
      <h2 id="featured-title" className="text-[22px] leading-[1.4]">
        {post.title}
      </h2>
      {post.featuredChart && <CallsBarChart label={post.featuredChart.label} bars={post.featuredChart.bars} />}
      {post.featuredStats && (
        <dl className="m-0 grid grid-cols-3 gap-2.5 border-t border-line-2 pt-4">
          {post.featuredStats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse justify-end">
              <dt className="mt-1 text-[12.5px] leading-normal text-muted">{s.label}</dt>
              <dd className={`num m-0 whitespace-nowrap text-[20px] leading-tight sm:text-[24px] ${s.tone ? TONE_CLASS[s.tone] : ""}`}>{s.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <Link
        href={`/posts/${post.slug}`}
        className="inline-flex min-h-11 items-center gap-1.5 self-start text-[15px] font-medium text-link underline-offset-4 hover:underline"
      >
        閱讀這篇實驗
        <ArrowIcon />
      </Link>
    </article>
  );
}
