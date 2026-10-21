# Blog plan 修改指引

> 給開發的 Claude：這份文件列出 `BLOG_PLAN.md` 的更新內容。請依序完成以下修改，完成後停下來，告訴我改了哪些檔案、我該執行什麼指令驗證。

## 背景

我寫好了「從零理解 Agent Harness」系列的 7 篇文章（.mdx）。這些文章大量使用 Markdown 表格，而且有好幾篇是同一天寫的，所以內容系統需要兩項調整。

## 修改 1：支援 Markdown 表格

**問題**：MDX 預設不支援 GFM 表格，文章中的表格會被當成普通文字顯示。

**要做的事**：
- 安裝 `remark-gfm`
- 在 MDX 渲染設定中加入 `remarkPlugins: [remarkGfm]`
- 為表格加上樣式，符合 `BLOG_PLAN.md` 第 4 節的設計規格：
  - 表格外包一層 `overflow-x: auto` 的容器，手機上可以橫向捲動
  - 外框 `line`（`#D3D9E1`）、圓角 14px、底色 `surface`
  - 標題列底色 `surface-2`（`#F5F7FA`）、文字粗體
  - 列與列之間用 `line-2`（`#E2E7EE`）分隔
  - 儲存格內距約 12px 16px

**驗收**：第 6 篇 `bash-policy-what-it-blocks.mdx` 的 15 列表格正確顯示，手機寬度下可以橫向捲動，表格中的 `\|`（跳脫的 pipe）顯示成 `|`。

## 修改 2：新增 `order` 欄位

**問題**：系列頁目前依日期排序，但有三篇文章在同一天，順序無法確定。

**要做的事**：
- frontmatter 新增**選填**欄位 `order`（正整數），代表系列內的閱讀順序
- 更新 frontmatter 驗證：`order` 存在時必須是正整數，否則建置失敗並指出檔名
- 更新排序邏輯：
  - **系列頁**：依 `order` 由小到大；沒有 `order` 的文章排在後面，依日期由舊到新
  - **文章頁的上一篇、下一篇**：使用與系列頁相同的順序
  - **首頁的「最新文章」**：維持依日期由新到舊，不受 `order` 影響；同一天時再依 `order` 由大到小

**驗收**：系列頁依 1 到 7 的順序顯示；第 1 篇沒有「上一篇」、第 7 篇的「下一篇」顯示佔位。

## 修改 3：加入系列文章

把以下 7 個檔案放進 `content/posts/`（我會另外提供檔案）：

| order | 檔名 | 日期 | 標籤 |
|---|---|---|---|
| 1 | `agent-is-a-while-loop.mdx` | 2026-10-05 | Agent 架構 |
| 2 | `tool-registry-and-git.mdx` | 2026-10-05 | Agent 架構 |
| 3 | `agents-md-harness-reads-model-writes.mdx` | 2026-10-05 | Agent 架構 |
| 4 | `bash-as-meta-tool.mdx` | 2026-10-06 | Agent 架構 |
| 5 | `react-loop-and-step-budget.mdx` | 2026-10-06 | Agent 架構 |
| 6 | `bash-policy-what-it-blocks.mdx` | 2026-10-06 | 踩坑紀錄 |
| 7 | `pip-install-timeout-process-tree.mdx` | 2026-10-13 | 踩坑紀錄 |

全部屬於系列 `agent-harness-from-scratch`，目前都是 `draft: true`。

**注意**：
- 文章內容不要修改，包括文字、數字和程式碼
- 如果建置時發現 MDX 語法錯誤，告訴我是哪個檔案、哪一行，以及你建議的修法，等我確認後再改
- 文章使用了 `<Callout type="limit" title="...">` 和 `<StatCards items={[...]} />` 兩個元件，請確認它們已在 MDX 元件中註冊。`StatCards` 的 `tone` 可能是 `"good"`、`"warn"` 或不填

**驗收**：`npm run dev` 時 7 篇都能開啟且標示為草稿；`npm run build` 成功，且 production 不包含這 7 篇（因為都是草稿）。

## 修改 4：同步更新 BLOG_PLAN.md

把以上的變更寫回 `BLOG_PLAN.md`，讓它保持是最新的規格：
- 第 2 節技術選型：新增一列「Markdown 表格：`remark-gfm`」
- 第 5 節 frontmatter：在 `series` 下方加入 `order` 欄位與說明
- 第 6 節系列頁：改成依 `order` 排序的規則

## 規則

- 只做這份指引列出的修改，不要順便調整其他東西
- 新增套件只有 `remark-gfm` 一個
- 不要 commit 或 push，除非我要求
- 有不確定的地方先問我
