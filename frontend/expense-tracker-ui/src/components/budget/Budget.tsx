import React, { useState } from "react";
import {
  useGetBudgets,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
} from "../../hooks/useBudgets";
import type { BudgetPeriod } from "../../services/budget.service";
import toast from "react-hot-toast";
import { formatMoney } from "../../utils/formatMoney";
import { Pencil, Trash2, X, AlertTriangle, Plus } from "lucide-react";
import { useGetDashboardStats } from "../../hooks/useExpenses";

const PAGE_SIZE = 10;

const emptyForm = {
  name: "",
  amount: "",
  period: "monthly" as BudgetPeriod,
};

export default function Budget() {
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data, isLoading } = useGetBudgets(currentPage, PAGE_SIZE);
  const budgets = data?.budgets ?? [];
  const pagination = data?.pagination;

  // Pull live spend data so we can show remaining per budget
  const { data: stats } = useGetDashboardStats();
  const emptyPeriod = { limit: 0, spent: 0, remaining: 0, percentageUsed: 0, isExceeded: false, overBy: 0 };
  const monthlyStats = stats?.monthly ?? emptyPeriod;
  const yearlyStats  = stats?.yearly  ?? emptyPeriod;

  const { mutate: createBudget, isPending: isCreating } = useCreateBudget();
  const { mutate: updateBudget, isPending: isUpdating } = useUpdateBudget();
  const { mutate: deleteBudget } = useDeleteBudget();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  // Does the selected period already have a budget (when creating new)?
  const existingForPeriod = !editingId
    ? budgets.find((b) => b.period === formData.period)
    : null;

  const totalMonthly = budgets
    .filter((b) => b.period === "monthly")
    .reduce((acc, b) => acc + b.amount, 0);

  const totalYearly = budgets
    .filter((b) => b.period === "yearly")
    .reduce((acc, b) => acc + b.amount, 0);

  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const from = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, total);

  const handleOpenModal = (budget?: (typeof budgets)[0]) => {
    if (budget) {
      setEditingId(budget._id);
      setFormData({ name: budget.name, amount: budget.amount.toString(), period: budget.period });
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
          onSuccess: () => { toast.success("Budget updated!"); handleCloseModal(); },
          onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to update budget."),
        }
      );
    } else {
      createBudget(payload, {
        onSuccess: () => { toast.success("Budget created!"); handleCloseModal(); },
        onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to create budget."),
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteBudget(id, {
      onSuccess: () => { toast.success("Budget deleted."); setDeleteConfirmId(null); },
      onError: () => toast.error("Failed to delete budget."),
    });
  };

  const isSaving = isCreating || isUpdating;

  // Per-budget spend info for the table
  const spendForBudget = (b: (typeof budgets)[0]) => {
    const s = b.period === "monthly" ? monthlyStats : yearlyStats;
    // Only show if this is the active (matching) budget
    if (s.limit === b.amount) return s;
    return null;
  };

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Budgets</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {total === 0 ? "No budgets set yet" : `${total} budget${total !== 1 ? "s" : ""} configured`}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
        >
          <Plus size={16} /> Add Budget
        </button>
      </div>

      {/* ── Summary Cards ── */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Monthly summary */}
          <div className={`rounded-2xl border p-5 shadow-sm ${
            totalMonthly > 0 && monthlyStats.isExceeded
              ? "border-rose-200 bg-rose-50"
              : totalMonthly > 0 && monthlyStats.percentageUsed >= 80
              ? "border-amber-200 bg-amber-50"
              : "border-gray-200 bg-white"
          }`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Monthly Budget</p>
            <h3 className="text-2xl font-bold text-blue-600 mt-1">{formatMoney(totalMonthly)}</h3>
            {totalMonthly > 0 && (
              <>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      monthlyStats.isExceeded ? "bg-rose-500" : monthlyStats.percentageUsed >= 80 ? "bg-amber-400" : "bg-blue-500"
                    }`}
                    style={{ width: `${Math.min(monthlyStats.percentageUsed, 100)}%` }}
                  />
                </div>
                <p className={`text-xs mt-1 ${monthlyStats.isExceeded ? "text-rose-600 font-semibold" : "text-gray-400"}`}>
                  {monthlyStats.isExceeded
                    ? `Over by ${formatMoney(monthlyStats.overBy)}`
                    : `${formatMoney(monthlyStats.remaining)} remaining · ${monthlyStats.percentageUsed.toFixed(0)}% used`}
                </p>
              </>
            )}
          </div>

          {/* Yearly summary */}
          <div className={`rounded-2xl border p-5 shadow-sm ${
            totalYearly > 0 && yearlyStats.isExceeded
              ? "border-rose-200 bg-rose-50"
              : totalYearly > 0 && yearlyStats.percentageUsed >= 80
              ? "border-amber-200 bg-amber-50"
              : "border-gray-200 bg-white"
          }`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Yearly Budget</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{formatMoney(totalYearly)}</h3>
            {totalYearly > 0 && (
              <>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      yearlyStats.isExceeded ? "bg-rose-500" : yearlyStats.percentageUsed >= 80 ? "bg-amber-400" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(yearlyStats.percentageUsed, 100)}%` }}
                  />
                </div>
                <p className={`text-xs mt-1 ${yearlyStats.isExceeded ? "text-rose-600 font-semibold" : "text-gray-400"}`}>
                  {yearlyStats.isExceeded
                    ? `Over by ${formatMoney(yearlyStats.overBy)}`
                    : `${formatMoney(yearlyStats.remaining)} remaining · ${yearlyStats.percentageUsed.toFixed(0)}% used`}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Budget Table ── */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Loading budgets…</div>
        ) : budgets.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            No budgets yet. Click <span className="font-semibold text-blue-600">Add Budget</span> to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Name</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Limit</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Period</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Spent / Remaining</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((budget, idx) => {
                  const spend = spendForBudget(budget);
                  return (
                    <tr
                      key={budget._id}
                      className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors ${idx % 2 !== 0 ? "bg-gray-50/40" : ""}`}
                    >
                      <td className="px-5 py-4 font-semibold text-gray-800">{budget.name}</td>
                      <td className="px-5 py-4 font-bold text-blue-600 tabular-nums">{formatMoney(budget.amount)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          budget.period === "monthly" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {budget.period}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {spend ? (
                          <div className="space-y-1 min-w-[140px]">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">{formatMoney(spend.spent)} spent</span>
                              <span className={spend.isExceeded ? "text-rose-600 font-semibold" : "text-gray-700"}>
                                {spend.isExceeded ? `-${formatMoney(spend.overBy)}` : `${formatMoney(spend.remaining)} left`}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${spend.isExceeded ? "bg-rose-500" : spend.percentageUsed >= 80 ? "bg-amber-400" : "bg-emerald-500"}`}
                                style={{ width: `${Math.min(spend.percentageUsed, 100)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenModal(budget)}
                            title="Edit"
                            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(budget._id)}
                            title="Delete"
                            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-400">
              Showing <span className="font-semibold text-gray-600">{from}–{to}</span> of{" "}
              <span className="font-semibold text-gray-600">{total}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!pagination?.hasPrevPage}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={!pagination?.hasNextPage}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-100">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? "Edit Budget" : "New Budget"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

              {/* Period conflict warning */}
              {existingForPeriod && (
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <AlertTriangle size={15} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700">
                    You already have a <span className="font-semibold">{formData.period}</span> budget
                    called <span className="font-semibold">"{existingForPeriod.name}"</span> ({formatMoney(existingForPeriod.amount)}).
                    Only one per period is allowed. Edit or delete the existing one instead.
                  </p>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Budget Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Spending, Annual Budget…"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-blue-400 focus:bg-white focus:outline-none transition"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="0.00"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-blue-400 focus:bg-white focus:outline-none transition"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Period</label>
                  <select
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-blue-400 focus:bg-white focus:outline-none transition"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value as BudgetPeriod })}
                    disabled={!!editingId} // can't change period on edit
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
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
                  disabled={isSaving || !!existingForPeriod}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition active:scale-95"
                >
                  {isSaving ? "Saving…" : editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border border-gray-100 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 mx-auto mb-4">
              <Trash2 size={22} className="text-rose-600" />
            </div>
            <h3 className="text-center text-base font-bold text-gray-900 mb-1">Delete budget?</h3>
            <p className="text-center text-sm text-gray-500 mb-6">Expense limits for this period will no longer be enforced.</p>
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
