# headers() 함수 개선 작업 정리

## 문제 상황

Next.js의 `next/headers`와 `server-only` 패키지는 App Router 환경(서버 컴포넌트)에서만 작동하지만, 프로젝트에서 Pages Router 환경에서도 사용하고 있어 오류가 발생했습니다.

주요 문제점:

1. `next/headers`의 `headers()` 함수가 Promise<ReadonlyHeaders> 타입을 반환하는데, 이를 비동기 처리 없이 사용
2. `server-only` 패키지가 Pages Router에서 호환되지 않음
3. 헤더 정보 획득 방식이 Pages Router와 App Router 간에 일관되지 않음

## 개선 내용

### 1. src/services/link.service.ts 파일 수정

```diff
 import { supabase } from "@/lib/supabase";
 import { CreateLinkDTO, Link } from "@/types/link";
 import { DailyClickStats } from "@/types/supabase";
- import { headers } from "next/headers";
- import "server-only";

- // 서버에서만 실행되는 헤더 관련 유틸리티 함수들
+ // 헤더 관련 유틸리티 함수들
 export const ServerUtils = {
-  async getRequestInfo() {
+  getRequestInfo(req?: Request) {
     try {
-      const headersList = await headers();
+      if (req) {
+        // 직접 Request 객체가 전달된 경우 (API 라우트)
+        const userAgent = req.headers.get("user-agent");
+        const ip = req.headers.get("x-forwarded-for") || "unknown";
+        return { userAgent, ip };
+      }
+
+      // Request 객체가 없는 경우 기본값 반환
       return {
-        userAgent: headersList.get("user-agent") || null,
-        ip: headersList.get("x-forwarded-for") || "unknown",
+        userAgent: null,
+        ip: "unknown",
       };
     } catch (error) {
      // ... 기존 코드 유지 ...
```

이 수정을 통해:

- `next/headers`와 `server-only` 의존성 제거
- `getRequestInfo` 함수를 비동기(async)에서 동기 함수로 변경
- 선택적으로 Request 객체를 매개변수로 받도록 수정
- 자동으로 헤더 정보를 가져오는 부분 제거

### 2. src/actions/link.ts 파일 수정

```diff
 "use server";

 import { supabase } from "@/lib/supabase";
 import { Link, LinkClick, DailyClickStats } from "@/types/supabase";
- import { headers } from "next/headers";

 // ... 기존 코드 ...

- export async function trackLinkClick(linkId: string): Promise<void> {
-   const headersList = await headers();
-   const userAgent = headersList.get("user-agent");
-   const ip = headersList.get("x-forwarded-for") || "unknown";
-
+ export async function trackLinkClick(
+   linkId: string,
+   userAgent?: string | null,
+   ip?: string
+ ): Promise<void> {
    const [clickInsert, countUpdate] = await Promise.all([
      supabase.from("link_clicks").insert({
        link_id: linkId,
-       user_agent: userAgent,
-       ip_address: ip,
+       user_agent: userAgent || null,
+       ip_address: ip || "unknown",
      }),
      // ... 기존 코드 유지 ...
```

이 수정을 통해:

- `next/headers` 의존성 제거
- `trackLinkClick` 함수가 헤더 정보를 직접 매개변수로 받도록 변경

## 배운 점

1. **Next.js의 API 차이점**: App Router와 Pages Router에서 사용할 수 있는 API가 다르며, 특히 서버 컴포넌트 기능은 App Router에서만 사용할 수 있음

2. **헤더 처리 방식**:

   - App Router: `headers()` 함수를 통해 서버 컴포넌트에서 직접 헤더 접근 가능
   - Pages Router: Request 객체를 통해 API 라우트에서 헤더 접근 가능

3. **코드 구조 개선**:
   - 환경에 구애받지 않는 유틸리티 함수 설계의 중요성
   - 의존성 주입을 통한 유연한 설계 패턴 적용 (Request 객체를 선택적으로 받도록 변경)

## 적용 방법

프로젝트의 다른 부분에서 헤더 정보가 필요한 경우:

1. Pages Router API 라우트에서:

```typescript
export default function handler(req, res) {
  const { userAgent, ip } = ServerUtils.getRequestInfo(req);
  // ...
}
```

2. 클라이언트 컴포넌트에서 API 라우트로 헤더 정보 전달:

```typescript
// API 호출 시 헤더 정보 전달
await trackLinkClick(linkId, navigator.userAgent, clientIp);
```

이 수정을 통해 App Router와 Pages Router 모두에서 일관되게 작동하는 코드를 구현했습니다.
