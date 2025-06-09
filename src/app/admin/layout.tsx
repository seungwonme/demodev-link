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
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <AdminSidebar userRole={profile.role || "user"} />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // For non-approved users, just render children
  return <>{children}</>;
}