// 執行：npm test
import { test, describe, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ContentError, getAdjacentPosts, getSeriesPosts, loadPosts } from "../lib/content.ts";

const SERIES = JSON.stringify([
  { id: "s1", title: "系列一", status: "連載中", desc: "說明", chips: ["a"] },
]);

const tmpDirs: string[] = [];
after(() => tmpDirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

/** 建立一個暫時的 content 資料夾，posts 為 { 檔名: 內容 } */
function fixture(posts: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "blog-content-"));
  tmpDirs.push(dir);
  fs.mkdirSync(path.join(dir, "posts"));
  fs.writeFileSync(path.join(dir, "series.json"), SERIES);
  for (const [name, body] of Object.entries(posts)) fs.writeFileSync(path.join(dir, "posts", name), body);
  return dir;
}

function post(fm: Record<string, string | boolean | number>): string {
  const lines = Object.entries(fm).map(([k, v]) => `${k}: ${typeof v === "string" ? JSON.stringify(v) : v}`);
  return `---\n${lines.join("\n")}\n---\n\n## 內文\n`;
}

const base = { title: "標題", date: "2026-10-01", tag: "RAG", excerpt: "摘要" };

// Next 的型別把 NODE_ENV 標成唯讀，測試時繞過
function withNodeEnv(value: string, fn: () => void) {
  const env = process.env as Record<string, string | undefined>;
  const prev = env.NODE_ENV;
  env.NODE_ENV = value;
  try {
    fn();
  } finally {
    env.NODE_ENV = prev;
  }
}

describe("草稿過濾", () => {
  const dir = fixture({
    "published.mdx": post({ ...base }),
    "wip.mdx": post({ ...base, date: "2026-10-02", draft: true }),
  });

  test("production 模式（NODE_ENV=production）不包含草稿", () => {
    withNodeEnv("production", () => {
      assert.deepEqual(loadPosts({ contentDir: dir }).map((p) => p.slug), ["published"]);
    });
  });

  test("開發模式包含草稿並保留 draft 標記", () => {
    withNodeEnv("development", () => {
      const posts = loadPosts({ contentDir: dir });
      assert.deepEqual(posts.map((p) => p.slug), ["wip", "published"]);
      assert.equal(posts[0].draft, true);
    });
  });
});

describe("frontmatter 驗證", () => {
  function expectError(posts: Record<string, string>, ...patterns: RegExp[]) {
    const dir = fixture(posts);
    assert.throws(
      () => loadPosts({ contentDir: dir, includeDrafts: true }),
      (e: unknown) => {
        assert.ok(e instanceof ContentError, "應該丟出 ContentError");
        for (const p of patterns) assert.match(e.message, p);
        return true;
      },
    );
  }

  test("缺少必填欄位時報錯並指出檔名與欄位", () => {
    const noTitle: Record<string, string> = { ...base };
    delete noTitle.title;
    expectError({ "no-title.mdx": post(noTitle) }, /no-title\.mdx/, /缺少必填欄位「title」/);
  });

  test("tag 不在允許清單時報錯", () => {
    expectError({ "bad-tag.mdx": post({ ...base, tag: "LLM" }) }, /bad-tag\.mdx/, /tag「LLM」不在允許清單/);
  });

  test("日期格式錯誤時報錯", () => {
    expectError({ "bad-date.mdx": post({ ...base, date: "2026/10/01" }) }, /bad-date\.mdx/, /date/);
    expectError({ "no-such-day.mdx": post({ ...base, date: "2026-02-30" }) }, /no-such-day\.mdx/);
  });

  test("series 不存在於 series.json 時報錯", () => {
    expectError({ "bad-series.mdx": post({ ...base, series: "nope" }) }, /bad-series\.mdx/, /series「nope」不存在/);
  });

  test("多個檔案出錯時一次列出全部", () => {
    expectError(
      { "a.mdx": post({ ...base, tag: "x" }), "b.mdx": post({ ...base, excerpt: "" }), "ok.mdx": post(base) },
      /a\.mdx/,
      /b\.mdx/,
    );
  });

  test("檔名不是合法 slug 時報錯", () => {
    expectError({ "Bad Name.mdx": post(base) }, /Bad Name\.mdx/, /檔名/);
  });

  test("order 不是正整數時報錯並指出檔名", () => {
    expectError({ "zero.mdx": post({ ...base, order: 0 }) }, /zero\.mdx/, /order「0」必須是正整數/);
    expectError({ "negative.mdx": post({ ...base, order: -1 }) }, /negative\.mdx/, /order/);
    expectError({ "decimal.mdx": post({ ...base, order: 1.5 }) }, /decimal\.mdx/, /order/);
    expectError({ "text.mdx": post({ ...base, order: "1" }) }, /text\.mdx/, /order/);
  });
});

describe("order 排序", () => {
  // 檔名的字母順序刻意和 order 不同，確認排序真的看 order
  const dir = fixture({
    "c-one.mdx": post({ ...base, date: "2026-10-05", series: "s1", order: 1 }),
    "a-two.mdx": post({ ...base, date: "2026-10-05", series: "s1", order: 2 }),
    "b-three.mdx": post({ ...base, date: "2026-10-05", series: "s1", order: 3 }),
    "d-four.mdx": post({ ...base, date: "2026-10-06", series: "s1", order: 4 }),
    "z-no-order-old.mdx": post({ ...base, date: "2026-01-01", series: "s1" }),
    "y-no-order-new.mdx": post({ ...base, date: "2026-11-01", series: "s1" }),
  });
  const opts = { contentDir: dir, includeDrafts: true };

  test("系列頁：依 order 由小到大，沒有 order 的排後面並依日期舊到新", () => {
    assert.deepEqual(getSeriesPosts("s1", opts).map((p) => p.slug), [
      "c-one",
      "a-two",
      "b-three",
      "d-four",
      "z-no-order-old",
      "y-no-order-new",
    ]);
  });

  test("首頁：依日期新到舊，同一天依 order 由大到小", () => {
    assert.deepEqual(loadPosts(opts).map((p) => p.slug), [
      "y-no-order-new",
      "d-four",
      "b-three",
      "a-two",
      "c-one",
      "z-no-order-old",
    ]);
  });

  test("上一篇／下一篇使用系列順序", () => {
    assert.equal(getAdjacentPosts("c-one", opts).prev, null);
    assert.equal(getAdjacentPosts("c-one", opts).next?.slug, "a-two");
    assert.equal(getAdjacentPosts("b-three", opts).prev?.slug, "a-two");
    assert.equal(getAdjacentPosts("b-three", opts).next?.slug, "d-four");
    assert.equal(getAdjacentPosts("y-no-order-new", opts).next, null);
  });
});

describe("排序與上一篇／下一篇", () => {
  const dir = fixture({
    "first.mdx": post({ ...base, date: "2026-01-01", series: "s1" }),
    "second.mdx": post({ ...base, date: "2026-02-01", series: "s1" }),
    "third.mdx": post({ ...base, date: "2026-03-01", series: "s1" }),
    "solo.mdx": post({ ...base, date: "2026-04-01" }),
  });
  const opts = { contentDir: dir, includeDrafts: true };

  test("列表依日期新到舊", () => {
    assert.deepEqual(loadPosts(opts).map((p) => p.slug), ["solo", "third", "second", "first"]);
  });

  test("系列文章依日期舊到新", () => {
    assert.deepEqual(getSeriesPosts("s1", opts).map((p) => p.slug), ["first", "second", "third"]);
  });

  test("上一篇是較舊的、下一篇是較新的，頭尾為 null", () => {
    const mid = getAdjacentPosts("second", opts);
    assert.equal(mid.prev?.slug, "first");
    assert.equal(mid.next?.slug, "third");
    assert.equal(getAdjacentPosts("first", opts).prev, null);
    assert.equal(getAdjacentPosts("third", opts).next, null);
  });

  test("不屬於系列的文章沒有上一篇與下一篇", () => {
    assert.deepEqual(getAdjacentPosts("solo", opts), { prev: null, next: null });
  });
});

describe("實際內容", () => {
  test("content/ 下的文章與 series.json 都能通過驗證", () => {
    const posts = loadPosts({ includeDrafts: true });
    const first = posts.find((p) => p.slug === "rag-eval-180-cases");
    assert.ok(first, "找不到第一篇文章");
    assert.equal(first.featured, true);
    assert.equal(first.featuredChart?.bars.length, 5);
  });

  test("Agent Harness 系列依 order 1 到 7 排列", () => {
    const list = getSeriesPosts("agent-harness-from-scratch", { includeDrafts: true });
    assert.deepEqual(list.map((p) => p.order), [1, 2, 3, 4, 5, 6, 7]);
    assert.equal(list[0].slug, "agent-is-a-while-loop");
    assert.equal(list[6].slug, "pip-install-timeout-process-tree");
  });
});
