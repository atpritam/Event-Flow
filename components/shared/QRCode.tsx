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
  const { user } = useUser();
  const eventId = event?._id || null;
  const orderID = orderedEventIds?.find(
    (order) => order.eventId === eventId
  )?.orderId;

  const ticketInfo = {
    eventId: eventId,
    orderId: orderID,
  };

  const encodedTicketInfo = encodeURIComponent(JSON.stringify(ticketInfo));
  const value = `${window.location.origin}/ticket-info?data=${encodedTicketInfo}`;

  return (
    <div className="flex flex-col gap-2">
      <QRCode value={value} size={200} />
      <a href={value} target="_blank" rel="noreferrer" className="self-center">
        <p className="text-primary-500 underline">View Ticket</p>
      </a>
    </div>
  );
};

export default QRCodeComponent;
