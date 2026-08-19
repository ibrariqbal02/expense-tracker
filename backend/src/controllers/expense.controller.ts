import { Request, Response } from "express";
import { Expense } from "../models/Expense";


export const createExpense = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const {
      title,
      amount,
      category,
      date,
      description,
      receiptUrl,
    } = req.body;

    if (!title || amount === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, amount, and category are required.",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0.",
      });
    }

    const expense = await Expense.create({
      title: title.trim(),
      amount: Number(amount),
      category,
      date: date || new Date(),
      description: description?.trim() || "",
      receiptUrl: receiptUrl || "",
      user: req.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Expense created successfully.",
      expense,
    });
  } catch (error) {
    console.error("Create expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};