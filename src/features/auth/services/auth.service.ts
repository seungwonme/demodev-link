import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { Profile } from "@/features/auth/types/profile";

export interface AuthResult {
  user: User | null;
  profile: Profile | null;
  error: Error | null;
}

export class AuthService {
  /**
   * Get the current authenticated user and their profile
   */
  static async getCurrentUser(): Promise<AuthResult> {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return { user: null, profile: null, error };
    }
    
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    return { 
      user, 
      profile: profile as Profile | null, 
      error: profileError 
    };
  }
  
  /**
   * Require authentication and optionally specific user status
   * Redirects if requirements are not met
   */
  static async requireAuth(options?: {
    requiredStatus?: "approved" | "pending" | "rejected" | "any";
    requireAdmin?: boolean;
  }): Promise<{ user: User; profile: Profile }> {
    const { user, profile, error } = await this.getCurrentUser();
    
    // Check if user is authenticated
    if (!user || error) {
      redirect("/admin/login");
    }
    
    // Check if profile exists
    if (!profile) {
      redirect("/admin/login");
    }
    
    // Check user status if required
    const requiredStatus = options?.requiredStatus || "approved";
    if (requiredStatus !== "any" && profile.status !== requiredStatus) {
      // Redirect based on actual status
      switch (profile.status) {
        case "pending":
          redirect("/admin/pending");
        case "rejected":
          redirect("/admin/rejected");
        default:
          redirect("/admin/login");
      }
    }
    
    // Check admin role if required
    if (options?.requireAdmin && profile.role !== "admin") {
      redirect("/admin/dashboard");
    }
    
    return { user, profile };
  }
  
  /**
   * Check if user has admin role
   */
  static async isAdmin(): Promise<boolean> {
    const { profile } = await this.getCurrentUser();
    return profile?.role === "admin";
  }
  
  /**
   * Check if user is approved
   */
  static async isApproved(): Promise<boolean> {
    const { profile } = await this.getCurrentUser();
    return profile?.status === "approved";
  }
  
  /**
   * Get user by status (for admin management)
   */
  static async getUsersByStatus(status: "pending" | "approved" | "rejected") {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });
    
    return { data, error };
  }
  
  /**
   * Update user status (admin only)
   */
  static async updateUserStatus(
    userId: string, 
    status: "approved" | "rejected"
  ) {
    const supabase = await createClient();
    
    // Verify admin
    await this.requireAuth({ requireAdmin: true });
    
    const { data, error } = await supabase
      .from("profiles")
      .update({ status })
      .eq("id", userId)
      .select()
      .single();
    
    return { data, error };
  }
}