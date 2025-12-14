# RLS 우회 작업 검토 리포트

## 발생한 문제

```
Error creating profile: {
  code: '42501',
  message: 'new row violates row-level security policy for table "profiles"'
}
```

링크 생성 시 `profiles` 테이블에 INSERT가 RLS 정책에 의해 차단됨.

---

## 수행한 작업

### 1. 문제 진단
- `profiles` 테이블에 RLS 활성화 상태
- 기존 RLS 정책이 `auth.uid()` (Supabase Auth 함수) 사용
- Clerk로 마이그레이션 후 `auth.uid()`가 `null` 반환 → 모든 RLS 정책 실패

### 2. 적용한 해결책
`SUPABASE_SERVICE_ROLE_KEY`를 사용하는 admin client 생성하여 RLS 우회

**수정된 파일:**
- `src/lib/supabase/admin.ts` (신규 생성)
- `src/features/links/actions/link.service.ts`
- `src/features/links/actions/update-link.ts`
- `src/features/campaigns/services/campaign.service.ts`
- `src/features/templates/services/template.service.ts`
- `src/features/auth/services/clerk-auth.service.ts`
- `src/app/api/webhooks/clerk/route.ts`

---

## 사용자 질문에 대한 답변

### Q1: RLS를 우회하는 것이 일반적인가?

**부분적으로 그렇습니다.**

| 상황 | 권장 여부 |
|------|----------|
| Webhook, 백그라운드 작업, 관리자 작업 | ✅ 일반적 |
| 모든 서버 사이드 작업에서 우회 | ⚠️ 권장하지 않음 |
| 클라이언트에서 우회 | ❌ 절대 금지 |

**Service Role Key 사용이 적절한 경우:**
- Clerk/Auth0 등 외부 인증 서비스의 Webhook
- 크론 작업, 백그라운드 프로세스
- 관리자 전용 작업

**하지만 현재 작업처럼 모든 DB 작업에서 우회하는 것은 과도합니다.**

### Q2: Clerk를 사용한다고 RLS를 우회하려고 한 이유?

**기존 RLS 정책이 Supabase Auth 전용이었기 때문입니다.**

```sql
-- 기존 정책 (작동 안 함)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (clerk_user_id = auth.uid()::text);
```

`auth.uid()`는 Supabase Auth의 함수로, Clerk 사용 시 `null`을 반환합니다.

**더 나은 해결책이 있었습니다:**

1. **Clerk JWT를 Supabase에 통합** (권장)
   - Clerk JWT를 Supabase에 전달
   - RLS에서 `auth.jwt() ->> 'sub'`로 Clerk user ID 추출

2. **RLS 정책 수정**
   - 서버에서 전달하는 커스텀 헤더/클레임 사용

### Q3: 현재 변경 내용의 보안 문제?

**잠재적 위험이 있습니다.**

#### 현재 보안 구조:
```
[요청] → [Clerk 인증 체크] → [Admin Client (RLS 우회)] → [DB]
```

#### 장점:
- Service Role Key는 서버에서만 사용 (클라이언트 노출 없음)
- `ClerkAuthService.requireAuth()`로 인증 체크

#### 단점 및 위험:
| 위험 | 설명 |
|------|------|
| **방어 계층 감소** | RLS가 두 번째 방어선인데, 이를 제거 |
| **버그 취약성** | 애플리케이션 코드 버그 시 데이터 유출 가능 |
| **권한 체크 누락 위험** | 개발자가 권한 체크를 빼먹으면 바로 보안 취약점 |
| **감사 추적 어려움** | 모든 작업이 service role로 실행되어 추적 어려움 |

#### 예시 시나리오:
```typescript
// 만약 개발자가 실수로 이렇게 작성하면?
static async deleteLink(linkId: string) {
  const adminClient = createAdminClient();
  // 권한 체크 없이 바로 삭제!
  await adminClient.from("links").delete().eq("id", linkId);
}
```
→ 누구나 모든 링크 삭제 가능

---

## 권장 해결책

### 옵션 1: Clerk + Supabase JWT 통합 (권장)

```typescript
// Clerk에서 Supabase용 JWT 템플릿 생성
// supabase-integration.ts
import { auth } from "@clerk/nextjs/server";

export async function createAuthenticatedClient() {
  const { getToken } = await auth();
  const supabaseToken = await getToken({ template: "supabase" });

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${supabaseToken}`,
        },
      },
    }
  );
}
```

```sql
-- RLS 정책 수정
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (clerk_user_id = (auth.jwt() ->> 'sub'));
```

### 옵션 2: 하이브리드 접근법

- **읽기 작업**: 일반 클라이언트 + RLS
- **쓰기 작업**: 명시적 권한 체크 후 Admin Client

```typescript
// 권한 체크 래퍼 함수
async function withAuthorization<T>(
  userId: string,
  resourceOwnerId: string,
  action: () => Promise<T>
): Promise<T> {
  if (userId !== resourceOwnerId) {
    throw new Error("권한이 없습니다.");
  }
  return action();
}
```

---

## 결론

| 항목 | 현재 상태 | 권장 상태 |
|------|----------|----------|
| RLS | 우회 (모든 작업) | 활성화 + Clerk JWT 통합 |
| 인증 | Clerk (앱 레벨) | Clerk + Supabase JWT |
| 권한 체크 | 앱 레벨만 | 앱 레벨 + DB 레벨 (이중 방어) |

**현재 변경은 임시 해결책으로는 작동하지만, 장기적으로는 Clerk JWT를 Supabase에 통합하여 RLS를 다시 활성화하는 것을 권장합니다.**

---

## 참고 자료

- [Clerk + Supabase Integration Guide](https://clerk.com/docs/integrations/databases/supabase)
- [Supabase RLS with External Auth](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JWT Verification](https://supabase.com/docs/guides/auth/jwts)

---

## 변경 이력

| 날짜 | 작업 | 작성자 |
|------|------|--------|
| 2024-12-14 | RLS 우회를 위한 Admin Client 도입 | Claude |
| - | Clerk JWT 통합 필요 (TODO) | - |
