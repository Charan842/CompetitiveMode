import Task from "../models/Task.js";
import { computeAndStoreResult } from "../services/resultService.js";

export const runAutoComputeResultsJob = async () => {
  const now = new Date();
  const expiredTasks = await Task.find({ endTime: { $lt: now } }).select("_id title");

  let computed = 0;
  for (const task of expiredTasks) {
    const { alreadyComputed } = await computeAndStoreResult(task._id, {
      requireEnded: false,
    });

    if (!alreadyComputed) {
      computed += 1;
      console.log(`[JOB] Computed result for task: ${task.title}`);
    }
  }

  return computed;
};
