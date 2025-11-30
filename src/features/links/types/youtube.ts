export interface YouTubeVideoInfo {
  videoId: string;
  isYouTube: boolean;
  embedUrl: string | null;
  thumbnailUrl: string | null;
}

export type YouTubeUrlFormat =
  | "watch" // youtube.com/watch?v=VIDEO_ID
  | "short" // youtu.be/VIDEO_ID
  | "embed" // youtube.com/embed/VIDEO_ID
  | "shorts" // youtube.com/shorts/VIDEO_ID
  | "unknown";

export type YouTubeThumbnailQuality =
  | "default" // 120x90
  | "mqdefault" // 320x180
  | "hqdefault" // 480x360
  | "sddefault" // 640x480
  | "maxresdefault"; // 1280x720
