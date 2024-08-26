import React, { use } from "react";
import { SearchParamProps } from "@/app/types";
import { getOrdersByEvent } from "@/lib/actions/order.action";
import OrdersChart from "./OrdersChart";
import OrdersTable from "./OrdersTable";
import { auth } from "@clerk/nextjs/server";
import { IOrderItem } from "@/lib/database/models/order.model";

const Orders = async ({ searchParams }: SearchParamProps) => {
  const { sessionClaims } = auth();
  const userId = sessionClaims?.userId as string;
  const eventId = (searchParams?.eventId as string) || "";
  const eventTitle = (searchParams?.eventTitle as string) || "";
  const searchText = (searchParams?.query as string) || "";
  const totalOrdersPromise = getOrdersByEvent({
    eventId,
    userId,
    searchString: "",
  });
  const ordersPromise = getOrdersByEvent({
    eventId,
    userId,
    searchString: searchText.trim(),
  });

  return (
    <div className="px-2">
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">Orders</h3>
        <h4 className="wrapper text-center sm:text-left mt-[-20px]">
          {eventTitle}
        </h4>
      </section>
      <OrdersChart
        ordersPromise={totalOrdersPromise as Promise<IOrderItem[]>}
      />
      <OrdersTable ordersPromise={ordersPromise as Promise<IOrderItem[]>} />
    </div>
  );
};

export default Orders;
