import { Router } from "express";
import { createCategory } from "../controllers/category.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";




const categoryRoutes = Router()

categoryRoutes.post("/",isAuthenticated,createCategory)
export default categoryRoutes