import { SearchParamProps } from "@/app/types";
import CheckoutButton from "@/components/shared/CheckoutButton";
import Collection from "@/components/shared/Collection";
import {
  checkValidity,
  getEventById,
  getRelatedEventsByCategory,
} from "@/lib/actions/event.actions";
import { formatDateTime } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import React from "react";
import EventLink from "@/components/shared/EventLink";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteConfirmation from "@/components/shared/DeleteConfirmation";
import ClientRender from "@/components/shared/ClientRender";
import EventDate from "./EventDate";

const EventDetails = async ({ params, searchParams }: SearchParamProps) => {
  const eventId = params.id;

  const event = await getEventById(eventId);

  const { sessionClaims } = auth();
  const userId = sessionClaims?.userId;
  const isEventCreator = userId === event.organizer._id;

  const relatedEvents = await getRelatedEventsByCategory({
    categoryId: event.category._id,
    eventId,
    page: searchParams.page as string,
  });

  const isAvailable = await checkValidity(eventId);
  const ticketsAvailable = isAvailable?.ticketsAvailable;

  return (
    <>
      <section className="flex justify-center bg-primary-50 bg-dotted-pattern bg-contain">
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:max-w-7xl">
          <Image
            src={event.imageUrl}
            alt="Event Image"
            width={1000}
            height={1000}
            className="h-full h-min-[300px] object-cover"
          />
          <div className="flex flex-col w-full gap-8 p-5 md:p-10">
            <div className="flex flex-col gap-6">
              <h2 className="h2-bold">{event.title}</h2>
              <div className="flex flex-col gap-4 sm:flex-col sm:items-start">
                <div className="flex gap-6">
                  <div className="flex gap-3">
                    <p className="p-bold-20 rounded-full bg-green-500/10 px-5 py-2 text-green-700">
                      {event.isFree ? "Free" : `$${event.price}`}
                    </p>
                    <p className="p-medium-16 rounded-full bg-grey-500/10 px-4 py-2.5 text-grey-500">
                      {event.category.name}
                    </p>
                  </div>
                  {isEventCreator && (
                    <div
                      className="flex flex-row gap-2"
                      style={{ transform: "scale(1.4)" }}
                    >
                      <Link
                        href={`/events/${event._id}/update`}
                        className="flex justify-center items-center"
                      >
                        <Image
                          src="/assets/icons/edit.svg"
                          alt="edit"
                          width={20}
                          height={20}
                        />
                      </Link>
                      <DeleteConfirmation
                        eventId={event._id}
                        userId={userId as string}
                      />
                    </div>
                  )}
                </div>
                <div className="p-medium-18 ml-2 sm:mt-0 flex flex-row items-center">
                  <span>by</span>
                  <EventLink
                    href={
                      isEventCreator
                        ? `/profile`
                        : `/profile/${event.organizer._id}`
                    }
                    className="text-primary-500 ml-1"
                  >
                    {event.organizer.firstName} {event.organizer.lastName}
                  </EventLink>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:gap-4">
              <div className="flex flex-row gap-4 justify-start">
                {ticketsAvailable && <CheckoutButton event={event} />}
                {isEventCreator && (
                  <EventLink
                    href={`/orders?eventId=${event._id}`}
                    className="flex gap-2"
                  >
                    <Button type="submit" role="link" className="sm:w-fit">
                      View Orders
                    </Button>
                  </EventLink>
                )}
              </div>
            </div>
            {!ticketsAvailable && (
              <p className="text-red-500 font-bold flex sm:justify-start">
                This event has already finished.
              </p>
            )}
            <div className="flex flex-col gap-5 ">
              <div className="flex gap-2 md:gap-3">
                <Image
                  src="/assets/icons/calendar.svg"
                  alt="Calendar Icon"
                  width={32}
                  height={32}
                />
                <EventDate
                  eventStartDateTime={event.startDateTime}
                  eventEndDateTime={event.endDateTime}
                />
              </div>
              <div className="p-regular-20 flex flex-row items-center gap-3">
                <Image
                  src="/assets/icons/location.svg"
                  alt="Location Icon"
                  width={32}
                  height={32}
                />
                <p className="p-medium-16 lg:p-regular-20">{event.location}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="p-bold-20 text-grey-600">What is it about?</p>
              <p className="p-medium-16 lg:p-regular-18 text-grey-500">
                {event.description}
              </p>
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-medium-16 lg:p-regular-18 truncate text-primary-500 underline inline-block w-full"
              >
                {event.url}
              </a>
            </div>
          </div>
        </div>
      </section>
      <section className="wrapper my-8 flex flex-col gap-8 md:gap-12">
        <h2 className="h2-bold">Related Events</h2>
        <Collection
          data={relatedEvents?.data}
          emptyTitle="No related events found"
          emptyStateSubtext="Please check back later."
          collectionType="All"
          limit={3}
          page={searchParams.page as unknown as number}
          totalPages={relatedEvents?.totalPages}
        />
      </section>
    </>
  );
};

export default EventDetails;
