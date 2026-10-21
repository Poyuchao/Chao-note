import type { ReactNode } from "react";

const VARIANTS = {
  limit: {
    box: "bg-tag-pitfall-bg border-[#F0D3A8] text-[#5A2C04]",
    title: "text-tag-pitfall-fg",
    icon: (
      <>
        <path d="M12 9v4M12 17h.01" />
        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      </>
    ),
  },
  note: {
    box: "bg-tag-agent-bg border-[#C9D5F8] text-ink",
    title: "text-tag-agent-fg",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </>
    ),
  },
};

export default function Callout({
  type = "note",
  title,
  children,
}: {
  type?: keyof typeof VARIANTS;
  title?: string;
  children: ReactNode;
}) {
  const v = VARIANTS[type] ?? VARIANTS.note;
  return (
    <aside role="note" className={`not-prose my-6 flex gap-3 rounded-[14px] border px-[18px] py-4 ${v.box}`}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`mt-1 flex-none ${v.title}`}
      >
        {v.icon}
      </svg>
      <div className="text-[15.5px] leading-[1.75] [&>p]:m-0">
        {title && <strong className={`block ${v.title}`}>{title}</strong>}
        {children}
      </div>
    </aside>
  );
}
