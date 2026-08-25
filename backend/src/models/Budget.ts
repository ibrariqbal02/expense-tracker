import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, 
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Budget cannot be negative."],
    },
  },
  { timestamps: true }
);

export const Budget = mongoose.model("Budget", budgetSchema);