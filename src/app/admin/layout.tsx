import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/features/auth/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user, just render children (middleware will handle redirects)
  if (!user) {
    return <>{children}</>;
  }

  // Check user profile status
  const { data: profile } = await supabase
    .from("profiles")
    .select("status, role")
    .eq("id", user.id)
    .single();

  // Only show sidebar for approved users
  if (profile?.status === "approved") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <AdminSidebar userRole={profile.role || "user"} />
        <main className="lg:pl-64 min-h-screen">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative container mx-auto p-6 pt-20 lg:pt-6">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // For non-approved users, just render children
  return <>{children}</>;
}