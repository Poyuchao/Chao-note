"use client";

import Link from "next/link";
import { useState } from "react";
import { TAGS, type Tag } from "@/lib/tags";
import { formatDate } from "@/lib/site";
import { DraftBadge, TagBadge } from "./Badges";

export interface PostListItem {
  slug: string;
  title: string;
  date: string;
  tag: Tag;
  excerpt: string;
  draft: boolean;
}

const FILTERS = ["全部", ...TAGS] as const;
type Filter = (typeof FILTERS)[number];

export default function PostList({ posts }: { posts: PostListItem[] }) {
  const [filter, setFilter] = useState<Filter>("全部");
  const visible = filter === "全部" ? posts : posts.filter((p) => p.tag === filter);

  return (
    <div>
      <div role="group" aria-label="依主題篩選文章" className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const on = f === filter;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(f)}
              className={`min-h-11 rounded-full border px-4 text-[14px] font-medium ${
                on ? "border-ink bg-ink text-white" : "border-control-line bg-surface text-ink-2 hover:border-ink-2"
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {filter}：{visible.length} 篇文章
      </p>

      <div className="rounded-[16px] border border-line bg-surface px-6">
        {visible.length === 0 ? (
          <p className="m-0 py-8 text-center text-[15px] text-muted">這個主題還沒有文章。</p>
        ) : (
          <ul className="m-0 list-none p-0">
            {visible.map((p) => (
              <li key={p.slug} className="border-b border-line-2 last:border-b-0">
                <Link
                  href={`/posts/${p.slug}`}
                  className="group grid grid-cols-1 gap-2 py-[22px] text-ink sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-6"
                >
                  <div className="flex flex-row items-center gap-2.5 sm:flex-col sm:items-start sm:gap-1.5">
                    <time dateTime={p.date} className="num text-[14px] font-semibold text-muted">
                      {formatDate(p.date)}
                    </time>
                    <TagBadge tag={p.tag} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[19px] group-hover:text-link">{p.title}</h3>
                      {p.draft && <DraftBadge />}
                    </div>
                    <p className="m-0 mt-1.5 text-[15px] leading-[1.7] text-ink-2">{p.excerpt}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
