// 不含 node 模組，client component 也可以 import
export const TAGS = ["Agent 架構", "RAG", "踩坑紀錄"] as const;
export type Tag = (typeof TAGS)[number];
