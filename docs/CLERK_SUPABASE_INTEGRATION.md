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
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
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

## 참고 링크

- [Clerk Supabase Integration Guide](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Supabase Clerk Partner Page](https://supabase.com/partners/integrations/clerk)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
