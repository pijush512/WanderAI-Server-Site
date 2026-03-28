import { model, Schema, Document } from "mongoose";

export interface ITrip extends Document {
  destination: string;
  days: number;
  budget: string;
  travelers: number;
  plan: object; 
  user?: Schema.Types.ObjectId;
}

const tripSchema = new Schema<ITrip>(
  {
    destination: { type: String, required: true },
    days: { type: Number, required: true },
    budget: { type: String, required: true },
    travelers: { type: Number, default: 1 },
    plan: { type: Object, required: true }, 
    user: { type: Schema.Types.ObjectId, ref: "User" }, 
  },
  {
    timestamps: true, 
  }
);

export const Trip = model<ITrip>("Trip", tripSchema);