import Link from "next/link";
import type { Series } from "@/lib/content";
import { Chip } from "./Badges";

export default function SeriesCard({ series, postCount }: { series: Series; postCount: number }) {
  const planned = series.status === "規劃中";
  return (
    <Link
      href={`/series/${series.id}`}
      className="group flex flex-col gap-3 rounded-[16px] border border-line bg-surface p-6 text-ink hover:border-ink-2"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex rounded-full border px-2.5 text-[13px] font-medium leading-6 ${
            planned ? "border-dashed border-control-line text-muted" : "border-control-line text-ink-2"
          }`}
        >
          {series.status}
        </span>
        <span className="text-[13px] text-muted">
          <span className="num font-semibold">{postCount}</span> 篇
        </span>
      </div>
      <h3 className="text-[19px] group-hover:text-link">{series.title}</h3>
      <p className="m-0 text-[15px] leading-[1.7] text-ink-2">{series.desc}</p>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
        {series.chips.map((c) => (
          <Chip key={c}>{c}</Chip>
        ))}
      </div>
    </Link>
  );
}
