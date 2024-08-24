import Collection from "@/components/shared/Collection";
import Loader from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import { IEvent } from "@/lib/database/models/event.model";
import { Plus } from "lucide-react";
import Link from "next/link";
import React, { Suspense, use } from "react";

interface EventsOrganizedProps {
  organizedEventsPromise: Promise<{ data: IEvent[]; totalPages: number }>;
  eventsPage: number;
  isUser?: boolean;
}
const EventsOrganized = ({
  organizedEventsPromise,
  eventsPage,
  isUser = true,
}: EventsOrganizedProps) => {
  const organizedEvents = use(organizedEventsPromise);
  let userName = "";
  if (!isUser) {
    userName = organizedEvents.data[0]?.organizer?.firstName;
  }
  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-5">
        <div className="wrapper flex items-center justify-center sm:justify-between">
          <h3 className="h3-bold text-center sm:text-left">
            Events Organized{!isUser && <span> by </span>}
            {userName}
          </h3>
          {isUser && (
            <Button asChild className="button hidden sm:flex">
              <Link href="/events/create">
                <Plus className="mr-1" />{" "}
                <span className="p-medium-18">New</span>
              </Link>
            </Button>
          )}
        </div>
      </section>
      <section className="wrapper my-8">
        <Collection
          data={organizedEvents.data}
          emptyTitle="No Events"
          emptyStateSubtext="Go create some events!"
          collectionType="Events_Organized"
          limit={3}
          page={eventsPage}
          urlParamName="eventsPage"
          totalPages={organizedEvents.totalPages}
        />
      </section>
    </>
  );
};

export default function EventsOrganizedWrapper(props: EventsOrganizedProps) {
  return (
    <Suspense fallback={<Loader />}>
      <EventsOrganized {...props} />
    </Suspense>
  );
}
