export interface MethodRow {
  id: string;
  how: string;
  calls: number;
}

export default function MethodTable({ rows }: { rows: MethodRow[] }) {
  return (
    <div className="not-prose my-6 overflow-x-auto rounded-[14px] border border-line bg-surface" tabIndex={0} role="region" aria-label="做法比較表">
      <table className="w-full min-w-[520px] border-collapse text-[15px] leading-relaxed">
        <thead>
          <tr className="bg-surface-2">
            <th scope="col" className="w-16 border-b border-line px-3.5 py-2.5 text-left font-bold">做法</th>
            <th scope="col" className="border-b border-line px-3.5 py-2.5 text-left font-bold">怎麼做</th>
            <th scope="col" className="w-28 border-b border-line px-3.5 py-2.5 text-right font-bold">每題呼叫數</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-line-2 last:border-b-0">
              <th scope="row" className="num px-3.5 py-3 text-left">{r.id}</th>
              <td className="px-3.5 py-3">{r.how}</td>
              <td className="num px-3.5 py-3 text-right">{r.calls}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
