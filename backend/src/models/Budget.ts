import mongoose from "mongoose";

export enum BudgetPeriod {
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Budget cannot be negative."],
    },
    period: {
      type: String,
      enum: Object.values(BudgetPeriod),
      required: true,
      default: BudgetPeriod.MONTHLY,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Budget = mongoose.model("Budget", budgetSchema);
