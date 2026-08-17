import mongoose from "mongoose";

const connectDb = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI
     
    if (!mongoURI) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    await mongoose.connect(mongoURI);

    console.log("Mongoose Connected on Atlas ");
  } catch (error) {
    console.error(" MongoDB Connection Failed");
    if (error instanceof Error) {
      console.error(error.message);
    }

    process.exit(1);
  }
};

export default connectDb;