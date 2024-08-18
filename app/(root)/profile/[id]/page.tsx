import Collection from "@/components/shared/Collection";
import { Button } from "@/components/ui/button";
import { getUserIDByClerkId } from "@/lib/actions/user.actions";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import React from "react";
import { Plus } from "lucide-react";
import { getEventsByUser } from "@/lib/actions/event.actions";
import { redirect } from "next/navigation";
import { SearchParamProps } from "@/app/types";

const ProfilePage = async ({ params, searchParams }: SearchParamProps) => {
  const userId = params.id;
  const { sessionClaims } = auth();
  const currentUserClerkId = sessionClaims?.userID as string;
  const currentUserId = await getUserIDByClerkId(currentUserClerkId);
  const isUser = currentUserId === userId;

  if (isUser) {
    redirect("/profile");
  }

  const eventsPage = Number(searchParams?.eventsPage) || 1;

  const organizedEvents = await getEventsByUser({
    userId,
    page: 1,
  });

  return (
    <>
      {/* Events Organized */}
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-5">
        <div className="wrapper flex items-center justify-center sm:justify-between">
          <h3 className="h3-bold text-center sm:text-left">Events Organized</h3>
          <Button asChild className="button hidden sm:flex">
            <Link href="/events/create">
              <Plus className="mr-1" />{" "}
              <span className="p-medium-18">Create</span>
            </Link>
          </Button>
        </div>
      </section>
      <section className="wrapper my-8">
        <Collection
          data={organizedEvents?.data}
          emptyTitle="No Events"
          emptyStateSubtext="Go create some events!"
          collectionType="Events_Organized"
          limit={3}
          page={eventsPage}
          urlParamName="eventsPage"
          totalPages={organizedEvents?.totalPages}
        />
      </section>
    </>
  );
};

export default ProfilePage;
