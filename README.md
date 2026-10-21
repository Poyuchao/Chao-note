# Agent 工程筆記

George Chao 的技術部落格，記錄打造 AI agent 時的實驗、踩過的坑，和量到的數字。

Next.js（App Router）+ TypeScript + Tailwind CSS。文章是 repo 裡的 MDX 檔，整站在 build 時靜態產生，不需要資料庫或後端。

---

## 本機開發

需要 **Node.js 22.18 以上**（建置腳本與測試直接執行 `.ts` 檔）。

```bash
npm install
npm run dev
```

打開 http://localhost:3000。開發模式下草稿也會顯示，並標示「草稿」。

### 常用指令

| 指令 | 用途 |
|---|---|
| `npm run dev` | 開發伺服器，含草稿 |
| `npm run check:content` | 只驗證 `content/` 的 frontmatter 與 series.json |
| `npm test` | 執行內容系統的測試 |
| `npm run lint` | ESLint |
| `npm run build` | 正式建置（依序：驗證內容 → `next build` → 建立搜尋索引） |
| `npm start` | 以正式模式啟動 build 的結果 |

> **搜尋只在 build 後可用。** 搜尋索引由 [Pagefind](https://pagefind.app/) 在 `npm run build` 之後產生到 `public/pagefind/`，`npm run dev` 時按搜尋會顯示「索引尚未產生」。要測試搜尋，請執行 `npm run build && npm start`。

---

## 新增一篇文章

1. **建立檔案**：在 `content/posts/` 新增 `你的網址.mdx`。檔名就是網址，只能用小寫英文、數字和連字號，例如 `crag-retry-budget.mdx` → `/posts/crag-retry-budget`。

2. **寫 frontmatter**（欄位說明見下一節）：

   ```mdx
   ---
   title: "文章標題"
   date: "2026-10-25"
   tag: "RAG"
   series: "rag-basics-to-agentic"
   project: "ResumePilot"
   excerpt: "一兩句摘要，顯示在列表上"
   draft: true
   ---

   ## 問題

   內文從這裡開始……
   ```

   先用 `draft: true`，寫完再改成 `false`。

3. **寫內文**：用 `##`（h2）分段，文章頁左側的目錄會自動從 h2 產生。建議結構：問題 → 嘗試 → 解法 → 數字 → 學到什麼。可以使用的元件見「[MDX 元件](#mdx-元件)」。

4. **在本機確認**：

   ```bash
   npm run dev
   ```

   文章會出現在首頁的「最新文章」，網址是 `/posts/你的網址`。

5. **驗證內容**：

   ```bash
   npm run check:content
   ```

   有錯時會列出檔名和每一個問題，例如：

   ```
   ✗ content 驗證失敗
   [crag-retry-budget.mdx] frontmatter 有誤：
     - 缺少必填欄位「excerpt」
     - tag「LLM」不在允許清單：Agent 架構、RAG、踩坑紀錄
   ```

6. **發布**：把 `draft` 改成 `false`，commit 並 push。連上 Vercel 後會自動部署。

---

## Frontmatter 欄位

| 欄位 | 必填 | 說明 |
|---|---|---|
| `title` | ✓ | 文章標題 |
| `date` | ✓ | 發布日期，格式 `YYYY-MM-DD`，建議加引號。列表依日期新到舊排序 |
| `tag` | ✓ | 只能是 `Agent 架構`、`RAG`、`踩坑紀錄` 其中之一 |
| `excerpt` | ✓ | 一兩句摘要，顯示在文章列表、RSS 與分享預覽 |
| `series` | | 所屬系列的 `id`，必須存在於 `content/series.json` |
| `project` | | 相關專案名稱，顯示在文章標題下方 |
| `draft` | | `true` 時正式網站不發布；開發模式仍會顯示。預設 `false` |
| `featured` | | `true` 時顯示在首頁右上的精選實驗卡。多篇時取最新一篇。預設 `false` |
| `featuredChart` | | 精選卡的長條圖，見下方 |
| `featuredStats` | | 精選卡的三個數字，見下方 |

任何欄位有誤，`npm run build` 都會失敗並指出是哪個檔案，不會把錯的內容部署出去。

### 精選卡的資料

精選卡的圖表與數字放在 frontmatter，因為首頁不會渲染文章內文。它們通常與內文的 `<MethodTable>`、`<StatCards>` 是同一組數字，**改內文時記得一起改**。

```yaml
featured: true
featuredChart:
  label: "每題呼叫次數"
  bars:
    - { id: "A", value: 1 }
    - { id: "B", value: 9 }
featuredStats:
  - { value: "76–82%", label: "五種做法的準確率" }
  - { value: "26%", label: "A 引用的證據不在履歷裡", tone: "warn" }   # 警示色
  - { value: "99%", label: "D 的證據有效率", tone: "good" }           # 正向色
```

---

## MDX 元件

以下元件可以直接寫在 `.mdx` 內文中，不需要 import。

**`<StatCards>`**：一排數字卡。`tone` 可省略，或用 `"warn"`（警示）、`"good"`（正向）。

```mdx
<StatCards
  items={[
    { value: "26%", label: "A 引用的證據不在履歷裡", tone: "warn" },
    { value: "99%", label: "D 的證據有效率", tone: "good" }
  ]}
/>
```

**`<MethodTable>`**：做法比較表，欄位為做法、怎麼做、每題呼叫數。

```mdx
<MethodTable
  rows={[
    { id: "A", how: "不檢索，整份履歷直接給 LLM", calls: 1 },
    { id: "B", how: "檢索最像的 3 段再判斷", calls: 1 }
  ]}
/>
```

**`<CallsBarChart>`**：橫向長條圖。

```mdx
<CallsBarChart label="每題呼叫次數" bars={[{ id: "A", value: 1 }, { id: "D", value: 29 }]} />
```

**`<Callout>`**：提示框。`type="limit"` 用來誠實寫出限制；`type="note"` 是一般補充。

```mdx
<Callout type="limit" title="限制">
資料量小，所以這份結果只看方向。
</Callout>
```

**程式碼區塊**：用 Markdown 的 ``` 加上語言名稱，build 時會自動上色。

````mdx
```python
for attempt in range(MAX_RETRIES + 1):
    chunks = retrieve(query, k=3)
```
````

新增元件：在 `components/mdx/` 建立元件，並加到 `components/mdx/index.ts` 的 `mdxComponents`。

---

## 系列

系列定義在 `content/series.json`：

```json
{
  "id": "rag-basics-to-agentic",
  "title": "RAG 從基礎到 Agentic",
  "status": "規劃中",
  "desc": "一句介紹",
  "chips": ["Chunking", "Rerank"]
}
```

- `id` 用於網址 `/series/<id>` 和文章的 `series` 欄位，只能用小寫英文、數字和連字號
- `status` 只能是 `連載中`、`規劃中`、`已完結`
- 系列頁的文章依日期由舊到新排列；文章頁底部的上一篇／下一篇也依同一順序

---

## 部署（Vercel）

1. 把 repo push 到 GitHub。
2. 在 Vercel 新增專案並選擇這個 repo。Framework 會自動偵測為 Next.js，Build Command 保持預設的 `npm run build` 即可，搜尋索引會在建置過程中一併產生。
3. （選填）在 Vercel 的 Environment Variables 設定：

   | 變數 | 說明 |
   |---|---|
   | `SITE_URL` | 網站的正式網址，例如 `https://example.com`。用於 RSS、sitemap、Open Graph 的絕對網址。沒設定時會用 Vercel 的正式網域（`VERCEL_PROJECT_PRODUCTION_URL`） |

之後每次 push 到主分支就會自動部署。

部署完成後，可以把 `https://你的網址/rss.xml` 貼到 [W3C Feed Validator](https://validator.w3.org/feed/) 確認 RSS 格式。

### 在本機預覽草稿的正式版

正式建置不包含草稿。若想在正式模式下預覽草稿（例如測試搜尋），可以設定 `SHOW_DRAFTS=1`：

```bash
# macOS / Linux
SHOW_DRAFTS=1 npm run build && npm start
```

```powershell
# Windows PowerShell
$env:SHOW_DRAFTS="1"; npm run build; npm start
```

**不要在 Vercel 設定 `SHOW_DRAFTS`**，否則草稿會被發布。

---

## 專案結構

```
content/
  posts/*.mdx           文章，檔名即網址
  series.json           系列
app/
  layout.tsx            共用 header、footer、字體與 SEO 預設值
  page.tsx              首頁
  posts/[slug]/         文章頁
  series/[id]/          系列頁
  rss.xml/route.ts      RSS
  sitemap.ts, robots.ts
components/
  mdx/                  可在 MDX 中使用的元件
  ...                   頁面元件（Header、Footer、文章列表、搜尋等）
lib/
  content.ts            讀取與驗證文章、排序、草稿過濾、上一篇／下一篇
  mdx.tsx               MDX 渲染、程式碼高亮、目錄
  site.ts               作者資訊、專案卡、網站網址
  tags.ts               主題標籤清單
scripts/
  check-content.ts      build 前驗證內容
  build-search.ts       build 後建立搜尋索引
tests/
  content.test.ts       內容系統測試
```

設計 token（顏色、字體）定義在 `app/globals.css` 的 `@theme`。新增主題標籤時，要同時改 `lib/tags.ts`、`lib/site.ts` 的 `TAG_STYLES`，以及 `app/globals.css` 的標籤顏色。

---

## 尚未完成

- 首頁 Hero 的介紹文字是 `[待補：介紹文字]`（`app/page.tsx`）
- Email 訂閱表單只有介面，不會送出
- 語言切換（EN）只有按鈕
- 沒有 Open Graph 分享圖片
