# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a URL shortening service built with Next.js 15, TypeScript, Clerk (authentication), and Supabase (database). It features user authentication with an approval system, link management, and analytics tracking.

## Common Development Commands

```bash
# Development
pnpm dev                    # Start development server with Turbopack

# Build & Production
pnpm build                  # Build for production
pnpm start                  # Start production server

# Testing & Quality
pnpm test                   # Run tests with Vitest
pnpm lint                   # Run Next.js linter

# Database Operations
pnpm run gen:types          # Generate TypeScript types from Supabase schema
pnpm run db:push            # Push migrations to Supabase
pnpm run db:pull            # Pull schema from Supabase

# Migration
pnpm run migrate:users-to-clerk  # Migrate existing users from Supabase Auth to Clerk
```

## High-Level Architecture

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (using globals.css, no config file)
- **UI Components**: shadcn/ui components
- **Authentication**: Clerk (replaced Supabase Auth)
- **Database**: Supabase (PostgreSQL) - database only, auth removed
- **Package Manager**: pnpm

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard (protected)
│   │   ├── login/         # Clerk SignIn component
│   │   ├── register/      # Clerk SignUp component
│   │   ├── users/         # User management (admin only)
│   │   └── ...
│   ├── api/
│   │   └── webhooks/
│   │       └── clerk/     # Clerk webhook handler
│   ├── [slug]/            # Dynamic redirect handler
│   └── layout.tsx         # Root layout with ClerkProvider
├── features/              # Feature-based modules
│   ├── auth/              # Authentication logic & components
│   │   ├── services/
│   │   │   └── clerk-auth.service.ts  # Clerk auth service
│   │   ├── actions/
│   │   │   └── clerk-user.ts          # User management actions
│   │   └── components/
│   ├── links/             # Link management
│   └── analytics/         # Analytics features
├── shared/                # Shared resources
│   ├── components/ui/     # shadcn/ui components
│   └── types/             # TypeScript definitions
├── lib/                   # External library configurations
│   └── supabase/          # Supabase client setup (database only)
└── middleware.ts          # Clerk middleware for route protection
```

### Key Architectural Patterns

1. **Feature-Based Organization**: Code is organized by feature (auth, links, analytics) rather than by type
2. **Server Components First**: Prioritize React Server Components, use `'use client'` only when necessary
3. **Server Actions**: Use Server Actions instead of API routes for data mutations
4. **Type Safety**: All database types are auto-generated from Supabase schema
5. **Metadata-Based Authorization**: User roles and status stored in Clerk metadata instead of database

### Authentication Flow (Clerk-based)

1. **User Registration**:

   - Users sign up via Clerk SignUp component
   - Webhook creates profile in database with status "pending"
   - Clerk publicMetadata.status set to "pending"
   - Clerk publicMetadata.role set to "user"

2. **Admin Approval**:

   - Admins review and approve/reject users via custom Admin UI
   - Status/role updated in Clerk metadata via Clerk API
   - No database update needed (metadata is source of truth)

3. **Role-Based Access**:

   - User status: `publicMetadata.status` (pending/approved/rejected)
   - User role: `publicMetadata.role` (user/admin)
   - Middleware checks publicMetadata for route protection

4. **Middleware Protection**:
   - Clerk middleware handles auth checks
   - Redirects based on status/role from metadata

### Database Schema

**⚠️ CRITICAL: Profile ID vs Clerk User ID**

The `profiles` table uses a UUID as PRIMARY KEY, NOT the Clerk user ID. Always use `profiles.id` for foreign key references.

**profiles** table:

- `id` (TEXT, PRIMARY KEY): UUID - **USE THIS for foreign keys**
- `clerk_user_id` (TEXT, UNIQUE): Clerk user ID - used to FIND profiles
- `email` (TEXT): User email
- `created_at`, `updated_at`: Timestamps

**links** table:

- `id`: Link ID
- `slug`: Shortened URL slug
- `original_url`: Original URL
- `user_id` (TEXT): **References `profiles.id`** (NOT clerk_user_id)
- `click_count`: Click count
- `created_at`: Creation time

**link_clicks** table:

- `id`: Click ID
- `link_id`: Link ID reference
- `clicked_at`: Click timestamp
- `user_agent`, `ip_address`: Metadata

### Environment Variables

Required variables:

```bash
# Clerk (Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Supabase (Database only)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Application
NEXT_PUBLIC_BASE_URL=
```

## Coding Conventions

1. **File Naming**: Use kebab-case for all files (e.g., `user-management-table.tsx`)
2. **Component Naming**: PascalCase for components, file names still kebab-case
3. **Functions/Variables**: camelCase with TypeScript types
4. **Imports**: Prefer named exports
5. **Icons**: Use lucide-react exclusively
6. **Styling**: Tailwind CSS only, no CSS modules or styled-components

## Important Implementation Details

### 1. Clerk Authentication

**Server-side**:

```typescript
import { ClerkAuthService } from '@/features/auth/services/clerk-auth.service';

// Get current user
const user = await ClerkAuthService.getCurrentUser();
// Returns: { userId, email, status, role }

// Require authentication with optional constraints
const user = await ClerkAuthService.requireAuth({
  requiredStatus: 'approved', // or "pending", "rejected", "any"
  requireAdmin: true, // optional
});
```

**Client-side**:

```typescript
import { useUser } from '@clerk/nextjs';

const { user, isLoaded, isSignedIn } = useUser();

// Access metadata
const status = user?.publicMetadata?.status;
const role = user?.publicMetadata?.role;
```

**Metadata Structure**:

```typescript
// Public Metadata (visible to user, read-only on client)
{
  status: "pending" | "approved" | "rejected",
  role: "user" | "admin"
}

// Private Metadata (server-only, audit trail)
{
  approved_at?: string,
  approved_by?: string,
  rejected_at?: string,
  rejected_by?: string,
  rejection_reason?: string
}
```

### 2. User Management (Admin Only)

```typescript
import {
  updateUserStatus,
  updateUserRole,
} from '@/features/auth/actions/clerk-user';

// Approve user
await updateUserStatus(userId, 'approved');

// Reject user with reason
await updateUserStatus(userId, 'rejected', 'reason');

// Change role
await updateUserRole(userId, 'admin');
```

### 3. Supabase Clients (Database Only)

**NOTE**: Supabase is used ONLY for database operations, NOT for authentication.

- Client components: `createClient()` from `@/lib/supabase/client.ts`
- Server components/actions: `await createClient()` from `@/lib/supabase/server.ts`
- All authentication is handled by Clerk

### 4. ID Generation

Uses Snowflake algorithm (`Snowflake.generate()`) for unique link IDs:

- Combines timestamp, worker ID, and sequence number
- Returns Base62-encoded string for short, URL-friendly identifiers

### 5. Middleware (`src/middleware.ts`)

- Uses `clerkMiddleware` from `@clerk/nextjs/server`
- Checks `sessionClaims.publicMetadata.status` for user status
- Checks `sessionClaims.publicMetadata.role` for admin access
- Redirects users based on status (pending → /admin/pending, etc.)

### 6. Clerk Webhook (`src/app/api/webhooks/clerk/route.ts`)

Handles Clerk events:

- `user.created`: Creates profile in database, sets initial metadata
- `user.deleted`: Removes profile from database

### 7. Testing

Vitest is configured with React Testing Library and jsdom environment:

- Run all tests: `pnpm test`
- Test setup: `test/config/setup-test-env.ts`

## Development Workflow

1. Always check existing patterns in the codebase before implementing new features
2. Use Server Components by default, add 'use client' only when needed
3. Follow the feature-based directory structure
4. For auth checks, use `ClerkAuthService` methods
5. User status/role: Always read from Clerk metadata, never from database
6. Generate types after database changes: `pnpm run gen:types`
7. Test with `pnpm test` before committing
8. Run `pnpm lint` to ensure code quality

## Migration from Supabase Auth to Clerk

See `docs/CLERK_MIGRATION_GUIDE.md` for detailed migration instructions.

**Key changes**:

- Removed: Supabase Auth (auth.users table, RLS policies, triggers)
- Added: Clerk SDK, webhook handler, ClerkAuthService
- User data: status/role moved from database to Clerk metadata
- profiles table: Uses `clerk_user_id` instead of `auth.users(id)`

**Migration script**:

```bash
pnpm run migrate:users-to-clerk
```

## Troubleshooting

### Clerk Issues

1. **Webhook not working**: Check `CLERK_WEBHOOK_SECRET` and endpoint URL in Clerk Dashboard
2. **Metadata not updating**: Ensure using Clerk API with proper permissions
3. **User can't log in**: Check if status is "approved" in Clerk Dashboard
4. **Too many redirects on /admin/login**: Middleware now allows public routes regardless of path prefix; ensure code has the updated check and watch middleware logs for metadata.
5. **Clerk metadata missing in sessionClaims**: Middleware falls back to Clerk user fetch to read publicMetadata when claims omit them.
6. **Links feature auth**: Link creation/updates now rely on Clerk auth (approved users) instead of Supabase auth; client form uses Clerk `useUser` for login state.
7. **Status pages**: `/admin/pending` and `/admin/rejected` now redirect approved users to `/admin/dashboard`.
8. **Short URL redirect to login**: Middleware now has `isShortUrlRoute()` check to allow single-segment paths (e.g., `/abc123`) without authentication.

### Database Issues

1. **RLS errors**: Supabase database operations should use `service_role_key`
2. **Foreign key errors**: Ensure `clerk_user_id` matches Clerk user ID exactly

### Development

1. **Hot reload issues**: Restart dev server after changing environment variables
2. **Type errors**: Run `pnpm run gen:types` after database schema changes

# 현재 프로젝트: demo-link

## 프로젝트 개요

- **위치**: `/Users/seungwonan/Dev/1-project/demo-link`
- **설명**: URL 단축 서비스 (Next.js 15 + Clerk + Supabase)
- **주요 기능**: 링크 단축, 사용자 승인 시스템, 분석/통계

## 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **인증**: Clerk (Supabase Auth에서 마이그레이션 완료)
- **데이터베이스**: Supabase (PostgreSQL) - 데이터베이스 용도만
- **스타일링**: Tailwind CSS v4
- **UI**: shadcn/ui + lucide-react
- **패키지 매니저**: pnpm

## 핵심 아키텍처

### 1. 인증 시스템 (Clerk 기반)

- **사용자 상태**: `publicMetadata.status` (pending/approved/rejected)
- **사용자 역할**: `privateMetadata.role` (user/admin)
- **중요**: 상태/역할은 Clerk metadata에 저장, 데이터베이스에는 저장 안 함

### 2. 디렉토리 구조

```
src/
├── app/                          # Next.js App Router
│   ├── admin/                    # 관리자 페이지 (보호됨)
│   │   ├── login/[[...sign-in]]/ # Clerk SignIn
│   │   ├── register/[[...sign-up]]/ # Clerk SignUp
│   │   └── users/                # 사용자 관리 (admin만)
│   ├── api/webhooks/clerk/       # Clerk webhook
│   └── [slug]/                   # 동적 리다이렉션
├── features/                     # 기능별 모듈
│   ├── auth/
│   │   ├── services/clerk-auth.service.ts  # 핵심 인증 로직
│   │   └── actions/clerk-user.ts           # 사용자 관리 액션
│   ├── links/
│   │   └── actions/
│   │       ├── link-actions.ts   # 서버 액션 (클라이언트 호출용)
│   │       ├── link.service.ts   # 링크 서비스 (테스트 지원)
│   │       ├── shorten-url.ts    # URL 단축 액션
│   │       ├── update-link.ts    # 링크 수정 액션
│   │       └── delete-link.ts    # 링크 삭제 액션
│   └── analytics/                # 분석 기능
├── shared/types/
│   ├── database.types.ts         # Supabase 자동 생성 타입
│   └── link.ts                   # Link 타입 + DTO
├── lib/supabase/                 # Supabase 클라이언트 (DB only)
└── middleware.ts                 # Clerk 미들웨어
```

### 3. 주요 서비스 사용법

**인증 체크 (서버)**:

```typescript
import { ClerkAuthService } from '@/features/auth/services/clerk-auth.service';

// 현재 사용자 가져오기
const user = await ClerkAuthService.getCurrentUser();

// 인증 필수 (승인된 사용자만)
const user = await ClerkAuthService.requireAuth({ requiredStatus: 'approved' });

// 관리자 전용
const user = await ClerkAuthService.requireAuth({ requireAdmin: true });
```

**사용자 관리 (관리자)**:

```typescript
import {
  updateUserStatus,
  updateUserRole,
} from '@/features/auth/actions/clerk-user';

await updateUserStatus(userId, 'approved');
await updateUserStatus(userId, 'rejected', '거절 사유');
await updateUserRole(userId, 'admin');
```

**Supabase 클라이언트 (DB only)**:

```typescript
// 서버 컴포넌트/액션
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();

// 클라이언트 컴포넌트
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
```

### 4. 데이터베이스 스키마

**profiles** (Clerk 연동):

- `clerk_user_id` (TEXT, PK): Clerk 사용자 ID
- `email` (TEXT)
- `created_at`, `updated_at`
- ⚠️ status, role 없음 (Clerk metadata 사용)

**links**:

- `id`, `slug`, `original_url`, `user_id` (TEXT)
- `click_count`, `created_at`

**link_clicks**:

- `id`, `link_id`, `clicked_at`
- `user_agent`, `ip_address`

### 5. 주요 명령어

```bash
# 개발
pnpm dev                          # Turbopack 개발 서버

# DB 관련
pnpm run gen:types                # Supabase 타입 생성
pnpm run db:push                  # 마이그레이션 푸시
pnpm run db:pull                  # 스키마 풀

# 마이그레이션
pnpm run migrate:users-to-clerk   # Supabase Auth → Clerk 마이그레이션
```

### 6. 환경 변수

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Supabase (DB only)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 7. 중요 구현 패턴

- **Server Components First**: 기본적으로 서버 컴포넌트, 필요시에만 'use client'
- **Feature-Based**: 기능별로 디렉토리 구성 (auth, links, analytics)
- **Metadata Authorization**: DB 대신 Clerk metadata로 권한 관리
- **Snowflake ID**: Base62 인코딩으로 짧은 URL 생성
- **Clerk Webhook**: user.created 이벤트로 profiles 자동 생성

### 8. 타입 시스템

**모든 DB 타입은 `database.types.ts`에서 자동 생성:**

```typescript
// 올바른 사용법 - database.types.ts에서 import
import type { Tables } from "@/shared/types/database.types";
type Link = Tables<"links">;
type Profile = Tables<"profiles">;

// 또는 link.ts의 re-export 사용
import { Link, DailyClickStats } from "@/shared/types/link";
```

**파일 구조:**
- `database.types.ts`: Supabase에서 자동 생성된 타입 (pnpm run gen:types)
- `link.ts`: Link 관련 타입 re-export + DTO 타입 정의

### 9. 마이그레이션 히스토리

- ✅ Supabase Auth → Clerk 완료 (2025-12-01)
- ✅ RLS 정책 제거 (애플리케이션 레벨 인증)
- ✅ status/role을 Clerk metadata로 이전
- ✅ 타입 시스템 정리 - database.types.ts 기반으로 통합 (2025-12-14)
- ✅ 중복 액션 파일 정리 (link.ts → link-actions.ts)
- ✅ Profile ID vs Clerk User ID 버그 수정
- 📄 상세: `docs/CLERK_MIGRATION_GUIDE.md`
