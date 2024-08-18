"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface TicketInfoType {
  eventId: string;
  eventName: string;
  eventDate: string;
  attendeeName: string;
  orderId: string;
}

const TicketInfo = () => {
  const searchParams = useSearchParams();
  const [ticketInfo, setTicketInfo] = useState<TicketInfoType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      validateTicket(data);
    }
  }, [searchParams]);

  const validateTicket = async (data: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/validate-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data,
      });
      const result = await response.json();
      if (!response.ok || !result.isValid) {
        throw new Error(result.error || "Failed to validate ticket");
      }
      setTicketInfo(result.ticketInfo);
    } catch (err) {
      setError("Error validating ticket");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-4">Validating ticket...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!ticketInfo) {
    return <div className="p-4">No valid ticket information found.</div>;
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-auto border-4 border-dashed border-gray-300">
      <h1 className="text-3xl font-bold mb-6 text-center">Event Ticket</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Event</h2>
          <p>{ticketInfo.eventName}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Date</h2>
          <p>
            {new Date(ticketInfo.eventDate).toLocaleString(undefined, {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
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
      <div className="mt-8 border-t-2 border-dashed border-gray-300 pt-4 text-center">
        <p className="text-sm text-gray-400">Thank you for your purchase!</p>
      </div>
    </div>
  );
};

export default TicketInfo;
