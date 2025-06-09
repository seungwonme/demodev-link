"use server";

import { createClient } from "@/lib/supabase/server";
import { UserStatus, UserRole } from "@/features/auth/types/profile";
import { revalidatePath } from "next/cache";

export async function updateUserStatus(
  userId: string, 
  status: UserStatus, 
  rejectionReason?: string
) {
  const supabase = await createClient();
  
  // Check if current user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (currentUserProfile?.role !== "admin") {
    throw new Error("Only admins can update user status");
  }

  // Update user status
  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "approved") {
    updateData.approved_at = new Date().toISOString();
    updateData.approved_by = user.id;
  } else if (status === "rejected") {
    updateData.rejected_at = new Date().toISOString();
    updateData.rejected_by = user.id;
    updateData.rejection_reason = rejectionReason;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId);

  if (error) throw error;

  revalidatePath("/admin/users");
}

export async function updateUserRole(userId: string, role: UserRole) {
  const supabase = await createClient();
  
  // Check if current user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (currentUserProfile?.role !== "admin") {
    throw new Error("Only admins can update user roles");
  }

  // Prevent admin from removing their own admin role
  if (userId === user.id && role !== "admin") {
    throw new Error("Cannot remove your own admin role");
  }

  // Update user role
  const { error } = await supabase
    .from("profiles")
    .update({ 
      role,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId);

  if (error) throw error;

  revalidatePath("/admin/users");
}