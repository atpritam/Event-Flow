"use client";

import { IEvent } from "@/lib/database/models/event.model";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import QRCodeComponent from "./QRCodeComponent";

const TicketDialog = ({
  event,
  orderedEventIds,
}: {
  event: IEvent;
  orderedEventIds?: { orderId: string; eventId: string }[];
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <div className="flex items-center gap-1 ">
          <span className="text-primary-500">QR Code</span>
          <Image
            src="/assets/icons/arrow.svg"
            alt="expand"
            width={10}
            height={10}
            className="group-hover:translate-y-[-3px] transition-all ease-out duration-150"
          />
        </div>
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Ticket Booked</AlertDialogTitle>
          <AlertDialogDescription className="p-regular-16 text-grey-600">
            {/* Display QR Code */}
            <span className="flex justify-center mt-4">
              <QRCodeComponent
                event={event}
                orderedEventIds={orderedEventIds}
              />
            </span>
            {/* Display Event Details */}
            <span className="flex flex-col items-center mb-4">
              <span className="text-xl font-semibold mt-2">{event.title}</span>
              <span className="text-gray-500 mt-1">
                Location: {event.location}
              </span>
              <span className="text-gray-500 mt-1">
                Date:{" "}
                {event?.startDateTime &&
                  new Date(event.startDateTime).toLocaleDateString()}{" "}
                -{" "}
                {event?.endDateTime &&
                  new Date(event.endDateTime).toLocaleDateString()}
              </span>
            </span>
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
