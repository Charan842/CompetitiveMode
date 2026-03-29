import cron from "node-cron";
import { runAutoComputeResultsJob } from "../jobs/autoComputeResultsJob.js";

/**
 * Runs every 15 minutes.
 * Finds tasks whose endTime has passed but have no result yet, and computes them.
 */
const scheduleAutoComputeResults = () => {
  cron.schedule("*/15 * * * *", async () => {
    console.log("[CRON] Checking for tasks needing result computation...");
    try {
      const computed = await runAutoComputeResultsJob();

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
