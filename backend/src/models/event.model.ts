
import mongoose, { Schema, Document } from "mongoose";

export interface ITicketListing {
  platform: string;
  price: number;
  bookingUrl: string;
  isDemo: boolean;
}

export interface IEvent extends Document {
  title: string;
  description: string;
  category: string;
  city: string;
  venue: string;
  date: Date;
  durationMinutes: number;
  minAge: number;
  imageUrl: string;
  tags: string[];
  rating: number;
  ticketListings: ITicketListing[];
}

const ticketListingSchema = new Schema<ITicketListing>(
  {
    platform: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    bookingUrl: {
      type: String,
      required: true,
    },
    isDemo: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    city: {
      type: String,
      required: true,
      index: true,
    },

    venue: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },

    minAge: {
      type: Number,
      default: 0,
      min: 0,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    tags: {
      type: [String],
      default: [],
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    ticketListings: {
      type: [ticketListingSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model<IEvent>(
  "Event",
  eventSchema
);

export default Event;
