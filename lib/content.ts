// 讀取 content/ 下的文章與系列。只用相對路徑與 node 內建模組，
// 讓 `node --test` 可以直接載入這個檔案（Node 的 TypeScript type stripping）。
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { TAGS, type Tag } from "./tags.ts";

export { TAGS };
export type { Tag };

export const SERIES_STATUSES = ["連載中", "規劃中", "已完結"] as const;
export type SeriesStatus = (typeof SERIES_STATUSES)[number];

export type StatTone = "warn" | "good";

export interface FeaturedChart {
  label: string;
  bars: { id: string; value: number }[];
}

export interface FeaturedStat {
  value: string;
  label: string;
  tone?: StatTone;
}

export interface PostMeta {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  tag: Tag;
  series?: string;
  /** 系列內的閱讀順序（正整數） */
  order?: number;
  project?: string;
  excerpt: string;
  featured: boolean;
  draft: boolean;
  featuredChart?: FeaturedChart;
  featuredStats?: FeaturedStat[];
}

export interface Post extends PostMeta {
  /** MDX 原文（不含 frontmatter） */
  body: string;
}

export interface Series {
  id: string;
  title: string;
  status: SeriesStatus;
  desc: string;
  chips: string[];
}

export interface LoadOptions {
  /** content 資料夾，預設為專案根目錄的 content/ */
  contentDir?: string;
  /** 是否包含草稿；預設在 production 以外的環境，或設定 SHOW_DRAFTS=1 時包含 */
  includeDrafts?: boolean;
}

export class ContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentError";
  }
}

const DEFAULT_CONTENT_DIR = path.join(process.cwd(), "content");
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function resolveOptions(opts: LoadOptions = {}) {
  return {
    contentDir: opts.contentDir ?? DEFAULT_CONTENT_DIR,
    includeDrafts: opts.includeDrafts ?? (process.env.NODE_ENV !== "production" || process.env.SHOW_DRAFTS === "1"),
  };
}

// ---------- 驗證 ----------

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/** YAML 未加引號的日期會被解析成 Date，統一轉成 YYYY-MM-DD 字串 */
function normalizeDate(v: unknown): string | null {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString().slice(0, 10);
  if (typeof v !== "string" || !DATE_RE.test(v)) return null;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v ? v : null;
}

function validateFeaturedChart(v: unknown, errors: string[]): FeaturedChart | undefined {
  if (v === undefined) return undefined;
  const c = v as Partial<FeaturedChart>;
  const ok =
    typeof v === "object" &&
    v !== null &&
    isNonEmptyString(c.label) &&
    Array.isArray(c.bars) &&
    c.bars.length > 0 &&
    c.bars.every((b) => isNonEmptyString(b?.id) && typeof b?.value === "number" && b.value >= 0);
  if (!ok) {
    errors.push("featuredChart 格式錯誤，需要 { label: string, bars: [{ id: string, value: number }] }");
    return undefined;
  }
  return c as FeaturedChart;
}

function validateFeaturedStats(v: unknown, errors: string[]): FeaturedStat[] | undefined {
  if (v === undefined) return undefined;
  const ok =
    Array.isArray(v) &&
    v.length > 0 &&
    v.every(
      (s) =>
        isNonEmptyString(s?.value) &&
        isNonEmptyString(s?.label) &&
        (s.tone === undefined || s.tone === "warn" || s.tone === "good"),
    );
  if (!ok) {
    errors.push('featuredStats 格式錯誤，需要 [{ value: string, label: string, tone?: "warn" | "good" }]');
    return undefined;
  }
  return v as FeaturedStat[];
}

/**
 * 解析並驗證單篇文章。任何錯誤都會丟出 ContentError，訊息包含檔名。
 * @param file 檔案路徑（用於錯誤訊息與 slug）
 * @param seriesIds 允許的 series id；不傳則不檢查
 */
export function parsePost(file: string, raw: string, seriesIds?: Set<string>): Post {
  const name = path.basename(file);
  const slug = name.replace(/\.mdx$/, "");
  let parsed: matter.GrayMatterFile<string>;
  try {
    // 傳空 options 避免 gray-matter 依內容快取結果
    parsed = matter(raw, {});
  } catch (e) {
    throw new ContentError(`[${name}] frontmatter 無法解析：${(e as Error).message}`);
  }
  const fm = parsed.data as Record<string, unknown>;
  const errors: string[] = [];

  if (!SLUG_RE.test(slug)) errors.push(`檔名「${slug}」只能用小寫英數字與連字號（檔名即網址）`);
  for (const key of ["title", "date", "tag", "excerpt"] as const) {
    if (fm[key] === undefined || fm[key] === null || fm[key] === "") errors.push(`缺少必填欄位「${key}」`);
  }

  if (fm.title !== undefined && !isNonEmptyString(fm.title)) errors.push("title 必須是字串");
  if (fm.excerpt !== undefined && !isNonEmptyString(fm.excerpt)) errors.push("excerpt 必須是字串");

  const date = fm.date === undefined ? null : normalizeDate(fm.date);
  if (fm.date !== undefined && date === null) errors.push(`date「${String(fm.date)}」不是有效的 YYYY-MM-DD`);

  if (fm.tag !== undefined && !TAGS.includes(fm.tag as Tag)) {
    errors.push(`tag「${String(fm.tag)}」不在允許清單：${TAGS.join("、")}`);
  }

  if (fm.series !== undefined) {
    if (!isNonEmptyString(fm.series)) errors.push("series 必須是字串");
    else if (seriesIds && !seriesIds.has(fm.series)) {
      errors.push(`series「${fm.series}」不存在於 series.json（可用：${[...seriesIds].join("、")}）`);
    }
  }
  if (fm.order !== undefined && !(Number.isInteger(fm.order) && (fm.order as number) > 0)) {
    errors.push(`order「${String(fm.order)}」必須是正整數`);
  }
  if (fm.project !== undefined && !isNonEmptyString(fm.project)) errors.push("project 必須是字串");
  for (const key of ["featured", "draft"] as const) {
    if (fm[key] !== undefined && typeof fm[key] !== "boolean") errors.push(`${key} 必須是 true 或 false`);
  }

  const featuredChart = validateFeaturedChart(fm.featuredChart, errors);
  const featuredStats = validateFeaturedStats(fm.featuredStats, errors);

  if (errors.length > 0) {
    throw new ContentError(`[${name}] frontmatter 有誤：\n  - ${errors.join("\n  - ")}`);
  }

  return {
    slug,
    title: fm.title as string,
    date: date as string,
    tag: fm.tag as Tag,
    series: fm.series as string | undefined,
    order: fm.order as number | undefined,
    project: fm.project as string | undefined,
    excerpt: fm.excerpt as string,
    featured: fm.featured === true,
    draft: fm.draft === true,
    featuredChart,
    featuredStats,
    body: parsed.content,
  };
}

export function parseSeries(raw: string, file = "series.json"): Series[] {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    throw new ContentError(`[${file}] JSON 格式錯誤：${(e as Error).message}`);
  }
  if (!Array.isArray(data)) throw new ContentError(`[${file}] 最外層必須是陣列`);

  const errors: string[] = [];
  const seen = new Set<string>();
  data.forEach((s, i) => {
    const where = `第 ${i + 1} 筆${isNonEmptyString(s?.id) ? `（${s.id}）` : ""}`;
    if (!isNonEmptyString(s?.id) || !SLUG_RE.test(s.id)) errors.push(`${where}：id 必須是小寫英數字與連字號`);
    else if (seen.has(s.id)) errors.push(`${where}：id 重複`);
    else seen.add(s.id);
    if (!isNonEmptyString(s?.title)) errors.push(`${where}：缺少 title`);
    if (!isNonEmptyString(s?.desc)) errors.push(`${where}：缺少 desc`);
    if (!SERIES_STATUSES.includes(s?.status)) {
      errors.push(`${where}：status「${String(s?.status)}」不在允許清單：${SERIES_STATUSES.join("、")}`);
    }
    if (!Array.isArray(s?.chips) || !s.chips.every(isNonEmptyString)) errors.push(`${where}：chips 必須是字串陣列`);
  });
  if (errors.length > 0) throw new ContentError(`[${file}] 有誤：\n  - ${errors.join("\n  - ")}`);
  return data as Series[];
}

// ---------- 讀取 ----------

/** 依日期新到舊；同一天依 order 由大到小（沒有 order 的排後面），再依 slug，確保結果穩定 */
function byDateDesc(a: PostMeta, b: PostMeta) {
  return b.date.localeCompare(a.date) || (b.order ?? 0) - (a.order ?? 0) || a.slug.localeCompare(b.slug);
}

/** 系列閱讀順序：有 order 的依 order 由小到大；沒有的排在後面，依日期由舊到新 */
function bySeriesOrder(a: PostMeta, b: PostMeta) {
  if (a.order !== undefined && b.order !== undefined) return a.order - b.order || a.slug.localeCompare(b.slug);
  if (a.order !== undefined) return -1;
  if (b.order !== undefined) return 1;
  return a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug);
}

export function loadSeries(opts?: LoadOptions): Series[] {
  const { contentDir } = resolveOptions(opts);
  const file = path.join(contentDir, "series.json");
  return parseSeries(fs.readFileSync(file, "utf8"), file);
}

/**
 * 讀取所有文章並驗證。有任何一篇出錯時，彙整所有錯誤後一次丟出。
 * 回傳依日期新到舊排序；production 預設排除草稿。
 */
export function loadPosts(opts?: LoadOptions): Post[] {
  const { contentDir, includeDrafts } = resolveOptions(opts);
  const seriesIds = new Set(loadSeries(opts).map((s) => s.id));
  const postsDir = path.join(contentDir, "posts");
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".mdx"));

  const posts: Post[] = [];
  const errors: string[] = [];
  for (const f of files) {
    const full = path.join(postsDir, f);
    try {
      posts.push(parsePost(full, fs.readFileSync(full, "utf8"), seriesIds));
    } catch (e) {
      if (e instanceof ContentError) errors.push(e.message);
      else throw e;
    }
  }
  if (errors.length > 0) throw new ContentError(errors.join("\n"));

  return posts.filter((p) => includeDrafts || !p.draft).sort(byDateDesc);
}

// 建置時每個頁面都會呼叫，結果在同一個 process 內快取。
// 開發模式不快取，新增或修改文章後不用重啟 dev server。
const cache = new Map<string, Post[]>();

export function getAllPosts(opts?: LoadOptions): Post[] {
  const r = resolveOptions(opts);
  if (process.env.NODE_ENV !== "production") return loadPosts(r);
  const key = `${r.contentDir}|${r.includeDrafts}`;
  let posts = cache.get(key);
  if (!posts) {
    posts = loadPosts(r);
    cache.set(key, posts);
  }
  return posts;
}

export function getPostBySlug(slug: string, opts?: LoadOptions): Post | undefined {
  return getAllPosts(opts).find((p) => p.slug === slug);
}

/** 精選文章：featured: true 中最新的一篇 */
export function getFeaturedPost(opts?: LoadOptions): Post | undefined {
  return getAllPosts(opts).find((p) => p.featured);
}

export function getSeriesById(id: string, opts?: LoadOptions): Series | undefined {
  return loadSeries(opts).find((s) => s.id === id);
}

/** 系列內的文章，依閱讀順序（見 bySeriesOrder）；上一篇／下一篇也用這個順序 */
export function getSeriesPosts(seriesId: string, opts?: LoadOptions): Post[] {
  return getAllPosts(opts)
    .filter((p) => p.series === seriesId)
    .sort(bySeriesOrder);
}

/** 同系列中的上一篇（較舊）與下一篇（較新）；不屬於系列或已是頭尾時為 null */
export function getAdjacentPosts(
  slug: string,
  opts?: LoadOptions,
): { prev: Post | null; next: Post | null } {
  const post = getPostBySlug(slug, opts);
  if (!post?.series) return { prev: null, next: null };
  const list = getSeriesPosts(post.series, opts);
  const i = list.findIndex((p) => p.slug === slug);
  return { prev: list[i - 1] ?? null, next: list[i + 1] ?? null };
}
