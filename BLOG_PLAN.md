# Agent 工程筆記：技術部落格開發計畫

> 給 Claude Code 的開發說明。請依照下方的階段逐步完成，每個階段完成後停下來，讓我確認後再進行下一階段。

## 1. 專案目標

一個記錄 AI agent 學習與實作的個人技術部落格。

- **作者**：George Chao（AI Engineer，台中）
- **定位**：記錄我打造 AI agent 時的實驗、踩過的坑，和量到的數字。每篇文章附程式碼，能量化的地方附數字。
- **讀者**：工程師、面試官、對 agent 開發有興趣的人
- **核心原則**：文章的主角是「我自己的實作、數字和踩坑」，不是課程摘要

## 2. 技術選型

| 項目 | 選擇 |
|---|---|
| 框架 | Next.js（App Router）+ TypeScript |
| 樣式 | Tailwind CSS，設計 token 依第 4 節定義 |
| 文章 | MDX 檔案存在 repo 中，用 `gray-matter` 讀 frontmatter，`next-mdx-remote/rsc` 渲染 |
| 程式碼高亮 | `rehype-pretty-code`（或同等方案） |
| Markdown 表格 | `remark-gfm` |
| 字體 | `next/font/google`：Bricolage Grotesque、Noto Sans TC、JetBrains Mono |
| 部署 | Vercel，連結 GitHub repo，push 即自動部署 |
| 渲染方式 | 全部靜態產生（SSG），不需要資料庫或後端 |

不要引入 CMS、資料庫或需要付費的服務。

## 3. 專案結構

```
my-blog/
├── content/
│   ├── posts/              # 每篇文章一個 .mdx，檔名即 slug
│   └── series.json         # 系列的名稱、介紹、狀態、章節標籤
├── app/
│   ├── layout.tsx          # 共用 header、footer、字體
│   ├── page.tsx            # 首頁
│   ├── posts/[slug]/page.tsx
│   ├── series/[id]/page.tsx
│   └── rss.xml/route.ts    # 階段 4
├── components/
│   ├── SiteHeader.tsx
│   ├── SiteFooter.tsx
│   ├── PostList.tsx        # 含主題篩選（client component）
│   ├── SeriesCard.tsx
│   ├── ProjectCard.tsx
│   ├── Toc.tsx             # 文章目錄
│   └── mdx/                # 可在 MDX 中使用的元件
│       ├── StatCards.tsx
│       ├── CallsBarChart.tsx
│       ├── Callout.tsx
│       └── MethodTable.tsx
└── lib/
    └── content.ts          # 讀取文章、依日期排序、過濾草稿、上一篇與下一篇
```

## 4. 設計規格

視覺方向：**工程實驗筆記**。冷灰藍底色、深藍文字、一個訊號藍重點色。數字是主角。

### 顏色

| Token | 值 | 用途 |
|---|---|---|
| `ground` | `#EEF1F4` | 頁面底色 |
| `surface` | `#FFFFFF` | 卡片、面板 |
| `surface-2` | `#F5F7FA` | 表格標題列 |
| `ink` | `#132033` | 主要文字、深色區塊（footer、程式碼底色） |
| `ink-2` | `#2D3748` | 次要文字 |
| `muted` | `#4A5568` | 說明文字、日期 |
| `line` | `#D3D9E1` | 外框 |
| `line-2` | `#E2E7EE` | 列表分隔線 |
| `control-line` | `#C3CAD4` | 按鈕、輸入框外框 |
| `accent` | `#2346D8` | 主按鈕、長條圖、連結強調 |
| `link` | `#1D3BB3` | 一般連結 |

主題標籤顏色：

| 標籤 | 背景 | 文字 |
|---|---|---|
| Agent 架構 | `#E6ECFD` | `#1D3BB3` |
| RAG | `#E1F3EF` | `#0F6B5C` |
| 踩坑紀錄 | `#FDEFD9` | `#8A4205` |

數字強調色：警示 `#9A4A06`、正向 `#0F6B5C`。

### 字體

- **內文**：Noto Sans TC，16–17px，行高 1.7–1.8
- **標題**：Noto Sans TC 900（中文）；Latin 字與數字用 Bricolage Grotesque 800
- **數字**：Bricolage Grotesque，`tabular-nums`
- **程式碼**：JetBrains Mono 14px

### 版面

- 內容最大寬度 1180px，左右 padding 24px
- 卡片圓角 14–16px，1px 外框，不加陰影
- 文章內文最大寬度約 760px
- 手機寬度下全部改為單欄

### 不要出現

漸層背景、emoji 圖示、卡片左側色條、全大寫標籤、每個區塊都有的淡入動畫。圖示一律用 inline SVG（stroke 風格）。

### 無障礙

- 互動元素用真正的 `<button>`、`<a href>`、`<input>` + `<label>`
- 點擊區域至少 44×44px
- 文字對比至少 4.5:1
- 有可見的 focus 樣式（`outline: 3px solid accent`）
- 主題篩選按鈕使用 `aria-pressed`
- 圖示按鈕加 `aria-label`

## 5. 內容模型

### 文章 frontmatter

```yaml
---
title: "文章標題"
date: "2026-10-18"
tag: "RAG"                 # Agent 架構 | RAG | 踩坑紀錄
series: "rag-basics-to-agentic"   # 選填，對應 series.json 的 id
order: 1                    # 選填，正整數，系列內的閱讀順序；不是正整數時建置失敗並指出檔名
project: "ResumePilot"      # 選填
excerpt: "一兩句摘要，顯示在列表上"
draft: false                # true 時 production 不發布，dev 環境顯示並標示為草稿
---
```

建置時要驗證 frontmatter：缺少必填欄位或 `tag` 不在允許清單時，建置失敗並顯示是哪個檔案。

### series.json

```json
[
  {
    "id": "agent-harness-from-scratch",
    "title": "從零理解 Agent Harness",
    "status": "連載中",
    "desc": "不用框架，一層一層手刻 agent 的外殼：從 while 迴圈到沙箱。",
    "chips": ["Loop", "Tools", "Context", "Environment", "Memory", "Observability"]
  },
  {
    "id": "agent-frameworks",
    "title": "Agent 框架比較",
    "status": "連載中",
    "desc": "用同一組六大元件的角度，看每個框架幫你做了什麼、留了什麼給你。",
    "chips": ["OpenAI Agents SDK", "CrewAI", "LangGraph", "AutoGen", "MCP"]
  },
  {
    "id": "rag-basics-to-agentic",
    "title": "RAG 從基礎到 Agentic",
    "status": "規劃中",
    "desc": "從固定檢索一次，到讓模型自己判斷要不要查、查得夠不夠。",
    "chips": ["Chunking", "混合檢索", "Rerank", "Corrective RAG", "Self-RAG", "評測"]
  }
]
```

### 文章撰寫模板

每篇文章建議依這個結構：

1. **問題**：遇到了什麼情況
2. **嘗試**：一開始怎麼做，結果如何
3. **解法**：後來怎麼改、為什麼（附程式碼或架構圖）
4. **數字**：量化的結果
5. **學到什麼**：一句話總結與下一步；若有限制，用 `<Callout type="limit">` 誠實寫出

## 6. 頁面規格

### 首頁（`/`）

由上到下：

1. **Header**：左側 logo（圓角方框內一個循環箭頭的 SVG）+「George Chao」+ 副標「Agent 工程筆記」；中間導覽：文章、系列、專案、關於；右側搜尋按鈕（階段 4 前先放按鈕即可）、語言切換按鈕（先放 UI，不實作功能）
2. **Hero**（左右兩欄，手機改為上下）
   - 左：小字「我做 AI agent 時的實驗、踩過的坑，和量到的數字。」；主標「把 agent 拆開來看，<br>再量量看它到底有沒有變好。」；介紹文字；按鈕「從評測集那篇開始讀」（連到精選文章）與「GitHub」
   - 右：**精選實驗卡**，讀取 frontmatter 有 `featured: true` 的文章，顯示標籤、標題、`CallsBarChart`、三個數字，以及「閱讀這篇實驗」連結
3. **三個系列**：讀取 `series.json`，每個系列一張卡片（狀態標籤、標題、介紹、章節標籤），連到 `/series/[id]`
4. **最新文章**：主題篩選按鈕（全部、Agent 架構、RAG、踩坑紀錄），文章列表（日期、標籤、標題、摘要），依日期新到舊，同一天時依 `order` 由大到小（不受系列順序影響）；篩選結果為空時顯示「這個主題還沒有文章。」
5. **文章背後的專案**：米米財經、ResumePilot 兩張卡片（內容見第 7 節）
6. **Footer**（深色 `ink` 底）：「一週一篇，只寫真的做過的東西。」、Email 訂閱表單（階段 4 前表單先不送出）、版權與 GitHub、LinkedIn、RSS 連結

### 文章頁（`/posts/[slug]`）

1. Header（同首頁）
2. 麵包屑：首頁 / 系列名稱 / 文章
3. 標籤、標題、作者、日期、專案
4. 兩欄：左側**文章目錄**（由 h2 自動產生），右側內文；手機目錄移到內文上方
5. 文章結尾：系列的上一篇、下一篇（與系列頁相同的順序，沒有時顯示佔位）
6. 作者介紹卡

### 系列頁（`/series/[id]`）

系列介紹 + 該系列所有文章，依閱讀順序排列：

- 有 `order` 的文章依 `order` 由小到大
- 沒有 `order` 的文章排在後面，依日期由舊到新

## 7. 固定內容

### 專案卡

**米米財經**
- 說明：全自動財經短影音：選題、改寫口播稿、生圖與審圖、配音、合成到上傳，無人介入運行兩個月。另有一個唯讀的稽核 agent，負責檢查選片決策。
- 標籤：MCP server、LangGraph、LLM-as-a-Judge、Guardrails
- 連結：YouTube 頻道 `https://www.youtube.com/@fintechchao1345/shorts`、原始碼 `https://github.com/Poyuchao/mimi-finance-shorts`

**ResumePilot**
- 說明：履歷分析與多輪問答系統。從零做 RAG pipeline，按章節切塊、pgvector 檢索、SSE 串流，並建了自己的評測集比較不同做法值不值得上線。
- 標籤：FastAPI、pgvector、Corrective RAG、Cloud Run
- 連結：線上 demo `https://resumepilot-frontend-338336680245.asia-east1.run.app/`

### 個人連結

- GitHub：`https://github.com/Poyuchao`
- LinkedIn：`https://linkedin.com/in/poyu-chao/`

### 作者介紹

AI Engineer，台中。做過 AI 助理平台與社群資料整合，現在專注在 agent harness、Agentic RAG 與評測。

## 8. 第一篇文章

檔名：`content/posts/rag-eval-180-cases.mdx`

```mdx
---
title: "我建了 180 題評測集，發現 CRAG 準確率沒變、成本卻多十倍"
date: "2026-10-18"
tag: "RAG"
series: "rag-basics-to-agentic"
project: "ResumePilot"
excerpt: "五種做法比較準確率、幻覺率與證據有效率。最複雜的那個，最後沒有上線。"
featured: true
draft: true
---

## 問題

ResumePilot 要判斷一份履歷是否符合職缺的每一條要求。原本的做法是把整份 JD 當成一個問題，檢索履歷中最像的 3 段，再一次判斷所有需求。它看起來能用，但我說不出它到底準不準。

## 怎麼建評測集

每題是一份履歷加一條職缺要求，答案只有三種：符合、部分符合、缺少，大約 180 題。

為了讓答案沒有模糊空間，我把幾份履歷刻意刪改。例如刪掉所有 MCP 相關的內容，這時職缺要求 MCP，答案就一定是「缺少」；系統只要說「符合」，就是編的。

## 五種做法

<MethodTable
  rows={[
    { id: "A", how: "不檢索，整份履歷直接給 LLM，一次判斷所有需求", calls: 1 },
    { id: "B", how: "整份 JD 當一個問題，檢索履歷最像的 3 段，一次判斷（原本的做法）", calls: 1 },
    { id: "C", how: "把 JD 拆成一條條需求，每條各自檢索 3 段、各自判斷", calls: 9 },
    { id: "D", how: "C 加上 CRAG：段落先評分，不相關就改寫查詢重搜，最多 2 次", calls: 29 },
    { id: "E", how: "D 加上驗證：判完再檢查證據是否真的證明這項能力", calls: 34 }
  ]}
/>

D 的核心是 CRAG：檢索到的段落先逐段評分，全都不相關就改寫查詢再查，最多兩次。

```python
for attempt in range(MAX_RETRIES + 1):
    chunks = retrieve(query, k=3)
    graded = [grade(c, requirement) for c in chunks]  # 相關 / 不確定 / 不相關
    if any(g == "relevant" for g in graded):
        return judge(requirement, chunks)
    query = rewrite(query)  # 例如補上全名 Model Context Protocol
return "缺少"
```

## 結果

<StatCards
  items={[
    { value: "76–82%", label: "五種做法的準確率" },
    { value: "26%", label: "A 引用的證據不在履歷裡", tone: "warn" },
    { value: "99%", label: "D 的證據有效率", tone: "good" }
  ]}
/>

五種做法的準確率差不多。最高的是不檢索、整份履歷直接判斷（81.5%），但它有 26% 的證據是編的。CRAG 的證據有效率到 99%，代價是每題約 29 次呼叫、token 約十倍。

<Callout type="limit" title="限制">
資料量小、只測了 gpt-4o-mini，保留的驗證集還沒跑，所以這份結果只看方向。
</Callout>

## 學到什麼

準確率不是唯一的指標。分數最高的做法最會編證據，最誠實的做法貴了十倍。準確率差不多、成本差十倍，所以我沒有上線 CRAG。下一步是跑保留的驗證集，確認這個方向在更多資料上還成立。
```

（注意：這篇的 `draft: true`，等我自己潤飾後再改成 `false`。開發時請在 dev 環境顯示它，讓首頁與文章頁有內容可以看。）

精選卡的長條圖資料取自同一組 `rows`：在 frontmatter 加 `featuredChart`，或由文章模組匯出，選一個簡單的做法即可，並說明你的選擇。

## 9. 開發階段

每個階段完成後停下來，告訴我：改了哪些檔案、我該執行什麼指令驗證、有哪些已知限制。

### 階段 1：專案骨架與設計系統

- 建立 Next.js + TypeScript + Tailwind 專案
- 在 Tailwind 設定第 4 節的顏色與字體 token
- 完成 `SiteHeader`、`SiteFooter`、`layout.tsx`
- **驗收**：`npm run dev` 能看到空白頁面上有 header 與 footer，手機寬度下導覽會換行

### 階段 2：內容系統

- `lib/content.ts`：讀取 `content/posts/*.mdx`、驗證 frontmatter、依日期排序、production 過濾草稿、計算上一篇與下一篇
- 建立 `series.json` 與第一篇文章
- **驗收**：寫一個簡單的測試或腳本，確認草稿在 production 模式被過濾、缺少欄位時會報錯並指出檔名

### 階段 3：頁面

- 首頁全部區塊（含主題篩選）
- 文章頁（含目錄、上一篇與下一篇、作者卡）與 MDX 元件
- 系列頁
- **驗收**：`npm run build` 成功、所有頁面都是靜態產生、手機寬度下版面正確、鍵盤可以操作所有按鈕與連結

### 階段 4：發布功能

- RSS（`/rss.xml`）
- SEO：每頁的 title、description、Open Graph
- `sitemap.xml`
- 搜尋（Pagefind 或同等的靜態方案）
- **驗收**：RSS 能通過驗證器、build 後搜尋可以找到第一篇文章

### 階段 5：部署

- 撰寫 README：本機開發、新增文章的步驟、frontmatter 說明、部署方式
- 我會自己把 repo 連到 Vercel
- **驗收**：README 照著做，一個新的人也能新增一篇文章並看到它

## 10. 規則

- 不要編造任何數字、日期或經歷。需要但我沒提供的內容，用 `[待補：說明]` 佔位
- 文章內容只用我提供的文字，不要自行擴寫
- 依賴套件盡量少，每新增一個套件都說明理由
- 不要 commit 或 push，除非我要求
- 有任何不確定或需要我決定的地方，先列出問題問我，不要自己假設
