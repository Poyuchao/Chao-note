export interface Bar {
  id: string;
  value: number;
}

/** 橫向長條圖：每列一個 id，長度依最大值等比例 */
export default function CallsBarChart({ label, bars }: { label: string; bars: Bar[] }) {
  const max = Math.max(...bars.map((b) => b.value), 1);
  return (
    <figure className="m-0 flex flex-col gap-2">
      <figcaption className="text-[13px] text-muted">{label}</figcaption>
      <ul className="m-0 grid list-none grid-cols-[20px_minmax(0,1fr)_32px] items-center gap-x-2.5 gap-y-1.5 p-0 text-[14px]">
        {bars.map((b) => (
          <li key={b.id} className="contents">
            <span className="num text-ink-2">{b.id}</span>
            <span className="h-3.5 rounded bg-ground" aria-hidden="true">
              <span
                className="block h-full rounded bg-accent"
                style={{ width: `${Math.max((b.value / max) * 100, 2)}%` }}
              />
            </span>
            <span className="num text-right">
              <span className="sr-only">{b.id}：</span>
              {b.value}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
