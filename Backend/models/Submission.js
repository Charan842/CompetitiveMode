import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    subtaskId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    locked: {
      type: Boolean,
      default: false,
    },
    response: {
      text: { type: String, default: null },
      code: { type: String, default: null },
      fileUrl: { type: String, default: null },
    },
  },
  { timestamps: true }
);

submissionSchema.index({ userId: 1, taskId: 1, subtaskId: 1 }, { unique: true });

export default mongoose.model("Submission", submissionSchema);
