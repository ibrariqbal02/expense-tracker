import api from "../api/axios";
import type { Pagination } from "./expense.service";

export type CategoryItem = {
  _id: string;
  name: string;
  user: string;
};

export type PaginatedCategories = {
  categories: CategoryItem[];
  pagination: Pagination;
};

export const getCategories = async (page = 1, limit = 10): Promise<PaginatedCategories> => {
  const response = await api.get("/category", { params: { page, limit } });
  return {
    categories: response.data.categories,
    pagination: response.data.pagination,
  };
};

export const createCategory = async (name: string) => {
  const response = await api.post("/category", { name });
  return response.data;
};
