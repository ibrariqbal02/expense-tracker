import { Request, Response } from "express";
import { Budget } from "../models/budget";

export const setBudget = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const { amount } = req.body;

    if (amount === undefined || Number(amount) < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid budget amount is required.",
      });
    }

    const budget = await Budget.findOneAndUpdate(
      { user: req.userId },
      { amount: Number(amount) },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Monthly budget updated successfully.",
      budget,
    });
  } catch (error) {
    console.error("Set budget error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error." });
  }
};
