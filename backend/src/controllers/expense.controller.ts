import { Request, Response } from "express";
import { Expense } from "../models/Expense";
import mongoose from "mongoose";
import { Category } from "../models/Category";
import { Budget } from "../models/Budget";

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

    // Budget exceeded check
    const expenseDate = date ? new Date(date) : new Date();
    const now = expenseDate;
    const userId = new mongoose.Types.ObjectId(req.userId);

    const userBudgets = await Budget.find({ user: req.userId });

    for (const budget of userBudgets) {
      let periodStart: Date;
      let periodEnd: Date;

      if (budget.period === "monthly") {
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      } else {
        periodStart = new Date(now.getFullYear(), 0, 1);
        periodEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      }

      const spentResult = await Expense.aggregate([
        {
          $match: {
            user: userId,
            date: { $gte: periodStart, $lte: periodEnd },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const alreadySpent = spentResult[0]?.total || 0;
      const projectedSpend = alreadySpent + Number(amount);

      if (projectedSpend > budget.amount) {
        const overBy = (projectedSpend - budget.amount).toFixed(2);
        const remaining = Math.max(0, budget.amount - alreadySpent).toFixed(2);
        return res.status(422).json({
          success: false,
          message: `Adding this expense exceeds your "${budget.name}" ${budget.period} budget by $${overBy}. Remaining budget: $${remaining}.`,
          budget: {
            name: budget.name,
            period: budget.period,
            limit: budget.amount,
            spent: alreadySpent,
            remaining: Number(remaining),
            overBy: Number(overBy),
          },
        });
      }
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

    const { createdAt, updatedAt, __v, ...expenseData } = (expense as any).toObject();

    return res.status(201).json({
      success: true,
      message: "Expense created successfully.",
      expense: expenseData,
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

    // Budget exceeded check — only when amount is being increased
    if (amount !== undefined) {
      const amountDelta = Number(amount) - expense.amount;
      if (amountDelta > 0) {
        const expenseDate = expense.date || new Date();
        const userId = new mongoose.Types.ObjectId(req.userId);
        const userBudgets = await Budget.find({ user: req.userId });

        for (const budget of userBudgets) {
          let periodStart: Date;
          let periodEnd: Date;

          if (budget.period === "monthly") {
            periodStart = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), 1);
            periodEnd = new Date(expenseDate.getFullYear(), expenseDate.getMonth() + 1, 0, 23, 59, 59, 999);
          } else {
            periodStart = new Date(expenseDate.getFullYear(), 0, 1);
            periodEnd = new Date(expenseDate.getFullYear(), 11, 31, 23, 59, 59, 999);
          }

          const spentResult = await Expense.aggregate([
            {
              $match: {
                user: userId,
                date: { $gte: periodStart, $lte: periodEnd },
              },
            },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]);

          const alreadySpent = spentResult[0]?.total || 0;
          const projectedSpend = alreadySpent + amountDelta;

          if (projectedSpend > budget.amount) {
            const overBy = (projectedSpend - budget.amount).toFixed(2);
            const remaining = Math.max(0, budget.amount - alreadySpent).toFixed(2);
            return res.status(422).json({
              success: false,
              message: `This update exceeds your "${budget.name}" ${budget.period} budget by $${overBy}. Remaining budget: $${remaining}.`,
              budget: {
                name: budget.name,
                period: budget.period,
                limit: budget.amount,
                spent: alreadySpent,
                remaining: Number(remaining),
                overBy: Number(overBy),
              },
            });
          }
        }
      }
    }

    await expense.save();

    const { createdAt, updatedAt, __v, ...expenseData } = (expense as any).toObject();

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully.",
      expense: expenseData,
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

    const { search, category, startDate, endDate, minAmount, maxAmount, page, limit } =
      req.query;

    const pageNumber = Math.max(1, parseInt(page as string) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
    const skip = (pageNumber - 1) * pageSize;

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

    const [expenses, total] = await Promise.all([
      Expense.find(filter, { createdAt: 0, updatedAt: 0, __v: 0 })
        .populate("category", "name")
        .sort({ date: -1 })
        .skip(skip)
        .limit(pageSize),
      Expense.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return res.status(200).json({
      success: true,
      message: `Fetched ${expenses.length} expenses successfully.`,
      expenses,
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

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }
    const userId = new mongoose.Types.ObjectId(req.userId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const totalResult = await Expense.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalExpenses = totalResult[0]?.total || 0;

    const thisMonthResult = await Expense.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const thisMonthExpenses = thisMonthResult[0]?.total || 0;

    const userBudget = await Budget.findOne({ user: userId });
    const budgetLimit = userBudget ? userBudget.amount : 0;
    const remainingBudget = Math.max(0, budgetLimit - thisMonthExpenses);
    const percentageUsed =
      budgetLimit > 0
        ? Number(((thisMonthExpenses / budgetLimit) * 100).toFixed(2))
        : 0;

    const expensesByCategory = await Expense.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
      {
        $project: {
          _id: 1,
          name: "$categoryInfo.name",
          totalAmount: 1,
          count: 1,
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    const recentExpenses = await Expense.find({ user: userId }, { createdAt: 0, updatedAt: 0, __v: 0 })
      .populate("category", "name")
      .sort({ date: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      data: {
        totalExpenses,
        thisMonthExpenses,
        budget: {
          limit: budgetLimit,
          used: thisMonthExpenses,
          remaining: remainingBudget,
          percentageUsed,
        },
        expensesByCategory,
        recentExpenses,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error." });
  }
};
