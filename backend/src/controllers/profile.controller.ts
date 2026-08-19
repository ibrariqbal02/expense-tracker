import { Request, Response } from "express";
import { User } from "../models/User";
import uploadToCloudinary from "../utils/uploadtoCloud";


export const myprofile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId).select(
      "-password -refreshToken"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Profile Details", user });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { name } = req.body;

    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name !== undefined) {
      user.name = name;
    }

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        "profiles"
      );

      user.profileUrl = result.secure_url;
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Update profile error:", error);

    const message =
      error instanceof Error
        ? error.message
        : error?.message || error?.error?.message || "Internal Server Error";

    return res.status(500).json({
      success: false,
      message,
    });
  }
};

