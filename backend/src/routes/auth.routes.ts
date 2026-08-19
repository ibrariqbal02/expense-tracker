import { Router } from "express";
import { login, logout, refreshToken, register, updatePassword } from "../controllers/auth.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";




const authRouter = Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.get('/logout',isAuthenticated,logout)
authRouter.post("/refresh", refreshToken);
authRouter.patch("/update-password", isAuthenticated, updatePassword);

export default authRouter
