"use client";

import { IEvent } from "@/lib/database/models/event.model";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";

import { loadStripe } from "@stripe/stripe-js";
import { checkoutOrder } from "@/lib/actions/order.action";
import Loader from "./Loader";

loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const Checkout = ({
  event,
  userId,
}: {
  event: IEvent;
  userId: string | null;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      console.log("Order placed! You will receive an email confirmation.");
    }

    if (query.get("canceled")) {
      console.log(
        "Order canceled -- continue to shop around and checkout when you’re ready."
      );
    }
  }, []);
  const onCheckout = async () => {
    const order = {
      eventTitle: event.title,
      eventId: event._id,
      price: event.price,
      isFree: event.isFree,
      buyerId: userId,
    };

    await checkoutOrder(order);
  };

  return (
    <>
      {isLoading && <Loader />}
      <form
        method="post"
        action={onCheckout}
        onClick={() => setIsLoading(true)}
      >
        <Button type="submit" role="link" className="sm:w-fit">
          {event.isFree ? "Get Tickets" : "Buy Tickets"}
        </Button>
      </form>
    </>
  );
};

export default Checkout;
