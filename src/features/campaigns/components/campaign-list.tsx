"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Eye, Edit, Trash2, Link2, MousePointerClick, Plus } from "lucide-react";
import { toast } from "sonner";
import { deleteCampaign } from "../actions/campaign-actions";
import { CampaignStatusBadge } from "./campaign-status-badge";
import type { CampaignWithStats, CampaignStatus } from "../types/campaign";

interface CampaignListProps {
  initialCampaigns: CampaignWithStats[];
}

export function CampaignList({ initialCampaigns }: CampaignListProps) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);

  const handleDelete = async (id: string) => {
    const result = await deleteCampaign(id);

    if (result.success) {
      setCampaigns(campaigns.filter((c) => c.id !== id));
      toast.success("캠페인이 삭제되었습니다.");
    } else {
      toast.error(result.error || "캠페인 삭제에 실패했습니다.");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toISOString().split("T")[0];
  };

  const hasUTMParams = (campaign: CampaignWithStats): boolean => {
    return !!(
      campaign.utm_source ||
      campaign.utm_medium ||
      campaign.utm_campaign ||
      campaign.utm_term ||
      campaign.utm_content
    );
  };

  if (campaigns.length === 0) {
    return (
      <Card className="border-none shadow-sm bg-white/50 dark:bg-white/5">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">
            아직 생성된 캠페인이 없습니다.
          </p>
          <Link href="/admin/campaigns/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              첫 캠페인 만들기
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {campaigns.map((campaign) => (
        <Card
          key={campaign.id}
          className="border-black/5 dark:border-white/5 hover:bg-muted/50 dark:hover:bg-white/5 shadow-sm transition-all"
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 mr-4">
                <div className="flex items-center gap-2 mb-2">
                  <Link
                    href={`/admin/campaigns/${campaign.id}`}
                    className="font-semibold text-lg hover:underline"
                  >
                    {campaign.name}
                  </Link>
                  <CampaignStatusBadge status={campaign.status as CampaignStatus} />
                  {hasUTMParams(campaign) && (
                    <Badge variant="outline" className="text-xs">
                      UTM
                    </Badge>
                  )}
                </div>

                {campaign.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {campaign.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Link2 className="h-4 w-4" />
                    <span>{campaign.total_links} 링크</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MousePointerClick className="h-4 w-4" />
                    <span>{campaign.total_clicks} 클릭</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  생성일: {formatDate(campaign.created_at)}
                </p>
              </div>

              <div className="flex gap-2">
                <Link href={`/admin/campaigns/${campaign.id}`}>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/admin/campaigns/${campaign.id}/edit`}>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>캠페인 삭제</AlertDialogTitle>
                      <AlertDialogDescription>
                        &quot;{campaign.name}&quot; 캠페인을 삭제하시겠습니까?
                        캠페인에 연결된 링크들은 삭제되지 않습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(campaign.id)}>
                        삭제
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
