import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import UserManagementTable from "@/features/auth/components/admin/user-management-table";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  
  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/admin/dashboard");
  }

  // Get all users
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // Separate users by status
  const pendingUsers = users?.filter(u => u.status === "pending") || [];
  const approvedUsers = users?.filter(u => u.status === "approved") || [];
  const rejectedUsers = users?.filter(u => u.status === "rejected") || [];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">사용자 관리</h1>

      {/* Pending Users Section */}
      {pendingUsers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">승인 대기 중 ({pendingUsers.length})</h2>
          <UserManagementTable users={pendingUsers} currentUserId={user.id} />
        </div>
      )}

      {/* Approved Users Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">승인된 사용자 ({approvedUsers.length})</h2>
        <UserManagementTable users={approvedUsers} currentUserId={user.id} />
      </div>

      {/* Rejected Users Section */}
      {rejectedUsers.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">거절된 사용자 ({rejectedUsers.length})</h2>
          <UserManagementTable users={rejectedUsers} currentUserId={user.id} />
        </div>
      )}
    </div>
  );
}