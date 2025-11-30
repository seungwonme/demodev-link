import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Plus } from "lucide-react";
import { CampaignList } from "@/features/campaigns/components/campaign-list";
import { getCampaigns } from "@/features/campaigns/actions/campaign-actions";

export default async function CampaignsPage() {
  const result = await getCampaigns();
  const campaigns = result.success && result.data ? result.data : [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">캠페인</h1>
          <p className="text-muted-foreground mt-1">
            마케팅 캠페인을 관리하고 링크를 그룹화하세요
          </p>
        </div>
        <Link href="/admin/campaigns/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            새 캠페인
          </Button>
        </Link>
      </div>

      <CampaignList initialCampaigns={campaigns} />
    </div>
  );
}
