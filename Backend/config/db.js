import mongoose from "mongoose";

let cachedConnectionPromise;

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    if (!cachedConnectionPromise) {
      cachedConnectionPromise = mongoose.connect(process.env.MONGODB_URI);
    }

    const conn = await cachedConnectionPromise;
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    cachedConnectionPromise = null;
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

export default connectDB;
