import type { FeaturedStat } from "@/lib/content";

export const TONE_CLASS = { warn: "text-warn", good: "text-good" } as const;

export default function StatCards({ items }: { items: FeaturedStat[] }) {
  return (
    <ul className="not-prose my-6 grid list-none grid-cols-1 gap-3 p-0 *:mt-0 sm:grid-cols-3">
      {items.map((s) => (
        <li key={s.label} className="rounded-[14px] border border-line bg-surface px-5 py-4">
          <div className={`num text-[30px] leading-tight ${s.tone ? TONE_CLASS[s.tone] : "text-ink"}`}>{s.value}</div>
          <div className="mt-1.5 text-[14px] leading-normal text-muted">{s.label}</div>
        </li>
      ))}
    </ul>
  );
}
