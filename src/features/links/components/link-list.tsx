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
import { Trash2, Copy, ExternalLink, BarChart3, Edit2 } from "lucide-react";
import { toast } from "sonner";

interface LinkListProps {
  initialLinks: Link[];
}

export default function LinkList({ initialLinks }: LinkListProps) {
  const [links, setLinks] = useState<Link[]>(initialLinks);
  const [showAll, setShowAll] = useState(false);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>("");
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState<string>("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const handleShowAll = async () => {
    if (!showAll) {
      const result = await getAllLinksForAnalytics();
      if (result.success && result.data) {
        setLinks(result.data as Link[]);
      }
    } else {
      setLinks(initialLinks);
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

      <div className="grid gap-4">
        {links.map((link) => (
          <Card
            key={link.id}
            className="hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 mr-4">
                  <p className="font-medium break-all">{link.original_url}</p>
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
                  <p className="font-medium">{link.click_count} 클릭</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(link.created_at || "")}
                  </p>
                  <div className="flex gap-2 mt-2 justify-end">
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
              {selectedLink?.id === link.id && (
                <div className="mt-4 border-t pt-4">
                  <LinkStats linkId={link.id} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
