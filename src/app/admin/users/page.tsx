import { ClerkAuthService } from "@/features/auth/services/clerk-auth.service";
import UserManagementTable from "@/features/auth/components/admin/user-management-table";

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
      <div>
        <h1 className="text-3xl font-bold mb-8">사용자 관리</h1>
        <UserManagementTable
          users={users}
          currentUserId={currentUser.userId}
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
