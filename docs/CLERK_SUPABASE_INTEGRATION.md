# Clerk + Supabase 통합 가이드

Clerk Third-Party Integration 방식으로 Supabase와 연동하는 방법.

---

## Third-Party Integration 설정

### Step 1: Clerk에서 Supabase Integration 활성화

1. [Clerk Dashboard](https://dashboard.clerk.com) 접속
2. **Configure** → **Integrations** → **Supabase** 선택
3. **Enable Integration** 클릭
4. **Clerk Domain** 복사 (예: `clerk.link.demodev.io`)

### Step 2: Supabase에서 Clerk를 Auth Provider로 등록

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. **Authentication** → **Sign In / Up** → **Third Party Auth**
3. **Add provider** 클릭
4. **Clerk** 선택
5. Clerk Domain 붙여넣기
6. **Confirm** 클릭

### Step 3: 환경 변수 설정

```bash
# .env.local

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxxxx
CLERK_SECRET_KEY=sk_xxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Webhook용
```

### Step 4: Supabase 클라이언트 설정

#### 클라이언트 사이드 (React)

```typescript
// src/lib/supabase/client.ts
"use client";

import { useSession } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

export function useSupabaseClient() {
  const { session } = useSession();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      async accessToken() {
        return session?.getToken() ?? null;
      },
    }
  );
}
```

#### 서버 사이드 (Server Components / Actions)

```typescript
// src/lib/supabase/server.ts
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function createServerClient() {
  const { getToken } = await auth();
  const token = await getToken();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    }
  );
}
```

### Step 5: RLS 정책 설정

#### 5-1. 테이블에 user_id 컬럼 추가

```sql
-- user_id 컬럼 추가 (Clerk user ID 저장)
ALTER TABLE your_table
ADD COLUMN user_id TEXT DEFAULT (auth.jwt()->>'sub');
```

#### 5-2. RLS 활성화

```sql
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
```

#### 5-3. RLS 정책 생성

```sql
-- SELECT 정책: 본인 데이터만 조회
CREATE POLICY "Users can view own data"
ON your_table
FOR SELECT
TO authenticated
USING ((SELECT auth.jwt()->>'sub') = user_id);

-- INSERT 정책: 본인 데이터만 생성
CREATE POLICY "Users can insert own data"
ON your_table
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.jwt()->>'sub') = user_id);

-- UPDATE 정책: 본인 데이터만 수정
CREATE POLICY "Users can update own data"
ON your_table
FOR UPDATE
TO authenticated
USING ((SELECT auth.jwt()->>'sub') = user_id)
WITH CHECK ((SELECT auth.jwt()->>'sub') = user_id);

-- DELETE 정책: 본인 데이터만 삭제
CREATE POLICY "Users can delete own data"
ON your_table
FOR DELETE
TO authenticated
USING ((SELECT auth.jwt()->>'sub') = user_id);
```

---

## Clerk Webhook 설정

사용자 생성/삭제 시 Supabase profiles 테이블과 동기화.

### Step 1: Webhook 엔드포인트 생성

```typescript
// src/app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// Service Role Key 사용 (RLS 우회)
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET");
  }

  // Svix 헤더 검증
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Webhook 검증
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }

  const eventType = evt.type;

  // 사용자 생성 시 프로필 생성
  if (eventType === "user.created") {
    const { id, email_addresses, primary_email_address_id } = evt.data;

    const primaryEmail = email_addresses.find(
      (email) => email.id === primary_email_address_id
    )?.email_address;

    try {
      const supabase = createAdminClient();

      // profiles 테이블에 레코드 생성
      const { error } = await supabase.from("profiles").insert({
        clerk_user_id: id,
        email: primaryEmail,
      });

      if (error) {
        console.error("Failed to create profile:", error);
        return new Response("Failed to create profile", { status: 500 });
      }

      // Clerk metadata 초기화
      const client = await clerkClient();
      await client.users.updateUserMetadata(id, {
        publicMetadata: {
          status: "pending",
          role: "user",
        },
      });

      console.log("Profile created:", id);
    } catch (error) {
      console.error("Error in user.created:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }

  // 사용자 삭제 시 프로필 삭제
  if (eventType === "user.deleted") {
    const { id } = evt.data;

    try {
      const supabase = createAdminClient();
      await supabase
        .from("profiles")
        .delete()
        .eq("clerk_user_id", id);

      console.log("Profile deleted:", id);
    } catch (error) {
      console.error("Error in user.deleted:", error);
    }
  }

  return new Response("OK", { status: 200 });
}
```

### Step 2: 환경 변수 추가

```bash
# .env.local에 추가
CLERK_WEBHOOK_SECRET=whsec_xxxxx  # Webhook 등록 후 복사
```

### Step 3: Clerk에서 Production 도메인 등록

1. [Clerk Dashboard](https://dashboard.clerk.com) → **Configure** → **Domains**
2. **Add Domain** 클릭
3. **Domain**: `your-domain.com` 입력
4. DNS 레코드 추가:
   - **Type**: `CNAME`
   - **Name**: `clerk` (또는 원하는 서브도메인)
   - **Value**: Clerk에서 제공하는 값 (예: `frontend-api.clerk.services`)
5. DNS 전파 완료 후 **Verify** 클릭

### Step 4: Clerk Dashboard에서 Webhook 등록

1. [Clerk Dashboard](https://dashboard.clerk.com) → **Configure** → **Webhooks**
2. **Add Endpoint** 클릭
3. **Endpoint URL**: `https://your-domain.com/api/webhooks/clerk`
4. **Events** 선택:
   - `user.created`
   - `user.deleted`
5. **Create** 클릭
6. **Signing Secret** 복사 → `CLERK_WEBHOOK_SECRET`에 설정

### Step 5: svix 패키지 설치

```bash
pnpm add svix
```

---

## RLS 정책 예시: demo-link 프로젝트

### profiles 테이블

```sql
-- 본인 프로필만 조회/수정 가능
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT TO authenticated
USING ((SELECT auth.jwt()->>'sub') = clerk_user_id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE TO authenticated
USING ((SELECT auth.jwt()->>'sub') = clerk_user_id);
```

### links 테이블

```sql
-- 본인 링크만 CRUD 가능
CREATE POLICY "Users can view own links"
ON links FOR SELECT TO authenticated
USING (user_id IN (
  SELECT id FROM profiles
  WHERE clerk_user_id = (SELECT auth.jwt()->>'sub')
));

CREATE POLICY "Users can insert own links"
ON links FOR INSERT TO authenticated
WITH CHECK (user_id IN (
  SELECT id FROM profiles
  WHERE clerk_user_id = (SELECT auth.jwt()->>'sub')
));

-- 공개 링크는 누구나 조회 (리다이렉트용)
CREATE POLICY "Anyone can view links for redirect"
ON links FOR SELECT TO anon
USING (true);
```

### link_clicks 테이블

```sql
-- 누구나 클릭 기록 가능 (익명 포함)
CREATE POLICY "Anyone can insert clicks"
ON link_clicks FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- 링크 소유자만 클릭 통계 조회
CREATE POLICY "Link owners can view clicks"
ON link_clicks FOR SELECT TO authenticated
USING (link_id IN (
  SELECT l.id FROM links l
  JOIN profiles p ON l.user_id = p.id
  WHERE p.clerk_user_id = (SELECT auth.jwt()->>'sub')
));
```

---

## 트러블슈팅

### 1. RLS 정책으로 데이터 접근 불가

**원인**: JWT에 sub claim이 없거나, user_id가 매칭 안 됨

**확인 방법**:
```sql
-- JWT claims 확인
SELECT auth.jwt();

-- 현재 사용자 ID 확인
SELECT auth.jwt()->>'sub';
```

### 2. profiles 테이블 insert 실패

**원인**: id 컬럼에 default 값이 없음

**해결**:
```sql
ALTER TABLE profiles
ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
```

---

## Production / Development 환경 분리

### 방법 1: Clerk 환경별 인스턴스 사용

Clerk는 Production/Development 인스턴스를 자동 분리함.

```bash
# .env.local (Development)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# .env.production (Production)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
```

### 방법 2: Supabase 프로젝트 분리

**권장**: Production/Development 별도 Supabase 프로젝트 생성

```bash
# .env.local (Development)
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=dev-service-role-key

# .env.production (Production)
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=prod-service-role-key
```

### 방법 3: Supabase Branching (Pro Plan)

Supabase Pro Plan에서 Git-like 브랜칭 지원.

```bash
# 브랜치 생성
supabase branches create develop

# 브랜치 목록
supabase branches list

# 브랜치 삭제
supabase branches delete develop
```

### 스키마 동기화

#### Supabase CLI로 마이그레이션 관리

```bash
# 1. Supabase CLI 설치
pnpm add -D supabase

# 2. 프로젝트 초기화
bunx supabase init

# 3. 원격 DB 연결
bunx supabase link --project-ref your-project-ref

# 4. 현재 스키마를 마이그레이션으로 추출
bunx supabase db pull

# 5. 새 마이그레이션 생성
bunx supabase migration new add_new_table

# 6. 마이그레이션 적용 (로컬)
bunx supabase db reset

# 7. 마이그레이션 적용 (원격)
bunx supabase db push
```

#### 타입 생성

```bash
# Supabase에서 TypeScript 타입 자동 생성
bunx supabase gen types typescript --project-id your-project-ref > src/shared/types/database.types.ts
```

### Clerk 환경 매칭

| Clerk 환경 | Supabase 프로젝트 | Third-Party Auth 설정 |
|-----------|------------------|---------------------|
| Development (`pk_test_`) | dev-project | Clerk dev domain |
| Production (`pk_live_`) | prod-project | Clerk prod domain |

**주의**: 각 Supabase 프로젝트마다 Clerk Third-Party Auth를 별도로 설정해야 함.

### Vercel 환경 변수 설정

```bash
# Development (Preview)
vercel env add NEXT_PUBLIC_SUPABASE_URL development
vercel env add CLERK_SECRET_KEY development

# Production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add CLERK_SECRET_KEY production
```

또는 Vercel Dashboard → Settings → Environment Variables에서 설정:

| Variable | Development | Production |
|----------|-------------|------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_xxx` | `pk_live_xxx` |
| `CLERK_SECRET_KEY` | `sk_test_xxx` | `sk_live_xxx` |
| `NEXT_PUBLIC_SUPABASE_URL` | dev URL | prod URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | dev key | prod key |
| `SUPABASE_SERVICE_ROLE_KEY` | dev key | prod key |
| `CLERK_WEBHOOK_SECRET` | dev secret | prod secret |

---

## Vercel Cron으로 Supabase 활성 상태 유지

Supabase 무료 플랜은 7일 동안 활동이 없으면 프로젝트가 일시 중지됩니다. Vercel Cron을 사용하여 6일마다 요청을 보내 이를 방지할 수 있습니다.

### Step 1: API Route 생성

```typescript
// src/app/api/cron/keep-alive/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Service Role Key 사용 (인증 없이 실행)
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function GET(request: Request) {
  // Vercel Cron 인증 확인 (선택사항이지만 권장)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    // 간단한 쿼리로 DB 활성화 (profiles 테이블 count)
    const { count, error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Keep-alive query failed:", error);
      return NextResponse.json(
        { error: "Database query failed" },
        { status: 500 }
      );
    }

    console.log(`Keep-alive: ${count} profiles found at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: "Supabase keep-alive ping successful",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Keep-alive error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Step 2: vercel.json 설정

```json
{
  "crons": [
    {
      "path": "/api/cron/keep-alive",
      "schedule": "0 0 */6 * *"
    }
  ]
}
```

**Cron 표현식 설명**:
- `0 0 */6 * *` = 매 6일마다 00:00 UTC에 실행
- 형식: `분 시 일 월 요일`

**다른 스케줄 옵션**:
| 표현식 | 설명 |
|--------|------|
| `0 0 */6 * *` | 6일마다 (권장) |
| `0 0 * * 0` | 매주 일요일 |
| `0 0 1,15 * *` | 매월 1일, 15일 |

### Step 3: 환경 변수 추가

```bash
# .env.local
CRON_SECRET=your-random-secret-string

# 생성 방법
openssl rand -base64 32
```

Vercel Dashboard → Settings → Environment Variables에서 `CRON_SECRET` 추가.

### Step 4: Vercel에서 Cron 활성화

1. `vercel.json`을 프로젝트 루트에 배치
2. Vercel에 배포
3. Vercel Dashboard → Settings → Crons에서 확인

**참고**: Vercel Hobby 플랜은 하루 1회 Cron 실행 제한이 있습니다. Pro 플랜부터 무제한입니다.

### 인증 없이 간단하게 사용 (비권장)

보안이 덜 중요한 경우 인증 없이 간단하게 구현할 수 있습니다:

```typescript
// src/app/api/cron/keep-alive/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, timestamp: new Date().toISOString() });
}
```

### 로컬 테스트

```bash
# 환경 변수 설정 후 테스트
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/keep-alive
```

### Vercel Cron 로그 확인

Vercel Dashboard → Logs에서 Cron 실행 로그 확인 가능.

---

## 참고 링크

- [Clerk Supabase Integration Guide](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Supabase Clerk Partner Page](https://supabase.com/partners/integrations/clerk)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
