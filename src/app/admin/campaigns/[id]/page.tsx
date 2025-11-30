import { notFound } from "next/navigation";
import { getCampaignWithLinks } from "@/features/campaigns/actions/campaign-actions";
import { CampaignDetail } from "@/features/campaigns/components/campaign-detail";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";

interface CampaignDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailPage({
  params,
}: CampaignDetailPageProps) {
  const { id } = await params;
  const result = await getCampaignWithLinks(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <Link href="/admin/campaigns">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            캠페인 목록으로
          </Button>
        </Link>
      </div>

      <CampaignDetail campaign={result.data} />
    </div>
  );
}
