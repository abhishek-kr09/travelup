import mongoose from "mongoose";

export const connectDB = async (mongoURI) => {
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      family: 4,
    });
    console.log("MongoDB Connected");

    mongoose.connection.on("error", (error) => {
      console.error("MongoDB runtime error:", error.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.error("MongoDB disconnected");
    });
  } catch (error) {
    console.error("DB connection failed:", error.message);
    throw error;
  }
};
