import { createRoot } from "react-dom/client";
import ResultsPanel from "./views/ResultsView";

type ResultsData = {
  sql: string;
  rows: Record<string, unknown>[];
  fields: string[];
  rowCount: number;
};

const rootElement = document.getElementById("root");
const dataElement = document.getElementById("results-data");

if (!rootElement || !dataElement) {
  throw new Error("Results panel root or data element was not found.");
}

const data: ResultsData = JSON.parse(dataElement.textContent ?? "{}");

createRoot(rootElement).render(
  <ResultsPanel
    sql={data.sql}
    rows={data.rows}
    fields={data.fields}
    rowCount={data.rowCount}
  />,
);