import { Link, Outlet } from "react-router-dom";
import LogoutButton from "../Auth/LogoutButton";

export const Dashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Top Navbar Header */}
                <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:space-x-6">
                        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                        <nav className="flex flex-wrap gap-x-4 gap-y-2">
                            <Link
                                to="/dashboard"
                                className="text-sm font-medium text-gray-600 hover:text-blue-600"
                            >
                                Overview
                            </Link>
                            <Link
                                to="/dashboard/expenses"
                                className="text-sm font-medium text-gray-600 hover:text-blue-600"
                            >
                                Expenses
                            </Link>
                            <Link
                                to="/dashboard/categories"
                                className="text-sm font-medium text-gray-600 hover:text-blue-600"
                            >
                                Category
                            </Link>
                            <Link
                                to="/dashboard/profile"
                                className="text-sm font-medium text-gray-600 hover:text-blue-600"
                            >
                                Profile
                            </Link>
                        </nav>
                    </div>
                    <LogoutButton />
                </div>


                <Outlet />
            </div>
        </div>
    );
};