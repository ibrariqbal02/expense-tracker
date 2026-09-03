import React, { useState } from "react";
import { useGetDashboardStats, useDeleteExpense, useUpdateExpense } from "../../hooks/useExpenses";
import { useGetCategories } from "../../hooks/useCategories";
import { Link } from "react-router-dom";
import { formatMoney } from "../../utils/formatMoney";
import { Pencil, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import BudgetStatusBanner from "../shared/BudgetStatusBanner";

export default function DashboardOverview() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();

  const { mutate: deleteExpense } = useDeleteExpense();
  const { mutate: updateExpense, isPending: isUpdating } = useUpdateExpense();
  const { data: categoriesData } = useGetCategories(1, 100);
  const categories = categoriesData?.categories ?? [];

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
    description: "",
  });

  const handleOpenEdit = (expense: any) => {
    setEditingId(expense._id);
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      category: typeof expense.category === "object" ? expense.category._id : expense.category,
      date: new Date(expense.date).toISOString().split("T")[0],
      description: expense.description || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    updateExpense(
      {
        id: editingId,
        title: formData.title,
        amount: Number(formData.amount),
        category: formData.category,
        date: formData.date,
        description: formData.description,
      },
      {
        onSuccess: () => {
          toast.success("Expense updated!");
          handleCloseModal();
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to update");
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteExpense(id, {
      onSuccess: () => { toast.success("Expense deleted"); setDeleteConfirmId(null); },
      onError: () => toast.error("Failed to delete"),
    });
  };

  const isLoading = statsLoading;

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  }

  const {
    totalExpenses = 0,
    thisMonthExpenses = 0,
    thisYearExpenses = 0,
    expensesByCategory = [],
    recentExpenses = [],
  } = stats || {};

  // Zero-safe fallback shapes
  const emptyPeriod = { limit: 0, spent: 0, remaining: 0, percentageUsed: 0, isExceeded: false, overBy: 0 };
  const monthly = stats?.monthly ?? emptyPeriod;
  const yearly  = stats?.yearly  ?? emptyPeriod;

  const yearlyRemaining = yearly.limit > 0 ? yearly.remaining : null;

  return (
    <div className="space-y-6">
      {/* ── Top Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">All-Time Total</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1.5">{formatMoney(totalExpenses)}</h3>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">This Year</p>
          <h3 className="text-2xl font-bold text-blue-600 mt-1.5">{formatMoney(thisYearExpenses)}</h3>
          {monthly.limit > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              Monthly budget: {formatMoney(monthly.limit)}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">This Month</p>
          <h3 className="text-2xl font-bold text-indigo-600 mt-1.5">{formatMoney(thisMonthExpenses)}</h3>
          {monthly.limit > 0 && (
            <p className={`text-xs mt-0.5 ${monthly.isExceeded ? "text-rose-500 font-semibold" : "text-gray-400"}`}>
              {monthly.isExceeded
                ? `Over by ${formatMoney(monthly.overBy)}`
                : `${formatMoney(monthly.remaining)} remaining`}
            </p>
          )}
        </div>

        <div className={`rounded-xl border p-5 shadow-sm ${
          yearlyRemaining === null
            ? "border-gray-200 bg-white"
            : yearly.isExceeded
            ? "border-rose-200 bg-rose-50"
            : yearly.percentageUsed >= 80
            ? "border-amber-200 bg-amber-50"
            : "border-emerald-200 bg-emerald-50"
        }`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Yearly Remaining</p>
          {yearlyRemaining !== null ? (
            <>
              <h3 className={`text-2xl font-bold mt-1.5 ${
                yearly.isExceeded ? "text-rose-600" : yearly.percentageUsed >= 80 ? "text-amber-600" : "text-emerald-600"
              }`}>
                {yearly.isExceeded ? "-" : ""}{formatMoney(yearly.isExceeded ? yearly.overBy : yearlyRemaining)}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatMoney(thisYearExpenses)} of {formatMoney(yearly.limit)} used
              </p>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-gray-300 mt-1.5">—</h3>
              <Link to="/dashboard/budgets" className="text-xs text-blue-500 hover:underline mt-0.5 block">
                Set a yearly budget
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── Budget Status Banner (monthly + yearly) ── */}
      <BudgetStatusBanner monthly={monthly} yearly={yearly} />

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
                        {formatMoney(item.totalAmount)} ({percentage.toFixed(0)}%)
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
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-red-600 mr-2">
                      -{formatMoney(expense.amount)}
                    </span>
                    <button
                      onClick={() => handleOpenEdit(expense)}
                      title="Edit"
                      className="inline-flex items-center justify-center rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 transition"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(expense._id)}
                      title="Delete"
                      className="inline-flex items-center justify-center rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Edit Expense</h3>
              <button
                onClick={handleCloseModal}
                className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-blue-400 focus:bg-white focus:outline-none transition"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-blue-400 focus:bg-white focus:outline-none transition"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-blue-400 focus:bg-white focus:outline-none transition"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                <select
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-blue-400 focus:bg-white focus:outline-none transition"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select a Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={2}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-blue-400 focus:bg-white focus:outline-none transition resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300 transition active:scale-95"
                >
                  {isUpdating ? "Saving…" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border border-gray-100 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 mx-auto mb-4">
              <Trash2 size={22} className="text-rose-600" />
            </div>
            <h3 className="text-center text-base font-bold text-gray-900 mb-1">Delete expense?</h3>
            <p className="text-center text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 transition active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
