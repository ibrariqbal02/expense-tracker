import { Request, Response } from "express";
import { Budget, BudgetPeriod } from "../models/Budget";

export const getBudgets = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const { page, limit } = req.query;

    const pageNumber = Math.max(1, parseInt(page as string) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
    const skip = (pageNumber - 1) * pageSize;

    const filter = { user: req.userId };

    const [budgets, total] = await Promise.all([
      Budget.find(filter, { createdAt: 0, updatedAt: 0, __v: 0 })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(pageSize),
      Budget.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return res.status(200).json({
      success: true,
      budgets,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error("Get budgets error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error." });
  }
};

export const createBudget = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const { name, amount, period } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Budget name is required." });
    }

    if (amount === undefined || Number(amount) < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Valid budget amount is required." });
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

    const { createdAt, updatedAt, __v, ...budgetData } = (budget as any).toObject();

    return res
      .status(201)
      .json({ success: true, message: "Budget created successfully.", budget: budgetData });
  } catch (error: any) {
    console.error("Create budget error:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A budget with this name and period already exists.",
      });
    }
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error." });
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
      return res
        .status(404)
        .json({ success: false, message: "Budget not found." });
    }

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        return res
          .status(400)
          .json({ success: false, message: "Budget name cannot be empty." });
      }
      budget.name = name.trim();
    }

    if (amount !== undefined) {
      if (Number(amount) < 0) {
        return res.status(400).json({
          success: false,
          message: "Budget amount cannot be negative.",
        });
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

    const { createdAt, updatedAt, __v, ...budgetData } = (budget as any).toObject();

    return res
      .status(200)
      .json({ success: true, message: "Budget updated successfully.", budget: budgetData });
  } catch (error: any) {
    console.error("Update budget error:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A budget with this name and period already exists.",
      });
    }
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error." });
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
      return res
        .status(404)
        .json({ success: false, message: "Budget not found." });
    }

    return res
      .status(200)
      .json({ success: true, message: "Budget deleted successfully." });
  } catch (error) {
    console.error("Delete budget error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error." });
  }
};
