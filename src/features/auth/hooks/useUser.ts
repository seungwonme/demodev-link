"use client";

import { useAuth } from "./useAuth";

export function useUser() {
  const { user, profile, loading, error } = useAuth();
  
  return {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    isApproved: profile?.status === "approved",
    isAdmin: profile?.role === "admin",
    isPending: profile?.status === "pending",
    isRejected: profile?.status === "rejected",
  };
}