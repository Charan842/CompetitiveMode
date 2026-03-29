import Result from "../models/Result.js";
import Task from "../models/Task.js";
import Match from "../models/Match.js";
import User from "../models/User.js";
import Submission from "../models/Submission.js";
import calculateWinner from "../utils/winnerCalculator.js";
import { detectClutchEvents } from "../utils/clutchDetector.js";
import { generateInsights } from "../utils/insightGenerator.js";

// POST /api/results/compute/:taskId — Compute and store result for a task
export const computeResult = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Only compute after endTime has passed
    if (Date.now() < new Date(task.endTime).getTime()) {
      return res.status(400).json({ message: "Cannot compute results before the task deadline" });
    }

    // Check if result already exists
    const existingResult = await Result.findOne({ taskId: task._id });
    if (existingResult) {
      return res.status(400).json({ message: "Result already computed for this task", result: existingResult });
    }

    const [playerA, playerB] = task.participants;

    const { winner, isDraw, playerAStats, playerBStats } = await calculateWinner(
      task._id,
      playerA,
      playerB,
      task.startTime
    );

    // Fetch all submissions for clutch detection
    const allSubmissions = await Submission.find({ taskId: task._id });

    // Detect clutch events
    const clutchEvents = detectClutchEvents(allSubmissions, task, winner);

    // Generate insights
    const insights = generateInsights(playerAStats, playerBStats, task, clutchEvents);

    const result = await Result.create({
      taskId: task._id,
      matchId: task.matchId,
      winner,
      isDraw,
      playerAStats,
      playerBStats,
      clutchEvents,
      insights,
    });

    // Update user stats
    if (isDraw) {
      await User.updateMany(
        { _id: { $in: [playerA, playerB] } },
        { $inc: { totalDraws: 1 } }
      );
    } else {
      const loserId = winner.toString() === playerA.toString() ? playerB : playerA;
      await Promise.all([
        User.findByIdAndUpdate(winner, { $inc: { totalWins: 1 } }),
        User.findByIdAndUpdate(loserId, { $inc: { totalLosses: 1 } }),
      ]);
    }

    // Update H2H stats on the match
    const match = await Match.findById(task.matchId);
    if (match) {
      // Toggle turn
      const [mPlayerA, mPlayerB] = match.players;
      match.currentTurn =
        match.currentTurn.toString() === mPlayerA.toString() ? mPlayerB : mPlayerA;

      // Update H2H stats for each player
      for (const pid of [playerA, playerB]) {
        let h2h = match.h2hStats.find(
          (s) => s.odId.toString() === pid.toString()
        );
        if (!h2h) {
          match.h2hStats.push({
            odId: pid,
            wins: 0,
            currentStreak: 0,
            longestStreak: 0,
            totalCompletionTime: 0,
            gamesPlayed: 0,
            fastestWinTime: null,
          });
          h2h = match.h2hStats[match.h2hStats.length - 1];
        }

        h2h.gamesPlayed += 1;

        const isPlayerA = pid.toString() === playerA.toString();
        const myStats = isPlayerA ? playerAStats : playerBStats;

        if (myStats.totalTime) {
          h2h.totalCompletionTime += myStats.totalTime;
        }

        if (!isDraw && winner && winner.toString() === pid.toString()) {
          h2h.wins += 1;
          h2h.currentStreak += 1;
          if (h2h.currentStreak > h2h.longestStreak) {
            h2h.longestStreak = h2h.currentStreak;
          }
          if (
            myStats.totalTime &&
            (h2h.fastestWinTime === null || myStats.totalTime < h2h.fastestWinTime)
          ) {
            h2h.fastestWinTime = myStats.totalTime;
          }
        } else {
          h2h.currentStreak = 0;
        }
      }

      await match.save();
    }

    const populated = await result.populate([
      { path: "winner", select: "username" },
      { path: "playerAStats.userId", select: "username" },
      { path: "playerBStats.userId", select: "username" },
    ]);

    res.status(201).json(populated);
  } catch (error) {
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
