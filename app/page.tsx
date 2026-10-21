import Link from "next/link";
import FeaturedCard from "@/components/FeaturedCard";
import PostList from "@/components/PostList";
import ProjectCard from "@/components/ProjectCard";
import SeriesCard from "@/components/SeriesCard";
import { getAllPosts, getFeaturedPost, loadSeries } from "@/lib/content";
import { PROJECTS, SITE } from "@/lib/site";

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 19c-4 1.5-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
    </svg>
  );
}

export default function HomePage() {
  const posts = getAllPosts();
  const featured = getFeaturedPost();
  const series = loadSeries();

  return (
    <>
      {/* Hero */}
      <section className="container-content pt-12 pb-10 md:pt-16 md:pb-14">
        <div className={`grid items-center gap-10 ${featured ? "md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]" : ""}`}>
          <div className="flex flex-col gap-5">
            <p className="m-0 text-[15px] text-muted">我做 AI agent 時的實驗、踩過的坑，和量到的數字。</p>
            <h1 className="text-[32px] leading-[1.25] tracking-[-0.01em] md:text-[44px]">
              把 agent 拆開來看，
              <br />
              再量量看它到底有沒有變好。
            </h1>
            <p className="m-0 text-ink-2">[待補：介紹文字]</p>
            <div className="mt-1 flex flex-wrap gap-3">
              {featured && (
                <Link
                  href={`/posts/${featured.slug}`}
                  className="inline-flex min-h-12 items-center rounded-[12px] bg-accent px-[22px] font-medium text-white hover:bg-link"
                >
                  從評測集那篇開始讀
                </Link>
              )}
              <a
                href={SITE.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 rounded-[12px] border border-control-line bg-surface px-5 font-medium text-ink hover:border-ink-2"
              >
                <GitHubIcon />
                GitHub
              </a>
            </div>
          </div>
          {featured && <FeaturedCard post={featured} />}
        </div>
      </section>

      {/* 系列 */}
      <section id="series" aria-labelledby="series-title" className="container-content scroll-mt-6 py-8">
        <h2 id="series-title" className="mb-5 text-[26px]">
          系列
        </h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {series.map((s) => (
            <SeriesCard key={s.id} series={s} postCount={posts.filter((p) => p.series === s.id).length} />
          ))}
        </div>
      </section>

      {/* 最新文章 */}
      <section id="posts" aria-labelledby="posts-title" className="container-content scroll-mt-6 py-8">
        <h2 id="posts-title" className="mb-4 text-[26px]">
          最新文章
        </h2>
        <PostList
          posts={posts.map(({ slug, title, date, tag, excerpt, draft }) => ({ slug, title, date, tag, excerpt, draft }))}
        />
      </section>

      {/* 專案 */}
      <section id="projects" aria-labelledby="projects-title" className="container-content scroll-mt-6 py-8">
        <h2 id="projects-title" className="mb-5 text-[26px]">
          文章背後的專案
        </h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {PROJECTS.map((p) => (
            <ProjectCard key={p.name} project={p} />
          ))}
        </div>
      </section>
    </>
  );
}
