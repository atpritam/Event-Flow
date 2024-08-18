import { model, models, Schema, Document } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  photo?: string;
  orders?: { _id: string; stripeId: string; event: { _id: string } }[];
}

const UserSchema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  photo: { type: String, required: false },
  orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
});

const User = models.User || model("User", UserSchema);

export default User;
