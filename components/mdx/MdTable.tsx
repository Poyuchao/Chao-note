import type { ComponentProps } from "react";

/** Markdown 表格：外包可橫向捲動的容器，樣式見 globals.css 的 .md-table */
export default function MdTable(props: ComponentProps<"table">) {
  return (
    <div className="md-table" tabIndex={0} role="region" aria-label="表格">
      <table {...props} />
    </div>
  );
}
