import { Router } from "express";
import { myprofile } from "../controllers/profile.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";



const profileRouter = Router()

profileRouter.get("/my-profile",isAuthenticated,myprofile)
export default profileRouter