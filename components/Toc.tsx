import type { Heading } from "@/lib/mdx";

export default function Toc({ headings }: { headings: Heading[] }) {
  if (headings.length === 0) return null;
  return (
    <nav aria-labelledby="toc-title" className="rounded-[14px] border border-line bg-surface px-5 py-[18px] lg:sticky lg:top-6">
      <p id="toc-title" className="m-0 mb-2 text-[13px] font-bold text-muted">
        目錄
      </p>
      <ol className="m-0 list-none p-0 text-[15px] leading-normal">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className="block border-l-2 border-line-2 py-2.5 pl-3 text-ink-2 hover:border-accent hover:text-link"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
