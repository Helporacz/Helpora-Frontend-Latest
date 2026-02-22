const CSV_BOM = "\uFEFF";

const escapeCsvValue = (value) => {
  const text = value === null || typeof value === "undefined" ? "" : String(value);
  if (/["\n,]/.test(text)) {
    return `"${text.replace(/"/g, "\"\"")}"`;
  }
  return text;
};

export const buildCsv = (headers = [], rows = []) => {
  const headerLine = headers.map((header) => escapeCsvValue(header)).join(",");
  const bodyLines = rows.map((row) =>
    row.map((value) => escapeCsvValue(value)).join(",")
  );
  return [headerLine, ...bodyLines].join("\n");
};

export const downloadCsv = (filename, csvContent) => {
  const blob = new Blob([CSV_BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
