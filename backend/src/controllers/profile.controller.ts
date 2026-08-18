import { Request, Response } from "express";
import { User } from "../models/User";

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
