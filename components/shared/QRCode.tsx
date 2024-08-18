import { IEvent } from "@/lib/database/models/event.model";
import { useUser } from "@clerk/nextjs";
import React from "react";
import QRCode from "react-qr-code";

const QRCodeComponent = ({ event }: { event: IEvent }) => {
  const { user } = useUser();
  const userId = user?.publicMetadata.userId;
  const eventId = event?._id || null;

  const value = `Hello World `;

  return <QRCode value={value} size={200} />;
};

export default QRCodeComponent;
