import connectDB from "../../../../Backend/config/db.js";
import { runAutoComputeResultsJob } from "../../../../Backend/jobs/autoComputeResultsJob.js";

export default async () => {
  await connectDB();
  const computed = await runAutoComputeResultsJob();

  return Response.json({ computed });
};

export const config = {
  schedule: "*/15 * * * *",
};
