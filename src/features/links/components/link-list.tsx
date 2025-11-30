"use client";

import { useState, useEffect } from "react";
import { Link } from "@/shared/types/link";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { deleteLink } from "@/features/links/actions/delete-link";
import { updateLinkDescription } from "@/features/links/actions/update-link";
import { getAllLinksForAnalytics } from "@/features/analytics/actions/get-analytics";
import LinkStats from "@/features/analytics/components/link-stats";
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
import { Trash2, Copy, ExternalLink, BarChart3, Edit2, Calendar, Youtube, FolderPlus } from "lucide-react";
import { toast } from "sonner";
import { isYouTubeUrl, getYouTubeVideoId } from "../utils/youtube";
import { YouTubeEmbed } from "./youtube/youtube-embed";
import { YouTubeThumbnail } from "./youtube/youtube-thumbnail";
import { AddToCampaignDialog } from "@/features/campaigns/components/add-to-campaign-dialog";

interface LinkListProps {
  initialLinks: Link[];
}

type DateRangePreset = '7d' | '30d' | '3m' | '6m' | 'all' | 'custom';

export default function LinkList({ initialLinks }: LinkListProps) {
  const [links, setLinks] = useState<(Link & { period_clicks?: number })[]>(initialLinks);
  const [showAll, setShowAll] = useState(false);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>("");
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState<string>("");
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [expandedYouTube, setExpandedYouTube] = useState<string | null>(null);
  const [showAddToCampaign, setShowAddToCampaign] = useState(false);
  const [selectedLinkForCampaign, setSelectedLinkForCampaign] = useState<string | null>(null);

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  useEffect(() => {
    // 날짜 범위가 변경되면 데이터 다시 로드
    fetchLinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRangePreset, customStartDate, customEndDate]);

  const getDateRange = (): { startDate?: string; endDate?: string } | undefined => {
    const now = new Date();
    const endDate = now.toISOString();

    switch (dateRangePreset) {
      case '7d': {
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        return { startDate: startDate.toISOString(), endDate };
      }
      case '30d': {
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        return { startDate: startDate.toISOString(), endDate };
      }
      case '3m': {
        const startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 3);
        return { startDate: startDate.toISOString(), endDate };
      }
      case '6m': {
        const startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 6);
        return { startDate: startDate.toISOString(), endDate };
      }
      case 'custom': {
        if (customStartDate && customEndDate) {
          return {
            startDate: new Date(customStartDate).toISOString(),
            endDate: new Date(customEndDate).toISOString(),
          };
        }
        return undefined;
      }
      case 'all':
      default:
        return undefined;
    }
  };

  const fetchLinks = async () => {
    const dateRange = getDateRange();
    const result = await getAllLinksForAnalytics(dateRange);
    if (result.success && result.data) {
      if (showAll) {
        setLinks(result.data);
      } else {
        setLinks(result.data.slice(0, 10));
      }
    }
  };

  const handleShowAll = async () => {
    if (!showAll) {
      const dateRange = getDateRange();
      const result = await getAllLinksForAnalytics(dateRange);
      if (result.success && result.data) {
        setLinks(result.data);
      }
    } else {
      const dateRange = getDateRange();
      const result = await getAllLinksForAnalytics(dateRange);
      if (result.success && result.data) {
        setLinks(result.data.slice(0, 10));
      }
    }
    setShowAll(!showAll);
  };

  const formatDate = (dateString: string) => {
    // ISO 표준 형식 사용 (hydration 오류 방지)
    return new Date(dateString).toISOString().split("T")[0];
  };
  
  const handleDelete = async (linkId: string) => {
    const result = await deleteLink(linkId);
    
    if (result.success) {
      setLinks(links.filter(link => link.id !== linkId));
      toast.success("링크가 삭제되었습니다.");
    } else {
      toast.error(result.error || "링크 삭제에 실패했습니다.");
    }
  };
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("클립보드에 복사되었습니다.");
    } catch {
      toast.error("복사에 실패했습니다.");
    }
  };

  const handleUpdateDescription = async (linkId: string) => {
    try {
      const { error } = await updateLinkDescription(linkId, editDescription);
      
      if (error) {
        toast.error("설명 업데이트에 실패했습니다.");
        return;
      }
      
      // 성공적으로 업데이트되면 로컬 상태 업데이트
      setLinks(links.map(link => 
        link.id === linkId 
          ? { ...link, description: editDescription }
          : link
      ));
      setEditingLink(null);
      toast.success("설명이 업데이트되었습니다.");
    } catch {
      toast.error("설명 업데이트 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {showAll ? "모든 링크" : "상위 10개 링크"}
        </h2>
        <Button onClick={handleShowAll}>
          {showAll ? "상위 10개만 보기" : "전체 보기"}
        </Button>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              날짜 범위 선택
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={dateRangePreset === '7d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRangePreset('7d')}
              >
                최근 7일
              </Button>
              <Button
                variant={dateRangePreset === '30d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRangePreset('30d')}
              >
                최근 30일
              </Button>
              <Button
                variant={dateRangePreset === '3m' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRangePreset('3m')}
              >
                최근 3개월
              </Button>
              <Button
                variant={dateRangePreset === '6m' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRangePreset('6m')}
              >
                최근 6개월
              </Button>
              <Button
                variant={dateRangePreset === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRangePreset('all')}
              >
                전체 기간
              </Button>
              <Button
                variant={dateRangePreset === 'custom' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRangePreset('custom')}
              >
                사용자 정의
              </Button>
            </div>

            {/* Custom Date Range Inputs */}
            {dateRangePreset === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">시작일</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">종료일</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            )}

            {/* Display Selected Range */}
            <div className="text-xs text-muted-foreground">
              {dateRangePreset === 'all' && '전체 데이터를 표시합니다'}
              {dateRangePreset === '7d' && '최근 7일 데이터를 표시합니다'}
              {dateRangePreset === '30d' && '최근 30일 데이터를 표시합니다'}
              {dateRangePreset === '3m' && '최근 3개월 데이터를 표시합니다'}
              {dateRangePreset === '6m' && '최근 6개월 데이터를 표시합니다'}
              {dateRangePreset === 'custom' && customStartDate && customEndDate &&
                `${customStartDate} ~ ${customEndDate} 데이터를 표시합니다`}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {links.map((link) => (
          <Card
            key={link.id}
            className="hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 mr-4">
                  <div className="flex items-center gap-3">
                    {/* YouTube 썸네일 (YouTube URL인 경우) */}
                    {isYouTubeUrl(link.original_url) && (
                      <YouTubeThumbnail
                        videoId={getYouTubeVideoId(link.original_url) || ""}
                        size="sm"
                        onClick={() => setExpandedYouTube(expandedYouTube === link.id ? null : link.id)}
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {isYouTubeUrl(link.original_url) && (
                          <Youtube className="h-4 w-4 text-red-600 flex-shrink-0" />
                        )}
                        <p className="font-medium break-all">{link.original_url}</p>
                      </div>
                    </div>
                  </div>
                  {editingLink === link.id ? (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border rounded"
                        placeholder="설명을 입력하세요"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateDescription(link.id);
                          } else if (e.key === 'Escape') {
                            setEditingLink(null);
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleUpdateDescription(link.id)}
                      >
                        저장
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingLink(null)}
                      >
                        취소
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {link.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {link.description}
                        </p>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingLink(link.id);
                          setEditDescription(link.description || "");
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
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
                      onClick={() => window.open(`${baseUrl}/${link.slug}`, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  {dateRangePreset === 'all' ? (
                    <p className="font-medium">{link.click_count} 클릭</p>
                  ) : (
                    <>
                      <p className="font-medium text-primary">
                        {link.period_clicks || 0} 클릭
                      </p>
                      <p className="text-xs text-muted-foreground">
                        (전체: {link.click_count})
                      </p>
                    </>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(link.created_at || "")}
                  </p>
                  <div className="flex gap-2 mt-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedLinkForCampaign(link.id);
                        setShowAddToCampaign(true);
                      }}
                    >
                      <FolderPlus className="h-4 w-4" />
                      캠페인
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedLink(selectedLink?.id === link.id ? null : link)}
                    >
                      <BarChart3 className="h-4 w-4" />
                      통계
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                          삭제
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>링크 삭제</AlertDialogTitle>
                          <AlertDialogDescription>
                            이 링크를 삭제하시겠습니까? 삭제된 링크는 복구할 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(link.id)}>
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
              {/* YouTube 임베드 (확장 시) */}
              {expandedYouTube === link.id && isYouTubeUrl(link.original_url) && (
                <div className="mt-4 border-t pt-4">
                  <YouTubeEmbed
                    videoId={getYouTubeVideoId(link.original_url) || ""}
                    title={link.description || undefined}
                    className="max-w-2xl"
                  />
                </div>
              )}
              {selectedLink?.id === link.id && (
                <div className="mt-4 border-t pt-4">
                  <LinkStats linkId={link.id} dateRange={getDateRange()} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add to Campaign Dialog */}
      {selectedLinkForCampaign && (
        <AddToCampaignDialog
          open={showAddToCampaign}
          onOpenChange={setShowAddToCampaign}
          linkId={selectedLinkForCampaign}
          onSuccess={() => {
            setSelectedLinkForCampaign(null);
          }}
        />
      )}
    </div>
  );
}
