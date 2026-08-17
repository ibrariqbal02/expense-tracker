import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, require: true },
  email: { type: String, require: true, unique: true },
  password: { type: String, require: true },
  profileUrl: { type: String, default: "" },
},{timestamps:true}); // auto add created at and updated at

export const User = mongoose.model('User', userSchema)
