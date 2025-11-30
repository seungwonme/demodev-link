-- Migration: 캠페인 및 링크 템플릿 기능 추가
-- Date: 2025-12-01
-- Description: campaigns, campaign_links, link_templates 테이블 생성

-- =====================================================
-- 1. campaigns 테이블 생성
-- =====================================================
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

-- campaigns 인덱스
CREATE INDEX IF NOT EXISTS "idx_campaigns_user_id" ON "public"."campaigns" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_campaigns_status" ON "public"."campaigns" ("status");

-- campaigns 권한 설정
GRANT ALL ON TABLE "public"."campaigns" TO "anon";
GRANT ALL ON TABLE "public"."campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."campaigns" TO "service_role";

COMMENT ON TABLE "public"."campaigns" IS '마케팅 캠페인 - 여러 링크를 그룹화하고 UTM 기본값을 설정';

-- =====================================================
-- 2. campaign_links 연결 테이블 생성 (다대다 관계)
-- =====================================================
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

-- campaign_links 인덱스
CREATE INDEX IF NOT EXISTS "idx_campaign_links_campaign_id" ON "public"."campaign_links" ("campaign_id");
CREATE INDEX IF NOT EXISTS "idx_campaign_links_link_id" ON "public"."campaign_links" ("link_id");

-- campaign_links 권한 설정
GRANT ALL ON TABLE "public"."campaign_links" TO "anon";
GRANT ALL ON TABLE "public"."campaign_links" TO "authenticated";
GRANT ALL ON TABLE "public"."campaign_links" TO "service_role";

COMMENT ON TABLE "public"."campaign_links" IS '캠페인-링크 연결 테이블 (다대다 관계)';

-- =====================================================
-- 3. link_templates 테이블 생성
-- =====================================================
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

-- link_templates 인덱스
CREATE INDEX IF NOT EXISTS "idx_link_templates_user_id" ON "public"."link_templates" ("user_id");

-- link_templates 권한 설정
GRANT ALL ON TABLE "public"."link_templates" TO "anon";
GRANT ALL ON TABLE "public"."link_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."link_templates" TO "service_role";

COMMENT ON TABLE "public"."link_templates" IS '자주 사용하는 링크 템플릿 - URL, 설명, UTM 파라미터 저장';

-- =====================================================
-- 4. updated_at 자동 업데이트 트리거
-- =====================================================

-- 트리거 함수 생성 (이미 존재하면 무시)
CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- campaigns 테이블 트리거
DROP TRIGGER IF EXISTS "update_campaigns_updated_at" ON "public"."campaigns";
CREATE TRIGGER "update_campaigns_updated_at"
    BEFORE UPDATE ON "public"."campaigns"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."update_updated_at_column"();

-- link_templates 테이블 트리거
DROP TRIGGER IF EXISTS "update_link_templates_updated_at" ON "public"."link_templates";
CREATE TRIGGER "update_link_templates_updated_at"
    BEFORE UPDATE ON "public"."link_templates"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."update_updated_at_column"();

-- 트리거 함수 권한
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";
