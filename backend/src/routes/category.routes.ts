import { Router } from "express";
import {
  createCategory,
  getCategories,
} from "../controllers/category.controller";
import  isAuthenticated from "../middlewares/auth.middleware";

const categoryRoutes = Router();

categoryRoutes.post("/", isAuthenticated, createCategory);
categoryRoutes.get("/", isAuthenticated, getCategories);

export default categoryRoutes;
