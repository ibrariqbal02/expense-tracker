import { Request, Response } from "express";
import { Budget, BudgetPeriod } from "../models/budget";


export const getBudgets = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const budgets = await Budget.find({ user: req.userId }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, budgets });
  } catch (error) {
    console.error("Get budgets error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};


export const createBudget = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const { name, amount, period } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Budget name is required." });
    }

    if (amount === undefined || Number(amount) < 0) {
      return res.status(400).json({ success: false, message: "Valid budget amount is required." });
    }

    if (!period || !Object.values(BudgetPeriod).includes(period)) {
      return res.status(400).json({
        success: false,
        message: `Period must be one of: ${Object.values(BudgetPeriod).join(", ")}.`,
      });
    }

    const budget = await Budget.create({
      user: req.userId,
      name: name.trim(),
      amount: Number(amount),
      period,
    });

    return res.status(201).json({ success: true, message: "Budget created successfully.", budget });
  } catch (error) {
    console.error("Create budget error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};


export const updateBudget = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const { id } = req.params;
    const { name, amount, period } = req.body;

    const budget = await Budget.findOne({ _id: id, user: req.userId });
    if (!budget) {
      return res.status(404).json({ success: false, message: "Budget not found." });
    }

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ success: false, message: "Budget name cannot be empty." });
      }
      budget.name = name.trim();
    }

    if (amount !== undefined) {
      if (Number(amount) < 0) {
        return res.status(400).json({ success: false, message: "Budget amount cannot be negative." });
      }
      budget.amount = Number(amount);
    }

    if (period !== undefined) {
      if (!Object.values(BudgetPeriod).includes(period)) {
        return res.status(400).json({
          success: false,
          message: `Period must be one of: ${Object.values(BudgetPeriod).join(", ")}.`,
        });
      }
      budget.period = period;
    }

    await budget.save();

    return res.status(200).json({ success: true, message: "Budget updated successfully.", budget });
  } catch (error) {
    console.error("Update budget error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};


export const deleteBudget = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const { id } = req.params;

    const budget = await Budget.findOneAndDelete({ _id: id, user: req.userId });
    if (!budget) {
      return res.status(404).json({ success: false, message: "Budget not found." });
    }

    return res.status(200).json({ success: true, message: "Budget deleted successfully." });
  } catch (error) {
    console.error("Delete budget error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};
