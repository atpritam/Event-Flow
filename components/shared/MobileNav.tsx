import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import NavItems from "./NavItems";
import Link from "next/link";

const MobileNav = () => {
  return (
    <nav className="md:hidden">
      <Sheet>
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
          <Image
            src="/assets/images/logo.svg"
            alt="logo"
            width={128}
            height={38}
          ></Image>
          <Separator />
          <NavItems />
          <button className="md:hidden flex justify-start mt-[-6px]">
            <Link href="/create-event">
              <span className=" flex-center p-medium-16 whitespace-nowrap">
                Donate
              </span>
            </Link>
          </button>
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default MobileNav;
