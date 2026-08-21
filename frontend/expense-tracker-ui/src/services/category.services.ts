import api from "../api/axios";

export type CategoryItem = {
  _id: string;
  name: string;
  user: string;
  createdAt?: string;
  updatedAt?: string;
};

export const getCategories = async (): Promise<CategoryItem[]> => {
  const response = await api.get("/category");
  return response.data.categories;
};

export const createCategory = async (name: string) => {
  const response = await api.post("/category", { name });
  return response.data;
};