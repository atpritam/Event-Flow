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
  };

  return (
    <ShadcnPagination className="flex justify-center gap-2 mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={() => onPageChange(page - 1)} href="#" />
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
        {page > 2 && (
          <PaginationItem>
            <PaginationLink href="#" onClick={() => onPageChange(page)}>
              {page}
            </PaginationLink>
          </PaginationItem>
        )}
        {page < totalPages && (
          <PaginationItem>
            <PaginationLink href="#" onClick={() => onPageChange(totalPages)}>
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationNext onClick={() => onPageChange(page + 1)} href="#" />
        </PaginationItem>
      </PaginationContent>
    </ShadcnPagination>
  );
};

export default Pagination;
