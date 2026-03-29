import Task from "../models/Task.js";
import Match from "../models/Match.js";
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

    // Enforce turn-based creation
    if (match.currentTurn.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "It's not your turn to create a task" });
    }

    // Validate time window
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    const taskCount = await Task.countDocuments({ matchId });
    if (taskCount >= 5) {
      return res.status(400).json({ message: "This match has already reached the maximum of 5 tasks" });
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

    // Clear the constraint after applying
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
