import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as expenseService from "../services/expense.service";
import type { ExpenseFilters } from "../services/expense.service";

export const useGetExpenses = (filters?: ExpenseFilters, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["expenses", filters, page, limit],
    queryFn: () => expenseService.getExpenses(filters, page, limit),
    placeholderData: (prev) => prev,
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: expenseService.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: expenseService.updateExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: expenseService.deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
};

export const useGetDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: expenseService.getDashboardStats,
  });
};
