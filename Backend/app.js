import express from "express";
import cors from "cors";
import errorHandler from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/chat", chatRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export default app;
