// ProfilePageContent.tsx
"use client";

import React, { Suspense } from "react";
import { use } from "react";
import Collection from "@/components/shared/Collection";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import Loader from "@/components/shared/Loader";
import { IEvent } from "@/lib/database/models/event.model";
import { IOrder } from "@/lib/database/models/order.model";
import EventsOrganized from "./EventsOrganized";

interface ProfilePageContentProps {
  organizedEventsPromise: Promise<{ data: IEvent[]; totalPages: number }>;
  ordersPromise: Promise<{ data: IOrder[]; totalPages: number }>;
  ordersPage: number;
  eventsPage: number;
}

const ProfilePageContent = ({
  organizedEventsPromise,
  ordersPromise,
  ordersPage,
  eventsPage,
}: ProfilePageContentProps) => {
  const organizedEvents = use(organizedEventsPromise);
  const orders = use(ordersPromise);

  const orderedEvents = orders.data.map((order) => order.event) as IEvent[];
  const orderedEventIds = orders.data.map((order) => ({
    orderId: order._id,
    eventId: order.event._id,
  })) as { orderId: string; eventId: string }[];

  return (
    <div className="px-2">
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
          totalPages={orders.totalPages}
          orderedEventIds={orderedEventIds}
        />
      </section>

      {/* Events Organized */}
      <EventsOrganized
        organizedEventsPromise={organizedEventsPromise}
        eventsPage={eventsPage}
      />
    </div>
  );
};

export default function ProfilePageContentWrapper(
  props: ProfilePageContentProps
) {
  return (
    <Suspense fallback={<Loader />}>
      <ProfilePageContent {...props} />
    </Suspense>
  );
}
