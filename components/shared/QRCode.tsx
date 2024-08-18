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
    eventName: event?.title,
    eventDate: event?.startDateTime,
    attendeeName: `${user?.firstName} ${user?.lastName}`,
    orderId: orderID,
  };

  const encodedTicketInfo = encodeURIComponent(JSON.stringify(ticketInfo));
  const value = `${window.location.origin}/ticket-info?data=${encodedTicketInfo}`;

  return <QRCode value={value} size={200} />;
};

export default QRCodeComponent;
