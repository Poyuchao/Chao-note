import { SITE } from "@/lib/site";
import { LogoMark } from "./SiteHeader";

export default function AuthorCard() {
  return (
    <section aria-label="作者介紹" className="flex items-start gap-4 rounded-[16px] border border-line bg-surface p-[22px]">
      <LogoMark size={48} />
      <div>
        <p className="m-0 font-display text-[18px] font-extrabold">{SITE.author}</p>
        <p className="m-0 mt-1 text-[15px] leading-[1.7] text-ink-2">{SITE.bio}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          <a href={SITE.links.github} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center px-2 text-[15px] text-link underline-offset-4 hover:underline">
            GitHub
          </a>
          <a href={SITE.links.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center px-2 text-[15px] text-link underline-offset-4 hover:underline">
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
}
