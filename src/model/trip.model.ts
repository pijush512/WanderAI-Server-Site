import { model, Schema, Document } from "mongoose";

// টাইপস্ক্রিপ্ট ইন্টারফেস (Optional but recommended)
export interface ITrip extends Document {
  destination: string;
  days: number;
  budget: string;
  travelers: number;
  plan: object; // এআই থেকে আসা পুরো JSON টা এখানে থাকবে
  user?: Schema.Types.ObjectId;
}

const tripSchema = new Schema<ITrip>(
  {
    destination: { type: String, required: true },
    days: { type: Number, required: true },
    budget: { type: String, required: true },
    travelers: { type: Number, default: 1 },
    // এআই এর পাঠানো জটিল অবজেক্ট সেভ করার জন্য Mixed বা Object টাইপ
    plan: { type: Object, required: true }, 
    // যদি আপনি পরে লগইন সিস্টেম যোগ করেন
    user: { type: Schema.Types.ObjectId, ref: "User" }, 
  },
  {
    timestamps: true, // এটি createdAt এবং updatedAt যোগ করবে
  }
);

export const Trip = model<ITrip>("Trip", tripSchema);