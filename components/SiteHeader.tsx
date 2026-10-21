import Link from "next/link";
import SearchDialog from "./SearchDialog";

const NAV = [
  { href: "/#posts", label: "文章" },
  { href: "/#series", label: "系列" },
  { href: "/#projects", label: "專案" },
  { href: "/#about", label: "關於" },
];

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} className="flex-none" viewBox="0 0 36 36" aria-hidden="true">
      <rect x="1" y="1" width="34" height="34" rx="9" fill="var(--color-ink)" />
      <g fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M25.5 15.5A8 8 0 0 0 11 13" />
        <path d="M10.5 20.5A8 8 0 0 0 25 23" />
        <path d="M11 8.5V13h4.5" />
        <path d="M25 27.5V23h-4.5" />
      </g>
    </svg>
  );
}

const controlBtn =
  "inline-flex h-11 min-w-11 items-center justify-center rounded-[10px] border border-control-line bg-surface px-3 text-ink-2 hover:border-ink-2 hover:text-ink";

export default function SiteHeader() {
  return (
    <header className="border-b border-line bg-surface">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2"
      >
        跳到主要內容
      </a>
      <div className="container-content flex flex-wrap items-center gap-x-6 gap-y-1 py-3">
        <Link href="/" className="flex min-h-11 items-center gap-3 rounded-md">
          <LogoMark />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-[17px] font-extrabold text-ink">George Chao</span>
            <span className="text-[13px] text-muted">Agent 工程筆記</span>
          </span>
        </Link>

        {/* 手機時導覽換到第二列並佔滿寬度 */}
        <nav aria-label="主要導覽" className="order-3 w-full md:order-none md:w-auto md:flex-1">
          <ul className="flex flex-wrap items-center gap-x-1 md:justify-center">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-md px-3 text-[15px] font-medium text-ink-2 hover:text-link"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <SearchDialog buttonClassName={controlBtn} />
          {/* 語言切換目前只有 UI */}
          <button type="button" aria-label="切換語言（尚未開放）" className={`${controlBtn} text-[14px] font-medium`}>
            EN
          </button>
        </div>
      </div>
    </header>
  );
}
