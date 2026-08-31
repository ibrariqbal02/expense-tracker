import { useGetDashboardStats } from "../../hooks/useExpenses";
import { useGetBudgets } from "../../hooks/useBudgets";
import { Link } from "react-router-dom";

export default function DashboardOverview() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: budgetsData, isLoading: budgetsLoading } = useGetBudgets(1, 100);
  const budgets = budgetsData?.budgets ?? [];

  const isLoading = statsLoading || budgetsLoading;

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  }

  const {
    totalExpenses = 0,
    thisMonthExpenses = 0,
    expensesByCategory = [],
    recentExpenses = [],
  } = stats || {};

  // Budget computations
  const totalMonthlyBudget = budgets
    .filter((b) => b.period === "monthly")
    .reduce((acc, b) => acc + b.amount, 0);

  const totalYearlyBudget = budgets
    .filter((b) => b.period === "yearly")
    .reduce((acc, b) => acc + b.amount, 0);

  const monthlyRemaining = totalMonthlyBudget - thisMonthExpenses;
  const monthlyUsedPct =
    totalMonthlyBudget > 0
      ? Math.min((thisMonthExpenses / totalMonthlyBudget) * 100, 100)
      : 0;
  const isOverBudget = totalMonthlyBudget > 0 && thisMonthExpenses > totalMonthlyBudget;

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Expenses</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-2">${totalExpenses.toFixed(2)}</h3>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Expenses This Month</p>
          <h3 className="text-3xl font-bold text-blue-600 mt-2">${thisMonthExpenses.toFixed(2)}</h3>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Budget Overview</h3>
          <Link
            to="/dashboard/budgets"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Manage Budgets →
          </Link>
        </div>

        {budgets.length === 0 ? (
          <p className="text-sm text-gray-500">
            No budgets set.{" "}
            <Link to="/dashboard/budgets" className="text-blue-600 hover:underline font-medium">
              Add one now
            </Link>
          </p>
        ) : (
          <div className="space-y-5">
            {/* Monthly Budget vs Spending */}
            {totalMonthlyBudget > 0 && (
              <div>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="text-gray-700">Monthly Budget</span>
                  <span className={isOverBudget ? "text-red-600" : "text-gray-900"}>
                    ${thisMonthExpenses.toFixed(2)} / ${totalMonthlyBudget.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${
                      isOverBudget ? "bg-red-500" : monthlyUsedPct > 80 ? "bg-yellow-400" : "bg-blue-600"
                    }`}
                    style={{ width: `${monthlyUsedPct}%` }}
                  />
                </div>
                <p className={`text-xs mt-1 ${isOverBudget ? "text-red-500 font-medium" : "text-gray-400"}`}>
                  {isOverBudget
                    ? `Over budget by $${Math.abs(monthlyRemaining).toFixed(2)}`
                    : `$${monthlyRemaining.toFixed(2)} remaining`}
                </p>
              </div>
            )}

            {/* Summary row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-xs text-blue-500 font-medium">Monthly Budget</p>
                <p className="text-lg font-bold text-blue-700 mt-0.5">
                  ${totalMonthlyBudget.toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-3">
                <p className="text-xs text-green-500 font-medium">Yearly Budget</p>
                <p className="text-lg font-bold text-green-700 mt-0.5">
                  ${totalYearlyBudget.toFixed(2)}
                </p>
              </div>
              <div className={`rounded-lg p-3 ${isOverBudget ? "bg-red-50" : "bg-gray-50"}`}>
                <p className={`text-xs font-medium ${isOverBudget ? "text-red-500" : "text-gray-500"}`}>
                  Monthly Remaining
                </p>
                <p className={`text-lg font-bold mt-0.5 ${isOverBudget ? "text-red-600" : "text-gray-700"}`}>
                  {isOverBudget ? "-" : ""}${Math.abs(monthlyRemaining).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Expenses by Category</h3>
          {expensesByCategory.length === 0 ? (
            <p className="text-sm text-gray-500">No category spending recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {expensesByCategory.map((item: any) => {
                const percentage =
                  totalExpenses > 0 ? (item.totalAmount / totalExpenses) * 100 : 0;
                return (
                  <div key={item._id}>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="text-gray-900">
                        ${item.totalAmount.toFixed(2)} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Expenses</h3>
          {recentExpenses.length === 0 ? (
            <p className="text-sm text-gray-500">No recent transactions found.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentExpenses.map((expense: any) => (
                <div key={expense._id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{expense.title}</p>
                    <p className="text-xs text-gray-500">
                      {expense.category?.name || "Uncategorized"} •{" "}
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-red-600">
                    -${expense.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
