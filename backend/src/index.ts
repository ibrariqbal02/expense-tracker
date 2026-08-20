import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDb from "./config/database";
import authRouter from "./routes/auth.routes";
import profileRouter from "./routes/profile.routes";
import expenseRouter from "./routes/expense.routes";
import categoryRoutes from "./routes/category.routes";
dotenv.config();

const app: Application = express();
connectDb();
const PORT: number = Number(process.env.PORT) || 4000;

//meddleware
app.use(express.json());




app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true, 
  })
);
// Routes
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/expense", expenseRouter);
app.use("/api/category", categoryRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
