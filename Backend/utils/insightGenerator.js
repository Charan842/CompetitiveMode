/**
 * Generates human-readable insight strings from result data.
 */

export function generateInsights(playerAStats, playerBStats, task, clutchEvents) {
  const insights = [];

  const pA = playerAStats;
  const pB = playerBStats;
  const totalSubtasks = task.subtasks.length;

  // Completion comparison
  if (pA.completedCount === totalSubtasks && pB.completedCount === totalSubtasks) {
    insights.push("Both players completed all subtasks — it came down to speed!");
  } else if (pA.completedCount === totalSubtasks) {
    insights.push(`Player A completed all ${totalSubtasks} subtasks.`);
  } else if (pB.completedCount === totalSubtasks) {
    insights.push(`Player B completed all ${totalSubtasks} subtasks.`);
  }

  // Time comparison
  if (pA.totalTime && pB.totalTime) {
    const diff = Math.abs(pA.totalTime - pB.totalTime);
    const diffMinutes = Math.round(diff / 60000);
    if (diffMinutes > 0) {
      const faster = pA.totalTime < pB.totalTime ? "Player A" : "Player B";
      insights.push(`${faster} was faster by ${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""}.`);
    } else {
      insights.push("Neck and neck — finishing times were nearly identical!");
    }
  }

  // Completion gap
  const gap = Math.abs(pA.completedCount - pB.completedCount);
  if (gap > 0 && gap <= 1) {
    insights.push("It was a close fight — only 1 subtask apart.");
  } else if (gap >= 2) {
    insights.push(`One player dominated with a ${gap}-subtask lead.`);
  }

  // Difficulty insight
  if (task.difficulty === "Hard") {
    insights.push("This was a Hard difficulty task — respect to both competitors!");
  }

  // Clutch event insights
  if (clutchEvents && clutchEvents.length > 0) {
    const hasFirstBlood = clutchEvents.some((e) => e.type === "first_blood");
    const hasClutchFinish = clutchEvents.some((e) => e.type === "clutch_finish");
    const hasComeback = clutchEvents.some((e) => e.type === "comeback_win");

    if (hasFirstBlood) {
      insights.push("First Blood was drawn early — one player struck first!");
    }
    if (hasClutchFinish) {
      insights.push("Clutch finish detected — a submission came in during the final moments!");
    }
    if (hasComeback) {
      insights.push("Comeback win! The winner was trailing at the halfway mark.");
    }
  }

  // No submissions
  if (pA.completedCount === 0 && pB.completedCount === 0) {
    insights.push("Neither player submitted anything. A ghost round!");
  }

  return insights;
}
