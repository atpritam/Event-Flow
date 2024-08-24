import Image from "next/image";

export function TicketHeader({ ETextShow = true }: { ETextShow?: boolean }) {
  return (
    <div className="bg-gradient-to-r from-[royalblue] to-purple-600 p-6">
      <Image
        src="/assets/images/logo.svg"
        alt="logo"
        height={100}
        width={100}
        className="mb-4"
      />
      {ETextShow && (
        <h1 className="text-3xl font-bold text-white">Event Ticket</h1>
      )}
    </div>
  );
}
