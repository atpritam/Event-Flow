import { getUserIDByClerkId } from "@/lib/actions/user.actions";
import { IEvent } from "@/lib/database/models/event.model";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import Checkout from "./Checkout";

const CheckoutButton = async ({ event }: { event: IEvent }) => {
  const { sessionClaims } = auth();
  const id = sessionClaims?.userID as string;
  let userId = null;
  if (id) {
    userId = await getUserIDByClerkId(id);
  }

  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        <Button asChild>
          <Link href="/sign-in">Get Tickets</Link>
        </Button>
      </SignedOut>
      <SignedIn>
        <Checkout event={event} userId={userId} />
      </SignedIn>
    </div>
  );
};

export default CheckoutButton;
