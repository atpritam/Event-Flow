"use client";

import React, { Suspense, use, useState } from "react";
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
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  exportToJSON,
} from "@/lib/utils";
import { ArrowUpDown } from "lucide-react";
import Loader from "@/components/shared/Loader";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function OrdersDataTable({
  ordersPromise,
  titleClickable = false,
}: {
  ordersPromise: Promise<IOrderItem[]>;
  titleClickable: boolean;
}) {
  const orders = use(ordersPromise);
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = React.useState<
    Record<string, boolean>
  >({
    eventTitle: titleClickable,
  });
  const [rowSelection, setRowSelection] = React.useState({});
  const [pageSize, setPageSize] = useState(10);
  const [isTableView, setIsTableView] = useState(true); // State for toggling view

  const columns: ColumnDef<IOrderItem>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
        />
      ),
    },
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
            href={`${window.location.origin}/orders?eventId=${eventId}&eventTitle=${eventTitle}`}
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
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-['']"
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => formatDateTime(row.original.createdAt).dateTime,
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-['']"
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => formatPrice(row.original.totalAmount),
    },
  ];

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
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const exportSelectedOrAll = (exportFunction: Function) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const dataToExport =
      selectedRows.length > 0
        ? selectedRows.map((row) => row.original)
        : [...orders];
    const col = [...columns];
    exportFunction(dataToExport, col);
  };

  return (
    <div>
      <div className="flex items-start py-4 flex-col sm:flex-row gap-1 sm:gap-4">
        <section className="sm:flex-1 w-full">
          <Search placeholder="Search Order ID or Buyer" />
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
              <DropdownMenuItem
                onClick={() => exportSelectedOrAll(exportToCSV)}
              >
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => exportSelectedOrAll(exportToExcel)}
              >
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => exportSelectedOrAll(exportToPDF)}
              >
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => exportSelectedOrAll(exportToJSON)}
              >
                JSON
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
          <Button
            variant="outline"
            className={`ml-auto flex self-center focus-visible:ring-offset-0 focus-visible:ring-transparent focus:ring-transparent md:${
              isTableView ? "hidden" : "flex"
            }`}
            onClick={() => setIsTableView(!isTableView)} // Toggle button
          >
            {isTableView ? "Card View" : "Table View"}
          </Button>
        </div>
      </div>
      {isTableView ? (
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
                    No Orders
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <div
                key={row.id}
                className="border rounded-lg p-4 shadow-sm bg-white"
              >
                <div className="font-medium text-lg text-[#2563eb]">
                  {row.original._id}
                </div>
                <div className="text-sm text-gray-600">
                  {titleClickable ? (
                    <EventLink
                      href={`${window.location.origin}/orders?eventId=${row.original.eventId}&eventTitle=${row.original.eventTitle}`}
                      className="text-blue-600 hover:underline"
                    >
                      {row.original.eventTitle}
                    </EventLink>
                  ) : (
                    row.original.eventTitle
                  )}
                </div>
                <div className="text-sm">{row.original.buyer}</div>
                <div className="text-sm">
                  {formatDateTime(row.original.createdAt).dateTime}
                </div>
                <div className="text-sm font-semibold">
                  {formatPrice(row.original.totalAmount)}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center">No Orders</div>
          )}
        </div>
      )}
      <div className="flex items-center justify-between sm:space-x-2 py-4 flex-col sm:flex-row gap-2 sm:gap-0">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <span className="text-sm text-gray-700">
            | Showing {table.getRowModel().rows.length} of {orders.length}{" "}
            orders
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              setPageSize(Number(value));
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px] focus-visible:ring-offset-0 focus-visible:ring-transparent focus:ring-transparent">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
    </div>
  );
}

export default function OrdersTable({
  ordersPromise,
  titleClickable,
}: {
  ordersPromise: Promise<IOrderItem[]>;
  titleClickable?: boolean;
}) {
  return (
    <Suspense fallback={<Loader />}>
      <ClientRender>
        <section className="wrapper mt-4">
          <OrdersDataTable
            ordersPromise={ordersPromise}
            titleClickable={titleClickable || false}
          />
        </section>
      </ClientRender>
    </Suspense>
  );
}
