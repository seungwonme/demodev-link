"use server";

import { revalidatePath } from "next/cache";
import { ClerkAuthService, UserStatus, UserRole } from "../services/clerk-auth.service";

/**
 * Update user status (admin only)
 */
export async function updateUserStatus(
  userId: string,
  status: UserStatus,
  rejectionReason?: string
) {
  try {
    await ClerkAuthService.updateUserStatus(userId, status, rejectionReason);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user status:", error);
    throw error;
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: string, role: UserRole) {
  try {
    await ClerkAuthService.updateUserRole(userId, role);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user role:", error);
    throw error;
  }
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers() {
  try {
    return await ClerkAuthService.getUsersByStatus();
  } catch (error) {
    console.error("Failed to get users:", error);
    throw error;
  }
}

/**
 * Get users by status (admin only)
 */
export async function getUsersByStatus(status: UserStatus) {
  try {
    return await ClerkAuthService.getUsersByStatus(status);
  } catch (error) {
    console.error("Failed to get users by status:", error);
    throw error;
  }
}
