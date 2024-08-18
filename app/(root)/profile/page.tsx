import Collection from "@/components/shared/Collection";
import { Button } from "@/components/ui/button";
import { getUserIDByClerkId } from "@/lib/actions/user.actions";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import React from "react";
import { Plus } from "lucide-react";
import { getEventsByUser } from "@/lib/actions/event.actions";
import { getOrdersByUser } from "@/lib/actions/order.action";
import { IOrder } from "@/lib/database/models/order.model";
import { SearchParamProps } from "@/app/types";

interface ProfilePageTypes {
  params: {
    userId: string;
  };
}
const ProfilePage = async ({ searchParams }: SearchParamProps) => {
  const { sessionClaims } = auth();
  const currentUserClerkId = sessionClaims?.userID as string;
  const currentUserId = await getUserIDByClerkId(currentUserClerkId);

  const ordersPage = Number(searchParams?.ordersPage) || 1;
  const eventsPage = Number(searchParams?.eventsPage) || 1;

  const organizedEvents = await getEventsByUser({
    userId: currentUserId,
    page: eventsPage,
  });

  const orders = await getOrdersByUser({
    userId: currentUserId,
    page: ordersPage,
    limit: 3,
  });

  const orderedEvents = orders?.data?.map((order: IOrder) => order.event) || [];

  const orderedEventIds =
    orders?.data?.map((order: IOrder) => ({
      orderId: order._id,
      eventId: order.event._id,
    })) || [];

  return (
    <>
      {/* My Tickets */}
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-5">
        <div className="wrapper flex items-center justify-center sm:justify-between">
          <h3 className="h3-bold text-center sm:text-left">My Tickets</h3>
          <Button asChild className="button hidden sm:flex">
            <Link href="/#events">
              <span className="p-medium-18">Explore More</span>
            </Link>
          </Button>
        </div>
      </section>
      <section className="wrapper my-8">
        <Collection
          data={orderedEvents}
          emptyTitle="No Tickets"
          emptyStateSubtext="Your purchased tickets will appear here."
          collectionType="My_Tickets"
          limit={3}
          page={ordersPage}
          urlParamName="ordersPage"
          totalPages={orders?.totalPages}
          orderedEventIds={orderedEventIds}
        />
      </section>

      {/* Events Organized */}
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-5">
        <div className="wrapper flex items-center justify-center sm:justify-between">
          <h3 className="h3-bold text-center sm:text-left">Events Organized</h3>
          <Button asChild className="button hidden sm:flex">
            <Link href="/events/create">
              <Plus className="mr-1" /> <span className="p-medium-18">New</span>
            </Link>
          </Button>
        </div>
      </section>
      <section className="wrapper my-8">
        <Collection
          data={organizedEvents?.data}
          emptyTitle="No Events"
          emptyStateSubtext="Go create some events!"
          collectionType="Events_Organized"
          limit={3}
          page={eventsPage}
          urlParamName="eventsPage"
          totalPages={organizedEvents?.totalPages}
        />
      </section>
    </>
  );
};

export default ProfilePage;
