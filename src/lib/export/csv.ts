export type CsvValue = string | number | boolean | null | undefined;

function csvCell(value: CsvValue) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function createCsv(headers: readonly string[], rows: readonly (readonly CsvValue[])[]) {
  return [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

export function downloadCsv({
  filename,
  headers,
  rows,
}: {
  filename: string;
  headers: readonly string[];
  rows: readonly (readonly CsvValue[])[];
}) {
  const url = URL.createObjectURL(new Blob([createCsv(headers, rows)], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
