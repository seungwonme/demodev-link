import { notFound } from "next/navigation";
import { getCampaign } from "@/features/campaigns/actions/campaign-actions";
import { CampaignForm } from "@/features/campaigns/components/campaign-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";

interface EditCampaignPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCampaignPage({
  params,
}: EditCampaignPageProps) {
  const { id } = await params;
  const result = await getCampaign(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Link href={`/admin/campaigns/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            캠페인 상세로
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">캠페인 수정</h1>
        <p className="text-muted-foreground mt-2">
          {result.data.name}
        </p>
      </div>

      <CampaignForm campaign={result.data} mode="edit" />
    </div>
  );
}
