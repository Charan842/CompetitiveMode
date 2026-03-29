import mongoose from "mongoose";

const playerStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    completedCount: { type: Number, default: 0 },
    totalTime: { type: Number, default: null },
  },
  { _id: false }
);

const clutchEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["first_blood", "clutch_finish", "comeback_win"],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      unique: true,
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isDraw: {
      type: Boolean,
      default: false,
    },
    playerAStats: {
      type: playerStatsSchema,
      required: true,
    },
    playerBStats: {
      type: playerStatsSchema,
      required: true,
    },
    clutchEvents: {
      type: [clutchEventSchema],
      default: [],
    },
    insights: {
      type: [String],
      default: [],
    },
    computedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Result", resultSchema);
