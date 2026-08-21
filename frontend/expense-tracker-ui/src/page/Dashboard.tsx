import { Link, Outlet } from "react-router-dom";
import LogoutButton from "./LogoutButton";

export const Dashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Top Navbar Header */}
                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center space-x-6">
                        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                        <nav className="flex space-x-4">
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