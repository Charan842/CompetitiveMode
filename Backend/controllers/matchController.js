import Match from "../models/Match.js";
import User from "../models/User.js";
import Submission from "../models/Submission.js";
import Result from "../models/Result.js";

// POST /api/matches — Create a new match between 2 players
export const createMatch = async (req, res, next) => {
  try {
    const { opponentId } = req.body;
    const currentUserId = req.user._id;

    if (currentUserId.toString() === opponentId) {
      return res.status(400).json({ message: "Cannot create a match with yourself" });
    }

    const opponent = await User.findById(opponentId);
    if (!opponent) {
      return res.status(404).json({ message: "Opponent not found" });
    }

    // Check if there's already an active match between these two players
    const existingMatch = await Match.findOne({
      players: { $all: [currentUserId, opponentId] },
      status: "active",
    });
    if (existingMatch) {
      return res.status(400).json({ message: "An active match already exists between these players" });
    }

    const match = await Match.create({
      players: [currentUserId, opponentId],
      currentTurn: currentUserId, // creator goes first
    });

    const populated = await match.populate("players", "username email");

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// GET /api/matches — Get all matches for current user
export const getMyMatches = async (req, res, next) => {
  try {
    const matches = await Match.find({
      players: req.user._id,
      status: { $ne: "disposed" },
    })
      .populate("players", "username email")
      .populate("currentTurn", "username")
      .sort({ createdAt: -1 });

    res.json(matches);
  } catch (error) {
    next(error);
  }
};

// GET /api/matches/:id
export const getMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("players", "username email totalWins totalLosses totalDraws")
      .populate("currentTurn", "username");

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const isPlayer = match.players.some(
      (p) => p._id.toString() === req.user._id.toString()
    );
    if (!isPlayer) {
      return res.status(403).json({ message: "You are not a participant in this match" });
    }

    if (match.status === "disposed") {
      return res.status(410).json({ message: "This match has been disposed" });
    }

    res.json(match);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/matches/:id/toggle-turn — Alternate turn (for cron or manual trigger)
export const toggleTurn = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const [playerA, playerB] = match.players;
    match.currentTurn =
      match.currentTurn.toString() === playerA.toString() ? playerB : playerA;

    await match.save();

    const populated = await match.populate("players", "username email");
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// GET /api/matches/:id/stats — H2H analytics for a match
export const getMatchStats = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("players", "username totalWins totalLosses totalDraws")
      .populate("h2hStats.odId", "username");

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const isPlayer = match.players.some(
      (p) => p._id.toString() === req.user._id.toString()
    );
    if (!isPlayer) {
      return res.status(403).json({ message: "You are not a participant in this match" });
    }

    // Build stats response
    const stats = match.h2hStats.map((s) => ({
      player: s.odId,
      wins: s.wins,
      currentStreak: s.currentStreak,
      longestStreak: s.longestStreak,
      avgCompletionTime:
        s.gamesPlayed > 0
          ? Math.round(s.totalCompletionTime / s.gamesPlayed)
          : 0,
      gamesPlayed: s.gamesPlayed,
      fastestWinTime: s.fastestWinTime,
    }));

    res.json({ matchId: match._id, players: match.players, h2hStats: stats });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/matches/:id/constraint — Set constraint for next task
export const setConstraint = async (req, res, next) => {
  try {
    const { constraint } = req.body;
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const isPlayer = match.players.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isPlayer) {
      return res.status(403).json({ message: "You are not a participant" });
    }

    match.nextConstraint = constraint || null;
    await match.save();

    res.json({ message: "Constraint set", nextConstraint: match.nextConstraint });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/matches/:id - Dispose a match for both participants
export const disposeMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const isPlayer = match.players.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isPlayer) {
      return res.status(403).json({ message: "You are not a participant in this match" });
    }

    if (match.status === "disposed") {
      return res.status(400).json({ message: "This match has already been disposed" });
    }

    match.status = "disposed";
    match.disposedBy = req.user._id;
    match.disposedAt = new Date();
    match.nextConstraint = null;

    await match.save();

    res.json({ message: "Match disposed successfully" });
  } catch (error) {
    next(error);
  }
};

// GET /api/matches/:id/result — Overall winner based on task wins
export const getMatchResult = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id).populate("players", "username");
    if (!match) return res.status(404).json({ message: "Match not found" });

    const isPlayer = match.players.some(
      (p) => p._id.toString() === req.user._id.toString()
    );
    if (!isPlayer) return res.status(403).json({ message: "Not a participant" });

    const results = await Result.find({ matchId: match._id });

    const winsMap = {};
    for (const p of match.players) winsMap[p._id.toString()] = 0;

    for (const r of results) {
      if (r.winner) {
        const wid = r.winner.toString();
        if (winsMap[wid] !== undefined) winsMap[wid]++;
      }
    }

    const [p1, p2] = match.players;
    const p1Wins = winsMap[p1._id.toString()];
    const p2Wins = winsMap[p2._id.toString()];

    let overallWinner = null;
    if (p1Wins > p2Wins) overallWinner = p1;
    else if (p2Wins > p1Wins) overallWinner = p2;

    res.json({
      players: [
        { player: p1, wins: p1Wins },
        { player: p2, wins: p2Wins },
      ],
      overallWinner,
      isDraw: overallWinner === null && results.length > 0,
      totalTasks: results.length,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/matches/:id/activity — Submission heatmap data
export const getActivityHeatmap = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // Get all submissions from tasks in this match via Task model
    const Task = (await import("../models/Task.js")).default;
    const tasks = await Task.find({ matchId: match._id }).select("_id");
    const taskIds = tasks.map((t) => t._id);

    const submissions = await Submission.find({ taskId: { $in: taskIds } })
      .select("userId submittedAt")
      .lean();

    // Group by date and userId
    const heatmap = {};
    for (const sub of submissions) {
      const dateKey = new Date(sub.submittedAt).toISOString().split("T")[0];
      if (!heatmap[dateKey]) heatmap[dateKey] = {};
      const uid = sub.userId.toString();
      heatmap[dateKey][uid] = (heatmap[dateKey][uid] || 0) + 1;
    }

    res.json(heatmap);
  } catch (error) {
    next(error);
  }
};

// GET /api/users/search?q=username — Search users to invite
export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.status(400).json({ message: "Search query must be at least 2 characters" });
    }

    const users = await User.find({
      _id: { $ne: req.user._id },
      username: { $regex: q, $options: "i" },
    })
      .select("username email")
      .limit(10);

    res.json(users);
  } catch (error) {
    next(error);
  }
};
