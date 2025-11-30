"use client";

import { Play } from "lucide-react";
import { getYouTubeThumbnailUrl } from "../../utils/youtube";

interface YouTubeThumbnailProps {
  videoId: string;
  title?: string;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-12 w-20",
  md: "h-16 w-28",
  lg: "h-24 w-40",
};

export function YouTubeThumbnail({
  videoId,
  title,
  onClick,
  className = "",
  size = "md",
}: YouTubeThumbnailProps) {
  const thumbnailUrl = getYouTubeThumbnailUrl(videoId, "mqdefault");

  return (
    <button
      type="button"
      className={`group relative overflow-hidden rounded-md ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      title={title || "YouTube 동영상 재생"}
    >
      <img
        src={thumbnailUrl}
        alt={title || "YouTube video thumbnail"}
        className="h-full w-full object-cover transition-transform group-hover:scale-105"
      />

      {/* 재생 버튼 오버레이 */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600">
          <Play className="h-4 w-4 fill-white text-white" />
        </div>
      </div>
    </button>
  );
}
