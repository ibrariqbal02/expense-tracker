import { Router } from "express";
import { myprofile, updateProfile } from "../controllers/profile.controller";
import  isAuthenticated  from "../middlewares/auth.middleware";
import upload from "../config/multer";

const profileRouter = Router();

profileRouter.get("/my-profile", isAuthenticated, myprofile);
profileRouter.put(
  "/profile",
  isAuthenticated,
  upload.single("profileUrl"),
  updateProfile
);
export default profileRouter;
