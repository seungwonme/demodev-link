# Supabase Auth → Clerk 마이그레이션 변경 사항

**날짜**: 2025-12-01
**작업자**: Claude Code
**목적**: 인증 시스템을 Supabase Auth에서 Clerk로 완전 전환

---

## 📋 목차

1. [설치된 패키지](#설치된-패키지)
2. [새로 생성된 파일](#새로-생성된-파일)
3. [수정된 파일](#수정된-파일)
4. [삭제된 파일](#삭제된-파일)
5. [데이터베이스 변경](#데이터베이스-변경)
6. [주요 아키텍처 변경](#주요-아키텍처-변경)
7. [다음 단계](#다음-단계)

---

## 설치된 패키지

### 새로 추가된 Dependencies

```json
{
  "@clerk/nextjs": "^6.35.5",
  "@clerk/backend": "^2.24.0",
  "svix": "^1.81.0"
}
```

### 유지된 Dependencies

```json
{
  "@supabase/ssr": "^0.6.1",          // 데이터베이스 전용
  "@supabase/supabase-js": "^2.49.4"  // 데이터베이스 전용
}
```

**참고**: Supabase는 인증 제거, 데이터베이스 용도로만 사용

---

## 새로 생성된 파일

### 1. 인증 관련 파일

#### `src/features/auth/services/clerk-auth.service.ts`
Clerk 기반 인증 서비스 (Supabase AuthService 대체)

**주요 기능**:
- `getCurrentUser()` - Clerk 사용자 + metadata 조회
- `requireAuth()` - 인증 체크 및 리다이렉션
- `getUsersByStatus()` - 상태별 사용자 조회 (admin only)
- `updateUserStatus()` - 사용자 승인/거절
- `updateUserRole()` - 역할 변경

**Metadata 구조**:
```typescript
// Public Metadata (사용자 visible)
{ status: "pending" | "approved" | "rejected" }

// Private Metadata (admin only)
{
  role: "user" | "admin",
  approved_at?: string,
  approved_by?: string,
  rejected_at?: string,
  rejected_by?: string,
  rejection_reason?: string
}
```

#### `src/features/auth/actions/clerk-user.ts`
Clerk 기반 사용자 관리 Server Actions

**Functions**:
- `updateUserStatus(userId, status, rejectionReason?)`
- `updateUserRole(userId, role)`
- `getAllUsers()`
- `getUsersByStatus(status)`

### 2. Webhook Handler

#### `src/app/api/webhooks/clerk/route.ts`
Clerk webhook 이벤트 처리

**처리 이벤트**:
- `user.created`: profiles 테이블에 레코드 생성 + metadata 설정
- `user.deleted`: profiles 테이블에서 레코드 삭제

### 3. 페이지 파일

#### `src/app/admin/login/[[...sign-in]]/page.tsx`
Clerk SignIn 컴포넌트 사용

#### `src/app/admin/register/[[...sign-up]]/page.tsx`
Clerk SignUp 컴포넌트 사용

### 4. 데이터베이스 Migration

#### `supabase/migrations/20251201000000_migrate_to_clerk.sql`
Clerk 전환을 위한 데이터베이스 스키마 변경

**주요 변경**:
- `profiles` 테이블: `clerk_user_id` 추가, `status`/`role` 제거
- `links` 테이블: `user_id`를 TEXT로 변경, `clerk_user_id` 참조
- Trigger, RLS 정책, Helper 함수 제거

### 5. 마이그레이션 도구

#### `scripts/migrate-users-to-clerk.ts`
기존 Supabase Auth 사용자를 Clerk로 이전하는 스크립트

**기능**:
- Supabase auth.users 조회
- Clerk 사용자 생성 (비밀번호 없이)
- profiles 테이블 업데이트
- links 테이블 user_id 업데이트

### 6. 문서

#### `docs/CLERK_MIGRATION_GUIDE.md`
Clerk 마이그레이션 가이드 (상세 설정 방법 포함)

#### `CLAUDE.md`
프로젝트 문서 업데이트 (Clerk 기반 아키텍처 반영)

---

## 수정된 파일

### 1. 설정 파일

#### `.env.example`
**변경 전**:
```bash
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
SUPABASE_DATABASE_PASSWORD="..."
INITIAL_ADMIN_EMAIL="..."
```

**변경 후**:
```bash
# Clerk Configuration (Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxxxx"
CLERK_SECRET_KEY="sk_test_xxxxx"
CLERK_WEBHOOK_SECRET="whsec_xxxxx"

# Supabase Configuration (Database only - Auth removed)
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Application Configuration
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

#### `package.json`
**추가된 script**:
```json
{
  "migrate:users-to-clerk": "tsx scripts/migrate-users-to-clerk.ts"
}
```

### 2. 레이아웃 및 Middleware

#### `src/app/layout.tsx`
**변경 사항**:
```typescript
// 추가
import { ClerkProvider } from "@clerk/nextjs";

// 변경
export default function RootLayout({ children }) {
  return (
    <ClerkProvider>  // 추가
      <html lang="ko" suppressHydrationWarning>
        {/* ... */}
      </html>
    </ClerkProvider>
  );
}
```

#### `src/middleware.ts`
**완전 재작성** - Supabase Auth → Clerk middleware

**변경 전**:
```typescript
import { createServerClient } from "@supabase/ssr";
// Supabase 기반 인증 체크
```

**변경 후**:
```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// Clerk metadata 기반 권한 체크
```

### 3. Admin 페이지

#### `src/app/admin/layout.tsx`
**변경 사항**:
```typescript
// 변경 전
import { AuthService } from "@/features/auth/services/auth.service";
const { user } = await AuthService.requireAuth();

// 변경 후
import { ClerkAuthService } from "@/features/auth/services/clerk-auth.service";
const user = await ClerkAuthService.getCurrentUser();
```

#### `src/app/admin/users/page.tsx`
**변경 사항**:
```typescript
// 변경 전
const { user } = await AuthService.requireAuth({ requireAdmin: true });
const { data: users } = await supabase.from("profiles").select("*");

// 변경 후
const currentUser = await ClerkAuthService.requireAuth({ requireAdmin: true });
const users = await ClerkAuthService.getUsersByStatus();
```

#### `src/app/admin/dashboard/page.tsx`
**변경 사항**:
```typescript
// Pending users 조회를 Clerk API로 변경
if (user.role === "admin") {
  const users = await ClerkAuthService.getUsersByStatus("pending");
  pendingUsers = users.length;
}
```

#### `src/app/admin/pending/page.tsx`
```typescript
// 변경 전
await AuthService.requireAuth({ requiredStatus: 'pending' });

// 변경 후
await ClerkAuthService.requireAuth({ requiredStatus: 'pending' });
```

#### `src/app/admin/rejected/page.tsx`
```typescript
// 변경 전
import { signOut } from "@/features/auth/actions/auth";
<form action={signOut}>...</form>

// 변경 후
import { SignOutButton } from "@clerk/nextjs";
<SignOutButton redirectUrl="/">...</SignOutButton>
```

### 4. 컴포넌트

#### `src/features/auth/components/admin/sidebar.tsx`
**변경 사항**:
```typescript
// 변경 전
import { signOut } from "@/features/auth/actions/auth";
import { UserRole } from "@/features/auth/types/profile";

// 변경 후
import { useClerk } from "@clerk/nextjs";
import { UserRole } from "@/features/auth/services/clerk-auth.service";

const { signOut } = useClerk();
const handleLogout = async () => {
  await signOut();
  router.push("/");
};
```

#### `src/features/auth/components/admin/user-management-table.tsx`
**변경 사항**:
```typescript
// 변경 전
import { Profile } from "@/features/auth/types/profile";
import { updateUserStatus, updateUserRole } from "@/features/auth/actions/user";

// 변경 후
import { updateUserStatus, updateUserRole } from "@/features/auth/actions/clerk-user";
import { UserStatus, UserRole } from "@/features/auth/services/clerk-auth.service";

interface ClerkUser {
  id: string;
  email: string | null;
  status: UserStatus;
  role: UserRole;
  createdAt: number;
  // ...
}
```

### 5. Utils

#### `src/features/auth/utils/with-auth.tsx`
**변경 사항**:
```typescript
// 변경 전
import { AuthService } from "@/features/auth/services/auth.service";
import { User } from "@supabase/supabase-js";
import { Profile } from "@/features/auth/types/profile";

// 변경 후
import { ClerkAuthService, UserStatus, UserRole } from "@/features/auth/services/clerk-auth.service";

export interface AuthenticatedPageProps {
  userId: string;
  email: string | null;
  status: UserStatus;
  role: UserRole;
}
```

---

## 삭제된 파일

### 1. Supabase Auth 관련

- ❌ `src/lib/supabase/middleware.ts` - Clerk middleware로 대체
- ❌ `src/features/auth/actions/auth.ts` - Clerk 자체 처리
- ❌ `src/features/auth/actions/user.ts` - `clerk-user.ts`로 대체
- ❌ `src/features/auth/services/auth.service.ts` - `clerk-auth.service.ts`로 대체

### 2. Auth Callback

- ❌ `src/app/auth/` - Clerk가 자체 처리

### 3. 로그인/회원가입 페이지

- ❌ `src/app/admin/login/page.tsx` - Clerk SignIn으로 대체
- ❌ `src/app/admin/login/login-client.tsx`
- ❌ `src/app/admin/register/page.tsx` - Clerk SignUp으로 대체

### 4. 비밀번호 재설정

- ❌ `src/app/reset-password/` - Clerk가 자체 처리

---

## 데이터베이스 변경

### profiles 테이블

#### 변경 전
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES profiles(id),
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES profiles(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 변경 후
```sql
CREATE TABLE profiles (
  clerk_user_id TEXT PRIMARY KEY,  -- Clerk user ID
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**변경 사항**:
- ✅ `clerk_user_id` 추가 (PRIMARY KEY)
- ❌ `id UUID` 제거
- ❌ `status`, `role` 제거 (→ Clerk metadata로 이전)
- ❌ `approved_at`, `approved_by`, `rejected_at`, `rejected_by`, `rejection_reason` 제거 (→ Clerk metadata로 이전)

### links 테이블

#### 변경 전
```sql
ALTER TABLE links
  ADD COLUMN user_id UUID REFERENCES profiles(id);
```

#### 변경 후
```sql
ALTER TABLE links
  ALTER COLUMN user_id TYPE TEXT,
  ADD CONSTRAINT links_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES profiles(clerk_user_id)
    ON DELETE CASCADE;
```

**변경 사항**:
- ✅ `user_id` 타입: `UUID` → `TEXT`
- ✅ Foreign key: `profiles(id)` → `profiles(clerk_user_id)`

### 제거된 Database Objects

- ❌ Trigger: `on_auth_user_created` (auth.users → profiles)
- ❌ Function: `handle_new_user()`
- ❌ Function: `is_admin()`
- ❌ Function: `is_approved()`
- ❌ View: `pending_users`
- ❌ RLS Policies: 모든 `auth.uid()` 기반 정책

---

## 주요 아키텍처 변경

### 1. 인증 플로우

#### 변경 전 (Supabase Auth)
```
사용자 가입
  ↓
auth.users 테이블에 저장
  ↓
Trigger → profiles 테이블 생성 (status: pending)
  ↓
관리자가 profiles.status 업데이트
  ↓
RLS 정책으로 접근 제어
```

#### 변경 후 (Clerk)
```
사용자 가입 (Clerk SignUp)
  ↓
Webhook: user.created
  ↓
profiles 테이블 생성
  ↓
Clerk metadata 설정 (status: pending, role: user)
  ↓
관리자가 Clerk metadata 업데이트 (Clerk API)
  ↓
Middleware에서 metadata 체크
```

### 2. 사용자 데이터 저장 위치

| 데이터 | 변경 전 | 변경 후 |
|--------|---------|---------|
| 이메일/비밀번호 | auth.users | Clerk |
| 사용자 ID | auth.users.id (UUID) | Clerk user ID (TEXT) |
| status | profiles.status | Clerk publicMetadata.status |
| role | profiles.role | Clerk privateMetadata.role |
| approved_at/by | profiles | Clerk privateMetadata |
| rejected_at/by/reason | profiles | Clerk privateMetadata |

### 3. 권한 체크

#### 변경 전
```typescript
// 데이터베이스 쿼리
const { data: profile } = await supabase
  .from("profiles")
  .select("status, role")
  .eq("id", user.id)
  .single();

if (profile.role === "admin") {
  // admin 로직
}
```

#### 변경 후
```typescript
// Clerk session claims에서 읽기
const user = await ClerkAuthService.getCurrentUser();
// { userId, email, status, role }

if (user.role === "admin") {
  // admin 로직
}
```

### 4. 로그인/로그아웃

#### 변경 전
```typescript
// 로그인
await supabase.auth.signInWithPassword({ email, password });

// 로그아웃
await supabase.auth.signOut();
```

#### 변경 후
```typescript
// 로그인 - Clerk UI 컴포넌트
<SignIn fallbackRedirectUrl="/admin/dashboard" />

// 로그아웃
const { signOut } = useClerk();
await signOut();
```

### 5. Middleware

#### 변경 전
```typescript
// Supabase createServerClient
const supabase = createServerClient(url, key, { cookies: {...} });
const { data: { user } } = await supabase.auth.getUser();

const { data: profile } = await supabase
  .from("profiles")
  .select("status, role")
  .eq("id", user.id)
  .single();
```

#### 변경 후
```typescript
// Clerk middleware
export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth();

  const publicMetadata = sessionClaims?.publicMetadata;
  const privateMetadata = sessionClaims?.privateMetadata;

  const userStatus = publicMetadata.status;
  const userRole = privateMetadata.role;
});
```

---

## 다음 단계

### 1. Clerk Dashboard 설정

```bash
# 1. https://dashboard.clerk.com에서 새 애플리케이션 생성
# 2. API Keys 복사 → .env.local에 추가
# 3. Webhook 설정:
#    - Endpoint: https://your-domain.com/api/webhooks/clerk
#    - Events: user.created, user.deleted
#    - Secret 복사 → CLERK_WEBHOOK_SECRET
```

### 2. 환경 변수 설정

`.env.local` 파일 생성:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 3. 데이터베이스 마이그레이션

```bash
# ⚠️ 반드시 백업 후 진행!
pnpm run db:push
pnpm run gen:types
```

### 4. 기존 사용자 마이그레이션 (선택)

```bash
# 기존 사용자가 있는 경우
pnpm run migrate:users-to-clerk
```

### 5. 초기 관리자 설정

Clerk Dashboard > Users에서:
```json
// Public Metadata
{ "status": "approved" }

// Private Metadata
{ "role": "admin" }
```

### 6. 테스트

- [ ] 새 사용자 가입 → pending 상태 확인
- [ ] 관리자 승인/거절 동작 확인
- [ ] 로그인/로그아웃
- [ ] 링크 생성 (approved만 가능)
- [ ] Admin 페이지 접근 제어
- [ ] Webhook 동작 (profiles 자동 생성)

---

## 참고 문서

- **마이그레이션 가이드**: `docs/CLERK_MIGRATION_GUIDE.md`
- **프로젝트 문서**: `CLAUDE.md`
- **Database Migration**: `supabase/migrations/20251201000000_migrate_to_clerk.sql`
- **마이그레이션 스크립트**: `scripts/migrate-users-to-clerk.ts`

---

## 문제 해결

### 일반적인 오류

1. **Module not found 오류**
   - 삭제된 파일을 import하는 경우
   - 해결: 해당 import를 Clerk 기반으로 변경

2. **Webhook 동작 안 함**
   - `CLERK_WEBHOOK_SECRET` 확인
   - Clerk Dashboard에서 webhook endpoint URL 확인
   - Webhook logs 확인

3. **사용자가 로그인할 수 없음**
   - Clerk metadata의 status가 "approved"인지 확인
   - Middleware 로그 확인

---

## 변경 사항 요약

| 항목 | 개수 |
|------|------|
| 새로 생성된 파일 | 9개 |
| 수정된 파일 | 13개 |
| 삭제된 파일 | 9개 |
| 설치된 패키지 | 3개 |
| 데이터베이스 테이블 변경 | 2개 |

**총 작업 시간**: ~2시간
**마이그레이션 상태**: ✅ 완료 (테스트 및 배포 대기)
