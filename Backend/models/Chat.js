import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);
