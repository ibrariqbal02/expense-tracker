import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as categoryService from "../services/category.services";

export const useGetCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
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
