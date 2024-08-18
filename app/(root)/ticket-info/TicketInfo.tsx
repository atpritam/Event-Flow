"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface TicketInfoType {
  eventName: string;
  eventDate: string;
  attendeeName: string;
  orderId: string;
}

const TicketInfo = () => {
  const searchParams = useSearchParams();
  const [ticketInfo, setTicketInfo] = useState<TicketInfoType | null>(null);

  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      try {
        const decodedData = JSON.parse(
          decodeURIComponent(data)
        ) as TicketInfoType;
        setTicketInfo(decodedData);
      } catch (error) {
        console.error("Error parsing ticket data:", error);
      }
    }
  }, [searchParams]);

  if (!ticketInfo) {
    return <div className="p-4">Loading ticket information...</div>;
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <h1 className="text-3xl font-bold mb-6 text-center">Event Ticket</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Event</h2>
          <p>{ticketInfo.eventName}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Date</h2>
          <p>{new Date(ticketInfo.eventDate).toLocaleString()}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Attendee</h2>
          <p>{ticketInfo.attendeeName}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Order ID</h2>
          <p>{ticketInfo.orderId}</p>
        </div>
      </div>
    </div>
  );
};

export default TicketInfo;
