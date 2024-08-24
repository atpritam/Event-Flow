import { auth } from "@clerk/nextjs/server";
import { getEventsByUser } from "@/lib/actions/event.actions";
import { getOrdersByUser } from "@/lib/actions/order.action";
import ProfilePageContent from "./ProfilePageContent";
import { SearchParamProps } from "@/app/types";

export default async function ProfilePage({ searchParams }: SearchParamProps) {
  const { sessionClaims } = auth();
  const userId = sessionClaims?.userId as string;

  const ordersPage = Number(searchParams?.ordersPage) || 1;
  const eventsPage = Number(searchParams?.eventsPage) || 1;

  const organizedEventsPromise = getEventsByUser({
    userId: userId,
    page: eventsPage,
  }).then((data) => data ?? { data: [], totalPages: 0 });

  const ordersPromise = getOrdersByUser({
    userId: userId,
    page: ordersPage,
    limit: 3,
  }).then((data) => data ?? { data: [], totalPages: 0 });

  return (
    <ProfilePageContent
      organizedEventsPromise={organizedEventsPromise}
      ordersPromise={ordersPromise}
      ordersPage={ordersPage}
      eventsPage={eventsPage}
    />
  );
}
