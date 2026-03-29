import cron from "node-cron";
import Task from "../models/Task.js";
import Result from "../models/Result.js";
import User from "../models/User.js";
import Match from "../models/Match.js";
import calculateWinner from "../utils/winnerCalculator.js";

/**
 * Runs every 15 minutes.
 * Finds tasks whose endTime has passed but have no result yet, and computes them.
 */
const scheduleAutoComputeResults = () => {
  cron.schedule("*/15 * * * *", async () => {
    console.log("[CRON] Checking for tasks needing result computation...");
    try {
      const now = new Date();

      // Find tasks that ended but have no result
      const expiredTasks = await Task.find({ endTime: { $lt: now } });

      let computed = 0;
      for (const task of expiredTasks) {
        const existingResult = await Result.findOne({ taskId: task._id });
        if (existingResult) continue;

        const [playerA, playerB] = task.participants;

        const { winner, isDraw, playerAStats, playerBStats } =
          await calculateWinner(task._id, playerA, playerB, task.startTime);

        await Result.create({
          taskId: task._id,
          matchId: task.matchId,
          winner,
          isDraw,
          playerAStats,
          playerBStats,
        });

        // Update user stats
        if (isDraw) {
          await User.updateMany(
            { _id: { $in: [playerA, playerB] } },
            { $inc: { totalDraws: 1 } }
          );
        } else {
          const loserId =
            winner.toString() === playerA.toString() ? playerB : playerA;
          await Promise.all([
            User.findByIdAndUpdate(winner, { $inc: { totalWins: 1 } }),
            User.findByIdAndUpdate(loserId, { $inc: { totalLosses: 1 } }),
          ]);
        }

        computed++;
        console.log(`[CRON] Computed result for task: ${task.title}`);
      }

      if (computed > 0) {
        console.log(`[CRON] Auto-computed ${computed} results.`);
      }
    } catch (error) {
      console.error("[CRON] Auto-compute error:", error.message);
    }
  });

  console.log("[CRON] Auto-compute results scheduled (every 15 min)");
};

export default scheduleAutoComputeResults;
