import React from "react";
import { SearchParamProps } from "@/app/types";
import { getOrdersByEvent } from "@/lib/actions/order.action";
import OrdersChart from "./OrdersChart";
import ClientOrders from "./Orders";
import { auth } from "@clerk/nextjs/server";
import { getEventById } from "@/lib/actions/event.actions";

const Orders = async ({ searchParams }: SearchParamProps) => {
  const { sessionClaims } = auth();
  const userId = sessionClaims?.userId as string;
  const eventId = (searchParams?.eventId as string) || "";
  const searchText = (searchParams?.query as string) || "";
  const totalOrders = await getOrdersByEvent({
    eventId,
    userId,
    searchString: "",
  });
  const orders = await getOrdersByEvent({
    eventId,
    userId,
    searchString: searchText.trim(),
  });

  return (
    <div className="px-2">
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">Orders</h3>
        <h4 className="wrapper text-center sm:text-left mt-[-20px]">
          {orders[0]
            ? orders[0]?.eventTitle || null
            : await getEventById(eventId).then((event) => event.title)}
        </h4>
      </section>
      <OrdersChart orders={totalOrders} />
      <ClientOrders orders={orders} />
    </div>
  );
};

export default Orders;
