import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import { Dashboard } from "../pages/Dashboard";
import { DashboardOverview } from "../pages/DashboardOverview";
import Expenses from "../pages/Expenses";


export const AppRoutes = () => {
  return (
    <Routes>
  
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />}>
        <Route index element={<DashboardOverview />} />
        <Route path="profile" element={<Profile />} />
        <Route path="expenses" element={<Expenses />} /> 
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};