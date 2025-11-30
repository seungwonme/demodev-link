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
   - Clerk privateMetadata.role set to "user"

2. **Admin Approval**:

   - Admins review and approve/reject users via custom Admin UI
   - Status/role updated in Clerk metadata via Clerk API
   - No database update needed (metadata is source of truth)

3. **Role-Based Access**:

   - User status: `publicMetadata.status` (pending/approved/rejected)
   - User role: `privateMetadata.role` (user/admin)
   - Middleware checks metadata for route protection

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
const role = user?.privateMetadata?.role;
```

**Metadata Structure**:

```typescript
// Public Metadata (visible to user)
{
  status: "pending" | "approved" | "rejected"
}

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
- Checks `sessionClaims.privateMetadata.role` for admin access
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
5. **Clerk metadata missing in sessionClaims**: Middleware falls back to Clerk user fetch to read public/private metadata when claims omit them.
6. **Links feature auth**: Link creation/updates now rely on Clerk auth (approved users) instead of Supabase auth; client form uses Clerk `useUser` for login state.
7. **Status pages**: `/admin/pending` and `/admin/rejected` now redirect approved users to `/admin/dashboard`.

### Database Issues

1. **RLS errors**: Supabase database operations should use `service_role_key`
2. **Foreign key errors**: Ensure `clerk_user_id` matches Clerk user ID exactly

### Development

1. **Hot reload issues**: Restart dev server after changing environment variables
2. **Type errors**: Run `pnpm run gen:types` after database schema changes
