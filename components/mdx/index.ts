import Callout from "./Callout";
import CallsBarChart from "./CallsBarChart";
import MdTable from "./MdTable";
import MethodTable from "./MethodTable";
import StatCards from "./StatCards";

/** 可在 MDX 中直接使用的元件，以及覆寫的 Markdown 元素 */
export const mdxComponents = { Callout, CallsBarChart, MethodTable, StatCards, table: MdTable };
