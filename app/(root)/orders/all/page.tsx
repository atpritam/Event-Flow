import React from "react";
import { SearchParamProps } from "@/app/types";
import { getAllOrdersByUser } from "@/lib/actions/order.action";
import OrdersChart from "../OrdersChart";
import ClientOrders from "../OrdersTable";
import { auth } from "@clerk/nextjs/server";
import { IOrderItem } from "@/lib/database/models/order.model";

const AllOrders = async ({ searchParams }: SearchParamProps) => {
  const { sessionClaims } = auth();
  const userId = sessionClaims?.userId as string;
  const searchText = (searchParams?.query as string) || "";
  const totalOrdersPromise =
    getAllOrdersByUser({
      userId,
      searchString: "",
    }) || [];
  const ordersPromise =
    getAllOrdersByUser({
      userId,
      searchString: searchText.trim(),
    }) || [];

  return (
    <div className="px-2">
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">All Orders</h3>
      </section>

      <OrdersChart
        ordersPromise={totalOrdersPromise as Promise<IOrderItem[]>}
      />
      <ClientOrders
        ordersPromise={ordersPromise as Promise<IOrderItem[]>}
        titleClickable={true}
      />
    </div>
  );
};

export default AllOrders;
