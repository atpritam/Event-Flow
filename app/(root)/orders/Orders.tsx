"use client";

import React from "react";
import * as XLSX from "xlsx";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { IOrderItem } from "@/lib/database/models/order.model";
import Search from "@/components/shared/Search";
import ClientRender from "@/components/shared/ClientRender";
import EventLink from "@/components/shared/EventLink";

export function OrdersDataTable({
  orders,
  titleClickable = false,
}: {
  orders: IOrderItem[];
  titleClickable: boolean;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = React.useState<
    Record<string, boolean>
  >({
    "Event Title": false,
  });

  const columns: ColumnDef<IOrderItem>[] = [
    {
      accessorKey: "_id",
      header: "Order ID",
      cell: ({ row }) => (
        <div className="font-medium text-[#2563eb]">{row.original._id}</div>
      ),
    },
    {
      accessorKey: "eventTitle",
      header: "Event Title",
      cell: ({ row }) => {
        const eventTitle = row.original.eventTitle;
        const eventId = row.original.eventId;
        return titleClickable ? (
          <EventLink
            href={`${window.location.origin}/orders?eventId=${eventId}`}
            className="text-blue-600 hover:underline"
          >
            {eventTitle}
          </EventLink>
        ) : (
          <div>{eventTitle}</div>
        );
      },
    },
    {
      accessorKey: "buyer",
      header: "Buyer",
      cell: ({ row }) => row.original.buyer,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => formatDateTime(row.original.createdAt).dateTime,
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => formatPrice(row.original.totalAmount),
    },
  ];

  function exportToCSV(data: IOrderItem[]) {
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

  function exportToExcel(data: IOrderItem[]) {
    const formattedData = data.map((row) => {
      const formattedRow: any = { ...row };
      formattedRow.createdAt = formatDateTime(
        formattedRow.createdAt as Date
      ).dateOnly;
      return formattedRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData, {
      //@ts-ignore
      header: columns.map((col) => col.accessorKey ?? ""),
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, "orders.xlsx");
  }

  const table = useReactTable({
    data: orders,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div>
      <div className="flex items-start py-4 flex-col sm:flex-row gap-1 sm:gap-4">
        <section className="sm:flex-1 w-full">
          <Search placeholder="Search Buyer" />
        </section>
        <div className="mt-2 sm:mt-1 flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="ml-auto flex self-center focus-visible:ring-offset-0 focus-visible:ring-transparent focus:ring-transparent"
              >
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportToCSV(orders)}>
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToExcel(orders)}>
                Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="ml-auto flex self-center focus-visible:ring-offset-0 focus-visible:ring-transparent focus:ring-transparent"
              >
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default function ClientOrders({
  orders,
  titleClickable,
}: {
  orders: IOrderItem[];
  titleClickable?: boolean;
}) {
  return (
    <ClientRender>
      <section className="wrapper mt-4">
        <OrdersDataTable
          orders={orders}
          titleClickable={titleClickable || false}
        />
      </section>
    </ClientRender>
  );
}
