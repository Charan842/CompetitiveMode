import Result from "../models/Result.js";
import { computeAndStoreResult } from "../services/resultService.js";

// POST /api/results/compute/:taskId — Compute and store result for a task
export const computeResult = async (req, res, next) => {
  try {
    const { result, alreadyComputed } = await computeAndStoreResult(req.params.taskId);

    if (alreadyComputed) {
      return res.status(400).json({ message: "Result already computed for this task", result });
    }

    const populated = await result.populate([
      { path: "winner", select: "username" },
      { path: "playerAStats.userId", select: "username" },
      { path: "playerBStats.userId", select: "username" },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

// GET /api/results/task/:taskId — Get result for a task
export const getResultByTask = async (req, res, next) => {
  try {
    const result = await Result.findOne({ taskId: req.params.taskId })
      .populate("winner", "username")
      .populate("playerAStats.userId", "username")
      .populate("playerBStats.userId", "username");

    if (!result) {
      return res.status(404).json({ message: "Result not found for this task" });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// GET /api/results/match/:matchId — Get all results for a match
export const getResultsByMatch = async (req, res, next) => {
  try {
    const results = await Result.find({ matchId: req.params.matchId })
      .populate("winner", "username")
      .populate("taskId", "title date")
      .sort({ computedAt: -1 });

    res.json(results);
  } catch (error) {
    next(error);
  }
};
