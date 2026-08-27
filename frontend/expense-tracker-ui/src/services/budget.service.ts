import api from "../api/axios";

export type BudgetPeriod = "monthly" | "yearly";

export type BudgetItem = {
  _id: string;
  name: string;
  amount: number;
  period: BudgetPeriod;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateBudgetPayload = {
  name: string;
  amount: number;
  period: BudgetPeriod;
};

export type UpdateBudgetPayload = Partial<CreateBudgetPayload> & {
  id: string;
};

export const getBudgets = async (): Promise<BudgetItem[]> => {
  const response = await api.get("/budget");
  return response.data.budgets;
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
