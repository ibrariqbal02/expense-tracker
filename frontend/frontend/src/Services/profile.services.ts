import api from "../api/axios";

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  profileUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const myProfile = async (): Promise<{ success: boolean; user: AuthUser }> => {
  const response = await api.get("/profile/my-profile");
  return response.data;
};


export const profileUpdate = async (formData: FormData) => {
  const response = await api.put("/profile/profile-update", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};