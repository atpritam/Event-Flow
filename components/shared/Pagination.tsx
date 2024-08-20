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
  PaginationEllipsis,
} from "@/components/ui/pagination";

type PaginationProps = {
  limit?: number;
  page: number;
  totalPages: number;
  urlParamName?: string;
};

const Pagination = ({
  limit,
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

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={page === i}
              href="#"
              onClick={() => onPageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      pageNumbers.push(
        <PaginationItem key={1}>
          <PaginationLink
            isActive={page === 1}
            href="#"
            onClick={() => onPageChange(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (page > 3) {
        pageNumbers.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) {
        pageNumbers.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={page === i}
              href="#"
              onClick={() => onPageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (page < totalPages - 2) {
        pageNumbers.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      pageNumbers.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            isActive={page === totalPages}
            href="#"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pageNumbers;
  };

  return (
    <ShadcnPagination className="flex justify-center gap-2 mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(page - 1)}
            className={
              page > 1 ? "cursor-pointer" : "cursor-not-allowed opacity-50"
            }
            aria-disabled={page === 1}
          />
        </PaginationItem>
        {renderPageNumbers()}
        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(page + 1)}
            className={
              page < totalPages
                ? "cursor-pointer"
                : "cursor-not-allowed opacity-50"
            }
            aria-disabled={page === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </ShadcnPagination>
  );
};

export default Pagination;
