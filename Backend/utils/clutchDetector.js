/**
 * Detects clutch moments during a task competition.
 * - first_blood: First player to submit any subtask
 * - clutch_finish: Submission in the last 10% of the time window
 * - comeback_win: Player was behind in submissions but ended up winning
 */

export function detectClutchEvents(submissions, task, winnerId) {
  const events = [];
  if (!submissions || submissions.length === 0) return events;

  const taskStart = new Date(task.startTime).getTime();
  const taskEnd = new Date(task.endTime).getTime();
  const totalDuration = taskEnd - taskStart;
  const clutchThreshold = taskStart + totalDuration * 0.9; // last 10%

  // Sort submissions by time
  const sorted = [...submissions].sort(
    (a, b) => new Date(a.submittedAt) - new Date(b.submittedAt)
  );

  // First Blood — first submission overall
  if (sorted.length > 0) {
    events.push({
      type: "first_blood",
      userId: sorted[0].userId,
      timestamp: sorted[0].submittedAt,
    });
  }

  // Clutch Finish — any submission in the last 10% of the window
  for (const sub of sorted) {
    const subTime = new Date(sub.submittedAt).getTime();
    if (subTime >= clutchThreshold) {
      events.push({
        type: "clutch_finish",
        userId: sub.userId,
        timestamp: sub.submittedAt,
      });
    }
  }

  // Comeback Win — winner had fewer submissions at the midpoint
  if (winnerId) {
    const midpoint = taskStart + totalDuration * 0.5;
    const players = [...new Set(sorted.map((s) => s.userId.toString()))];

    if (players.length === 2) {
      const midCounts = {};
      for (const pid of players) {
        midCounts[pid] = sorted.filter(
          (s) =>
            s.userId.toString() === pid &&
            new Date(s.submittedAt).getTime() <= midpoint
        ).length;
      }

      const winnerIdStr = winnerId.toString();
      const opponentId = players.find((p) => p !== winnerIdStr);

      if (
        opponentId &&
        midCounts[winnerIdStr] !== undefined &&
        midCounts[opponentId] !== undefined &&
        midCounts[winnerIdStr] < midCounts[opponentId]
      ) {
        events.push({
          type: "comeback_win",
          userId: winnerId,
          timestamp: new Date(),
        });
      }
    }
  }

  return events;
}
