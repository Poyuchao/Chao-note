"use client";

import { useEffect, useRef, useState } from "react";

// Pagefind 在 build 後才產生 /pagefind/pagefind.js，這裡只描述用到的部分
interface PagefindResult {
  id: string;
  data: () => Promise<{ url: string; excerpt: string; meta: { title?: string } }>;
}
interface Pagefind {
  init: () => Promise<void>;
  debouncedSearch: (q: string, opts?: object, ms?: number) => Promise<{ results: PagefindResult[] } | null>;
}

interface Hit {
  id: string;
  url: string;
  title: string;
  excerpt: string;
}

type Status = "idle" | "loading" | "ready" | "unavailable";

let pagefindPromise: Promise<Pagefind> | null = null;

function loadPagefind(): Promise<Pagefind> {
  if (!pagefindPromise) {
    const url = "/pagefind/pagefind.js";
    pagefindPromise = import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url).then(async (pf: Pagefind) => {
      await pf.init();
      return pf;
    });
    pagefindPromise.catch(() => {
      pagefindPromise = null;
    });
  }
  return pagefindPromise;
}

/** 移除 .html 結尾：Pagefind 索引的是 .next/server/app 裡的檔名 */
function cleanUrl(url: string) {
  return url.replace(/\.html$/, "").replace(/\/index$/, "/") || "/";
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export default function SearchDialog({ buttonClassName }: { buttonClassName: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [status, setStatus] = useState<Status>("idle");

  function open() {
    dialogRef.current?.showModal();
    if (status === "idle") {
      setStatus("loading");
      loadPagefind().then(
        () => setStatus("ready"),
        () => setStatus("unavailable"),
      );
    }
  }

  useEffect(() => {
    if (status !== "ready") return;
    const q = query.trim();
    if (!q) return;
    let cancelled = false;
    loadPagefind()
      .then((pf) => pf.debouncedSearch(q, {}, 200))
      .then(async (res) => {
        if (!res || cancelled) return; // null 代表被更新的輸入取代
        const data = await Promise.all(res.results.slice(0, 8).map((r) => r.data().then((d) => ({ id: r.id, ...d }))));
        if (cancelled) return;
        setHits(data.map((d) => ({ id: d.id, url: cleanUrl(d.url), title: d.meta.title ?? d.url, excerpt: d.excerpt })));
      });
    return () => {
      cancelled = true;
    };
  }, [query, status]);

  const q = query.trim();
  // 清空輸入時不顯示上一次的結果
  const shown = q ? hits : [];

  return (
    <>
      <button type="button" aria-label="搜尋文章" aria-haspopup="dialog" className={buttonClassName} onClick={open}>
        <SearchIcon />
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="search-title"
        className="m-auto mt-[10vh] w-[calc(100%-32px)] max-w-[640px] rounded-[16px] border border-line bg-surface p-0 text-ink backdrop:bg-ink/50"
        onClick={(e) => {
          // 點背景關閉
          if (e.target === dialogRef.current) dialogRef.current.close();
        }}
      >
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 id="search-title" className="text-[18px]">
              搜尋文章
            </h2>
            <button
              type="button"
              aria-label="關閉搜尋"
              onClick={() => dialogRef.current?.close()}
              className="inline-flex size-11 items-center justify-center rounded-[10px] text-ink-2 hover:bg-surface-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <label htmlFor="search-input" className="sr-only">
            關鍵字
          </label>
          <input
            id="search-input"
            type="search"
            autoFocus
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="輸入關鍵字，例如 CRAG"
            className="h-12 rounded-[10px] border border-control-line bg-surface px-4 text-[16px] placeholder:text-muted"
          />

          <div aria-live="polite" className="min-h-6 text-[14px] text-muted">
            {status === "loading" && "載入搜尋索引中…"}
            {status === "unavailable" && "搜尋索引尚未產生。請執行 npm run build 後用 npm start 開啟網站。"}
            {status === "ready" && q && shown.length === 0 && "找不到符合的文章。"}
            {status === "ready" && shown.length > 0 && `找到 ${shown.length} 篇`}
          </div>

          {shown.length > 0 && (
            <ul className="m-0 flex max-h-[55vh] list-none flex-col gap-2 overflow-y-auto p-0">
              {shown.map((h) => (
                <li key={h.id}>
                  <a
                    href={h.url}
                    className="block rounded-[12px] border border-line-2 px-4 py-3 text-ink hover:border-ink-2"
                  >
                    <span className="block font-bold text-link">{h.title}</span>
                    {/* Pagefind 的摘要已轉義，只包含 <mark> 標記 */}
                    <span
                      className="mt-1 block text-[14px] leading-relaxed text-ink-2 [&_mark]:bg-tag-agent-bg [&_mark]:text-ink"
                      dangerouslySetInnerHTML={{ __html: h.excerpt }}
                    />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </dialog>
    </>
  );
}
