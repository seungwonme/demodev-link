import { AuthService } from "@/features/auth/services/auth.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { AlertCircle } from "lucide-react";

// Force dynamic rendering since we use cookies
export const dynamic = "force-dynamic";

export default async function PendingApprovalPage() {
  // Check if user is pending - this will redirect if not
  await AuthService.requireAuth({ requiredStatus: "pending" });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
              <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">승인 대기 중</CardTitle>
          <CardDescription className="text-base mt-2">
            계정이 관리자의 승인을 기다리고 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
            <p className="font-medium">안내사항:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>승인 과정은 보통 1-2일이 소요됩니다</li>
              <li>승인 완료 시 이메일로 알려드립니다</li>
              <li>문의사항은 관리자에게 연락주세요</li>
            </ul>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              가입 신청해 주셔서 감사합니다
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}