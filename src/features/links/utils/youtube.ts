import type {
  YouTubeVideoInfo,
  YouTubeUrlFormat,
  YouTubeThumbnailQuality,
} from "../types/youtube";

/**
 * YouTube URL 패턴들
 * - youtube.com/watch?v=VIDEO_ID
 * - youtu.be/VIDEO_ID
 * - youtube.com/embed/VIDEO_ID
 * - youtube.com/shorts/VIDEO_ID
 * - youtube.com/v/VIDEO_ID
 */
const YOUTUBE_PATTERNS: { pattern: RegExp; format: YouTubeUrlFormat }[] = [
  {
    pattern:
      /(?:youtube\.com\/watch\?.*v=|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    format: "watch",
  },
  {
    pattern: /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    format: "short",
  },
  {
    pattern: /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    format: "embed",
  },
  {
    pattern: /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    format: "shorts",
  },
  {
    pattern: /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    format: "watch",
  },
];

/**
 * URL이 YouTube URL인지 확인
 */
export function isYouTubeUrl(url: string): boolean {
  return YOUTUBE_PATTERNS.some(({ pattern }) => pattern.test(url));
}

/**
 * YouTube URL에서 비디오 ID 추출
 */
export function getYouTubeVideoId(url: string): string | null {
  for (const { pattern } of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * YouTube URL 형식 감지
 */
export function getYouTubeUrlFormat(url: string): YouTubeUrlFormat {
  for (const { pattern, format } of YOUTUBE_PATTERNS) {
    if (pattern.test(url)) {
      return format;
    }
  }
  return "unknown";
}

/**
 * YouTube 임베드 URL 생성
 */
export function getYouTubeEmbedUrl(
  videoId: string,
  options?: {
    autoplay?: boolean;
    mute?: boolean;
    controls?: boolean;
    loop?: boolean;
  }
): string {
  const params = new URLSearchParams();

  if (options?.autoplay) params.set("autoplay", "1");
  if (options?.mute) params.set("mute", "1");
  if (options?.controls === false) params.set("controls", "0");
  if (options?.loop) {
    params.set("loop", "1");
    params.set("playlist", videoId);
  }

  const queryString = params.toString();
  return `https://www.youtube.com/embed/${videoId}${queryString ? `?${queryString}` : ""}`;
}

/**
 * YouTube 썸네일 URL 생성
 */
export function getYouTubeThumbnailUrl(
  videoId: string,
  quality: YouTubeThumbnailQuality = "mqdefault"
): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * YouTube URL을 분석하여 비디오 정보 반환
 */
export function parseYouTubeUrl(url: string): YouTubeVideoInfo {
  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
    return {
      videoId: "",
      isYouTube: false,
      embedUrl: null,
      thumbnailUrl: null,
    };
  }

  return {
    videoId,
    isYouTube: true,
    embedUrl: getYouTubeEmbedUrl(videoId),
    thumbnailUrl: getYouTubeThumbnailUrl(videoId),
  };
}
