import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as budgetService from "../services/budget.service";

export const useGetBudgets = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["budgets", page, limit],
    queryFn: () => budgetService.getBudgets(page, limit),
    placeholderData: (prev) => prev,
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: budgetService.createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: budgetService.updateBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: budgetService.deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};
