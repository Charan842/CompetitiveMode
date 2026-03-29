import mongoose from "mongoose";

const subtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Subtask title is required"],
    trim: true,
  },
  type: {
    type: String,
    enum: ["text", "link", "code", "file"],
    required: [true, "Subtask type is required"],
  },
  resourceLink: {
    type: String,
    default: null,
  },
  instructions: {
    type: String,
    required: [true, "Subtask instructions are required"],
  },
});

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Task description is required"],
    },
    category: {
      type: String,
      enum: ["DSA", "Study", "Fitness", "Custom"],
      required: [true, "Category is required"],
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      validate: {
        validator: (arr) => arr.length === 2,
        message: "A task must have exactly 2 participants",
      },
    },
    date: {
      type: Date,
      required: [true, "Task date is required"],
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
    },
    subtasks: {
      type: [subtaskSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one subtask is required",
      },
    },
    constraintText: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
