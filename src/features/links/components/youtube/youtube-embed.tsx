"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
} from "../../utils/youtube";

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  autoplay?: boolean;
  className?: string;
}

export function YouTubeEmbed({
  videoId,
  title,
  autoplay = false,
  className = "",
}: YouTubeEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const thumbnailUrl = getYouTubeThumbnailUrl(videoId, "mqdefault");
  const embedUrl = getYouTubeEmbedUrl(videoId, {
    autoplay: isPlaying,
    mute: false,
  });

  if (!isPlaying) {
    return (
      <div
        className={`relative aspect-video w-full overflow-hidden rounded-lg bg-black ${className}`}
      >
        {/* 썸네일 이미지 */}
        <Image
          src={thumbnailUrl}
          alt={title || "YouTube video thumbnail"}
          fill
          className="object-cover"
          unoptimized
        />

        {/* 재생 버튼 오버레이 */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40">
          <Button
            variant="ghost"
            size="icon"
            className="h-16 w-16 rounded-full bg-red-600 text-white hover:bg-red-700 hover:text-white"
            onClick={() => setIsPlaying(true)}
          >
            <Play className="h-8 w-8 fill-current" />
          </Button>
        </div>

        {/* YouTube 로고 */}
        <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
          YouTube
        </div>
      </div>
    );
  }

  return (
    <div className={`relative aspect-video w-full ${className}`}>
      <iframe
        src={embedUrl}
        title={title || "YouTube video player"}
        className="h-full w-full rounded-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />

      {/* 닫기 버튼 */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gray-800 text-white hover:bg-gray-700 hover:text-white"
        onClick={() => setIsPlaying(false)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
