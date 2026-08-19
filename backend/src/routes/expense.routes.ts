import { Router } from "express";
import { createExpense } from "../controllers/expense.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";


const expenseRouter = Router()

expenseRouter.post('/', isAuthenticated,createExpense)
export default expenseRouter