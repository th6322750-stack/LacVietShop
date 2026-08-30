/** Xuất CSV kèm BOM UTF-8 để Excel đọc đúng tiếng Việt. */

function cell(value: unknown) {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: unknown[][]) {
  return rows.map((row) => row.map(cell).join(",")).join("\r\n");
}

function stamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

/** rows[0] là dòng tiêu đề. Trả về tên file đã tải. */
export function downloadCsv(name: string, rows: unknown[][]) {
  const blob = new Blob([`﻿${toCsv(rows)}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const fileName = `${name}-${stamp()}.csv`;
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return fileName;
}
