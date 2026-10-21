import type { Project } from "@/lib/site";
import { Chip } from "./Badges";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="flex flex-col gap-3.5 rounded-[16px] border border-line bg-surface p-[26px]">
      <h3 className="text-[21px]">{project.name}</h3>
      <p className="m-0 text-[15px] leading-[1.75] text-ink-2">{project.desc}</p>
      <div className="flex flex-wrap gap-1.5">
        {project.chips.map((c) => (
          <Chip key={c}>{c}</Chip>
        ))}
      </div>
      <div className="mt-auto flex flex-wrap gap-2 pt-1.5">
        {project.links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-[10px] border border-control-line px-4 text-[15px] font-medium text-ink hover:border-ink-2"
          >
            {l.label}
            <span className="sr-only">（{project.name}，開新分頁）</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </a>
        ))}
      </div>
    </article>
  );
}
