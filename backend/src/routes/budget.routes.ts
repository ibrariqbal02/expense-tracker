import { Router } from "express";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../controllers/budget.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";

const budgetRouter = Router();

budgetRouter.get("/", isAuthenticated, getBudgets);
budgetRouter.post("/", isAuthenticated, createBudget);
budgetRouter.put("/:id", isAuthenticated, updateBudget);
budgetRouter.delete("/:id", isAuthenticated, deleteBudget);

export default budgetRouter;
