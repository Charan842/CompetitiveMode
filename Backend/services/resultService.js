import Result from "../models/Result.js";
import Task from "../models/Task.js";
import Match from "../models/Match.js";
import User from "../models/User.js";
import Submission from "../models/Submission.js";
import calculateWinner from "../utils/winnerCalculator.js";
import { detectClutchEvents } from "../utils/clutchDetector.js";
import { generateInsights } from "../utils/insightGenerator.js";

export const computeAndStoreResult = async (taskId, { requireEnded = true } = {}) => {
  const task = await Task.findById(taskId);
  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  if (requireEnded && Date.now() < new Date(task.endTime).getTime()) {
    const error = new Error("Cannot compute results before the task deadline");
    error.statusCode = 400;
    throw error;
  }

  const existingResult = await Result.findOne({ taskId: task._id });
  if (existingResult) {
    return { result: existingResult, task, alreadyComputed: true };
  }

  const [playerA, playerB] = task.participants;

  const { winner, isDraw, playerAStats, playerBStats } = await calculateWinner(
    task._id,
    playerA,
    playerB,
    task.startTime
  );

  const allSubmissions = await Submission.find({ taskId: task._id });
  const clutchEvents = detectClutchEvents(allSubmissions, task, winner);
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

  const match = await Match.findById(task.matchId);
  if (match) {
    const [mPlayerA, mPlayerB] = match.players;
    match.currentTurn =
      match.currentTurn.toString() === mPlayerA.toString() ? mPlayerB : mPlayerA;

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

  return { result, task, alreadyComputed: false };
};
