"use client";

import { useState, useEffect } from "react";
import { Link } from "@/types/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LinkService } from "@/services/link.service";
import LinkStats from "./link-stats";

interface LinkListProps {
  initialLinks: Link[];
}

export default function LinkList({ initialLinks }: LinkListProps) {
  const [links, setLinks] = useState<Link[]>(initialLinks);
  const [showAll, setShowAll] = useState(false);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const handleShowAll = async () => {
    if (!showAll) {
      const allLinks = await LinkService.getAllLinks();
      setLinks(allLinks);
    } else {
      setLinks(initialLinks);
    }
    setShowAll(!showAll);
  };

  const formatDate = (dateString: string) => {
    // ISO 표준 형식 사용 (hydration 오류 방지)
    return new Date(dateString).toISOString().split("T")[0];
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
            className="cursor-pointer hover:bg-gray-50"
            onClick={() =>
              setSelectedLink(selectedLink?.id === link.id ? null : link)
            }
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{link.original_url}</p>
                  <p className="text-sm text-gray-500">
                    단축 URL: {baseUrl}/{link.slug}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{link.click_count} 클릭</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(link.created_at)}
                  </p>
                </div>
              </div>
              {selectedLink?.id === link.id && (
                <div className="mt-4">
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
