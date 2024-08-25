"use client";

import { useEffect, useState, useRef, use } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import QRCode from "react-qr-code";
import { useUser } from "@clerk/nextjs";
import { getOrderByID, markOrderAsUsed } from "@/lib/actions/order.action";
import { AutoCheckbox } from "./AutoCheckbox";
import { TicketHeader } from "./TicketHeader";
import { TicketDetails } from "./TicketDetails";
import { TicketStatus } from "./TicketStatus";

interface TicketInfoType {
  eventId: string;
  eventName: string;
  eventDate: string;
  eventEndDateTime: string;
  attendeeName: string;
  orderId: string;
  used: boolean;
}

const TicketInfo = () => {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const userId: string = (user?.publicMetadata?.userId as string) || "";
  const [isUser, setIsUser] = useState(false);
  const [ticketInfo, setTicketInfo] = useState<TicketInfoType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [valid, setValid] = useState(true);
  const [buttonIcon, setButtonIcon] = useState<"download" | "check">(
    "download"
  );
  const [eventId, setEventId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [organizerId, setOrganizerId] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [loadingFeedback, setLoadingFeedback] = useState<string | null>(null);
  const [usedBefore, setUsedBefore] = useState<boolean>(false);
  const [markedUsed, setMarkedUsed] = useState<boolean>(false);
  const [autoMark, setAutoMark] = useState<boolean>(false);

  const ticketRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedAutoMark = localStorage.getItem("autoMark");
    if (storedAutoMark) {
      setAutoMark(JSON.parse(storedAutoMark));
    }

    setIsLoading(true);
    const data = searchParams.get("data");
    if (data) {
      const { eventId, orderId, organizerId } = JSON.parse(data);
      setEventId(eventId);
      setOrderId(orderId);
      setOrganizerId(organizerId as string);
      validateTicket(data);
    }
  }, [searchParams]);

  useEffect(() => {
    const ticketInfo = {
      eventId: eventId,
      orderId: orderId,
      organizerId: organizerId,
    };

    const encodedTicketInfo = encodeURIComponent(JSON.stringify(ticketInfo));
    const value = `${window.location.origin}/ticket-info?data=${encodedTicketInfo}`;
    setValue(value);
  }, [eventId, orderId]);

  useEffect(() => {
    if (!userId || !organizerId) return;
    if (userId === organizerId) {
      setIsUser(true);
    }
  }, [userId, organizerId]);

  useEffect(() => {
    if (ticketInfo) {
      const eventEndDateTime = new Date(ticketInfo.eventEndDateTime);
      const now = new Date();
      setValid(now <= eventEndDateTime);
      setUsedBefore(ticketInfo.used);
    }
  }, [ticketInfo]);

  useEffect(() => {
    if (autoMark && !markedUsed && ticketInfo && !usedBefore) {
      handleMarkAsUsed();
    }
  }, [autoMark, markedUsed, usedBefore, ticketInfo]);

  const validateTicket = async (data: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/validate-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data,
      });
      const result = await response.json();
      if (!response.ok || !result.isValid) {
        setValid(false);
        throw new Error(result.error || "Failed to validate ticket");
      }
      setTicketInfo(result.ticketInfo);
    } catch (err) {
      setError("Error validating ticket");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTicketAsImage = async () => {
    if (contentRef.current) {
      setButtonIcon("check");

      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `ticket-${ticketInfo?.eventName}.png`;
      link.click();

      setTimeout(() => {
        setButtonIcon("download");
      }, 900);
    }
  };

  const handleMarkAsUsed = async () => {
    setLoadingFeedback("Processing...");
    setError(null);

    try {
      const orderId = ticketInfo?.orderId;
      if (!orderId) {
        throw new Error("Order ID is not available.");
      }

      const order = await getOrderByID(orderId, userId);
      if (!order) {
        throw new Error("Order not found.");
      }

      if (order.used) {
        setUsedBefore(true);
        setMarkedUsed(false);
        return;
      }

      const updatedOrder = await markOrderAsUsed(orderId, userId);

      if (updatedOrder?.used) {
        setMarkedUsed(true);
        setUsedBefore(false);
      } else {
        throw new Error("Failed to mark ticket as used.");
      }
    } catch (err) {
      setError("Failed to mark ticket as used.");
      console.error(err);
    } finally {
      setLoadingFeedback(null);
    }
  };

  const handleAutoMarkChange = (checked: boolean) => {
    setAutoMark(checked);
    localStorage.setItem("autoMark", JSON.stringify(checked));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-lg mx-auto mt-8 p-4">
        <CardContent>
          <h2 className="text-xl font-semibold text-red-500 mb-2">
            Validation Error
          </h2>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!ticketInfo) {
    return (
      <Card className="max-w-lg mx-auto mt-8 p-4">
        <CardContent>
          <p className="text-lg">No valid ticket information found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {isUser ? (
        <>
          {!markedUsed && !usedBefore && (
            <div className="sm:hidden flex justify-center">
              <Button
                id="mark-used-button"
                onClick={handleMarkAsUsed}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {loadingFeedback ? "Processing" : "Mark as Used"}
              </Button>
            </div>
          )}

          <div className="max-w-2xl w-full mx-auto p-4 md:w-[600px]">
            <Card className="overflow-hidden relative shadow-md">
              <TicketHeader ETextShow={false} />
              <CardContent className="p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Event</h1>
                <div className="space-y-6">
                  <TicketDetails
                    eventName={ticketInfo.eventName}
                    eventDate={ticketInfo.eventDate}
                    attendeeName={ticketInfo.attendeeName}
                    orderId={ticketInfo.orderId}
                    ShowDate={false}
                  />
                  <TicketStatus
                    valid={valid}
                    markedUsed={markedUsed}
                    usedBefore={usedBefore}
                  />

                  {error && (
                    <div className="mt-4 text-red-600 font-semibold text-center">
                      {error}
                    </div>
                  )}
                </div>
              </CardContent>
              {isUser && !markedUsed && !usedBefore && (
                <div className="absolute sm:top-4 sm:right-4 hidden sm:block">
                  <Button
                    id="mark-used-button"
                    onClick={handleMarkAsUsed}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    {loadingFeedback ? "Processing" : "Mark as Used"}
                  </Button>
                </div>
              )}
            </Card>
            <AutoCheckbox
              isChecked={autoMark}
              onChange={handleAutoMarkChange}
            />
          </div>
        </>
      ) : (
        <div className="max-w-2xl w-full mx-auto p-4">
          <Card
            ref={ticketRef}
            className="overflow-hidden relative sm:w-[600px]"
          >
            <div ref={contentRef}>
              <TicketHeader />
              <CardContent className="p-6">
                <TicketDetails
                  eventName={ticketInfo.eventName}
                  eventDate={ticketInfo.eventDate}
                  attendeeName={ticketInfo.attendeeName}
                  orderId={ticketInfo.orderId}
                />
                <div className="space-y-6">
                  {value && (
                    <div className="text-center mt-4 flex justify-center">
                      <QRCode value={value} size={128} />
                    </div>
                  )}
                </div>
                <TicketStatus
                  valid={valid}
                  markedUsed={markedUsed}
                  usedBefore={usedBefore}
                />
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500">
                    Thank you for your purchase!
                  </p>
                </div>
              </CardContent>
            </div>
            <Button
              id="download-button"
              onClick={downloadTicketAsImage}
              className="absolute top-4 right-4 bg-white text-blue-600 hover:bg-gray-100"
            >
              {buttonIcon === "download" ? (
                <Download className="w-5 h-5" />
              ) : (
                <Check className="w-5 h-5 text-green-600" />
              )}
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TicketInfo;
