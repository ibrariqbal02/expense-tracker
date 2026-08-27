import React, { useState } from "react";
import {
  useGetBudgets,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
} from "../../hooks/useBudgets";
import type { BudgetPeriod } from "../../services/budget.service";
import toast from "react-hot-toast";

const emptyForm = {
  name: "",
  amount: "",
  period: "monthly" as BudgetPeriod,
};

export default function Budget() {
  const { data: budgets = [], isLoading } = useGetBudgets();
  const { mutate: createBudget, isPending: isCreating } = useCreateBudget();
  const { mutate: updateBudget, isPending: isUpdating } = useUpdateBudget();
  const { mutate: deleteBudget } = useDeleteBudget();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const totalMonthly = budgets
    .filter((b) => b.period === "monthly")
    .reduce((acc, b) => acc + b.amount, 0);

  const totalYearly = budgets
    .filter((b) => b.period === "yearly")
    .reduce((acc, b) => acc + b.amount, 0);

  const handleOpenModal = (budget?: (typeof budgets)[0]) => {
    if (budget) {
      setEditingId(budget._id);
      setFormData({
        name: budget.name,
        amount: budget.amount.toString(),
        period: budget.period,
      });
    } else {
      setEditingId(null);
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name.trim(),
      amount: Number(formData.amount),
      period: formData.period,
    };

    if (editingId) {
      updateBudget(
        { id: editingId, ...payload },
        {
          onSuccess: () => {
            toast.success("Budget updated!");
            handleCloseModal();
          },
          onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to update budget.");
          },
        }
      );
    } else {
      createBudget(payload, {
        onSuccess: () => {
          toast.success("Budget created!");
          handleCloseModal();
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to create budget.");
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this budget?")) {
      deleteBudget(id, {
        onSuccess: () => toast.success("Budget deleted."),
        onError: () => toast.error("Failed to delete budget."),
      });
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <div className="space-y-6">
      {/* Header & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Budgets</h2>
          <p className="text-sm text-gray-500 mt-1">
            {budgets.length === 0
              ? "No budgets set yet."
              : `${budgets.length} budget${budgets.length !== 1 ? "s" : ""} configured`}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          + Add Budget
        </button>
      </div>

      {/* Summary Cards */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Monthly Budgets</p>
            <h3 className="text-3xl font-bold text-blue-600 mt-2">${totalMonthly.toFixed(2)}</h3>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Yearly Budgets</p>
            <h3 className="text-3xl font-bold text-green-600 mt-2">${totalYearly.toFixed(2)}</h3>
          </div>
        </div>
      )}

      {/* Budget List */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading budgets...</div>
        ) : budgets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No budgets yet. Click <span className="font-medium text-blue-600">+ Add Budget</span> to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Period</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {budgets.map((budget) => (
                  <tr key={budget._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{budget.name}</td>
                    <td className="px-6 py-4 font-semibold text-blue-600">
                      ${budget.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                          budget.period === "monthly"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {budget.period}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {budget.createdAt
                        ? new Date(budget.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(budget)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(budget._id)}
                        className="text-red-600 hover:underline font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-5">
              {editingId ? "Edit Budget" : "Add New Budget"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Budget Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Groceries, Rent, Entertainment..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Amount */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              {/* Period */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Period
                </label>
                <select
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
                  value={formData.period}
                  onChange={(e) =>
                    setFormData({ ...formData, period: e.target.value as BudgetPeriod })
                  }
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : editingId ? "Update Budget" : "Create Budget"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
