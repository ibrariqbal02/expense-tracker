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
  { timestamps: false }
);

// A user can have multiple budgets but not two with the same name + period
budgetSchema.index({ user: 1, name: 1, period: 1 }, { unique: true });

export const Budget = mongoose.model("Budget", budgetSchema);
