import React from "react";
import QRCode from "react-qr-code";
import { IEvent } from "@/lib/database/models/event.model";
import { useUser } from "@clerk/nextjs";

const QRCodeComponent = ({
  event,
  orderedEventIds,
}: {
  event: IEvent;
  orderedEventIds?: { orderId: string; eventId: string }[];
}) => {
  const eventId = event?._id || null;
  const orderID = orderedEventIds?.find(
    (order) => order.eventId === eventId
  )?.orderId;
  const organizerId = event?.organizer?._id;

  const ticketInfo = {
    eventId: eventId,
    orderId: orderID,
    organizerId: organizerId,
  };

  const encodedTicketInfo = encodeURIComponent(JSON.stringify(ticketInfo));
  const value = `${window.location.origin}/ticket-info?data=${encodedTicketInfo}`;

  return (
    <span className="flex flex-col gap-4">
      <QRCode value={value} size={200} />
      <a href={value} target="_blank" rel="noreferrer" className="self-center">
        <span className="text-primary-500 py-2 px-2.5 p-medium-18 rounded-md">
          View Ticket
        </span>
      </a>
    </span>
  );
};

export default QRCodeComponent;
