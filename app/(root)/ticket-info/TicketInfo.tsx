"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Calendar, User, Hash, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import html2canvas from "html2canvas";
import Image from "next/image";

interface TicketInfoType {
  eventId: string;
  eventName: string;
  eventDate: string;
  attendeeName: string;
  orderId: string;
}

const TicketInfo = () => {
  const searchParams = useSearchParams();
  const [ticketInfo, setTicketInfo] = useState<TicketInfoType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [valid, setValid] = useState(true);
  const [buttonIcon, setButtonIcon] = useState<"download" | "check">(
    "download"
  );
  const ticketRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    const data = searchParams.get("data");
    if (data) {
      validateTicket(data);
    }
  }, [searchParams]);

  useEffect(() => {
    if (ticketInfo) {
      const eventDate = new Date(ticketInfo.eventDate);
      const now = new Date();
      setValid(now <= eventDate);
    }
  }, [ticketInfo]);

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
    <div className="max-w-2xl w-full mx-auto p-4">
      <Card ref={ticketRef} className="overflow-hidden relative">
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
                    <p className="text-lg font-medium">{ticketInfo?.orderId}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-4 right-20 flex flex-col justify-center items-center">
              {valid ? (
                <>
                  <Check className="w-6 h-6 mr-2 text-white" />
                  <p className="text-sm font-semibold text-white mr-2">Valid</p>
                </>
              ) : (
                <>
                  <X className="w-6 h-6 mr-2 text-white" />
                  <p className="text-sm font-semibold text-white mr-2">
                    Expired
                  </p>
                </>
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
  );
};

export default TicketInfo;
