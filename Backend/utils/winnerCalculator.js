import SubmissionTracking from "../models/SubmissionTracking.js";

/**
 * Calculates the winner for a given task between two players.
 *
 * Logic:
 *  1. Player with more completed subtasks wins.
 *  2. If tied on completion, lower totalTime (lastSubmission - startTime) wins.
 *  3. If neither submitted, it's a draw.
 *  4. If only one submitted, that player wins.
 */
const calculateWinner = async (taskId, playerAId, playerBId, startTime) => {
  const [trackingA, trackingB] = await Promise.all([
    SubmissionTracking.findOne({ taskId, userId: playerAId }),
    SubmissionTracking.findOne({ taskId, userId: playerBId }),
  ]);

  const statsA = {
    userId: playerAId,
    completedCount: trackingA?.completedCount || 0,
    totalTime: trackingA?.lastSubmissionTime
      ? trackingA.lastSubmissionTime.getTime() - new Date(startTime).getTime()
      : null,
  };

  const statsB = {
    userId: playerBId,
    completedCount: trackingB?.completedCount || 0,
    totalTime: trackingB?.lastSubmissionTime
      ? trackingB.lastSubmissionTime.getTime() - new Date(startTime).getTime()
      : null,
  };

  let winner = null;
  let isDraw = false;

  // Edge case: no submissions from either
  if (statsA.completedCount === 0 && statsB.completedCount === 0) {
    isDraw = true;
  }
  // Edge case: only one player submitted
  else if (statsA.completedCount > 0 && statsB.completedCount === 0) {
    winner = playerAId;
  } else if (statsB.completedCount > 0 && statsA.completedCount === 0) {
    winner = playerBId;
  }
  // Step 1: compare completion counts
  else if (statsA.completedCount > statsB.completedCount) {
    winner = playerAId;
  } else if (statsB.completedCount > statsA.completedCount) {
    winner = playerBId;
  }
  // Step 2: tie-breaker on time
  else {
    if (statsA.totalTime !== null && statsB.totalTime !== null) {
      if (statsA.totalTime < statsB.totalTime) {
        winner = playerAId;
      } else if (statsB.totalTime < statsA.totalTime) {
        winner = playerBId;
      } else {
        isDraw = true;
      }
    } else {
      isDraw = true;
    }
  }

  return {
    winner,
    isDraw,
    playerAStats: statsA,
    playerBStats: statsB,
  };
};

export default calculateWinner;
