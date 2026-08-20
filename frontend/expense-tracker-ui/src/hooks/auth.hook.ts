import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as authService from "../services/auth.services";

export const useRegister = () => {
  return useMutation({
    mutationFn: authService.register,
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: authService.login,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,

    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: ["me"],
      });
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: authService.updatePassword,
  });
};
