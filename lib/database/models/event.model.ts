import { model, models, Schema, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  location: string;
  createdAt?: Date;
  imageUrl: string;
  startDateTime?: Date;
  endDateTime?: Date;
  price: number;
  isFree?: boolean;
  url?: string;
  category: Schema.Types.ObjectId;
  organizer: Schema.Types.ObjectId;
}

const EventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  imageUrl: { type: String, required: true },
  startDateTime: { type: Date, required: true, default: Date.now },
  endDateTime: { type: Date, required: true, default: Date.now },
  price: { type: Number, required: true },
  isFree: { type: Boolean, default: false },
  url: { type: String },
  category: { type: Schema.Types.ObjectId, ref: "Category" },
  organizer: { type: Schema.Types.ObjectId, ref: "User" },
});

const Event = models.Event || model("Event", EventSchema);

export default Event;
