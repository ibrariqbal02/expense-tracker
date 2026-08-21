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

    const { title, amount, category, date, description, receiptUrl } = req.body;

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

    if (category !== undefined) {
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
    await expense.save();
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

    const { search, category, startDate, endDate, minAmount, maxAmount } =
      req.query;
    const filter: any = { user: req.userId };
    if (search) {
      filter.title = { $regex: search as string, $options: "i" };
    }
    if (category) {
      filter.category = category;
    }
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = Number(minAmount);
      if (maxAmount) filter.amount.$lte = Number(maxAmount);
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) {
        // Set end date to end of the selected day (23:59:59)
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }
    const expenses = await Expense.find(filter)
      .populate("category", "name")
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      message: `Fetched ${expenses.length} expenses successfully.`,
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


// export const getDashboardStats = async(rq)