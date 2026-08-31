import React, { useState, useEffect } from "react";

import toast from "react-hot-toast";
import { useGetProfile, useProfileUpdate } from "../../hooks/profile.service";
import { useUpdatePassword } from "../../hooks/auth.hook";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { data: user, isLoading, isError } = useGetProfile();
  const { mutate: updateProfile, isPending } = useProfileUpdate();

  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Dialog open/close state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "" });
  const { mutate: updatePassword, isPending: isPasswordPending, error: passwordError, isSuccess: passwordSuccess } = useUpdatePassword();
  const navigate = useNavigate();

  useEffect(() => {
    if (passwordSuccess) {
      const timer = setTimeout(() => navigate("/login"), 1500);
      return () => clearTimeout(timer);
    }
  }, [passwordSuccess]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    if (selectedFile) {
      formData.append("profileUrl", selectedFile);
    }

    updateProfile(formData, {
      onSuccess: () => {
        toast.success("Profile updated successfully!");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to update profile.");
      },
    });
  };

  // Dialog band karne ka function — state reset bhi karta hai
  const closeDialog = () => {
    setShowPasswordDialog(false);
    setPasswordData({ currentPassword: "", newPassword: "" });
  };

  if (isLoading)
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
          <div className="mb-6 h-8 w-40 rounded bg-gray-200" />

          {/* Avatar Skeleton */}
          <div className="flex items-center space-x-6 mb-6">
            <div className="h-24 w-24 rounded-full bg-gray-200" />
            <div className="h-9 w-32 rounded-lg bg-gray-200" />
          </div>

          {/* Email Skeleton */}
          <div className="mb-4">
            <div className="mb-1 h-4 w-28 rounded bg-gray-200" />
            <div className="h-10 w-full rounded-lg bg-gray-200" />
          </div>

          {/* Name Skeleton */}
          <div className="mb-4">
            <div className="mb-1 h-4 w-20 rounded bg-gray-200" />
            <div className="h-10 w-full rounded-lg bg-gray-200" />
          </div>

          {/* Button Skeleton */}
          <div className="h-10 w-full rounded-lg bg-gray-200" />
        </div>
      </div>
    );

  if (isError) return <div className="p-8 text-center text-red-500">Error loading profile details.</div>;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">My Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-6">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100">
              {preview || user?.profileUrl ? (
                <img src={preview || user?.profileUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-bold text-gray-400">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <label className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">
              <span>Change Photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          {/* Read-Only Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Name Field */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white transition duration-200 hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* Change Password Button — Dialog open karta hai */}
        <div className="mt-6 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => setShowPasswordDialog(true)}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Change Password
          </button>
        </div>
      </div>

      {/* ===================== PASSWORD DIALOG BOX ===================== */}
      {showPasswordDialog && (
        /*
          Yeh outer div "Backdrop" hai — poora screen cover karta hai
          ek dark transparent layer se, taake focus dialog par rahe.
          "fixed inset-0" matlab: top-0, right-0, bottom-0, left-0 — poora screen
          "z-50" matlab: sabse upar layer mein render hoga
          "flex items-center justify-center" dialog ko screen ke beech mein rakhta hai
        */
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={closeDialog} // Backdrop click se dialog band ho jata hai
        >
          {/*
            Yeh inner div actual Dialog Box hai.
            "e.stopPropagation()" isliye lagaya ke agar dialog ke andar click
            karein to backdrop ka onClick fire na ho — warna dialog band ho jata
          */}
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dialog Header */}
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Change Password</h3>
              {/* X button — dialog band karta hai */}
              <button
                type="button"
                onClick={closeDialog}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none"
              >
                ✕
              </button>
            </div>

            {/* Success Message */}
            {passwordSuccess && (
              <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 border border-green-200">
                Password updated! Redirecting to login...
              </div>
            )}

            {/* Error Message */}
            {passwordError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                {(passwordError as any)?.response?.data?.message || "Failed to update password."}
              </div>
            )}

            {/* Dialog Form */}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* Dialog Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="flex-1 rounded-lg border border-gray-300 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isPasswordPending}
                  onClick={() => updatePassword(passwordData)}
                  className="flex-1 rounded-lg bg-gray-800 py-2.5 font-medium text-white transition hover:bg-gray-900 disabled:bg-gray-400"
                >
                  {isPasswordPending ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* =================== END DIALOG BOX =================== */}
    </div>
  );
}
