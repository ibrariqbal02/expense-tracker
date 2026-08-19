import { Request, Response } from "express";
import { Expense } from "../models/Expense";
import mongoose from "mongoose";
import { Category } from "../models/Category";

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

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID.",
      });
    }

    const categoryExists = await Category.findOne({
      _id: category,
      user: req.userId,
    });

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
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

export const updateExpense = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(400).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    const { title, amount, category, date, description, receiptUrl } = req.body;
    const expense = await Expense.findOne({
      _id: id,
      user: req.userId,
    });
    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: "Expense Not found" });
    }

    if (title !== undefined) {
      expense.title = title.trim();
    }
    if (amount !== undefined) {
      if (Number(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be greater than 0.",
        });
      }
      expense.amount = amount;
    }

    if(category !== undefined){
        expense.category = category;
    }
    if (date !== undefined) {
      expense.date = date;
    }

    if (description !== undefined) {
      expense.description = description.trim();
    }

    if (receiptUrl !== undefined) {
      expense.receiptUrl = receiptUrl;
    }
    await expense.save()
     return res.status(200).json({
      success: true,
      message: "Expense updated successfully.",
      expense,
    });
  } catch (error) {
     console.error("Update expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};
export const getExpenses = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const expenses = await Expense.find({
      user: req.userId,
    }).sort({ date: -1 });

    return res.status(200).json({
      success: true,
      message: `Expenses ${expenses.length} fetched successfully.`,
      expenses,
    });
  } catch (error) {
    console.error("Get expenses error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const { id } = req.params;

    const expense = await Expense.findOne({
      _id: id,
      user: req.userId,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

    await Expense.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully.",
    });
  } catch (error) {
    console.error("Delete expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};