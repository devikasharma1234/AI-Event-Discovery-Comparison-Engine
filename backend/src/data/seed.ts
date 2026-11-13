import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Event from "../models/event.model.js";
import { dummyEvents } from "./events.seed.js";

const seedDatabase = async (): Promise<void> => {
  try {
    await connectDB();

    // Clear old demo events before inserting fresh data
    await Event.deleteMany({});

    await Event.insertMany(dummyEvents);

    console.log(
      `${dummyEvents.length} dummy events inserted successfully`
    );
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedDatabase();
