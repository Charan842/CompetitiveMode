import cron from "node-cron";
import { runTurnToggleJob } from "../jobs/turnToggleJob.js";

/**
 * Runs every day at midnight (00:00).
 * Toggles the turn for all active matches.
 */
const scheduleTurnToggle = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("[CRON] Running daily turn toggle...");
    try {
      const toggled = await runTurnToggleJob();

      console.log(`[CRON] Toggled turns for ${toggled} active matches.`);
    } catch (error) {
      console.error("[CRON] Turn toggle error:", error.message);
    }
  });

  console.log("[CRON] Daily turn toggle scheduled (00:00)");
};

export default scheduleTurnToggle;
