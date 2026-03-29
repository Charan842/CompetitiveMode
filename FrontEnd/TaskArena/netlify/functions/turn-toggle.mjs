import connectDB from "../../../../Backend/config/db.js";
import { runTurnToggleJob } from "../../../../Backend/jobs/turnToggleJob.js";

export default async () => {
  await connectDB();
  const toggled = await runTurnToggleJob();

  return Response.json({ toggled });
};

export const config = {
  schedule: "30 18 * * *",
};
