import api from "../api/axios";
import type { Pagination } from "./expense.service";

export type BudgetPeriod = "monthly" | "yearly";

export type BudgetItem = {
  _id: string;
  name: string;
  amount: number;
  period: BudgetPeriod;
};

export type CreateBudgetPayload = {
  name: string;
  amount: number;
  period: BudgetPeriod;
};

export type UpdateBudgetPayload = Partial<CreateBudgetPayload> & {
  id: string;
};

export type PaginatedBudgets = {
  budgets: BudgetItem[];
  pagination: Pagination;
};

export const getBudgets = async (page = 1, limit = 10): Promise<PaginatedBudgets> => {
  const response = await api.get("/budget", { params: { page, limit } });
  return {
    budgets: response.data.budgets,
    pagination: response.data.pagination,
  };
};

export const createBudget = async (data: CreateBudgetPayload): Promise<BudgetItem> => {
  const response = await api.post("/budget", data);
  return response.data.budget;
};

export const updateBudget = async ({ id, ...data }: UpdateBudgetPayload): Promise<BudgetItem> => {
  const response = await api.put(`/budget/${id}`, data);
  return response.data.budget;
};

export const deleteBudget = async (id: string): Promise<void> => {
  await api.delete(`/budget/${id}`);
};
