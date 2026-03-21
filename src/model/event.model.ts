import { model, Schema } from "mongoose";


const eventSchema = new Schema<TEvent>({
  title: {type: String, required: true},
  description: {type: String, required: true},
  date: {type: Date, required: true},
  location: {type: String, required: true},
  organizer: {type: String, required: true},
  image: String
},
{
  timestamps: true,
}
)

export const Event =model<TEvent>("Event", eventSchema)