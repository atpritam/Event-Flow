import { SearchParamProps, UpdateEventParams } from "@/app/types";
import EventForm from "@/components/shared/EventForm";
import { getEventById } from "@/lib/actions/event.actions";
import { getUserIDByClerkId } from "@/lib/actions/user.actions";
import { auth } from "@clerk/nextjs/server";
import React from "react";

const UpdateEvent = async ({ params }: SearchParamProps) => {
  const eventId = params.id;
  const { sessionClaims } = auth();
  const id = sessionClaims?.userID as string;
  const userId = await getUserIDByClerkId(id);

  const event = await getEventById(eventId);

  const isUserAuthorized = userId === event.organizer._id;

  return (
    <>
      {!isUserAuthorized ? (
        <div className="wrapper my-8">
          <h3 className="h3-bold text-center">
            You are not authorized to update this event
          </h3>
        </div>
      ) : (
        <>
          <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
            <h3 className="wrapper h3-bold text-center sm:text-left">
              Update Event
            </h3>
          </section>
          <div className="wrapper my-8">
            <EventForm userId={userId} type="Update" event={event} />
          </div>
        </>
      )}
    </>
  );
};

export default UpdateEvent;
