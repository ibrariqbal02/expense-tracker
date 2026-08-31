import React, { useState } from "react";
import {
    useGetExpenses,
    useCreateExpense,
    useUpdateExpense,
    useDeleteExpense,
    useGetDashboardStats,
} from "../../hooks/useExpenses";
import toast from "react-hot-toast";
import { useGetCategories } from "../../hooks/useCategories";

const emptyFilters = {
    search: "",
    category: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
};

const PAGE_SIZE = 10;

export default function Expenses() {
    const [filters, setFilters] = useState(emptyFilters);
    const [appliedFilters, setAppliedFilters] = useState<typeof emptyFilters | undefined>(undefined);
    const [currentPage, setCurrentPage] = useState(1);

    const activeFilters = appliedFilters
        ? Object.fromEntries(Object.entries(appliedFilters).filter(([, v]) => v !== ""))
        : undefined;

    const { data, isLoading } = useGetExpenses(activeFilters, currentPage, PAGE_SIZE);
    const expenses = data?.expenses ?? [];
    const pagination = data?.pagination;

    const { mutate: createExpense, isPending: isCreating } = useCreateExpense();
    const { mutate: updateExpense, isPending: isUpdating } = useUpdateExpense();
    const { mutate: deleteExpense } = useDeleteExpense();

    const { data: stats } = useGetDashboardStats();

    // Fetch all categories without pagination for the filter dropdown and form
    const { data: categoriesData } = useGetCategories(1, 100);
    const categories = categoriesData?.categories ?? [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
    });

    const handleOpenModal = (expense?: any) => {
        if (expense) {
            setEditingId(expense._id);
            setFormData({
                title: expense.title,
                amount: expense.amount.toString(),
                category: typeof expense.category === "object" ? expense.category._id : expense.category,
                date: new Date(expense.date).toISOString().split("T")[0],
                description: expense.description || "",
            });
        } else {
            setEditingId(null);
            setFormData({
                title: "",
                amount: "",
                category: "",
                date: new Date().toISOString().split("T")[0],
                description: "",
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            title: formData.title,
            amount: Number(formData.amount),
            category: formData.category,
            date: formData.date,
            description: formData.description,
        };

        if (editingId) {
            updateExpense(
                { id: editingId, ...payload },
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
        } else {
            createExpense(payload, {
                onSuccess: () => {
                    toast.success("Expense added!");
                    handleCloseModal();
                },
                onError: (err: any) => {
                    toast.error(err?.response?.data?.message || "Failed to create");
                },
            });
        }
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this expense?")) {
            deleteExpense(id, {
                onSuccess: () => toast.success("Expense deleted"),
                onError: () => toast.error("Failed to delete"),
            });
        }
    };

    const totalPages = pagination?.totalPages ?? 1;
    const total = pagination?.total ?? 0;
    const from = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const to = Math.min(currentPage * PAGE_SIZE, total);

    // Budget status derived from dashboard stats
    const monthlyBudget = stats?.budget ?? null;
    const monthlyUsedPct = monthlyBudget && monthlyBudget.limit > 0
        ? Math.min((monthlyBudget.used / monthlyBudget.limit) * 100, 100)
        : 0;
    const isOverMonthly = monthlyBudget && monthlyBudget.limit > 0 && monthlyBudget.used > monthlyBudget.limit;
    const isNearMonthly = !isOverMonthly && monthlyUsedPct >= 80;

    return (
        <div className="space-y-6">
            {/* Header and Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Expenses</h2>
                    <p className="text-sm text-gray-500">
                        Total records: <span className="font-semibold text-gray-700">{total}</span>
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                    + Add Expense
                </button>
            </div>

            {/* Budget Status Banner */}
            {monthlyBudget && monthlyBudget.limit > 0 && (
                <div
                    className={`rounded-xl border px-5 py-4 shadow-sm ${
                        isOverMonthly
                            ? "border-red-300 bg-red-50"
                            : isNearMonthly
                            ? "border-yellow-300 bg-yellow-50"
                            : "border-green-300 bg-green-50"
                    }`}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">
                                {isOverMonthly ? "🚨" : isNearMonthly ? "⚠️" : "✅"}
                            </span>
                            <div>
                                <p className={`text-sm font-semibold ${
                                    isOverMonthly ? "text-red-700" : isNearMonthly ? "text-yellow-700" : "text-green-700"
                                }`}>
                                    {isOverMonthly
                                        ? `Monthly budget exceeded by $${(monthlyBudget.used - monthlyBudget.limit).toFixed(2)}`
                                        : isNearMonthly
                                        ? `Approaching monthly budget limit (${monthlyUsedPct.toFixed(0)}% used)`
                                        : `Monthly budget on track (${monthlyUsedPct.toFixed(0)}% used)`}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    ${monthlyBudget.used.toFixed(2)} spent of ${monthlyBudget.limit.toFixed(2)} budget
                                    {!isOverMonthly && ` · $${monthlyBudget.remaining.toFixed(2)} remaining`}
                                </p>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="sm:w-48 w-full">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all ${
                                        isOverMonthly ? "bg-red-500" : isNearMonthly ? "bg-yellow-400" : "bg-green-500"
                                    }`}
                                    style={{ width: `${monthlyUsedPct}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <input
                        type="text"
                        placeholder="Search by title..."
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                    <select
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Min $"
                            className="w-1/2 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            value={filters.minAmount}
                            onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Max $"
                            className="w-1/2 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            value={filters.maxAmount}
                            onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                        />
                    </div>
                    <input
                        type="date"
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    />
                    <input
                        type="date"
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setAppliedFilters({ ...filters });
                                setCurrentPage(1);
                            }}
                            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                        >
                            Apply
                        </button>
                        <button
                            onClick={() => {
                                setFilters(emptyFilters);
                                setAppliedFilters(undefined);
                                setCurrentPage(1);
                            }}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Expenses Table */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading expenses...</div>
                ) : expenses.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No expenses found. Add one above!</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">Title</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Description</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {expenses.map((expense) => (
                                    <tr key={expense._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-900">{expense.title}</td>
                                        <td className="px-6 py-4 font-semibold text-red-600">${expense.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                                {typeof expense.category === "object" && expense.category !== null
                                                    ? (expense.category as any).name
                                                    : expense.category || "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{new Date(expense.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 max-w-xs truncate">{expense.description || "-"}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleOpenModal(expense)}
                                                className="text-blue-600 hover:underline font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(expense._id)}
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

                {/* Pagination */}
                {total > 0 && (
                    <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {from}–{to} of {total}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={!pagination?.hasPrevPage}
                                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={!pagination?.hasNextPage}
                                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add / Edit Expense Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
                    <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-lg border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                            {editingId ? "Edit Expense" : "Add New Expense"}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Groceries, Rent, Coffee..."
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Amount ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    placeholder="0.00"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                                <select
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none bg-white"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="">Select a Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    rows={2}
                                    placeholder="Optional notes..."
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating || isUpdating}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300"
                                >
                                    {isCreating || isUpdating ? "Saving..." : editingId ? "Update" : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
