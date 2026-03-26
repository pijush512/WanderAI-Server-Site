import { Schema, model } from 'mongoose';

const reviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  trip: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true }
}, { timestamps: true });

export const Review = model('Review', reviewSchema);