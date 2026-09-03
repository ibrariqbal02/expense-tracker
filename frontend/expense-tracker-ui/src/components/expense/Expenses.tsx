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
import { formatMoney } from "../../utils/formatMoney";
import { Pencil, Trash2, Plus, Search, SlidersHorizontal, X, Receipt, AlertTriangle, TrendingUp } from "lucide-react";
import BudgetStatusBanner from "../shared/BudgetStatusBanner";
import { Link } from "react-router-dom";

// ─── Budget Exceeded Modal ────────────────────────────────────────────────────
interface BudgetExceededData {
    name: string;
    period: string;
    limit: number;
    spent: number;
    remaining: number;
    overBy: number;
}

function BudgetExceededModal({
    data,
    onClose,
}: {
    data: BudgetExceededData;
    onClose: () => void;
}) {
    const usedPct = data.limit > 0 ? Math.min((data.spent / data.limit) * 100, 100) : 0;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-rose-100 overflow-hidden">
                {/* red top bar */}
                <div className="bg-rose-600 px-6 py-4 flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20">
                        <AlertTriangle size={18} className="text-white" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm leading-tight">Budget Limit Exceeded</p>
                        <p className="text-rose-200 text-xs capitalize">{data.period} budget</p>
                    </div>
                </div>

                <div className="px-6 py-5 space-y-4">
                    {/* budget name */}
                    <p className="text-sm text-gray-600">
                        Adding this expense exceeds your{" "}
                        <span className="font-semibold text-gray-900">"{data.name}"</span>{" "}
                        <span className="capitalize">{data.period}</span> budget.
                    </p>

                    {/* stat row */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-xl bg-gray-50 p-3">
                            <p className="text-xs text-gray-400 mb-0.5">Limit</p>
                            <p className="text-sm font-bold text-gray-800">{formatMoney(data.limit)}</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 p-3">
                            <p className="text-xs text-gray-400 mb-0.5">Spent</p>
                            <p className="text-sm font-bold text-rose-600">{formatMoney(data.spent)}</p>
                        </div>
                        <div className="rounded-xl bg-rose-50 p-3 border border-rose-200">
                            <p className="text-xs text-rose-400 mb-0.5">Over by</p>
                            <p className="text-sm font-bold text-rose-700">{formatMoney(data.overBy)}</p>
                        </div>
                    </div>

                    {/* progress bar */}
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>{usedPct.toFixed(0)}% used</span>
                            <span>{formatMoney(data.remaining)} was available</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="h-2 rounded-full bg-rose-500" style={{ width: "100%" }} />
                        </div>
                    </div>

                    {/* tip */}
                    <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5">
                        <TrendingUp size={14} className="text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-700">
                            To add this expense, increase your{" "}
                            <span className="capitalize font-semibold">{data.period}</span> budget limit
                            to at least{" "}
                            <span className="font-semibold">{formatMoney(data.spent + data.overBy)}</span>.
                        </p>
                    </div>

                    {/* actions */}
                    <div className="flex gap-2.5 pt-1">
                        <button
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                        >
                            Close
                        </button>
                        <Link
                            to="/dashboard/budgets"
                            onClick={onClose}
                            className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white text-center hover:bg-blue-700 transition active:scale-95"
                        >
                            Increase Budget
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

const emptyFilters = {
    search: "",
    category: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
};

const PAGE_SIZE = 10;

// Deterministic colour per category name
const CATEGORY_COLORS = [
    "bg-violet-100 text-violet-700",
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
    "bg-orange-100 text-orange-700",
    "bg-pink-100 text-pink-700",
    "bg-teal-100 text-teal-700",
    "bg-indigo-100 text-indigo-700",
];

function categoryColor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
}

function TableSkeleton() {
    return (
        <>
            {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                    {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-5 py-4">
                            <div className="h-4 rounded bg-gray-100 animate-pulse" style={{ width: j === 4 ? "60%" : "80%" }} />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

export default function Expenses() {
    const [filters, setFilters] = useState(emptyFilters);
    const [appliedFilters, setAppliedFilters] = useState<typeof emptyFilters | undefined>(undefined);
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const activeFilters = appliedFilters
        ? Object.fromEntries(Object.entries(appliedFilters).filter(([, v]) => v !== ""))
        : undefined;

    const activeFilterCount = appliedFilters
        ? Object.values(appliedFilters).filter((v) => v !== "").length
        : 0;

    const { data, isLoading } = useGetExpenses(activeFilters, currentPage, PAGE_SIZE);
    const expenses = data?.expenses ?? [];
    const pagination = data?.pagination;

    const { mutate: createExpense, isPending: isCreating } = useCreateExpense();
    const { mutate: updateExpense, isPending: isUpdating } = useUpdateExpense();
    const { mutate: deleteExpense } = useDeleteExpense();

    const { data: stats } = useGetDashboardStats();

    const { data: categoriesData } = useGetCategories(1, 100);
    const categories = categoriesData?.categories ?? [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [budgetExceeded, setBudgetExceeded] = useState<BudgetExceededData | null>(null);

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
                    onSuccess: () => { toast.success("Expense updated!"); handleCloseModal(); },
                    onError: (err: any) => {
                        const res = err?.response?.data;
                        if (err?.response?.status === 422 && res?.budget) {
                            setBudgetExceeded(res.budget);
                        } else {
                            toast.error(res?.message || "Failed to update");
                        }
                    },
                }
            );
        } else {
            createExpense(payload, {
                onSuccess: () => { toast.success("Expense added!"); handleCloseModal(); },
                onError: (err: any) => {
                    const res = err?.response?.data;
                    if (err?.response?.status === 422 && res?.budget) {
                        setBudgetExceeded(res.budget);
                    } else {
                        toast.error(res?.message || "Failed to create");
                    }
                },
            });
        }
    };

    const handleDelete = (id: string) => {
        deleteExpense(id, {
            onSuccess: () => { toast.success("Expense deleted"); setDeleteConfirmId(null); },
            onError: () => toast.error("Failed to delete"),
        });
    };

    const totalPages = pagination?.totalPages ?? 1;
    const total = pagination?.total ?? 0;
    const from = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const to = Math.min(currentPage * PAGE_SIZE, total);

    // Zero-safe fallback shapes so BudgetStatusBanner always gets valid props
    const emptyPeriod = { limit: 0, spent: 0, remaining: 0, percentageUsed: 0, isExceeded: false, overBy: 0 };
    const monthly = stats?.monthly ?? emptyPeriod;
    const yearly  = stats?.yearly  ?? emptyPeriod;

    return (
        <div className="space-y-5">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Expenses</h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {total > 0 ? `${total} record${total !== 1 ? "s" : ""} found` : "No expenses yet"}
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
                >
                    <Plus size={16} />
                    Add Expense
                </button>
            </div>

            {/* ── Budget Banner (monthly + yearly, shared component) ── */}
            <BudgetStatusBanner monthly={monthly} yearly={yearly} />

            {/* ── Filter Bar ── */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                {/* top row */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                    {/* search */}
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by title…"
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm focus:border-blue-400 focus:bg-white focus:outline-none transition"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") { setAppliedFilters({ ...filters }); setCurrentPage(1); }
                            }}
                        />
                    </div>

                    {/* category quick filter */}
                    <select
                        className="hidden sm:block rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-blue-400 focus:bg-white focus:outline-none transition"
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>

                    {/* toggle advanced */}
                    <button
                        onClick={() => setShowFilters((v) => !v)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                            showFilters || activeFilterCount > 0
                                ? "border-blue-300 bg-blue-50 text-blue-700"
                                : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                        <SlidersHorizontal size={14} />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    {/* apply */}
                    <button
                        onClick={() => { setAppliedFilters({ ...filters }); setCurrentPage(1); }}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition active:scale-95"
                    >
                        Apply
                    </button>
                </div>

                {/* advanced filters */}
                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">From</label>
                            <input
                                type="date"
                                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">To</label>
                            <input
                                type="date"
                                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Min Amount</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                                value={filters.minAmount}
                                onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Max Amount</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                                value={filters.maxAmount}
                                onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                            />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                            <button
                                onClick={() => {
                                    setFilters(emptyFilters);
                                    setAppliedFilters(undefined);
                                    setCurrentPage(1);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-white transition"
                            >
                                <X size={13} /> Clear all
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Table ── */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/80">
                                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Title</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Amount</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Category</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Date</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 hidden md:table-cell">Description</th>
                                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableSkeleton />
                            ) : expenses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-400">
                                            <Receipt size={36} strokeWidth={1.2} />
                                            <p className="text-sm font-medium">No expenses found</p>
                                            <p className="text-xs text-gray-400">
                                                {activeFilterCount > 0
                                                    ? "Try adjusting your filters"
                                                    : "Click \"Add Expense\" to get started"}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((expense, idx) => {
                                    const catName =
                                        typeof expense.category === "object" && expense.category !== null
                                            ? (expense.category as any).name
                                            : expense.category || "";
                                    const colorClass = catName ? categoryColor(catName) : "bg-gray-100 text-gray-500";

                                    return (
                                        <tr
                                            key={expense._id}
                                            className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors ${
                                                idx % 2 === 0 ? "" : "bg-gray-50/40"
                                            }`}
                                        >
                                            {/* Title */}
                                            <td className="px-5 py-4">
                                                <span className="font-semibold text-gray-800">{expense.title}</span>
                                            </td>

                                            {/* Amount */}
                                            <td className="px-5 py-4">
                                                <span className="font-bold text-rose-600 tabular-nums">
                                                    {formatMoney(expense.amount)}
                                                </span>
                                            </td>

                                            {/* Category badge */}
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}>
                                                    {catName || "—"}
                                                </span>
                                            </td>

                                            {/* Date */}
                                            <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                                                {new Date(expense.date).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </td>

                                            {/* Description (hidden on mobile) */}
                                            <td className="px-5 py-4 hidden md:table-cell">
                                                {expense.description ? (
                                                    <span className="text-gray-500 truncate max-w-[180px] block">{expense.description}</span>
                                                ) : (
                                                    <span className="text-gray-300">—</span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleOpenModal(expense)}
                                                        title="Edit"
                                                        className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirmId(expense._id)}
                                                        title="Delete"
                                                        className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {total > 0 && (
                    <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-gray-400">
                            Showing <span className="font-semibold text-gray-600">{from}–{to}</span> of{" "}
                            <span className="font-semibold text-gray-600">{total}</span> expenses
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={!pagination?.hasPrevPage}
                                className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                «
                            </button>
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={!pagination?.hasPrevPage}
                                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                Prev
                            </button>

                            {/* page numbers */}
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let page: number;
                                    if (totalPages <= 5) {
                                        page = i + 1;
                                    } else if (currentPage <= 3) {
                                        page = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        page = totalPages - 4 + i;
                                    } else {
                                        page = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`h-7 w-7 rounded-lg text-xs font-semibold transition ${
                                                page === currentPage
                                                    ? "bg-blue-600 text-white shadow-sm"
                                                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={!pagination?.hasNextPage}
                                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                Next
                            </button>
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={!pagination?.hasNextPage}
                                className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                »
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Add / Edit Modal ── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl border border-gray-100">
                        {/* modal header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingId ? "Edit Expense" : "New Expense"}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Groceries, Rent…"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-blue-400 focus:bg-white focus:outline-none transition"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Amount ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        required
                                        placeholder="0.00"
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-blue-400 focus:bg-white focus:outline-none transition"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Date</label>
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
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
                                <select
                                    required
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-blue-400 focus:bg-white focus:outline-none transition"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Description <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Any notes about this expense…"
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
                                    disabled={isCreating || isUpdating}
                                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300 transition active:scale-95"
                                >
                                    {isCreating || isUpdating ? "Saving…" : editingId ? "Update" : "Save"}
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

            {/* ── Budget Exceeded Modal ── */}
            {budgetExceeded && (
                <BudgetExceededModal
                    data={budgetExceeded}
                    onClose={() => setBudgetExceeded(null)}
                />
            )}
        </div>
    );
}
