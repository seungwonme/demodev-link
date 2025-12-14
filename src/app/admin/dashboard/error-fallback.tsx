"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
} from "@/shared/components/ui/card";
import { AlertTriangle } from "lucide-react";

export function DashboardErrorFallback() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">대시보드</h1>
        <p className="text-muted-foreground">
          시스템 상태를 확인 중입니다...
        </p>
      </div>

      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-700 mb-2">
              대시보드를 불러올 수 없습니다
            </h2>
            <p className="text-sm text-red-600 mb-4">
              시스템에 일시적인 문제가 발생했습니다. 잠시 후 다시
              시도해주세요.
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              새로고침
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
