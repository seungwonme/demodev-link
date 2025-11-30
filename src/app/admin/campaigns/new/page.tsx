import { CampaignForm } from "@/features/campaigns/components/campaign-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";

export default function NewCampaignPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/campaigns">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            캠페인 목록으로
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">새 캠페인 만들기</h1>
        <p className="text-muted-foreground mt-2">
          여러 링크를 그룹화하고 기본 UTM 파라미터를 설정하세요
        </p>
      </div>

      <CampaignForm mode="create" />
    </div>
  );
}
