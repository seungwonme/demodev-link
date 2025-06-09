import { AuthService } from "@/features/auth/services/auth.service";
import { User } from "@supabase/supabase-js";
import { Profile } from "@/features/auth/types/profile";

export interface WithAuthOptions {
  requiredStatus?: "approved" | "pending" | "rejected" | "any";
  requireAdmin?: boolean;
}

export interface AuthenticatedPageProps {
  user: User;
  profile: Profile;
}

/**
 * Higher-order function to protect pages with authentication
 * 
 * @example
 * ```tsx
 * export default withAuth(DashboardPage);
 * 
 * // With options
 * export default withAuth(AdminUsersPage, { requireAdmin: true });
 * ```
 */
export function withAuth<P extends object = object>(
  Component: React.ComponentType<P & AuthenticatedPageProps>,
  options?: WithAuthOptions
) {
  return async function ProtectedPage(props: P) {
    const { user, profile } = await AuthService.requireAuth(options);
    
    return <Component {...props} user={user} profile={profile} />;
  };
}