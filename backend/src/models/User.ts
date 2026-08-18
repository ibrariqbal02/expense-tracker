import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileUrl: { type: String, default: "" },
  refreshToken: {
      type: String,
      default: "",
    },
},{timestamps:true}); // auto add created at and updated at

export const User = mongoose.model('User', userSchema)
