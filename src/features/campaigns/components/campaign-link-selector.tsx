"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Loader2, Search, Plus, Link2, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  getAvailableLinks,
  addLinkToCampaign,
  createAndAddLinkToCampaign,
  createLinksFromTemplatesAndAddToCampaign,
} from "../actions/campaign-actions";
import { getTemplates } from "@/features/templates/actions/template-actions";
import type { Link } from "@/shared/types/link";
import type { LinkTemplate } from "@/features/templates/types/template";
import type { CreateLinkDTO } from "@/shared/types/link";
import type { Campaign } from "../types/campaign";

interface CampaignLinkSelectorProps {
  campaignId: string;
  campaign: Campaign;
  onClose: () => void;
  onLinkAdded: (link: Link) => void;
  onLinksAdded?: (links: Link[]) => void;
}

export function CampaignLinkSelector({
  campaignId,
  campaign,
  onClose,
  onLinkAdded,
  onLinksAdded,
}: CampaignLinkSelectorProps) {
  // 기존 링크 관련 상태
  const [links, setLinks] = useState<Link[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<Link[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingLinkId, setAddingLinkId] = useState<string | null>(null);

  // 새 링크 생성 관련 상태
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkDescription, setNewLinkDescription] = useState("");
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  // 템플릿 관련 상태
  const [templates, setTemplates] = useState<LinkTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(new Set());
  const [isAddingTemplates, setIsAddingTemplates] = useState(false);

  // 캠페인 기본 UTM 파라미터
  const campaignUtmParams = {
    utm_source: campaign.utm_source || "",
    utm_medium: campaign.utm_medium || "",
    utm_campaign: campaign.utm_campaign || "",
    utm_term: campaign.utm_term || "",
    utm_content: campaign.utm_content || "",
  };

  // 기존 링크 목록 로드
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const result = await getAvailableLinks(campaignId);
        if (result.success && result.data) {
          setLinks(result.data);
          setFilteredLinks(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch links:", error);
        toast.error("링크 목록을 불러오는데 실패했습니다.");
      } finally {
        setIsLoadingLinks(false);
      }
    };

    fetchLinks();
  }, [campaignId]);

  // 템플릿 목록 로드
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const result = await getTemplates();
        if (result.success && result.data) {
          setTemplates(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch templates:", error);
        toast.error("템플릿 목록을 불러오는데 실패했습니다.");
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  // 검색 필터
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = links.filter(
      (link) =>
        link.original_url.toLowerCase().includes(query) ||
        link.slug.toLowerCase().includes(query) ||
        link.description?.toLowerCase().includes(query)
    );
    setFilteredLinks(filtered);
  }, [searchQuery, links]);

  // 기존 링크 추가
  const handleAddLink = async (link: Link) => {
    setAddingLinkId(link.id);

    try {
      const result = await addLinkToCampaign(campaignId, link.id);

      if (result.success) {
        toast.success("링크가 캠페인에 추가되었습니다.");
        onLinkAdded(link);
        setLinks(links.filter((l) => l.id !== link.id));
        setFilteredLinks(filteredLinks.filter((l) => l.id !== link.id));
      } else {
        toast.error(result.error || "링크 추가에 실패했습니다.");
      }
    } catch {
      toast.error("링크 추가 중 오류가 발생했습니다.");
    } finally {
      setAddingLinkId(null);
    }
  };

  // 새 링크 생성 및 추가 (캠페인 UTM 자동 적용)
  const handleCreateNewLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newLinkUrl.trim()) {
      toast.error("URL을 입력해주세요.");
      return;
    }

    setIsCreatingLink(true);

    try {
      const linkData: CreateLinkDTO = {
        original_url: newLinkUrl,
        description: newLinkDescription || undefined,
        utm_params: campaignUtmParams,
      };

      const result = await createAndAddLinkToCampaign(campaignId, linkData);

      if (result.success && result.data) {
        toast.success("링크가 생성되어 캠페인에 추가되었습니다.");
        onLinkAdded(result.data);
        setNewLinkUrl("");
        setNewLinkDescription("");
      } else {
        toast.error(result.error || "링크 생성에 실패했습니다.");
      }
    } catch {
      toast.error("링크 생성 중 오류가 발생했습니다.");
    } finally {
      setIsCreatingLink(false);
    }
  };

  // 템플릿 선택 토글
  const handleTemplateToggle = (templateId: string, checked: boolean) => {
    const newSet = new Set(selectedTemplateIds);
    if (checked) {
      newSet.add(templateId);
    } else {
      newSet.delete(templateId);
    }
    setSelectedTemplateIds(newSet);
  };

  // 전체 선택/해제
  const handleSelectAllTemplates = (checked: boolean) => {
    if (checked) {
      setSelectedTemplateIds(new Set(templates.map((t) => t.id)));
    } else {
      setSelectedTemplateIds(new Set());
    }
  };

  // 선택한 템플릿들로 링크 일괄 생성 및 추가
  const handleAddSelectedTemplates = async () => {
    if (selectedTemplateIds.size === 0) {
      toast.error("템플릿을 선택해주세요.");
      return;
    }

    setIsAddingTemplates(true);

    try {
      const selectedTemplates = templates.filter((t) =>
        selectedTemplateIds.has(t.id)
      );

      const result = await createLinksFromTemplatesAndAddToCampaign(
        campaignId,
        selectedTemplates,
        campaignUtmParams
      );

      if (result.success && result.data) {
        toast.success(
          `${result.data.length}개의 링크가 캠페인에 추가되었습니다.`
        );
        // 다중 링크 콜백이 있으면 배열로 한 번에 전달, 없으면 개별 호출
        if (onLinksAdded) {
          onLinksAdded(result.data);
        } else {
          result.data.forEach((link) => onLinkAdded(link));
        }
        setSelectedTemplateIds(new Set());
      } else {
        toast.error(result.error || "링크 생성에 실패했습니다.");
      }
    } catch {
      toast.error("링크 생성 중 오류가 발생했습니다.");
    } finally {
      setIsAddingTemplates(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>캠페인에 링크 추가</DialogTitle>
          <DialogDescription>
            기존 링크를 선택하거나, 새 링크를 생성하거나, 템플릿에서 선택하세요
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="existing" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3 bg-muted dark:bg-white/5">
            <TabsTrigger value="existing" className="flex items-center gap-2 data-[state=active]:bg-background dark:data-[state=active]:bg-white/15 data-[state=active]:text-foreground">
              <Link2 className="h-4 w-4" />
              기존 링크
            </TabsTrigger>
            <TabsTrigger value="new" className="flex items-center gap-2 data-[state=active]:bg-background dark:data-[state=active]:bg-white/15 data-[state=active]:text-foreground">
              <Sparkles className="h-4 w-4" />
              새 링크
            </TabsTrigger>
            <TabsTrigger value="template" className="flex items-center gap-2 data-[state=active]:bg-background dark:data-[state=active]:bg-white/15 data-[state=active]:text-foreground">
              <FileText className="h-4 w-4" />
              템플릿
            </TabsTrigger>
          </TabsList>

          {/* 기존 링크 탭 */}
          <TabsContent value="existing" className="flex-1 flex flex-col min-h-0 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="URL, 슬러그 또는 설명으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {isLoadingLinks ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredLinks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? (
                  <p>검색 결과가 없습니다.</p>
                ) : (
                  <p>추가 가능한 링크가 없습니다.</p>
                )}
              </div>
            ) : (
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-2">
                  {filteredLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2">
                          <Link2 className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          <p className="font-medium truncate">{link.slug}</p>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {link.original_url}
                        </p>
                        {link.description && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {link.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {link.click_count || 0} 클릭
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleAddLink(link)}
                          disabled={addingLinkId === link.id}
                        >
                          {addingLinkId === link.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* 새 링크 탭 */}
          <TabsContent value="new" className="flex-1 flex flex-col space-y-4">
            <form onSubmit={handleCreateNewLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-url">URL *</Label>
                <Input
                  id="new-url"
                  type="url"
                  placeholder="https://example.com"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-description">설명 (선택)</Label>
                <Textarea
                  id="new-description"
                  placeholder="링크에 대한 설명을 입력하세요"
                  value={newLinkDescription}
                  onChange={(e) => setNewLinkDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isCreatingLink}
              >
                {isCreatingLink ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    링크 생성 및 추가
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          {/* 템플릿 탭 */}
          <TabsContent value="template" className="flex-1 flex flex-col min-h-0 space-y-4">
            {isLoadingTemplates ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>저장된 템플릿이 없습니다.</p>
              </div>
            ) : (
              <>
                {/* 상단 컨트롤 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedTemplateIds.size === templates.length}
                      onCheckedChange={handleSelectAllTemplates}
                    />
                    <Label htmlFor="select-all" className="text-sm cursor-pointer">
                      전체 선택 ({selectedTemplateIds.size}/{templates.length})
                    </Label>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAddSelectedTemplates}
                    disabled={selectedTemplateIds.size === 0 || isAddingTemplates}
                  >
                    {isAddingTemplates ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        추가 중...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        선택한 템플릿 추가 ({selectedTemplateIds.size})
                      </>
                    )}
                  </Button>
                </div>

                {/* 템플릿 목록 */}
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-2">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className={`flex items-center p-3 border rounded-lg hover:bg-muted/30 cursor-pointer ${
                          selectedTemplateIds.has(template.id)
                            ? "border-primary bg-primary/5"
                            : ""
                        }`}
                        onClick={() =>
                          handleTemplateToggle(
                            template.id,
                            !selectedTemplateIds.has(template.id)
                          )
                        }
                      >
                        <Checkbox
                          checked={selectedTemplateIds.has(template.id)}
                          onCheckedChange={(checked) =>
                            handleTemplateToggle(template.id, !!checked)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="mr-3"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            <p className="font-medium truncate">{template.name}</p>
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {template.original_url}
                          </p>
                          {template.description && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {template.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
