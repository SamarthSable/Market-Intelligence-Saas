import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema({
  userId: { type: Number, required: true }, // MySQL user id
  companies: [{ type: Number }], // MySQL company ids
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Watchlist", watchlistSchema);
