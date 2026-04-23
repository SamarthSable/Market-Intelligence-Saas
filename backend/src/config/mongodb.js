import mongoose from "mongoose";

export async function connectMongo() {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is not set.");
  }

  // A short server selection timeout makes startup errors feel immediate instead of hanging forever.
  await mongoose.connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log("MongoDB Connected");
}
