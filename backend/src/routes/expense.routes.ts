import { Router } from "express";
import { createExpense, deleteExpense, getDashboardStats, getExpenses, updateExpense } from "../controllers/expense.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";


const expenseRouter = Router()

expenseRouter.post('/', isAuthenticated,createExpense)
expenseRouter.put('/updated/:id', isAuthenticated,updateExpense)
expenseRouter.get("/", isAuthenticated, getExpenses);

expenseRouter.delete("/:id", isAuthenticated, deleteExpense);
expenseRouter.get("/dashboard", isAuthenticated,getDashboardStats)
export default expenseRouter