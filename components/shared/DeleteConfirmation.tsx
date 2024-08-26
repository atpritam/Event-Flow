"use client";

import React, { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { deleteEvent } from "@/lib/actions/event.actions";

const DeleteConfirmation = ({
  eventId,
  userId,
}: {
  eventId: string;
  userId: string;
}) => {
  const pathname = usePathname();
  let [isPending, startTransition] = useTransition();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDelete = async () => {
    startTransition(async () => {
      const response = await deleteEvent({ eventId, path: pathname, userId });
      if (!response.success) {
        setErrorMessage(response.message);
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      }
    });
  };

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger>
          <Image
            src="/assets/icons/delete.svg"
            alt="delete"
            width={20}
            height={20}
          />
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete?
            </AlertDialogTitle>
            <AlertDialogDescription className="p-regular-16 text-grey-600">
              This will permanently delete this event
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {isPending ? "Deleting" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showError && (
        <Alert
          variant="destructive"
          className="fixed bottom-4 right-4 w-96 transition-opacity duration-300 z-50 bg-white border-2"
        >
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default DeleteConfirmation;
