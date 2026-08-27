
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import Profile from "../components/profile/Profile";
import { Dashboard } from "../components/dashboard/Dashboard";
import DashboardOverview from "../components/organisms/DashboardOverview";
import Expenses from "../components/expense/Expenses";
import Categories from "../components/category/Categories";
import Budget from "../components/budget/Budget";


export const AppRoutes = () => {
  return (
    <Routes>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />}>
        <Route index element={<DashboardOverview />} />
        <Route path="profile" element={<Profile />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="categories" element={<Categories />} />
        <Route path="budgets" element={<Budget />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};