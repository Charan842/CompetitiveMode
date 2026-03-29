import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";

// Cron jobs
import scheduleTurnToggle from "./cron/turnToggle.js";
import scheduleAutoComputeResults from "./cron/autoComputeResults.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Start cron jobs
    scheduleTurnToggle();
    scheduleAutoComputeResults();
  });
}).catch((error) => {
  console.error(`Server startup failed: ${error.message}`);
  process.exit(1);
});
