"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { formUrlQuery } from "@/lib/utils";
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type PaginationProps = {
  limit: number;
  page: number;
  totalPages: number;
  urlParamName?: string;
};

const Pagination = ({
  page,
  totalPages,
  urlParamName = "page",
}: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onPageChange = (newPage: number) => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: urlParamName,
      value: newPage.toString(),
    });

    router.push(newUrl, { scroll: false });

    setTimeout(() => {
      const eventsSection = document.getElementById("events");
      if (eventsSection) {
        eventsSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 1);
  };

  return (
    <ShadcnPagination className="flex justify-center gap-2 mt-4">
      <PaginationContent>
        <PaginationItem>
          {page > 1 ? (
            <PaginationPrevious
              onClick={() => onPageChange(page - 1)}
              className="cursor-pointer"
            />
          ) : (
            <PaginationPrevious
              aria-disabled="true"
              className="cursor-not-allowed opacity-50"
            />
          )}
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            isActive={page === 1}
            href="#"
            onClick={() => onPageChange(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>
        {totalPages > 1 && (
          <PaginationItem>
            <PaginationLink
              isActive={page === 2}
              href="#"
              onClick={() => onPageChange(2)}
            >
              2
            </PaginationLink>
          </PaginationItem>
        )}
        {page < totalPages ? (
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(page + 1)}
              className="cursor-pointer"
            />
          </PaginationItem>
        ) : (
          <PaginationItem>
            <PaginationNext
              aria-disabled="true"
              className="cursor-not-allowed opacity-50"
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </ShadcnPagination>
  );
};

export default Pagination;
