import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../page/Login";
import Register from "../page/Register";
import Profile from "../page/Profile";
import { Dashboard } from "../page/Dashboard";
import { DashboardOverview } from "../page/DashboardOverview";
import Expenses from "../page/Expenses";
import Categories from "../page/Categories";


export const AppRoutes = () => {
  return (
    <Routes>
  
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />}>
        <Route index element={<DashboardOverview />} />
        <Route path="profile" element={<Profile />} />
        <Route path="expenses" element={<Expenses />} /> 
        <Route path="categories" element={<Categories />} /> {/* Category Route */}
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};