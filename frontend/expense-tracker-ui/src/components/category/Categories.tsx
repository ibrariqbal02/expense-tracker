import React, { useState } from "react";
import { useCreateCategory, useGetCategories } from "../../hooks/useCategories";
import toast from "react-hot-toast";

const PAGE_SIZE = 10;

export default function Categories() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useGetCategories(currentPage, PAGE_SIZE);
  const categories = data?.categories ?? [];
  const pagination = data?.pagination;

  const { mutate: createCategory, isPending } = useCreateCategory();
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createCategory(name, {
      onSuccess: () => {
        toast.success("Category created!");
        setName("");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to create category");
      },
    });
  };

  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const from = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      {/* Create Category Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Category</h2>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            required
            placeholder="e.g. Groceries, Utilities, Entertainment"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            type="submit"
            disabled={isPending}
            className="shrink-0 rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isPending ? "Adding..." : "Add Category"}
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Your Categories</h3>
          {total > 0 && (
            <span className="text-sm text-gray-500">{total} total</span>
          )}
        </div>

        {isLoading ? (
          <p className="text-gray-500">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-gray-500">No categories added yet.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat._id}
                  className="rounded-full bg-blue-50 border border-blue-200 px-4 py-1.5 text-sm font-medium text-blue-700"
                >
                  {cat.name}
                </span>
              ))}
            </div>

            {/* Pagination */}
            {total > PAGE_SIZE && (
              <div className="flex flex-col gap-3 border-t border-gray-200 mt-4 pt-3 sm:flex-row sm:items-center sm:justify-between">
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
          </>
        )}
      </div>
    </div>
  );
}
