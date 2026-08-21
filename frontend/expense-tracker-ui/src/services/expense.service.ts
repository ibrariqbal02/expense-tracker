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

// export const getExpenses = async (): Promise<ExpenseItem[]> => {
//   const response = await api.get("/expense");
//   return response.data.expenses;
// };


export const getExpenses = async (params?: Record<string, any>) => {
  const response = await api.get("/expense", { params });
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