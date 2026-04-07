import Submission from "../models/Submission.js";
import SubmissionTracking from "../models/SubmissionTracking.js";
import Task from "../models/Task.js";

// POST /api/submissions — Submit a response for a subtask
export const createSubmission = async (req, res, next) => {
  try {
    const { taskId, subtaskId, response } = req.body;
    const now = Date.now(); // server time only

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify user is a participant
    const isParticipant = task.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not a participant in this task" });
    }

    // Validate subtask exists
    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    // Validate response has content for the subtask type
    if (!response || typeof response !== "object") {
      return res.status(400).json({ message: "A response is required" });
    }
    const type = subtask.type || "text";
    const hasContent =
      ((type === "text" || type === "link") && response.text?.trim()) ||
      (type === "code" && response.code?.trim()) ||
      ((type === "file" || type === "image") && response.fileUrl?.trim());
    if (!hasContent) {
      return res.status(400).json({ message: "Please provide a valid response" });
    }

    // Enforce time window — backend only, never trust frontend
    if (now < new Date(task.startTime).getTime()) {
      return res.status(400).json({ message: "Submissions are not allowed before the start time" });
    }
    if (now > new Date(task.endTime).getTime()) {
      return res.status(400).json({ message: "Submission deadline has passed" });
    }

    // Anti-cheat: check if submission is locked (already finalized)
    const existing = await Submission.findOne({
      userId: req.user._id,
      taskId,
      subtaskId,
    });
    if (existing && existing.locked) {
      return res
        .status(403)
        .json({ message: "This submission is locked and cannot be edited" });
    }

    // Upsert submission
    const submission = await Submission.findOneAndUpdate(
      { userId: req.user._id, taskId, subtaskId },
      {
        userId: req.user._id,
        taskId,
        subtaskId,
        submittedAt: new Date(now),
        response,
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Update tracking
    const totalCompleted = await Submission.countDocuments({
      userId: req.user._id,
      taskId,
    });

    await SubmissionTracking.findOneAndUpdate(
      { taskId, userId: req.user._id },
      {
        completedCount: totalCompleted,
        lastSubmissionTime: new Date(now),
      },
      { upsert: true, new: true }
    );

    res.status(201).json(submission);
  } catch (error) {
    next(error);
  }
};

// GET /api/submissions/task/:taskId — Get all submissions for a task (both players)
export const getSubmissionsByTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isParticipant = task.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not a participant in this task" });
    }

    const submissions = await Submission.find({ taskId: req.params.taskId })
      .populate("userId", "username");

    res.json(submissions);
  } catch (error) {
    next(error);
  }
};

// GET /api/submissions/my/:taskId — Get current user's submissions for a task
export const getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({
      taskId: req.params.taskId,
      userId: req.user._id,
    });

    res.json(submissions);
  } catch (error) {
    next(error);
  }
};

// GET /api/submissions/tracking/:taskId — Get tracking info for both players
export const getTrackingByTask = async (req, res, next) => {
  try {
    const tracking = await SubmissionTracking.find({
      taskId: req.params.taskId,
    }).populate("userId", "username");

    res.json(tracking);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/submissions/lock/:taskId — Lock all submissions for the current user on a task
export const lockSubmissions = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isParticipant = task.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not a participant in this task" });
    }

    const result = await Submission.updateMany(
      { userId: req.user._id, taskId: req.params.taskId },
      { locked: true }
    );

    res.json({
      message: "Submissions locked successfully",
      lockedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};
