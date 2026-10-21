import { compileMDX } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/mdx";

export interface Heading {
  id: string;
  text: string;
}

// 最小的 hast 型別，只用到這裡需要的欄位
interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function textOf(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

export function slugifyHeading(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "");
}

/** 幫 h2 加上 id，並把標題收集到 headings 給目錄用 */
function rehypeHeadingIds({ headings }: { headings: Heading[] }) {
  return (tree: HastNode) => {
    const used = new Map<string, number>();
    const visit = (node: HastNode) => {
      if (node.type === "element" && node.tagName === "h2") {
        const text = textOf(node).trim();
        const base = slugifyHeading(text) || "section";
        const n = used.get(base) ?? 0;
        used.set(base, n + 1);
        const id = n === 0 ? base : `${base}-${n + 1}`;
        node.properties = { ...node.properties, id };
        headings.push({ id, text });
      }
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}

export async function renderPostBody(body: string) {
  const headings: Heading[] = [];
  const { content } = await compileMDX({
    source: body,
    components: mdxComponents,
    options: {
      // 文章都在 repo 裡，需要讓 <MethodTable rows={[...]} /> 這類 props 運作；
      // blockDangerousJS 仍維持預設開啟
      blockJS: false,
      mdxOptions: {
        // GFM 表格、刪除線等
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          [rehypePrettyCode, { theme: "github-dark-default", keepBackground: false }],
          [rehypeHeadingIds, { headings }],
        ],
      },
    },
  });
  return { content, headings };
}
