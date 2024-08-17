import { CollectionProps } from "@/app/types";
import React from "react";
import EmptyState from "./EmptyState";
import EventCard from "./EventCard";
import PaginationStyle from "./Pagination";

const Collection = ({
  data,
  emptyTitle,
  emptyStateSubtext,
  collectionType,
  limit,
  page,
  totalPages,
  urlParamName,
}: CollectionProps) => {
  return (
    <>
      {data?.length > 0 ? (
        <div className="flex flex-col items-center gap-10">
          <ul className="grid w-full grid-cols-1 gap:5 sm:grid-col-2 lg:grid-cols-3 xl:gap-10">
            {data?.map((event) => {
              const hasOrderLink = collectionType === "Events_Organized";
              const hidePrice = collectionType === "My_Tickets";

              return (
                <EventCard
                  key={event._id}
                  event={event}
                  hasOrderLink={hasOrderLink}
                  hidePrice={hidePrice}
                />
              );
            })}
          </ul>
        </div>
      ) : (
        <EmptyState title={emptyTitle} subtext={emptyStateSubtext} />
      )}
      <PaginationStyle
        limit={limit}
        page={page}
        totalPages={totalPages}
        urlParamName={urlParamName}
      />
    </>
  );
};

export default Collection;
