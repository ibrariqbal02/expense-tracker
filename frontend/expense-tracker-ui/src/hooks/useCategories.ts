import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as categoryService from "../services/category.services";

export const useGetCategories = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["categories", page, limit],
    queryFn: () => categoryService.getCategories(page, limit),
    placeholderData: (prev) => prev,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};
