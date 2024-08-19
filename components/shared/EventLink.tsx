"use client";

import Link from "next/link";
import React, { useState } from "react";
import Loader from "@/components/shared/Loader";

const EventLink = ({
  href,
  children,
  className,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    if (onClick) {
      onClick();
    }
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <Link href={href} onClick={handleClick} className={className}>
          {children}
        </Link>
      )}
    </>
  );
};

export default EventLink;
