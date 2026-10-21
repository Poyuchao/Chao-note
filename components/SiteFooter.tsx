import SubscribeForm from "./SubscribeForm";

const LINKS = [
  { href: "https://github.com/Poyuchao", label: "GitHub" },
  { href: "https://linkedin.com/in/poyu-chao/", label: "LinkedIn" },
  { href: "/rss.xml", label: "RSS" },
];

export default function SiteFooter() {
  return (
    <footer id="about" className="mt-20 bg-ink text-white">
      <div className="container-content grid gap-10 py-14 md:grid-cols-[1fr_auto] md:items-start">
        <div className="max-w-xl">
          <p className="font-display text-[26px] font-black leading-snug">一週一篇，只寫真的做過的東西。</p>
          <p className="mt-4 text-[15px] leading-relaxed text-[#C9D2DE]">
            AI Engineer，台中。做過 AI 助理平台與社群資料整合，現在專注在 agent harness、Agentic RAG 與評測。
          </p>
        </div>
        <SubscribeForm />
      </div>
      <div className="border-t border-[#2A3A52]">
        <div className="container-content flex flex-col gap-2 py-5 text-[14px] text-[#C9D2DE] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} George Chao</p>
          <ul className="flex flex-wrap gap-x-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="inline-flex min-h-11 items-center rounded-md px-2 text-white underline-offset-4 hover:underline"
                  {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
