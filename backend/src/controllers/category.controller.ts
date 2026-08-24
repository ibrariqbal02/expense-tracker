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

    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      category,
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

    const categories = await Category.find({
      user: req.userId,
    }).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      message: `Total ${categories.length} Categories `,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};
