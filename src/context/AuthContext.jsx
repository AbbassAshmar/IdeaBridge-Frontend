import { createContext, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "../services/api/auth";
import { getErrorMessage } from "../services/api/client";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ["auth", "user"],
    retry: false,
    queryFn: async () => {
      try {
        const response = await getCurrentUser();
        return response?.data?.user || null;
      } catch {
        return null;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (response) => {
      queryClient.setQueryData(["auth", "user"], response?.data?.user || null);
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: (response) => {
      queryClient.setQueryData(["auth", "user"], response?.data?.user || null);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      queryClient.setQueryData(["auth", "user"], null);
    },
  });

  const login = async (payload) => loginMutation.mutateAsync(payload);
  const register = async (payload) => registerMutation.mutateAsync(payload);
  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to log out."));
    }
  };
  const refreshUser = async () => {
    await queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
  };

  const value = useMemo(
    () => ({
      user: userQuery.data || null,
      isAuthenticated: Boolean(userQuery.data),
      isLoading: userQuery.isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [userQuery.data, userQuery.isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
