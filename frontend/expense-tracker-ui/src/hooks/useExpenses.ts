import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as expenseService from "../services/expense.service";
import type { ExpenseFilters } from "../services/expense.service";

export const useGetExpenses = (filters?: ExpenseFilters) => {
  return useQuery({
    queryKey: ["expenses", filters],
    queryFn: () => expenseService.getExpenses(filters),
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: expenseService.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: expenseService.updateExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: expenseService.deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};


export const useGetDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: expenseService.getDashboardStats,
  });
};