"use client";
import Collection from "@/components/shared/Collection";
import Loader from "@/components/shared/Loader";
import { IEvent } from "@/lib/database/models/event.model";
import React, { Suspense, use } from "react";

interface HomePageCollectionProps {
  eventsPromise: Promise<{ data: IEvent[]; totalPages: number }>;
  page: number;
}
const HomePageCollection = ({
  eventsPromise,
  page,
}: HomePageCollectionProps) => {
  const events = use(eventsPromise);
  return (
    <Collection
      data={events?.data}
      emptyTitle="No Events Found"
      emptyStateSubtext="Come back later"
      collectionType="All"
      limit={6}
      page={page}
      totalPages={events?.totalPages}
    />
  );
};

export default function HomePageCollectionWrapper(
  props: HomePageCollectionProps
) {
  return (
    <Suspense fallback={<Loader />}>
      <HomePageCollection {...props} />
    </Suspense>
  );
}
