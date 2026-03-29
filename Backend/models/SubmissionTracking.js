import mongoose from "mongoose";

const submissionTrackingSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    completedCount: {
      type: Number,
      default: 0,
    },
    lastSubmissionTime: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

submissionTrackingSchema.index({ taskId: 1, userId: 1 }, { unique: true });

export default mongoose.model("SubmissionTracking", submissionTrackingSchema);
