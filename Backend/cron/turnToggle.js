import cron from "node-cron";
import Match from "../models/Match.js";

/**
 * Runs every day at midnight (00:00).
 * Toggles the turn for all active matches.
 */
const scheduleTurnToggle = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("[CRON] Running daily turn toggle...");
    try {
      const activeMatches = await Match.find({ status: "active" });

      let toggled = 0;
      for (const match of activeMatches) {
        const [playerA, playerB] = match.players;
        match.currentTurn =
          match.currentTurn.toString() === playerA.toString()
            ? playerB
            : playerA;
        await match.save();
        toggled++;
      }

      console.log(`[CRON] Toggled turns for ${toggled} active matches.`);
    } catch (error) {
      console.error("[CRON] Turn toggle error:", error.message);
    }
  });

  console.log("[CRON] Daily turn toggle scheduled (00:00)");
};

export default scheduleTurnToggle;
