import { Calendar, User, Hash } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface TicketDetailsProps {
  eventName: string;
  eventDate: string;
  attendeeName: string;
  orderId: string;
  ShowDate?: boolean;
}

export function TicketDetails({
  eventName,
  eventDate,
  attendeeName,
  orderId,
  ShowDate = true,
}: TicketDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">{eventName}</h2>
        {ShowDate && (
          <div className="flex items-center mt-2 text-gray-600">
            <Calendar className="w-5 h-5 mr-2" />
            <p>{new Date(eventDate).toLocaleString()}</p>
          </div>
        )}
      </div>
      <Separator />
      <div className="flex justify-between flex-col md:flex-row md:gap-0 gap-5">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Attendee</h3>
          <div className="flex items-center mt-1">
            <User className="w-5 h-5 mr-2 text-gray-400" />
            <p className="text-lg font-medium">{attendeeName}</p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Order ID</h3>
          <div className="flex items-center mt-1">
            <Hash className="w-5 h-5 mr-2 text-gray-400" />
            <p className="text-lg font-medium">{orderId}</p>
          </div>
        </div>
      </div>
      <Separator />
    </div>
  );
}
