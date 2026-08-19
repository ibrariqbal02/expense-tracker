import { Router } from "express";
import { createExpense, updateExpense } from "../controllers/expense.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";


const expenseRouter = Router()

expenseRouter.post('/', isAuthenticated,createExpense)
expenseRouter.post('/updated/:id', isAuthenticated,updateExpense)
export default expenseRouter