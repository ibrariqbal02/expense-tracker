import React, { useState } from "react";

import { useNavigate } from "react-router-dom";
import { useUpdatePassword } from "../hooks/auth.hook";

export default function UpdatePassword() {
  const [formData, setFormData] = useState({ currentPassword: "", newPassword: "" });
  const { mutate: updatePassword, isPending, error, isSuccess } = useUpdatePassword();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePassword(formData, {
      onSuccess: () => {

        setTimeout(() => navigate("/login"), 1500);
      },
    });
  };

  return (
    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-md border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Update Password</h3>

      {isSuccess && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 border border-green-200">
          Password updated successfully! Redirecting to login...
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {(error as any)?.response?.data?.message || "Failed to update password."}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Current Password</label>
          <input
            type="password"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">New Password</label>
          <input
            type="password"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-gray-800 py-2.5 font-medium text-white transition hover:bg-gray-900 focus:outline-none disabled:bg-gray-400"
        >
          {isPending ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}