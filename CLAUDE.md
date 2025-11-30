# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a URL shortening service built with Next.js 15, TypeScript, and Supabase. It features user authentication with an approval system, link management, and analytics tracking.

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

# Admin Setup
pnpm run seed:admin         # Interactive script to create admin user
```

## High-Level Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (using globals.css, no config file)
- **UI Components**: shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with SSR
- **Package Manager**: pnpm

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard (protected)
│   ├── [slug]/            # Dynamic redirect handler
│   └── auth/              # Auth callback routes
├── features/              # Feature-based modules
│   ├── auth/              # Authentication logic & components
│   ├── links/             # Link management
│   └── analytics/         # Analytics features
├── shared/                # Shared resources
│   ├── components/ui/     # shadcn/ui components
│   └── types/             # TypeScript definitions
├── lib/                   # External library configurations
│   └── supabase/          # Supabase client setup
└── middleware.ts          # Route protection & auth
```

### Key Architectural Patterns

1. **Feature-Based Organization**: Code is organized by feature (auth, links, analytics) rather than by type
2. **Server Components First**: Prioritize React Server Components, use `'use client'` only when necessary
3. **Server Actions**: Use Server Actions instead of API routes for data mutations
4. **Type Safety**: All database types are auto-generated from Supabase schema

### Authentication Flow

1. **User Registration**: New users register and enter "pending" status
2. **Admin Approval**: Admins review and approve/reject users
3. **Role-Based Access**: Users have roles (user/admin) with different permissions
4. **Middleware Protection**: Routes are protected at the middleware level

### Database Schema

Key tables:
- `profiles`: User profiles with role and approval status
- `links`: Shortened URLs with click tracking
- `link_clicks`: Individual click events with metadata

### Environment Variables

Required variables:
```
NEXT_PUBLIC_BASE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY (for admin functions)
```

## Coding Conventions

1. **File Naming**: Use kebab-case for all files (e.g., `user-management-table.tsx`)
2. **Component Naming**: PascalCase for components, file names still kebab-case
3. **Functions/Variables**: camelCase with TypeScript types
4. **Imports**: Prefer named exports
5. **Icons**: Use lucide-react exclusively
6. **Styling**: Tailwind CSS only, no CSS modules or styled-components

## Important Implementation Details

1. **Supabase Clients**: 
   - Use `createClient()` from `/lib/supabase/client.ts` for client components
   - Use `createServerClient()` from `/lib/supabase/server.ts` for server components

2. **ID Generation**: Uses Snowflake algorithm for unique link IDs

3. **Middleware**: Handles auth checks and redirects based on user status

4. **Admin Features**: Located in `/app/admin/*` with role-based protection

5. **Testing**: Vitest is configured with React Testing Library

## Development Workflow

1. Always check existing patterns in the codebase before implementing new features
2. Use Server Components by default, add 'use client' only when needed
3. Follow the feature-based directory structure
4. Generate types after database changes: `pnpm run gen:types`
5. Test with `pnpm test` before committing
6. Run `pnpm lint` to ensure code quality