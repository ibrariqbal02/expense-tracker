import express, { Application } from "express";

import dotenv from "dotenv";
import connectDb from "./config/database";
import authRouter from "./routes/auth.routes";
dotenv.config();


const app: Application = express();
connectDb()
const PORT: number = Number(process.env.PORT) || 4000;
 

//meddleware
app.use(express.json());

// Routes 
app.use('/api/auth', authRouter)









app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})