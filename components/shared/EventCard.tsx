"use client";

import { IEvent } from "@/lib/database/models/event.model";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import DeleteConfirmation from "./DeleteConfirmation";
import TicketDialog from "./TicketDialog";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import Loader from "./Loader";
import { usePathname } from "next/navigation";
import ClientRender from "./ClientRender";

const EventCard = ({
  event,
  hasOrderLink,
  hidePrice,
  orderedEventIds,
}: {
  event: IEvent;
  hasOrderLink?: boolean;
  hidePrice?: boolean;
  orderedEventIds?: { orderId: string; eventId: string }[];
}) => {
  const pathname = usePathname();
  const isProfilePage = pathname.includes("/profile");
  const { user } = useUser();
  const userId = user?.publicMetadata.userId;
  const isEventCreator = userId === event.organizer._id;
  const [loading, setLoading] = useState(false);
  const organizerName = `${event.organizer.firstName} ${event.organizer.lastName}`;
  const organizerProfileUrl = isEventCreator
    ? `/profile`
    : `/profile/${event.organizer._id}`;

  return (
    <>
      {loading && <Loader />}
      <div className="group relative flex min-h-[380px] w-full max-w-[400px] flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg md:min-h-[438px]">
        <Link
          href={`/events/${event._id}`}
          style={{ backgroundImage: `url(${event.imageUrl})` }}
          className="flex flex-center bg-grey-50 flex-grow bg-cover bg-center text-grey-500"
          onClick={() => setLoading(true)}
        />
        {isEventCreator && !hidePrice && (
          <div className="absolute right-2 top-2 flex flex-col gap-4 rounded-xl bg-white p-[10px] shadow-sm transition-all">
            <Link
              href={`/events/${event._id}/update`}
              className="flex justify-center items-center"
              onClick={() => setLoading(true)}
            >
              <Image
                src="/assets/icons/edit.svg"
                alt="edit"
                width={20}
                height={20}
              />
            </Link>
            <DeleteConfirmation eventId={event._id} userId={userId as string} />
          </div>
        )}
        <div className="flex min-h-[230px] flex-col gap-3 p-5 md:gap-4">
          {!hidePrice && (
            <div className="flex gap-2">
              <span className="p-semibold-14 w-min rounded-full bg-green-100 px-4 py-1 text-green-900">
                {event.isFree ? "Free" : `$${event.price}`}
              </span>
              <span className="p-semibold-14 w-min rounded-full bg-grey-500/10 px-4 py-1 text-grey-600">
                {event.category.name}
              </span>
            </div>
          )}
          <ClientRender>
            {" "}
            <p className="p-medium-16 text-grey-600">
              {event.startDateTime
                ? formatDateTime(event.startDateTime).dateTime
                : null}
            </p>
          </ClientRender>

          <Link href={`/events/${event._id}`} onClick={() => setLoading(true)}>
            <p className="p-medium-16 lg:p-medium-20 line-clamp-2 flex-1 text-black">
              {event.title}
            </p>
          </Link>
          <div className="flex-between w-full">
            {!isProfilePage ? (
              <Link
                className="p-medium-16 md:p-medium-16 text-grey-500 hover:text-primary-500"
                href={organizerProfileUrl}
                onClick={() => setLoading(true)}
              >
                {organizerName}
              </Link>
            ) : (
              <span className="p-medium-16 md:p-medium-16 text-grey-500 cursor-pointer">
                {organizerName}
              </span>
            )}

            {hasOrderLink && isEventCreator && (
              <Link
                href={`/orders?eventId=${event._id}`}
                className="flex gap-2"
                onClick={() => setLoading(true)}
              >
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
            {!hasOrderLink && hidePrice && (
              <TicketDialog event={event} orderedEventIds={orderedEventIds} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EventCard;
