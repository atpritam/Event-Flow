import React from "react";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { SearchParamProps } from "@/app/types";
import { IOrderItem } from "@/lib/database/models/order.model";
import { getOrdersByEvent } from "@/lib/actions/order.action";
import Search from "@/components/shared/Search";

const Orders = async ({ searchParams }: SearchParamProps) => {
  const eventId = (searchParams?.eventId as string) || "";
  const searchText = (searchParams?.query as string) || "";
  const orders = await getOrdersByEvent({ eventId, searchString: searchText });

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">Orders</h3>
      </section>

      <section className="wrapper mt-8">
        <Search placeholder="Search buyer name..." />
      </section>

      <section className="wrapper">
        {orders && orders.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No orders found.</p>
        ) : (
          <>
            {/* Table for larger screens */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse border-t">
                <thead>
                  <tr className="p-medium-14 border-b text-grey-500">
                    <th className="min-w-[250px] py-3 text-left">Order ID</th>
                    <th className="min-w-[200px] flex-1 py-3 pr-4 text-left">
                      Event Title
                    </th>
                    <th className="min-w-[150px] py-3 text-left">Buyer</th>
                    <th className="min-w-[100px] py-3 text-left">Created</th>
                    <th className="min-w-[100px] py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((row: IOrderItem) => (
                    <tr
                      key={row._id}
                      className="p-regular-14 lg:p-regular-16 border-b"
                      style={{ boxSizing: "border-box" }}
                    >
                      <td className="min-w-[250px] py-4 text-primary-500">
                        {row._id}
                      </td>
                      <td className="min-w-[200px] flex-1 py-4 pr-4">
                        {row.eventTitle}
                      </td>
                      <td className="min-w-[150px] py-4">{row.buyer}</td>
                      <td className="min-w-[100px] py-4">
                        {formatDateTime(row.createdAt).dateTime}
                      </td>
                      <td className="min-w-[100px] py-4 text-right">
                        {formatPrice(row.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards for mobile screens */}
            <div className="md:hidden grid gap-4">
              {orders.map((row: IOrderItem) => (
                <div key={row._id} className="bg-white p-4 rounded-lg shadow">
                  <p className="text-primary-500 font-semibold mb-2">
                    Order ID: {row._id}
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">Event:</span> {row.eventTitle}
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">Buyer:</span> {row.buyer}
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">Date:</span>{" "}
                    {formatDateTime(row.createdAt).dateTime}
                  </p>
                  <p className="text-right">
                    <span className="font-medium">Amount:</span>{" "}
                    {formatPrice(row.totalAmount)}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
};

export default Orders;
