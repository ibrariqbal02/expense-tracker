
import { useGetDashboardStats } from "../../hooks/useExpenses";


export default function DashboardOverview() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  }

  const { totalExpenses = 0, thisMonthExpenses = 0, expensesByCategory = [], recentExpenses = [] } = stats || {};

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
                const percentage = totalExpenses > 0 ? (item.totalAmount / totalExpenses) * 100 : 0;
                return (
                  <div key={item._id}>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="text-gray-900">${item.totalAmount.toFixed(2)} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
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
                      {expense.category?.name || "Uncategorized"} • {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-red-600">-${expense.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}