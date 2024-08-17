import { IEvent } from "@/lib/database/models/event.model";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import DeleteConfirmation from "./DeleteConfirmation";

const EventCard = ({
  event,
  hasOrderLink,
  hidePrice,
}: {
  event: IEvent;
  hasOrderLink?: boolean;
  hidePrice?: boolean;
}) => {
  const { sessionClaims } = auth();
  const isEventCreator = sessionClaims?.userID === event.organizer.clerkId;
  return (
    <div className="group relative flex min-h-[380px] w-full max-w-[400px] flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg md:min-h-[438px]">
      <Link
        href={`/events/${event._id}`}
        style={{ backgroundImage: `url(${event.imageUrl})` }}
        className="flex flex-center bg-grey-50 flex-grow bg-cover bg-center text-grey-500"
      />
      {isEventCreator && !hidePrice && (
        <div className="absolute right-2 top-2 flex flex-col gap-4 rounded-xl bg-white p-[10px] shadow-sm transition-all">
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
          <DeleteConfirmation eventId={event._id} />
        </div>
      )}
      <div className="flex min-h-[230px] flex-col gap-3 p-5 md:gap-4">
        {!hidePrice && (
          <div className="flex gap-2">
            <span className="p-semibold-14 w-min rounded-full bg-green-100 px-4 py-1 text-green-900">
              {event.isFree ? "Free" : `$${event.price}`}
            </span>
            <p className="p-semibold-14 w-min rounded-full bg-grey-500/10 px-4 py-1 text-grey-600">
              {event.category.name}
            </p>
          </div>
        )}
        <p className="p-medium-16 text-grey-600">
          {event.startDateTime
            ? formatDateTime(event.startDateTime).dateTime
            : null}
        </p>
        <Link href={`/events/${event._id}`}>
          <p className="p-medium-16 lg:p-medium-20 line-clamp-2 flex-1 text-black">
            {event.title}
          </p>
        </Link>
        <div className="flex-between w-full">
          <Link
            className="p-medium-16 md:p-medium-16 text-grey-500 hover:text-primary-500"
            href={
              isEventCreator ? `/profile` : `/profile/${event.organizer._id}`
            }
          >
            {event.organizer.firstName} {event.organizer.lastName}
          </Link>
          {hasOrderLink && (
            <Link href={`/orders?eventId=${event._id}`} className="flex gap-2">
              <p className="text-primary-500">Order Details</p>
              <Image
                src="/assets/icons/arrow.svg"
                alt="arrow"
                width={10}
                height={10}
                className="transform group-hover:translate-x-[3px] transition-all ease-out duration-150"
              />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
