"use client";

import type { Row, Table } from "@tanstack/react-table";
import type { SheetData } from "write-excel-file/browser";

import type { ExportFormat, ExportScope } from "./types";

type ExportColumn = {
  id: string;
  label: string;
};

type ExportPayload = {
  columns: ExportColumn[];
  rows: (string | number | boolean | null)[][];
};

/** Visible, exportable columns in their current on-screen order. */
function collectColumns<TData>(table: Table<TData>): ExportColumn[] {
  return table
    .getVisibleLeafColumns()
    .filter((column) => !column.columnDef.meta?.excludeFromExport)
    .map((column) => ({
      id: column.id,
      label: column.columnDef.meta?.label ?? column.id,
    }));
}

function cellValue<TData>(
  row: Row<TData>,
  columnId: string,
): string | number | boolean | null {
  const column = row.getAllCells().find((cell) => cell.column.id === columnId);
  const exportValue = column?.column.columnDef.meta?.exportValue;

  if (exportValue) return exportValue(row.original);

  const value = row.getValue(columnId);

  if (value === null || value === undefined) return null;
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.join(", ");

  return String(value);
}

function buildPayload<TData>(
  table: Table<TData>,
  scope: ExportScope,
): ExportPayload {
  const columns = collectColumns(table);
  const rows =
    scope === "page"
      ? table.getRowModel().rows
      : table.getFilteredRowModel().rows;

  return {
    columns,
    rows: rows.map((row) => columns.map((column) => cellValue(row, column.id))),
  };
}

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function toCsvCell(value: string | number | boolean | null): string {
  if (value === null) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function exportCsv(payload: ExportPayload, filename: string): void {
  const lines = [
    payload.columns.map((column) => toCsvCell(column.label)).join(","),
    ...payload.rows.map((row) => row.map(toCsvCell).join(",")),
  ];

  // The BOM is what makes Excel open UTF-8 Arabic correctly.
  download(
    new Blob([`﻿${lines.join("\r\n")}`], {
      type: "text/csv;charset=utf-8",
    }),
    `${filename}.csv`,
  );
}

function exportJson(payload: ExportPayload, filename: string): void {
  const records = payload.rows.map((row) =>
    Object.fromEntries(
      payload.columns.map((column, index) => [
        column.label,
        row[index] ?? null,
      ]),
    ),
  );

  download(
    new Blob([JSON.stringify(records, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
    `${filename}.json`,
  );
}

async function exportXlsx(
  payload: ExportPayload,
  filename: string,
  direction: "rtl" | "ltr",
): Promise<void> {
  // Loaded on demand — the writer is far too large for the initial bundle.
  // The package has no root export; `/browser` is the client-side build.
  const { default: writeXlsxFile } = await import("write-excel-file/browser");

  // Typed as SheetData so TypeScript picks the sheet-data overload.
  const sheet: SheetData = [
    payload.columns.map((column) => ({
      value: column.label,
      type: String,
      fontWeight: "bold" as const,
    })),
    ...payload.rows.map((row) =>
      row.map((value) => {
        if (value === null) return { value: "", type: String };
        if (typeof value === "number") return { value, type: Number };
        if (typeof value === "boolean") return { value, type: Boolean };
        return { value, type: String };
      }),
    ),
  ];

  await writeXlsxFile(sheet, {
    columns: payload.columns.map(() => ({ width: 24 })),
    // Excel opens the sheet right-to-left when the admin is working in Arabic.
    rightToLeft: direction === "rtl",
  }).toFile(`${filename}.xlsx`);
}

/**
 * PDF goes through the browser's own print pipeline rather than a JS PDF
 * library. Libraries like jsPDF do not shape Arabic text — letters come out
 * disconnected and in the wrong order — whereas the browser renders Arabic and
 * RTL correctly and lets the user "Save as PDF" from the print dialog.
 */
function exportPdf(
  payload: ExportPayload,
  filename: string,
  direction: "rtl" | "ltr",
): void {
  const escapeHtml = (value: string | number | boolean | null): string =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");

  const html = `<!doctype html>
<html dir="${direction}" lang="${direction === "rtl" ? "ar" : "en"}">
<head>
<meta charset="utf-8">
<title>${escapeHtml(filename)}</title>
<style>
  @page { size: A4 landscape; margin: 12mm; }
  body { font-family: system-ui, "IBM Plex Sans Arabic", sans-serif; font-size: 11px; color: #111; }
  h1 { font-size: 15px; margin: 0 0 10px; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ccc; padding: 5px 7px; text-align: start; vertical-align: top; }
  th { background: #f3f3f3; font-weight: 600; }
  tr { break-inside: avoid; }
  thead { display: table-header-group; }
</style>
</head>
<body>
<h1>${escapeHtml(filename)}</h1>
<table>
<thead><tr>${payload.columns.map((c) => `<th>${escapeHtml(c.label)}</th>`).join("")}</tr></thead>
<tbody>${payload.rows
    .map(
      (row) =>
        `<tr>${row.map((v) => `<td>${escapeHtml(v)}</td>`).join("")}</tr>`,
    )
    .join("")}</tbody>
</table>
</body></html>`;

  const frame = document.createElement("iframe");
  frame.style.position = "fixed";
  frame.style.inset = "0";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";
  document.body.appendChild(frame);

  const doc = frame.contentDocument;
  if (!doc) {
    frame.remove();
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  frame.contentWindow?.addEventListener("afterprint", () => frame.remove());
  frame.contentWindow?.focus();
  frame.contentWindow?.print();
}

export async function exportTable<TData>(
  table: Table<TData>,
  format: ExportFormat,
  scope: ExportScope,
  filename: string,
  direction: "rtl" | "ltr",
): Promise<void> {
  const payload = buildPayload(table, scope);

  switch (format) {
    case "csv":
      return exportCsv(payload, filename);
    case "json":
      return exportJson(payload, filename);
    case "xlsx":
      return exportXlsx(payload, filename, direction);
    case "pdf":
      return exportPdf(payload, filename, direction);
  }
}
