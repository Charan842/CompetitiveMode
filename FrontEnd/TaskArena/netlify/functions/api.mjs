import serverless from "serverless-http";
import connectDB from "../../../../Backend/config/db.js";
import app from "../../../../Backend/app.js";

let cachedHandler;

const getHandler = async () => {
  if (!cachedHandler) {
    await connectDB();
    cachedHandler = serverless(app, {
      basePath: "/.netlify/functions",
    });
  }

  return cachedHandler;
};

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const appHandler = await getHandler();
  return appHandler(event, context);
};
