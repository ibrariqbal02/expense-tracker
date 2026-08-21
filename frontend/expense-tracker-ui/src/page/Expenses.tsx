import React, { useState } from "react";
import {
    useGetExpenses,
    useCreateExpense,
    useUpdateExpense,
    useDeleteExpense,
} from "../hooks/useExpenses";
import toast from "react-hot-toast";
import { useGetCategories } from "../hooks/useCategories";

export default function Expenses() {

    const [filters, setFilters] = useState({
        search: "",
        category: "",
        startDate: "",
        endDate: "",
        minAmount: "",
        maxAmount: "",
    });


    const { data: expenses = [], isLoading } = useGetExpenses(filters);
    const { mutate: createExpense, isPending: isCreating } = useCreateExpense();
    const { mutate: updateExpense, isPending: isUpdating } = useUpdateExpense();
    const { mutate: deleteExpense } = useDeleteExpense();
    const { data: categories = [] } = useGetCategories();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
    });


    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };


    const handleClearFilters = () => {
        setFilters({
            search: "",
            category: "",
            startDate: "",
            endDate: "",
            minAmount: "",
            maxAmount: "",
        });
    };

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

    const totalExpense = expenses.reduce((acc: number, curr: any) => acc + curr.amount, 0);

    return (
        <div className="space-y-6">
            {/* Header and Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Expenses</h2>
                    <p className="text-sm text-gray-500">
                        Total Spent: <span className="font-semibold text-red-600">${totalExpense.toFixed(2)}</span>
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                    + Add Expense
                </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <h3 className="text-sm font-semibold text-gray-700">Filter Expenses</h3>
                    <button
                        onClick={handleClearFilters}
                        className="text-xs text-blue-600 hover:underline font-medium"
                    >
                        Reset Filters
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {/* Search by Title */}
                    <input
                        type="text"
                        placeholder="Search title..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />

                    {/* Category Filter */}
                    <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange("category", e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat: any) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>

                    {/* Min Amount */}
                    <input
                        type="number"
                        placeholder="Min $"
                        value={filters.minAmount}
                        onChange={(e) => handleFilterChange("minAmount", e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />

                    {/* Max Amount */}
                    <input
                        type="number"
                        placeholder="Max $"
                        value={filters.maxAmount}
                        onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />

                    {/* Start Date */}
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange("startDate", e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />

                    {/* End Date */}
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange("endDate", e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>
            </div>

            {/* Expenses Table */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading expenses...</div>
                ) : expenses.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No expenses match your criteria.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">Title</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Description</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {expenses.map((expense: any) => (
                                    <tr key={expense._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-900">{expense.title}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                                {expense.category?.name || "Uncategorized"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-red-600">${expense.amount.toFixed(2)}</td>
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
            </div>

            {/* Modal remains unchanged */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg border border-gray-200">
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
                                    {categories.map((cat: any) => (
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