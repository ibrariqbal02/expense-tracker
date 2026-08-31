import api from "../api/axios";



export type AuthUser = {
  _id: string;
  name: string;
  email: string;
};


export type LoginResponse = {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
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


  localStorage.setItem("accessToken", response.data.accessToken);
  localStorage.setItem("refreshToken", response.data.refreshToken);

  return response.data;
};

export const logout = async () => {
  const response = await api.get("/auth/logout");

  // localStorage se tokens hatao
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  return response.data;
};

export const refreshToken = async () => {
  // localStorage se refreshToken nikalo aur body mein bhejo
  const storedRefreshToken = localStorage.getItem("refreshToken");

  const response = await api.post("/auth/refresh-token", {
    refreshToken: storedRefreshToken,
  });

  // Naya accessToken response se lo aur localStorage mein update karo
  localStorage.setItem("accessToken", response.data.accessToken);

  return response.data;
};

export const updatePassword = async (data: { currentPassword: string; newPassword: string }) => {
  const response = await api.patch("/auth/update-password", data);
  return response.data;
};


