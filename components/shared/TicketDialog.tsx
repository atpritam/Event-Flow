"use client";

import { IEvent } from "@/lib/database/models/event.model";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import TestQRCode from "./QRCode";

const TicketDialog = ({
  event,
  orderedEventIds,
}: {
  event: IEvent;
  orderedEventIds?: { orderId: string; eventId: string }[];
}) => {
  const qrCodeValue =
    "Thank You for Purchasing your Event ticket from Event Flow!"; // QR code content

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="flex items-center gap-1 ">
          <span className="text-primary-500">QR Code</span>
          <Image
            src="/assets/icons/arrow.svg"
            alt="expand"
            width={10}
            height={10}
            className="group-hover:translate-y-[-3px] transition-all ease-out duration-150"
          />
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Ticket Booked</AlertDialogTitle>
          <AlertDialogDescription className="p-regular-16 text-grey-600">
            {/* Display QR Code */}
            <div className="flex justify-center mt-4">
              <TestQRCode event={event} orderedEventIds={orderedEventIds} />
            </div>
            {/* Display Event Details */}
            <div className="flex flex-col items-center mb-4">
              <h2 className="text-xl font-semibold mt-2">{event.title}</h2>
              <p className="text-gray-500 mt-1">Location: {event.location}</p>
              <p className="text-gray-500 mt-1">
                Date:{" "}
                {event?.startDateTime &&
                  new Date(event.startDateTime).toLocaleDateString()}{" "}
                -{" "}
                {event?.endDateTime &&
                  new Date(event.endDateTime).toLocaleDateString()}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TicketDialog;
