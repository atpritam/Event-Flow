"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import NavItems from "./NavItems";
import Link from "next/link";

const MobileNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="align-middle md:hidden">
            <Image
              src="/assets/icons/menu.svg"
              width={24}
              height={24}
              alt="Menu"
              className="cursor-pointer"
            />
          </SheetTrigger>
          <SheetContent className="flex flex-col gap-6 bg-white md:hidden">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <Image
              src="/assets/images/logo.svg"
              alt="logo"
              width={128}
              height={38}
            />
            <Separator />
            <NavItems setOpen={setOpen} />
            <button
              className="md:hidden flex justify-start mt-[-6px]"
              onClick={() => setOpen(false)}
            >
              <Link href="https://buymeacoffee.com/pritamchk" target="_blank">
                <span className="flex-center p-medium-16 whitespace-nowrap">
                  Donate
                </span>
              </Link>
            </button>
          </SheetContent>
        </Sheet>
      </nav>
    </>
  );
};

export default MobileNav;
