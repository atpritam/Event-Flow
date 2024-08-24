import { SearchParamProps, UpdateEventParams } from "@/app/types";
import EventForm from "@/components/shared/EventForm";
import { getEventById } from "@/lib/actions/event.actions";
import { auth } from "@clerk/nextjs/server";
import React from "react";

const UpdateEvent = async ({ params }: SearchParamProps) => {
  const eventId = params.id;
  const { sessionClaims } = auth();
  const userId = sessionClaims?.userId as string;

  const eventPromise = getEventById(eventId);

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">
          Update Event
        </h3>
      </section>
      <div className="wrapper my-8">
        <EventForm userId={userId} type="Update" eventPromise={eventPromise} />
      </div>
    </>
  );
};

export default UpdateEvent;
