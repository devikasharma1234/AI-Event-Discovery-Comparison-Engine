import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Event from "../models/event.model.js";
import { dummyEvents } from "./events.seed.js";

const seedDatabase = async (): Promise<void> => {
  try {
    await connectDB();

    await Event.bulkWrite(dummyEvents.map((event) => ({
      updateOne: {
        filter: { title: event.title, city: event.city, "ticketListings.isDemo": true },
        update: { $set: event },
        upsert: true,
      },
    })));

    console.log(
      `${dummyEvents.length} sample events refreshed`
    );
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedDatabase();
