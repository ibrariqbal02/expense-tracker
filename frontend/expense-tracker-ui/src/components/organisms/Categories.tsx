import React, { useState } from "react";
import { useCreateCategory, useGetCategories } from "../../hooks/useCategories";
import toast from "react-hot-toast";

export default function Categories() {
  const { data: categories = [], isLoading } = useGetCategories();
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
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Categories</h3>
        {isLoading ? (
          <p className="text-gray-500">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-gray-500">No categories added yet.</p>
        ) : (
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
        )}
      </div>
    </div>
  );
}