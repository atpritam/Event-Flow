import { type ClassValue, clsx } from "clsx";

import { twMerge } from "tailwind-merge";
import qs from "query-string";

import { UrlQueryParams, RemoveUrlQueryParams } from "@/app/types";
import { IOrderItem } from "./database/models/order.model";
import { ColumnDef } from "@tanstack/react-table";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    year: "numeric",
    day: "numeric",
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  const formattedDateTime: string = new Date(dateString).toLocaleString(
    "en-US",
    dateTimeOptions
  );

  const formattedDate: string = new Date(dateString).toLocaleString(
    "en-US",
    dateOptions
  );

  const formattedTime: string = new Date(dateString).toLocaleString(
    "en-US",
    timeOptions
  );

  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

export const formatPrice = (price: string) => {
  const amount = parseFloat(price);
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

  return formattedPrice;
};

export function formUrlQuery({ params, key, value }: UrlQueryParams) {
  const currentUrl = qs.parse(params);

  currentUrl[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
}

export function removeKeysFromQuery({
  params,
  keysToRemove,
}: RemoveUrlQueryParams) {
  const currentUrl = qs.parse(params);

  keysToRemove.forEach((key) => {
    delete currentUrl[key];
  });

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
}

export function exportToCSV(
  data: IOrderItem[],
  columns: ColumnDef<IOrderItem>[]
) {
  const header = columns.map((col) => col.header ?? "");
  const rows = data.map((row) =>
    columns.map((col) => {
      //@ts-ignore
      const key = col.accessorKey as keyof IOrderItem;
      const value = row[key];

      if (key === "createdAt") {
        return formatDateTime(value as Date).dateOnly;
      }

      return value;
    })
  );

  const csvContent = [
    header.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "orders.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportToExcel(
  data: IOrderItem[],
  columns: ColumnDef<IOrderItem>[]
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Orders");

  worksheet.addRow(columns.map((col) => col.header ?? ""));

  data.forEach((row) => {
    const rowData = columns.map((col) => {
      //@ts-ignore
      const key = col.accessorKey as keyof IOrderItem;
      const value = row[key];
      if (key === "createdAt") {
        return formatDateTime(value as Date).dateOnly;
      }
      return value;
    });
    worksheet.addRow(rowData);
  });

  workbook.xlsx.writeBuffer().then((buffer: BlobPart) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "orders.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

export function exportToPDF(
  data: IOrderItem[],
  columns: ColumnDef<IOrderItem>[]
) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Orders Report", 105, 20, { align: "center" });

  const header = columns.map((col: ColumnDef<IOrderItem>) => col.header ?? "");

  const tableData = data.map((row) => {
    return columns.map((col: ColumnDef<IOrderItem>) => {
      //@ts-ignore
      const key = col.accessorKey as keyof IOrderItem;
      const value = row[key];
      if (key === "createdAt") {
        return formatDateTime(value as Date).dateOnly;
      }
      return value;
    });
  });

  const colWidths = [60, 45, 40, 35, 25];
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);
  const pageWidth = doc.internal.pageSize.getWidth();
  const tableX = (pageWidth - tableWidth) / 2;

  //@ts-ignore
  doc.autoTable({
    startY: 30,
    head: [header],
    body: tableData,
    theme: "striped",
    styles: {
      fontSize: 10,
      cellPadding: 5,
      halign: "center",
      valign: "middle",
    },
    headStyles: {
      fillColor: [41, 87, 141],
      textColor: [255, 255, 255],
    },
    margin: { top: 30, left: tableX },
    pageBreak: "auto",
    showHead: "everyPage",
    columnStyles: {
      0: { cellWidth: colWidths[0] },
      1: { cellWidth: colWidths[1] },
      2: { cellWidth: colWidths[2] },
      3: { cellWidth: colWidths[3] },
      4: { cellWidth: colWidths[4] },
    },
    tableWidth: tableWidth,
    //@ts-ignore
    theme: "grid",
  });

  doc.save("orders.pdf");
}

export function exportToJSON(data: IOrderItem[]) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "orders.json");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const handleError = (error: unknown) => {
  console.error(error);
  throw new Error(typeof error === "string" ? error : JSON.stringify(error));
};
