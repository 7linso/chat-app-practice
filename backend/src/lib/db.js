import mongoose from "mongoose";
import "dotenv/config";

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`Connected to DB: ${connection.connection.host}`);
  } catch (e) {
    console.log(`Error in DB: ${e}`);
  }
};
