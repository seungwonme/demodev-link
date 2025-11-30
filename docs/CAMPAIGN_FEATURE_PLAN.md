# Campaign Feature Implementation Plan

## Overview

캠페인 설정, YouTube 임베딩, 자주 사용하는 링크(템플릿) 기능을 추가합니다.

**요구사항 정리:**
- 캠페인: 링크 그룹화 + UTM 캠페인 연동
- 자주 사용하는 링크: URL + 설명 + UTM 전체를 템플릿으로 저장
- YouTube: 링크 리스트에서 인라인 임베드

---

## 1. Database Schema

### 1.1 campaigns 테이블
```sql
CREATE TABLE IF NOT EXISTS "public"."campaigns" (
    "id" TEXT DEFAULT gen_random_uuid()::TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_term" TEXT,
    "utm_content" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "campaigns_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_campaigns_user_id" ON "public"."campaigns" ("user_id");
CREATE INDEX "idx_campaigns_status" ON "public"."campaigns" ("status");
```

### 1.2 campaign_links 연결 테이블
```sql
CREATE TABLE IF NOT EXISTS "public"."campaign_links" (
    "id" TEXT DEFAULT gen_random_uuid()::TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "link_id" UUID NOT NULL,
    "added_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "campaign_links_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "campaign_links_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE,
    CONSTRAINT "campaign_links_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE CASCADE,
    CONSTRAINT "campaign_links_unique" UNIQUE ("campaign_id", "link_id")
);

CREATE INDEX "idx_campaign_links_campaign_id" ON "public"."campaign_links" ("campaign_id");
```

### 1.3 link_templates 테이블
```sql
CREATE TABLE IF NOT EXISTS "public"."link_templates" (
    "id" TEXT DEFAULT gen_random_uuid()::TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "original_url" TEXT NOT NULL,
    "description" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_term" TEXT,
    "utm_content" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "link_templates_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "link_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_link_templates_user_id" ON "public"."link_templates" ("user_id");
```

---

## 2. File Structure

```
src/features/
├── campaigns/
│   ├── actions/
│   │   └── campaign-actions.ts
│   ├── components/
│   │   ├── campaign-list.tsx
│   │   ├── campaign-card.tsx
│   │   ├── campaign-form.tsx
│   │   ├── campaign-detail.tsx
│   │   ├── campaign-link-selector.tsx
│   │   └── campaign-status-badge.tsx
│   ├── services/
│   │   └── campaign.service.ts
│   └── types/
│       └── campaign.ts
│
├── templates/
│   ├── actions/
│   │   └── template-actions.ts
│   ├── components/
│   │   ├── template-list.tsx
│   │   ├── template-card.tsx
│   │   ├── template-form.tsx
│   │   └── template-selector.tsx
│   ├── services/
│   │   └── template.service.ts
│   └── types/
│       └── template.ts
│
├── links/
│   ├── components/
│   │   └── youtube/
│   │       ├── youtube-embed.tsx
│   │       └── youtube-thumbnail.tsx
│   ├── types/
│   │   └── youtube.ts
│   └── utils/
│       └── youtube.ts

src/app/admin/
├── campaigns/
│   ├── page.tsx
│   ├── new/page.tsx
│   └── [id]/
│       ├── page.tsx
│       └── edit/page.tsx
└── templates/
    ├── page.tsx
    ├── new/page.tsx
    └── [id]/edit/page.tsx
```

---

## 3. Implementation Order

### Phase 1: Database & Types
1. Migration 파일 생성 (campaigns, campaign_links, link_templates)
2. `pnpm run db:push` 실행
3. `pnpm run gen:types` 실행
4. 타입 정의 파일 생성

### Phase 2: YouTube Embedding
1. `src/features/links/utils/youtube.ts` - YouTube URL 파싱 유틸리티
2. `src/features/links/types/youtube.ts` - 타입 정의
3. `src/features/links/components/youtube/youtube-embed.tsx` - 임베드 컴포넌트
4. `src/features/links/components/youtube/youtube-thumbnail.tsx` - 썸네일 컴포넌트
5. `link-list.tsx` 수정 - YouTube 링크 감지 및 인라인 임베드 표시

### Phase 3: Link Templates
1. `src/features/templates/types/template.ts`
2. `src/features/templates/services/template.service.ts`
3. `src/features/templates/actions/template-actions.ts`
4. 템플릿 UI 컴포넌트들
5. `src/app/admin/templates/` 페이지들
6. Sidebar 네비게이션 업데이트

### Phase 4: Campaign System
1. `src/features/campaigns/types/campaign.ts`
2. `src/features/campaigns/services/campaign.service.ts`
3. `src/features/campaigns/actions/campaign-actions.ts`
4. 캠페인 UI 컴포넌트들
5. `src/app/admin/campaigns/` 페이지들
6. 템플릿 선택기를 URL 입력 폼에 통합

### Phase 5: Integration
1. URL 입력 폼에 템플릿 선택 드롭다운 추가
2. 링크 생성 후 "템플릿으로 저장" 옵션
3. 링크 리스트에 "캠페인에 추가" 옵션
4. 대시보드에 캠페인 통계 표시

---

## 4. Key Implementation Details

### YouTube URL 파싱
```typescript
// src/features/links/utils/youtube.ts
const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
];

export function getYouTubeVideoId(url: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}
```

### Service 패턴 (기존 패턴 따름)
```typescript
// src/features/campaigns/services/campaign.service.ts
export class CampaignService {
  static async createCampaign(data: CreateCampaignDTO): Promise<Campaign> {
    const user = await ClerkAuthService.requireAuth({ requiredStatus: "approved" });
    const supabase = await createClient();
    // ... implementation
  }
}
```

---

## 5. Critical Files to Modify

| File | Change |
|------|--------|
| `src/features/links/components/link-list.tsx` | YouTube 임베드 토글 추가 |
| `src/features/links/components/url/url-input-form.tsx` | 템플릿 선택기 추가 |
| `src/features/auth/components/admin/sidebar.tsx` | 캠페인, 템플릿 메뉴 추가 |
| `src/shared/types/database.types.ts` | 자동 생성 (gen:types) |

---

## 6. UI/UX Considerations

- YouTube 임베드: 리스트에서 확장 시 16:9 비율로 표시
- 템플릿 선택: 드롭다운으로 빠른 선택, 선택 시 폼 자동 채우기
- 캠페인 상태: active(초록), paused(노랑), archived(회색) 배지
- 기존 디자인 패턴(glass-effect, gradient) 유지
