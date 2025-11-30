# Clerk 마이그레이션 가이드

Supabase Auth에서 Clerk로 전환하기 위한 단계별 가이드입니다.

## ✅ 완료된 작업

- [x] Clerk SDK 설치 및 설정
- [x] Middleware를 Clerk 기반으로 전환
- [x] ClerkProvider를 root layout에 추가
- [x] Clerk webhook handler 생성
- [x] ClerkAuthService 생성 (Supabase AuthService 대체)
- [x] Admin 페이지를 Clerk 기반으로 업데이트
- [x] Database migration 파일 생성
- [x] 기존 Supabase Auth 코드 제거

## 🚀 배포 전 필수 작업

### 1. Clerk Dashboard 설정

1. [Clerk Dashboard](https://dashboard.clerk.com)에서 새 애플리케이션 생성
2. 환경 변수 복사:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_SECRET_KEY=sk_...
   ```

3. **Webhook 설정**:
   - Dashboard > Webhooks > Add Endpoint
   - Endpoint URL: `https://your-domain.com/api/webhooks/clerk`
   - Subscribe to events:
     - `user.created`
     - `user.deleted`
   - Signing secret 복사:
     ```bash
     CLERK_WEBHOOK_SECRET=whsec_...
     ```

4. **이메일 설정**:
   - Dashboard > Email, Phone, Username > Email 활성화
   - 이메일 확인 필수 설정

5. **Metadata 설정** (선택사항):
   - Dashboard > Sessions > Customize session token
   - Include metadata in session claims 활성화

### 2. 환경 변수 설정

`.env.local` 파일에 다음 변수들을 추가하세요:

```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxxxx"
CLERK_SECRET_KEY="sk_test_xxxxx"
CLERK_WEBHOOK_SECRET="whsec_xxxxx"

# Supabase Configuration (Database only)
NEXT_PUBLIC_SUPABASE_URL="https://your_project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Application Configuration
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 3. 데이터베이스 마이그레이션 실행

**⚠️ 주의: 프로덕션 환경에서는 반드시 백업 후 진행하세요!**

```bash
# 마이그레이션 실행
pnpm run db:push

# 타입 재생성
pnpm run gen:types
```

### 4. 기존 사용자 마이그레이션

**옵션 A: 기존 사용자가 없는 경우**
- 마이그레이션 스크립트 실행 불필요
- 새로운 사용자는 Clerk webhook을 통해 자동 생성됨

**옵션 B: 기존 사용자가 있는 경우**

마이그레이션 스크립트를 사용하여 기존 사용자를 Clerk로 이전:

```bash
# 마이그레이션 스크립트 실행
pnpm run migrate:users-to-clerk
```

이 스크립트는:
1. 기존 Supabase Auth 사용자를 Clerk로 생성
2. profiles 테이블의 clerk_user_id 업데이트
3. Clerk metadata에 status/role 설정
4. links 테이블의 user_id를 clerk_user_id로 업데이트

**수동 마이그레이션 (사용자가 적은 경우)**:
1. 각 사용자에게 Clerk로 재가입 요청
2. 관리자가 이전 승인 상태를 다시 설정

### 5. 초기 관리자 설정

Clerk Dashboard 또는 코드를 통해 첫 관리자를 설정하세요:

**방법 1: Clerk Dashboard 사용**
1. Dashboard > Users > 사용자 선택
2. Metadata 탭 이동
3. Private Metadata 수정:
   ```json
   {
     "role": "admin"
   }
   ```
4. Public Metadata 수정:
   ```json
   {
     "status": "approved"
   }
   ```

**방법 2: 코드를 통한 설정**
```typescript
import { clerkClient } from "@clerk/nextjs/server";

const client = await clerkClient();
await client.users.updateUserMetadata("user_xxx", {
  publicMetadata: { status: "approved" },
  privateMetadata: { role: "admin" },
});
```

### 6. 테스트

마이그레이션 후 다음 기능을 테스트하세요:

- [ ] 새 사용자 가입 (pending 상태로 시작)
- [ ] 관리자 승인/거절 프로세스
- [ ] 로그인/로그아웃
- [ ] 링크 생성 (approved 사용자만 가능)
- [ ] 관리자 페이지 접근 제어
- [ ] Webhook 동작 (profiles 테이블 자동 생성)

## 📝 주요 변경사항

### 인증 플로우

**이전 (Supabase Auth)**:
```typescript
// 로그인
await supabase.auth.signInWithPassword({ email, password });

// 현재 사용자 가져오기
const { data: { user } } = await supabase.auth.getUser();

// 프로필 조회
const { data: profile } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", user.id)
  .single();
```

**현재 (Clerk)**:
```typescript
// 로그인 - Clerk UI 컴포넌트 사용
<SignIn />

// 현재 사용자 가져오기
const user = await ClerkAuthService.getCurrentUser();
// { userId, email, status, role }

// 권한 체크
await ClerkAuthService.requireAuth({ requireAdmin: true });
```

### 사용자 권한 관리

**status/role 저장 위치**:
- ~~`profiles` 테이블~~ → **Clerk metadata**
- status: `publicMetadata.status` (pending/approved/rejected)
- role: `privateMetadata.role` (user/admin)

**업데이트 방법**:
```typescript
// 사용자 승인
await ClerkAuthService.updateUserStatus(userId, "approved");

// 역할 변경
await ClerkAuthService.updateUserRole(userId, "admin");
```

### Database Schema

**profiles 테이블 변경**:
- `id UUID` → 제거
- `clerk_user_id TEXT PRIMARY KEY` (새로 추가)
- `status`, `role`, `approved_at` 등 → 제거 (Clerk metadata로 이전)

**links 테이블 변경**:
- `user_id UUID` → `user_id TEXT`
- Foreign key: `profiles(id)` → `profiles(clerk_user_id)`

## 🔧 트러블슈팅

### Webhook이 동작하지 않는 경우

1. Clerk Dashboard에서 webhook endpoint URL 확인
2. CLERK_WEBHOOK_SECRET 환경 변수 확인
3. Webhook logs 확인 (Dashboard > Webhooks > Logs)
4. 로컬 테스트: [Clerk CLI](https://clerk.com/docs/quickstarts/cli) 사용

### 마이그레이션 후 기존 사용자가 로그인할 수 없는 경우

- Clerk에 새로 가입해야 함 (이메일 주소는 동일하게 사용 가능)
- 관리자가 다시 승인 필요
- 또는 마이그레이션 스크립트 사용

### RLS 정책 오류

- profiles/links 테이블 접근 시 오류 발생하면
- Supabase service_role_key 사용 확인
- RLS 정책이 비활성화되었는지 확인 (마이그레이션에서 처리됨)

## 📚 참고 자료

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Webhooks](https://clerk.com/docs/integrations/webhooks/overview)
- [Clerk User Metadata](https://clerk.com/docs/users/metadata)
