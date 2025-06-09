import { AuthService } from "@/features/auth/services/auth.service";
import { createClient } from "@/lib/supabase/server";
import UserManagementTable from "@/features/auth/components/admin/user-management-table";
import { Profile } from "@/features/auth/types/profile";

// 동적 렌더링 강제 설정 (Static Generation 방지)
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  try {
    // Use centralized auth service - require admin role
    const { user } = await AuthService.requireAuth({ requireAdmin: true });
    
    const supabase = await createClient();

    // Fetch all users
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (usersError || !users) {
      console.error("Error fetching users:", usersError);
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">사용자 로드 실패</h2>
            <p className="text-muted-foreground">
              사용자 데이터를 불러오는 중 문제가 발생했습니다.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">사용자 관리</h1>
        <UserManagementTable
          users={users as Profile[]}
          currentUserId={user.id}
        />
      </div>
    );
  } catch (error) {
    console.error("AdminUsersPage error:", error);
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">접근 권한이 없습니다</h2>
          <p className="text-muted-foreground">
            이 페이지는 관리자만 접근할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }
}