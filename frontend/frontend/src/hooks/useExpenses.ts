import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as expenseService from "../Services/expense.service";

export const useGetExpenses = () => {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: expenseService.getExpenses,
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