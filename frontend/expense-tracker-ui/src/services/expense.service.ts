import api from "../api/axios";

export type ExpenseItem = {
  _id: string;
  title: string;
  amount: number;
  category: {
    _id: string;
    name: string;
  } | string;
  date: string;
  description?: string;
  receiptUrl?: string;
};

export type CreateExpensePayload = {
  title: string;
  amount: number;
  category: string;
  date?: string;
  description?: string;
  receiptUrl?: string;
};

export type UpdateExpensePayload = Partial<CreateExpensePayload> & {
  id: string;
};

export type ExpenseFilters = {
  search?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: string;
  maxAmount?: string;
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type PaginatedExpenses = {
  expenses: ExpenseItem[];
  pagination: Pagination;
};

export const getExpenses = async (
  filters?: ExpenseFilters,
  page = 1,
  limit = 10
): Promise<PaginatedExpenses> => {
  const response = await api.get("/expense", { params: { ...filters, page, limit } });
  return {
    expenses: response.data.expenses,
    pagination: response.data.pagination,
  };
};

export const createExpense = async (data: CreateExpensePayload) => {
  const response = await api.post("/expense/", data);
  return response.data;
};

export const updateExpense = async ({ id, ...data }: UpdateExpensePayload) => {
  const response = await api.put(`/expense/updated/${id}`, data);
  return response.data;
};

export const deleteExpense = async (id: string) => {
  const response = await api.delete(`/expense/${id}`);
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get("/expense/dashboard");
  return response.data.data;
};
