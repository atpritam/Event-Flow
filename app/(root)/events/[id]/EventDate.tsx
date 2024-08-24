"use client";

import { formatDateTime } from "@/lib/utils";
import React from "react";

interface EventDateProps {
  eventStartDateTime: Date;
  eventEndDateTime: Date;
}
const EventDate = ({
  eventStartDateTime,
  eventEndDateTime,
}: EventDateProps) => {
  return (
    <div>
      <div className="p-medium-16 lg:p-regular-20 flex flex-wrap items-center">
        <p>{formatDateTime(eventStartDateTime).dateOnly} - </p>
        <p>{formatDateTime(eventEndDateTime).dateOnly}</p>
      </div>
      <div className="p-medium-16 lg:p-regular-20 flex flex-wrap items-center">
        <p>{formatDateTime(eventStartDateTime).timeOnly} - </p>
        <p>{formatDateTime(eventEndDateTime).timeOnly}</p>
      </div>
    </div>
  );
};

export default EventDate;
