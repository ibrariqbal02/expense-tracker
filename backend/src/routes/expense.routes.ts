import { Router } from "express";
import { createExpense, deleteExpense, getExpenses, updateExpense } from "../controllers/expense.controller";
import isAuthenticated  from "../middlewares/auth.middleware";


const expenseRouter = Router()

expenseRouter.post('/', isAuthenticated,createExpense)
expenseRouter.post('/updated/:id', isAuthenticated,updateExpense)
expenseRouter.get("/", isAuthenticated, getExpenses);

expenseRouter.delete("/:id", isAuthenticated, deleteExpense);
export default expenseRouter