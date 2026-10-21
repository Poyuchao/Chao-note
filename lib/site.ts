import type { Tag } from "./content.ts";

/**
 * 網站的正式網址，用於 RSS、sitemap、Open Graph 的絕對網址。
 * 優先用 SITE_URL；在 Vercel 上沒設定時用 Vercel 提供的正式網域；本機為 localhost。
 */
export const SITE_URL = (
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

export const SITE = {
  title: "George Chao｜Agent 工程筆記",
  description: "我做 AI agent 時的實驗、踩過的坑，和量到的數字。",
  author: "George Chao",
  subtitle: "Agent 工程筆記",
  bio: "AI Engineer，台中。做過 AI 助理平台與社群資料整合，現在專注在 agent harness、Agentic RAG 與評測。",
  links: {
    github: "https://github.com/Poyuchao",
    linkedin: "https://linkedin.com/in/poyu-chao/",
  },
};

export const TAG_STYLES: Record<Tag, { bg: string; fg: string }> = {
  "Agent 架構": { bg: "bg-tag-agent-bg", fg: "text-tag-agent-fg" },
  RAG: { bg: "bg-tag-rag-bg", fg: "text-tag-rag-fg" },
  踩坑紀錄: { bg: "bg-tag-pitfall-bg", fg: "text-tag-pitfall-fg" },
};

export interface Project {
  name: string;
  desc: string;
  chips: string[];
  links: { label: string; href: string }[];
}

export const PROJECTS: Project[] = [
  {
    name: "米米財經",
    desc: "全自動財經短影音：選題、改寫口播稿、生圖與審圖、配音、合成到上傳，無人介入運行兩個月。另有一個唯讀的稽核 agent，負責檢查選片決策。",
    chips: ["MCP server", "LangGraph", "LLM-as-a-Judge", "Guardrails"],
    links: [
      { label: "YouTube 頻道", href: "https://www.youtube.com/@fintechchao1345/shorts" },
      { label: "原始碼", href: "https://github.com/Poyuchao/mimi-finance-shorts" },
    ],
  },
  {
    name: "ResumePilot",
    desc: "履歷分析與多輪問答系統。從零做 RAG pipeline，按章節切塊、pgvector 檢索、SSE 串流，並建了自己的評測集比較不同做法值不值得上線。",
    chips: ["FastAPI", "pgvector", "Corrective RAG", "Cloud Run"],
    links: [{ label: "線上 demo", href: "https://resumepilot-frontend-338336680245.asia-east1.run.app/" }],
  },
];

/** 2026-10-18 → 2026.10.18 */
export function formatDate(date: string) {
  return date.replaceAll("-", ".");
}

/** 每頁 openGraph 都要帶的共用欄位（子頁面的 openGraph 會整個覆蓋 layout 的） */
export const OG_BASE = { siteName: SITE.title, locale: "zh_TW" } as const;
