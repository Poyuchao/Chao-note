import type { Tag } from "@/lib/content";
import { TAG_STYLES } from "@/lib/site";

export function TagBadge({ tag }: { tag: Tag }) {
  const s = TAG_STYLES[tag];
  return (
    <span className={`inline-flex rounded-full px-2.5 py-px text-[13px] font-medium leading-6 ${s.bg} ${s.fg}`}>
      {tag}
    </span>
  );
}

export function DraftBadge() {
  return (
    <span className="inline-flex rounded-md border border-dashed border-warn px-2 text-[12px] leading-5 text-warn">
      草稿
    </span>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-md border border-line-2 bg-surface-2 px-2 text-[12.5px] leading-6 text-ink-2">
      {children}
    </span>
  );
}

export function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
