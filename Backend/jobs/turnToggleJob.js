import Match from "../models/Match.js";

export const runTurnToggleJob = async () => {
  const activeMatches = await Match.find({ status: "active" });

  let toggled = 0;
  for (const match of activeMatches) {
    const [playerA, playerB] = match.players;
    match.currentTurn =
      match.currentTurn.toString() === playerA.toString() ? playerB : playerA;
    await match.save();
    toggled += 1;
  }

  return toggled;
};
