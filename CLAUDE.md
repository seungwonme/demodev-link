# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

URL shortening service built with Next.js 15, TypeScript, Clerk (authentication), and Supabase (database only). Features user approval system, link management, and analytics tracking.

## Commands

```bash
# Development
pnpm dev                    # Start dev server with Turbopack
pnpm build                  # Build for production
pnpm test                   # Run tests with Vitest
pnpm lint                   # Run Next.js linter

# Database
pnpm run gen:types          # Generate TypeScript types from Supabase schema
pnpm run db:push            # Push migrations to Supabase
pnpm run db:pull            # Pull schema from Supabase
```

## Architecture

### Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4 (globals.css only, no config file)
- **UI**: shadcn/ui + lucide-react (icons)
- **Auth**: Clerk (NOT Supabase Auth)
- **Database**: Supabase PostgreSQL (database only)
- **Package Manager**: pnpm

### Directory Structure

```
src/
├── app/                    # Next.js App Router (routing only)
├── features/               # Feature-based modules
│   ├── auth/               # Clerk auth service & actions
│   ├── links/              # Link management
│   ├── analytics/          # Analytics features
│   ├── campaigns/          # Campaign management
│   └── templates/          # URL templates
├── shared/
│   ├── components/ui/      # shadcn/ui components
│   └── types/              # TypeScript definitions
├── lib/
│   ├── supabase/           # Supabase client (DB only)
│   └── url.ts              # URL utilities (getBaseUrl, getShortUrl)
└── middleware.ts           # Clerk middleware
```

### Key Patterns

1. **Feature-Based Organization**: Code organized by feature, not by type
2. **Server Components First**: Use `'use client'` only when necessary
3. **Server Actions over API Routes**: Use Server Actions for data mutations
4. **Metadata-Based Authorization**: User roles/status in Clerk metadata, NOT database

## Authentication (Clerk)

**Server-side:**
```typescript
import { ClerkAuthService } from '@/features/auth/services/clerk-auth.service';

const user = await ClerkAuthService.getCurrentUser();
const user = await ClerkAuthService.requireAuth({ requiredStatus: 'approved' });
const user = await ClerkAuthService.requireAuth({ requireAdmin: true });
```

**Client-side:**
```typescript
import { useUser } from '@clerk/nextjs';
const { user } = useUser();
const status = user?.publicMetadata?.status; // "pending" | "approved" | "rejected"
const role = user?.publicMetadata?.role;     // "user" | "admin"
```

**User Management (Admin):**
```typescript
import { updateUserStatus, updateUserRole } from '@/features/auth/actions/clerk-user';
await updateUserStatus(userId, 'approved');
await updateUserRole(userId, 'admin');
```

## Database Schema

**⚠️ CRITICAL: Profile ID vs Clerk User ID**

The `profiles` table uses UUID as PRIMARY KEY, NOT Clerk user ID.

```
profiles: id (UUID, PK), clerk_user_id (TEXT, UNIQUE), email, timestamps
links: id, slug, original_url, user_id (→ profiles.id), click_count, timestamps
link_clicks: id, link_id, clicked_at, user_agent, ip_address
```

**Supabase Clients:**
```typescript
// Server
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();

// Client
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
```

## URL Utilities

Always use `getBaseUrl()` instead of `window.location.origin`:

```typescript
import { getBaseUrl, getShortUrl } from '@/lib/url';

const baseUrl = getBaseUrl();           // Uses NEXT_PUBLIC_BASE_URL
const shortUrl = getShortUrl(slug);     // Returns full short URL
```

## Coding Conventions

- **File Naming**: kebab-case (e.g., `user-management-table.tsx`)
- **Components**: PascalCase names, kebab-case files
- **Functions/Variables**: camelCase with TypeScript types
- **Imports**: Prefer named exports
- **Icons**: lucide-react only
- **Styling**: Tailwind CSS only

## Environment Variables

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Supabase (DB only)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Application
NEXT_PUBLIC_BASE_URL=          # Custom domain for short URLs
```

## Important Notes

- User status/role: Always read from Clerk metadata, never from database
- Database types: Auto-generated via `pnpm run gen:types`
- Short URL IDs: Generated using Snowflake algorithm (Base62 encoded)
- Clerk Webhook (`/api/webhooks/clerk`): Creates profiles on user.created
