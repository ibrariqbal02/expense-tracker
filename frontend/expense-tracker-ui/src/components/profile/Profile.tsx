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
  const [showPasswordForm, setShowPasswordForm] = useState(false);
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

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
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

        {/* Change Password Toggle */}
        <div className="mt-6 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => setShowPasswordForm((v) => !v)}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            {showPasswordForm ? "Cancel" : "Change Password"}
          </button>

          {showPasswordForm && (
            <div className="mt-4 space-y-4">
              {passwordSuccess && (
                <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 border border-green-200">
                  Password updated! Redirecting to login...
                </div>
              )}
              {passwordError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                  {(passwordError as any)?.response?.data?.message || "Failed to update password."}
                </div>
              )}
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
              <button
                type="button"
                disabled={isPasswordPending}
                onClick={() => updatePassword(passwordData)}
                className="w-full rounded-lg bg-gray-800 py-2.5 font-medium text-white transition hover:bg-gray-900 disabled:bg-gray-400"
              >
                {isPasswordPending ? "Updating..." : "Update Password"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}