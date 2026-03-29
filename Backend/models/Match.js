import mongoose from "mongoose";

const h2hStatsSchema = new mongoose.Schema(
  {
    odId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    wins: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    totalCompletionTime: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
    fastestWinTime: { type: Number, default: null },
  },
  { _id: false }
);

const matchSchema = new mongoose.Schema(
  {
    players: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      validate: {
        validator: (arr) => arr.length === 2,
        message: "A match must have exactly 2 players",
      },
      required: true,
    },
    currentTurn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "disposed"],
      default: "active",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    h2hStats: {
      type: [h2hStatsSchema],
      default: [],
    },
    nextConstraint: {
      type: String,
      default: null,
    },
    disposedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    disposedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Match", matchSchema);
