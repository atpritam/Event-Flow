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
        <>
          <div className="flex flex-col items-center gap-10">
            <ul className="grid w-full grid-cols-1 gap:5 sm:grid-col-2 lg:grid-cols-3 xl:gap-10">
              {data?.map((event) => {
                const hasOrderLink = collectionType === "Events_Organized";
                const hidePrice = collectionType === "My_Tickets";

                return (
                  <li key={event._id} className="flex justify-center">
                    <EventCard
                      event={event}
                      hasOrderLink={hasOrderLink}
                      hidePrice={hidePrice}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
          {totalPages && totalPages > 1 && (
            <PaginationStyle
              limit={limit}
              page={page}
              totalPages={totalPages}
              urlParamName={urlParamName}
            />
          )}
        </>
      ) : (
        <EmptyState title={emptyTitle} subtext={emptyStateSubtext} />
      )}
    </>
  );
};

export default Collection;
