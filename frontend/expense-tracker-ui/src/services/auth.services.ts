import api from "../api/axios";



export type AuthUser = {
  _id: string;
  name: string;
  email: string;
};

// Tokens are now httpOnly cookies — the body only contains user info.
export type LoginResponse = {
  success: boolean;
  message: string;
  user: AuthUser;
};

export const register = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const login = async (data: {
  email: string;
  password: string;
}): Promise<LoginResponse> => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const logout = async () => {

  const response = await api.get("/auth/logout");
  return response.data;
};

export const refreshToken = async () => {

  const response = await api.post("/auth/refresh-token");
  return response.data;
};

export const updatePassword = async (data: { currentPassword: string; newPassword: string }) => {
  const response = await api.patch("/auth/update-password", data);
  return response.data;
};
