import mongoose from "mongoose";

export const connectToDB = async () => {
  try {
    if (typeof process.env.MONGO_URI === 'string') {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("Connected to DB successfully", process.env.MONGO_URI);
    } else {
      console.log("MONGO_URI is not defined or is not a valid string.");
    }
  } catch (error) {
    console.log("Error connecting to DB", error);
  }
};
