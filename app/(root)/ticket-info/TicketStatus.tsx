import { Check, X } from "lucide-react";

interface TicketStatusProps {
  valid: boolean;
  markedUsed: boolean;
  usedBefore: boolean;
}

export function TicketStatus({
  valid,
  markedUsed,
  usedBefore,
}: TicketStatusProps) {
  return (
    <div className="text-center mt-8">
      {valid ? (
        <>
          {usedBefore && (
            <div className="text-red-600 font-semibold">
              <X className="w-6 h-6 inline-block mr-2" />
              <span>Used Before</span>
            </div>
          )}
          {!usedBefore && markedUsed && (
            <div className="text-yellow-600 font-semibold">
              <Check className="w-6 h-6 inline-block mr-2" />
              <span>Marked Used</span>
            </div>
          )}
          {!markedUsed && !usedBefore && (
            <div className="text-green-600 font-semibold">
              <Check className="w-6 h-6 inline-block mr-2" />
              <span>Valid Ticket</span>
            </div>
          )}
        </>
      ) : (
        <div className="text-red-600 font-semibold">
          <X className="w-6 h-6 inline-block mr-2" />
          <span>Expired Ticket</span>
        </div>
      )}
    </div>
  );
}
