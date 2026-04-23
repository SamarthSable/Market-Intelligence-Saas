import mongoose from "mongoose";

export async function connectMongo() {
  try {
    // A short server selection timeout makes startup errors feel immediate instead of hanging forever.
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection failed", err);
    process.exit(1);
  }
}
