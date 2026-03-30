import Task from "../models/Task.js";
import Match from "../models/Match.js";
import Submission from "../models/Submission.js";
import Result from "../models/Result.js";
import { getTemplate, getAllTemplates } from "../utils/subtaskTemplates.js";

// POST /api/tasks — Create a task (only currentTurn player can create)
export const createTask = async (req, res, next) => {
  try {
    const { matchId, title, description, category, difficulty, date, startTime, endTime, subtasks, constraintText } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (match.status !== "active") {
      return res.status(400).json({ message: "This match is no longer active" });
    }

    // Auto-switch turn when a new day has started (server date)
    const todayUTCStart = new Date();
    todayUTCStart.setUTCHours(0, 0, 0, 0);

    const lastTask = await Task.findOne({ matchId }).sort({ createdAt: -1 });
    if (lastTask && lastTask.createdAt < todayUTCStart) {
      // A new day has begun — hand the turn to the other player
      const [p1, p2] = match.players;
      match.currentTurn =
        match.currentTurn.toString() === p1.toString() ? p2 : p1;
      await match.save();
    }

    // Enforce: only the currentTurn player may create tasks today
    if (match.currentTurn.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "It's not your turn to create a task today" });
    }

    // Validate time window
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    // Apply constraint from match if set
    const appliedConstraint = constraintText || match.nextConstraint || null;

    const task = await Task.create({
      title,
      description,
      category,
      difficulty: difficulty || "Medium",
      createdBy: req.user._id,
      matchId,
      participants: match.players,
      date: new Date(date),
      startTime: start,
      endTime: end,
      subtasks,
      constraintText: appliedConstraint,
    });

    // Clear constraint after it has been applied
    if (match.nextConstraint) {
      match.nextConstraint = null;
      await match.save();
    }

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/match/:matchId — Get all tasks for a match
export const getTasksByMatch = async (req, res, next) => {
  try {
    const tasks = await Task.find({ matchId: req.params.matchId })
      .populate("createdBy", "username")
      .sort({ date: -1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/:id — Get single task
export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("createdBy", "username")
      .populate("participants", "username");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isParticipant = task.participants.some(
      (p) => p._id.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not a participant in this task" });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/templates — Get all subtask templates
export const getTemplates = async (req, res, next) => {
  try {
    const { category } = req.query;
    if (category) {
      const template = getTemplate(category);
      if (!template) {
        return res.status(404).json({ message: `No template for category: ${category}` });
      }
      return res.json({ category, subtasks: template });
    }
    res.json(getAllTemplates());
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/:taskId/all-submissions — Get all submissions grouped by player (only after result)
export const getAllSubmissions = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate("participants", "username");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Only participants can access
    const isParticipant = task.participants.some(
      (p) => p._id.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not a participant in this task" });
    }

    // Security: only allow after result has been computed
    const result = await Result.findOne({ taskId: task._id });
    if (!result) {
      return res.status(403).json({ message: "Submissions are revealed only after results are computed" });
    }

    // Fetch all submissions for this task
    const submissions = await Submission.find({ taskId: task._id })
      .populate("userId", "username")
      .lean();

    // Build subtask map for quick lookup
    const subtaskMap = {};
    for (const st of task.subtasks) {
      subtaskMap[st._id.toString()] = st;
    }

    // Group by userId
    const grouped = {};
    for (const sub of submissions) {
      const uid = sub.userId._id.toString();
      if (!grouped[uid]) {
        grouped[uid] = {
          user: sub.userId,
          submissions: [],
        };
      }
      grouped[uid].submissions.push({
        subtaskId: sub.subtaskId,
        subtask: subtaskMap[sub.subtaskId?.toString()] || null,
        imageUrl: sub.imageUrl,
        submittedAt: sub.submittedAt,
        locked: sub.locked,
      });
    }

    // Sort each player's submissions by subtask order
    const subtaskOrder = task.subtasks.map((s) => s._id.toString());
    for (const uid of Object.keys(grouped)) {
      grouped[uid].submissions.sort(
        (a, b) =>
          subtaskOrder.indexOf(a.subtaskId?.toString()) -
          subtaskOrder.indexOf(b.subtaskId?.toString())
      );
    }

    res.json({
      taskId: task._id,
      taskTitle: task.title,
      subtasks: task.subtasks,
      playerSubmissions: Object.values(grouped),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/today/:matchId — Get today's task for a match
export const getTodayTask = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const task = await Task.findOne({
      matchId: req.params.matchId,
      date: { $gte: todayStart, $lte: todayEnd },
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "username")
      .populate("participants", "username");

    if (!task) {
      return res.status(404).json({ message: "No task for today yet" });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};
