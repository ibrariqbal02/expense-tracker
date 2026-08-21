import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as profileService from "../services/profile.services";

export const useGetProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: profileService.myProfile,
    select: (data) => data.user,
  });
};

export const useProfileUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileService.profileUpdate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
