"use client";

import { headerLinks } from "@/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface NavItemsParams {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}
const NavItems = ({ setOpen }: NavItemsParams) => {
  const pathname = usePathname();

  const handleClick = () => {
    if (setOpen) {
      setOpen(false);
    }
  };

  return (
    <ul className="md:flex-between flex w-full flex-col items-start gap-5 md:flex-row">
      {headerLinks.map((link, i) => {
        const isActive = pathname === link.route;
        return (
          <li
            key={i}
            className={`${
              isActive && "text-primary-500"
            } flex-center p-medium-16 whitespace-nowrap`}
          >
            <Link href={link.route} onClick={handleClick}>
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default NavItems;
