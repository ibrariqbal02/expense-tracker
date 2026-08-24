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
  createdAt?: string;
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

export const getExpenses = async (filters?: ExpenseFilters): Promise<ExpenseItem[]> => {
  const response = await api.get("/expense", { params: filters });
  return response.data.expenses;
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