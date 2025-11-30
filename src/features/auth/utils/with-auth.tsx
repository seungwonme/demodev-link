import { ClerkAuthService, UserStatus, UserRole } from "@/features/auth/services/clerk-auth.service";

export interface WithAuthOptions {
  requiredStatus?: UserStatus | "any";
  requireAdmin?: boolean;
}

export interface AuthenticatedPageProps {
  userId: string;
  email: string | null;
  status: UserStatus;
  role: UserRole;
}

/**
 * Higher-order function to protect pages with authentication using Clerk
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
    const user = await ClerkAuthService.requireAuth(options);

    return <Component {...props} {...user} />;
  };
}
