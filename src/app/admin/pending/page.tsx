import { AuthService } from '@/features/auth/services/auth.service';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { AlertCircle } from 'lucide-react';

// Force dynamic rendering since we use cookies
export const dynamic = 'force-dynamic';

export default async function PendingApprovalPage() {
  // Check if user is pending - this will redirect if not
  await AuthService.requireAuth({ requiredStatus: 'pending' });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <Card className="relative w-full max-w-md border-border/50 shadow-2xl backdrop-blur-sm bg-card/95">
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
