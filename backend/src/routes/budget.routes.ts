import { Router } from "express";
import { setBudget } from "../controllers/budget.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";


const budgetRouter =  Router()


budgetRouter.post('/',isAuthenticated,setBudget)


export default budgetRouter