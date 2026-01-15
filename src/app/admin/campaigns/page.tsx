import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Plus, FolderKanban } from "lucide-react";
import { CampaignList } from "@/features/campaigns/components/campaign-list";
import { getCampaigns } from "@/features/campaigns/actions/campaign-actions";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const result = await getCampaigns();
  const campaigns = result.success && result.data ? result.data : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white dark:bg-white/10 shadow-sm border-none">
            <FolderKanban className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">캠페인</h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">마케팅 캠페인을 관리하고 링크를 그룹화하세요.</p>
          </div>
        </div>
        <Link href="/admin/campaigns/new">
          <Button size="lg" className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold">
            <Plus className="h-4 w-4 mr-2" />
            새 캠페인
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-white/5 rounded-2xl p-8 backdrop-blur-xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] min-h-[400px]">
        <CampaignList initialCampaigns={campaigns} />
      </div>
    </div>
  );
}
