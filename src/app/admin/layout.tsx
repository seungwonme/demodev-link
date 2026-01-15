import { ClerkAuthService } from "@/features/auth/services/clerk-auth.service";
import AdminSidebar from "@/features/auth/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get current user from Clerk
  const user = await ClerkAuthService.getCurrentUser();

  // If no user, just render children (middleware will handle redirects)
  if (!user) {
    return <>{children}</>;
  }

  // Only show sidebar for approved users
  if (user.status === "approved") {
    return (
      <div className="min-h-screen bg-muted/30 dark:bg-background">
        <AdminSidebar userRole={user.role} />
        <main className="lg:pl-64 min-h-screen relative">
          {/* Ambient Glow Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent pointer-events-none" />

          <div className="relative container mx-auto p-6 pt-20 lg:pt-8 animate-in backdrop-blur-[1px]">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // For non-approved users, just render children
  return <>{children}</>;
}
