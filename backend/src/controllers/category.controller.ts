import { Request, Response } from "express";
import { Category } from "../models/Category";

export const createCategory = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required.",
      });
    }

    const categoryName = name.trim();

    const existingCategory = await Category.findOne({
      name: categoryName,
      user: req.userId,
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category already exists.",
      });
    }

    const category = await Category.create({
      name: categoryName,
      user: req.userId,
    });

    const { createdAt, updatedAt, __v, ...categoryData } = (category as any).toObject();

    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      category: categoryData,
    });
  } catch (error) {
    console.error("Create category error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const { page, limit } = req.query;

    const pageNumber = Math.max(1, parseInt(page as string) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
    const skip = (pageNumber - 1) * pageSize;

    const filter = { user: req.userId };

    const [categories, total] = await Promise.all([
      Category.find(filter, { createdAt: 0, updatedAt: 0, __v: 0 })
        .sort({ name: 1 })
        .skip(skip)
        .limit(pageSize),
      Category.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return res.status(200).json({
      success: true,
      message: `Total ${total} Categories`,
      categories,
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
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};
