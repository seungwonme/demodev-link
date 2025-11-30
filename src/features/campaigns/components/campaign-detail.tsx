"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
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
import {
  Edit,
  ExternalLink,
  Copy,
  Trash2,
  Link2,
  MousePointerClick,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { removeLinkFromCampaign } from "../actions/campaign-actions";
import { CampaignStatusBadge } from "./campaign-status-badge";
import { CampaignLinkSelector } from "./campaign-link-selector";
import { isYouTubeUrl, getYouTubeVideoId } from "@/features/links/utils/youtube";
import { YouTubeThumbnail } from "@/features/links/components/youtube/youtube-thumbnail";
import { YouTubeEmbed } from "@/features/links/components/youtube/youtube-embed";
import type { CampaignWithLinks, CampaignStatus } from "../types/campaign";
import type { Link as LinkType } from "@/shared/types/link";

interface CampaignDetailProps {
  campaign: CampaignWithLinks;
}

export function CampaignDetail({ campaign: initialCampaign }: CampaignDetailProps) {
  const [campaign, setCampaign] = useState(initialCampaign);
  const [expandedYouTube, setExpandedYouTube] = useState<string | null>(null);
  const [showLinkSelector, setShowLinkSelector] = useState(false);
  const [baseUrl, setBaseUrl] = useState<string>("");

  useState(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  });

  const handleRemoveLink = async (linkId: string) => {
    const result = await removeLinkFromCampaign(campaign.id, linkId);

    if (result.success) {
      setCampaign({
        ...campaign,
        links: campaign.links.filter((l) => l.id !== linkId),
      });
      toast.success("링크가 캠페인에서 제거되었습니다.");
    } else {
      toast.error(result.error || "링크 제거에 실패했습니다.");
    }
  };

  const handleLinkAdded = (link: LinkType) => {
    setCampaign({
      ...campaign,
      links: [link, ...campaign.links],
    });
    setShowLinkSelector(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("클립보드에 복사되었습니다.");
    } catch {
      toast.error("복사에 실패했습니다.");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toISOString().split("T")[0];
  };

  const totalClicks = campaign.links.reduce(
    (sum, link) => sum + (link.click_count || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* 캠페인 소스 (유튜브 임베딩) */}
      {campaign.source_url && isYouTubeUrl(campaign.source_url) && (
        <Card>
          <CardHeader>
            <CardTitle>캠페인 소스</CardTitle>
          </CardHeader>
          <CardContent>
            <YouTubeEmbed
              videoId={getYouTubeVideoId(campaign.source_url) || ""}
              title={campaign.name}
            />
          </CardContent>
        </Card>
      )}

      {/* 캠페인 정보 */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-2xl">{campaign.name}</CardTitle>
              <CampaignStatusBadge status={campaign.status as CampaignStatus} />
            </div>
            {campaign.description && (
              <p className="text-muted-foreground">{campaign.description}</p>
            )}
          </div>
          <Link href={`/admin/campaigns/${campaign.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              수정
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                <Link2 className="h-4 w-4" />
                <span className="text-sm">링크 수</span>
              </div>
              <p className="text-2xl font-bold">{campaign.links.length}</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                <MousePointerClick className="h-4 w-4" />
                <span className="text-sm">총 클릭</span>
              </div>
              <p className="text-2xl font-bold">{totalClicks}</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-muted-foreground text-sm mb-1">생성일</div>
              <p className="text-lg font-medium">{formatDate(campaign.created_at)}</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-muted-foreground text-sm mb-1">수정일</div>
              <p className="text-lg font-medium">{formatDate(campaign.updated_at)}</p>
            </div>
          </div>

          {/* UTM 정보 */}
          {(campaign.utm_source ||
            campaign.utm_medium ||
            campaign.utm_campaign) && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">기본 UTM 파라미터</h4>
              <div className="flex flex-wrap gap-2">
                {campaign.utm_source && (
                  <Badge variant="outline">source: {campaign.utm_source}</Badge>
                )}
                {campaign.utm_medium && (
                  <Badge variant="outline">medium: {campaign.utm_medium}</Badge>
                )}
                {campaign.utm_campaign && (
                  <Badge variant="outline">campaign: {campaign.utm_campaign}</Badge>
                )}
                {campaign.utm_term && (
                  <Badge variant="outline">term: {campaign.utm_term}</Badge>
                )}
                {campaign.utm_content && (
                  <Badge variant="outline">content: {campaign.utm_content}</Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 링크 목록 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>캠페인 링크</CardTitle>
          <Button onClick={() => setShowLinkSelector(true)}>
            <Plus className="h-4 w-4 mr-2" />
            링크 추가
          </Button>
        </CardHeader>
        <CardContent>
          {campaign.links.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">아직 추가된 링크가 없습니다.</p>
              <Button variant="outline" onClick={() => setShowLinkSelector(true)}>
                <Plus className="h-4 w-4 mr-2" />
                첫 링크 추가하기
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaign.links.map((link) => (
                <div
                  key={link.id}
                  className="border rounded-lg p-4 hover:bg-muted/30"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center gap-3">
                        {isYouTubeUrl(link.original_url) && (
                          <YouTubeThumbnail
                            videoId={getYouTubeVideoId(link.original_url) || ""}
                            size="sm"
                            onClick={() =>
                              setExpandedYouTube(
                                expandedYouTube === link.id ? null : link.id
                              )
                            }
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium break-all">
                            {link.original_url}
                          </p>
                          {link.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {link.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-sm text-gray-500">
                          {baseUrl}/{link.slug}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(`${baseUrl}/${link.slug}`)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            window.open(`${baseUrl}/${link.slug}`, "_blank")
                          }
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{link.click_count || 0} 클릭</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(link.created_at || null)}
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="mt-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>링크 제거</AlertDialogTitle>
                            <AlertDialogDescription>
                              이 링크를 캠페인에서 제거하시겠습니까? 링크 자체는
                              삭제되지 않습니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveLink(link.id)}
                            >
                              제거
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* YouTube 임베드 */}
                  {expandedYouTube === link.id &&
                    isYouTubeUrl(link.original_url) && (
                      <div className="mt-4 pt-4 border-t">
                        <YouTubeEmbed
                          videoId={getYouTubeVideoId(link.original_url) || ""}
                          title={link.description || undefined}
                          className="max-w-2xl"
                        />
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 링크 선택 다이얼로그 */}
      {showLinkSelector && (
        <CampaignLinkSelector
          campaignId={campaign.id}
          campaign={campaign}
          onClose={() => setShowLinkSelector(false)}
          onLinkAdded={handleLinkAdded}
        />
      )}
    </div>
  );
}
