import React, { useState, useEffect } from "react";

import toast from "react-hot-toast";
import { useGetProfile, useProfileUpdate } from "../hooks/profile.service";

export default function Profile() {
  const { data: user, isLoading, isError } = useGetProfile();
  const { mutate: updateProfile, isPending } = useProfileUpdate();

  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.profileUrl) setPreview(user.profileUrl);
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
    <div className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">My Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-6">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100">
            {preview ? (
              <img src={preview} alt="Profile" className="h-full w-full object-cover" />
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
    </div>
  );
}