import Chat from "../models/Chat.js";
import Match from "../models/Match.js";

// POST /api/chat/send
export const sendMessage = async (req, res, next) => {
  try {
    const { matchId, message } = req.body;
    const senderId = req.user._id;

    if (!matchId || !message || !message.trim()) {
      return res.status(400).json({ message: "matchId and message are required" });
    }
    if (message.trim().length > 500) {
      return res.status(400).json({ message: "Message cannot exceed 500 characters" });
    }

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    const isParticipant = match.players.some(
      (p) => p.toString() === senderId.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not a participant in this match" });
    }

    const chat = await Chat.create({
      matchId,
      senderId,
      message: message.trim(),
    });

    await chat.populate("senderId", "username");

    res.status(201).json(chat);
  } catch (err) {
    next(err);
  }
};

// GET /api/chat/:matchId
export const getMessages = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const userId = req.user._id;

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    const isParticipant = match.players.some(
      (p) => p.toString() === userId.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not a participant in this match" });
    }

    const messages = await Chat.find({ matchId })
      .populate("senderId", "username")
      .sort({ createdAt: 1 })
      .lean();

    res.json(messages);
  } catch (err) {
    next(err);
  }
};
