import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Loader from "@/components/shared/Loader";
import CategoryFilter from "@/components/shared/CategoryFilter";
import Search from "@/components/shared/Search";
import { Button } from "@/components/ui/button";
import { getAllEvents } from "@/lib/actions/event.actions";
import { SearchParamProps } from "../types";
import Image from "next/image";
import Link from "next/link";

// Dynamically import the Collection component
const Collection = dynamic(() => import('@/components/shared/Collection'), {
  loading: () => <Loader />,
  ssr: true
});

export default async function Home({ searchParams }: SearchParamProps) {
  const page = Number(searchParams?.page) || 1;
  const searchText = (searchParams?.query as string) || "";
  const category = (searchParams?.category as string) || "";

  const events = await getAllEvents({
    query: searchText,
    category,
    page,
    limit: 6,
  });

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-contain py-5 md:py-10 sm:px-2">
        <div className="wrapper grid grid-cols-1 gap-5 md:grid-cols-2 2xl:gap-0">
          <div className="flex flex-col justify-center gap-8">
            <h1 className="h1-bold">
              Host, Connect, Celebrate: Your Events, Our Platform!
            </h1>
            <p className="p-regular-20 md:p-regular-24">
              Book and learn helpful tips from 3,168+ mentors in world-class
              companies with our global community.
            </p>
            <Button size="lg" asChild className="button w-full sm:w-fit">
              <Link href="#events">Explore Now</Link>
            </Button>
          </div>

          <Image
            src="/assets/images/hero.png"
            alt="hero"
            width={600}
            height={600}
            priority={true}
            className="max-h-[70vh] object-contain object-center 2xl:max-h-[50vh]"
          />
        </div>
      </section>

      <section
        id="events"
        className="wrapper my-8 flex flex-col gap-8 md:gap-12"
      >
        <h2 className="h2-bold px-2">
          Trust by <br className="md:hidden" /> Thousands of Events
        </h2>

        <div className="flex w-full flex-col gap-5 md:flex-row sm:px-2">
          <Search placeholder="Search Events" />
          <CategoryFilter />
        </div>

        <Suspense fallback={<Loader />}>
          <Collection
            data={events?.data}
            emptyTitle="No Events Found"
            emptyStateSubtext="Come back later"
            collectionType="All"
            limit={6}
            page={page}
            totalPages={events?.totalPages}
          />
        </Suspense>
      </section>
    </>
  );
}