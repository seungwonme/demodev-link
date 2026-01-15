import { ClerkAuthService } from "@/features/auth/services/clerk-auth.service";
import UserManagementTable from "@/features/auth/components/admin/user-management-table";
import { Users } from "lucide-react";

// 동적 렌더링 강제 설정 (Static Generation 방지)
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  try {
    // Middleware already verified auth, approval, and admin role
    const currentUser = await ClerkAuthService.getCurrentUser();

    // Defensive check (middleware should prevent this)
    if (!currentUser || currentUser.status !== 'approved' || currentUser.role !== 'admin') {
      throw new Error('Admin access required');
    }

    // Fetch all users from Clerk
    const users = await ClerkAuthService.getUsersByStatus();

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white dark:bg-white/10 shadow-sm border-none">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">사용자 관리</h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">플랫폼의 모든 사용자를 관리하고 권한을 설정하세요.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-2xl p-8 backdrop-blur-xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
          <UserManagementTable
            users={users}
            currentUserId={currentUser.userId}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("AdminUsersPage error:", error);
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-8 rounded-2xl bg-white dark:bg-white/5 shadow-xl border border-white/10 backdrop-blur-md">
          <h2 className="text-xl font-bold mb-2 text-red-500">접근 권한이 없습니다</h2>
          <p className="text-muted-foreground">
            이 페이지는 관리자만 접근할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }
}
