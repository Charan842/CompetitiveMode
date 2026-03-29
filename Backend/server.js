import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";

// Route imports
import authRoutes from "./routes/authRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

// Cron jobs
import scheduleTurnToggle from "./cron/turnToggle.js";
import scheduleAutoComputeResults from "./cron/autoComputeResults.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/upload", uploadRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Start cron jobs
    scheduleTurnToggle();
    scheduleAutoComputeResults();
  });
});
