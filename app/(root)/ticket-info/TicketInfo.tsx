"use client";

import { useEffect, useState, useRef, use } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Calendar, User, Hash, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import html2canvas from "html2canvas";
import Image from "next/image";
import QRCode from "react-qr-code";
import { useUser } from "@clerk/nextjs";
import { getOrderByID, markOrderAsUsed } from "@/lib/actions/order.action";
import { Checkbox } from "@/components/ui/checkbox";

export function AutoCheckbox({
  isChecked,
  onChange,
}: {
  isChecked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <Checkbox id="auto" checked={isChecked} onCheckedChange={onChange} />
      <label
        htmlFor="auto"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Auto mark scanned tickets as used.
      </label>
    </div>
  );
}

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
  const userId = user?.publicMetadata.userId || null;
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
  const [organizerId, setOrganizerId] = useState<string | null>(null);
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
      setOrganizerId(organizerId);
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

      const order = await getOrderByID(orderId);
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
            <Card className="overflow-hidden relative">
              <CardContent className="p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Event</h1>
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">
                      {ticketInfo?.eventName}
                    </h2>
                  </div>
                  <Separator />
                  <div className="flex justify-between flex-col gap-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Attendee
                      </h3>
                      <div className="flex items-center mt-1">
                        <User className="w-5 h-5 mr-2 text-gray-400" />
                        <p className="text-lg font-medium">
                          {ticketInfo?.attendeeName}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Order ID
                      </h3>
                      <div className="flex items-center mt-1">
                        <Hash className="w-5 h-5 mr-2 text-gray-400" />
                        <p className="text-lg font-medium">
                          {ticketInfo?.orderId}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Separator />
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
              <div className="bg-gradient-to-r from-[royalblue] to-purple-600 p-6">
                <Image
                  src="/assets/images/logo.svg"
                  alt="logo"
                  height={100}
                  width={100}
                  className="mb-4"
                />
                <h1 className="text-3xl font-bold text-white">Event Ticket</h1>
              </div>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">
                      {ticketInfo?.eventName}
                    </h2>
                    <div className="flex items-center mt-2 text-gray-600">
                      <Calendar className="w-5 h-5 mr-2" />
                      <p>
                        {new Date(ticketInfo?.eventDate!).toLocaleString(
                          undefined,
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between flex-col md:flex-row md:gap-0 gap-5">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Attendee
                      </h3>
                      <div className="flex items-center mt-1">
                        <User className="w-5 h-5 mr-2 text-gray-400" />
                        <p className="text-lg font-medium">
                          {ticketInfo?.attendeeName}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Order ID
                      </h3>
                      <div className="flex items-center mt-1">
                        <Hash className="w-5 h-5 mr-2 text-gray-400" />
                        <p className="text-lg font-medium">
                          {ticketInfo?.orderId}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  {value && (
                    <div className="text-center mt-4 flex justify-center">
                      <QRCode value={value} size={128} />
                    </div>
                  )}
                </div>
                <div className="absolute top-4 right-20 flex flex-col justify-center items-center">
                  {valid ? (
                    markedUsed || usedBefore ? (
                      <div className="text-white font-semibold flex flex-col justify-center items-center">
                        <X className="w-6 h-6 inline-block" />
                        <span>Used</span>
                      </div>
                    ) : (
                      <div className="text-white font-semibold flex flex-col justify-center items-center">
                        <Check className="w-6 h-6 inline-block mr-2" />
                        <span>Valid</span>
                      </div>
                    )
                  ) : (
                    <div className="text-white font-semibold flex flex-col justify-center items-center">
                      <X className="w-6 h-6 inline-block mr-2" />
                      <span>Expired</span>
                    </div>
                  )}
                </div>
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
