/**
 * @file src/features/auth/services/clerk-auth.service.ts
 * @description Clerk 기반 인증 서비스
 *
 * Clerk API를 사용하여 사용자 인증 및 권한 관리를 수행합니다.
 * Supabase Auth를 대체합니다.
 */

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type UserStatus = "pending" | "approved" | "rejected";
export type UserRole = "user" | "admin";

export interface ClerkUserMetadata {
  publicMetadata: {
    status?: UserStatus;
  };
  privateMetadata: {
    role?: UserRole;
    approved_at?: string;
    approved_by?: string;
    rejected_at?: string;
    rejected_by?: string;
    rejection_reason?: string;
  };
}

export interface AuthResult {
  userId: string;
  email: string | null;
  status: UserStatus;
  role: UserRole;
}

export class ClerkAuthService {
  /**
   * Get the current authenticated user with metadata
   */
  static async getCurrentUser(): Promise<AuthResult | null> {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    const user = await currentUser();

    if (!user) {
      return null;
    }

    const publicMetadata = (user.publicMetadata as ClerkUserMetadata["publicMetadata"]) || {};
    const privateMetadata = (user.privateMetadata as ClerkUserMetadata["privateMetadata"]) || {};

    const status = publicMetadata.status || "pending";
    const role = privateMetadata.role || "user";
    const email = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress || null;

    return {
      userId,
      email,
      status,
      role,
    };
  }

  /**
   * Require authentication and optionally specific user status
   * Redirects if requirements are not met
   */
  static async requireAuth(options?: {
    requiredStatus?: UserStatus | "any";
    requireAdmin?: boolean;
  }): Promise<AuthResult> {
    const user = await this.getCurrentUser();

    // Check if user is authenticated
    if (!user) {
      redirect("/admin/login");
    }

    // Check user status if required
    const requiredStatus = options?.requiredStatus || "approved";
    if (requiredStatus !== "any" && user.status !== requiredStatus) {
      // Redirect based on actual status
      if (user.status === "pending") {
        redirect("/admin/pending");
      } else if (user.status === "rejected") {
        redirect("/admin/rejected");
      } else {
        redirect("/admin/login");
      }
    }

    // Check admin role if required
    if (options?.requireAdmin && user.role !== "admin") {
      redirect("/admin/dashboard");
    }

    return user;
  }

  /**
   * Check if user has admin role
   */
  static async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === "admin";
  }

  /**
   * Check if user is approved
   */
  static async isApproved(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.status === "approved";
  }

  /**
   * Get all users by status (admin only)
   */
  static async getUsersByStatus(status?: UserStatus) {
    await this.requireAuth({ requireAdmin: true });

    const client = await clerkClient();

    // Get all users
    const { data: users } = await client.users.getUserList({
      limit: 500,
    });

    // Filter by status if provided
    const filteredUsers = status
      ? users.filter((user) => {
          const publicMetadata = (user.publicMetadata as ClerkUserMetadata["publicMetadata"]) || {};
          return publicMetadata.status === status;
        })
      : users;

    return filteredUsers.map((user) => {
      const publicMetadata = (user.publicMetadata as ClerkUserMetadata["publicMetadata"]) || {};
      const privateMetadata = (user.privateMetadata as ClerkUserMetadata["privateMetadata"]) || {};
      const email = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress || null;

      return {
        id: user.id,
        email,
        status: publicMetadata.status || "pending",
        role: privateMetadata.role || "user",
        createdAt: user.createdAt,
        ...privateMetadata,
      };
    });
  }

  /**
   * Update user status (admin only)
   */
  static async updateUserStatus(
    targetUserId: string,
    status: UserStatus,
    rejectionReason?: string
  ) {
    const currentUser = await this.requireAuth({ requireAdmin: true });

    const client = await clerkClient();
    const user = await client.users.getUser(targetUserId);

    const privateMetadata = (user.privateMetadata as ClerkUserMetadata["privateMetadata"]) || {};

    // Prepare metadata updates
    const metadataUpdate: ClerkUserMetadata = {
      publicMetadata: {
        status,
      },
      privateMetadata: {
        ...privateMetadata,
      },
    };

    if (status === "approved") {
      metadataUpdate.privateMetadata.approved_at = new Date().toISOString();
      metadataUpdate.privateMetadata.approved_by = currentUser.userId;
      // Clear rejection data
      delete metadataUpdate.privateMetadata.rejected_at;
      delete metadataUpdate.privateMetadata.rejected_by;
      delete metadataUpdate.privateMetadata.rejection_reason;
    } else if (status === "rejected") {
      metadataUpdate.privateMetadata.rejected_at = new Date().toISOString();
      metadataUpdate.privateMetadata.rejected_by = currentUser.userId;
      metadataUpdate.privateMetadata.rejection_reason = rejectionReason;
      // Clear approval data
      delete metadataUpdate.privateMetadata.approved_at;
      delete metadataUpdate.privateMetadata.approved_by;
    }

    await client.users.updateUserMetadata(targetUserId, metadataUpdate);

    return { success: true };
  }

  /**
   * Update user role (admin only)
   */
  static async updateUserRole(targetUserId: string, role: UserRole) {
    const currentUser = await this.requireAuth({ requireAdmin: true });

    // Prevent admin from removing their own admin role
    if (targetUserId === currentUser.userId && role !== "admin") {
      throw new Error("Cannot remove your own admin role");
    }

    const client = await clerkClient();
    const user = await client.users.getUser(targetUserId);

    const privateMetadata = (user.privateMetadata as ClerkUserMetadata["privateMetadata"]) || {};

    await client.users.updateUserMetadata(targetUserId, {
      privateMetadata: {
        ...privateMetadata,
        role,
      },
    });

    return { success: true };
  }

  /**
   * Get user profile from database
   */
  static async getUserProfile(clerkUserId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("clerk_user_id", clerkUserId)
      .single();

    return { data, error };
  }
}
