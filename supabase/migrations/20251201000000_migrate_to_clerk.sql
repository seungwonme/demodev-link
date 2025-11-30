-- Migration: Supabase Auth에서 Clerk로 전환
-- Date: 2025-12-01
-- Description: profiles 테이블을 Clerk 기반으로 변경하고, auth.users 의존성 제거
-- 전략: 기존 id를 TEXT로 변환하고, clerk_user_id를 별도 컬럼으로 추가

-- Step 1: RLS 비활성화 (테이블 구조 변경을 위해)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE links DISABLE ROW LEVEL SECURITY;

-- Step 2: 기존 RLS 정책 제거
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Approved users can read links" ON links;
DROP POLICY IF EXISTS "Approved users can create links" ON links;
DROP POLICY IF EXISTS "Approved users can update own links" ON links;
DROP POLICY IF EXISTS "Approved users can delete own links" ON links;

-- Step 3: 뷰 제거
DROP VIEW IF EXISTS pending_users;

-- Step 4: Helper 함수 제거
DROP FUNCTION IF EXISTS app_auth.is_admin(uuid);
DROP FUNCTION IF EXISTS app_auth.is_approved(uuid);
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_approved();

-- Step 5: Trigger 제거
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 6: app_auth 스키마 제거
DROP SCHEMA IF EXISTS app_auth CASCADE;

-- Step 7: links 테이블의 외래키 먼저 제거 (타입 변경 전에)
ALTER TABLE links DROP CONSTRAINT IF EXISTS links_user_id_fkey;

-- Step 8: auth.users 외래키 제거
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_approved_by_fkey;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_rejected_by_fkey;

-- Step 9: 인덱스 제거
DROP INDEX IF EXISTS idx_profiles_status;
DROP INDEX IF EXISTS idx_profiles_admin_check;

-- Step 10: profiles.id 타입 변경 (UUID -> TEXT)
ALTER TABLE profiles ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- Step 11: links 테이블의 user_id 타입 변경
ALTER TABLE links ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Step 12: profiles 테이블에 clerk_user_id 컬럼 추가
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS clerk_user_id TEXT UNIQUE;

-- Step 13: status, role 관련 컬럼 제거 (Clerk metadata로 이전)
ALTER TABLE profiles DROP COLUMN IF EXISTS status;
ALTER TABLE profiles DROP COLUMN IF EXISTS role;
ALTER TABLE profiles DROP COLUMN IF EXISTS approved_at;
ALTER TABLE profiles DROP COLUMN IF EXISTS approved_by;
ALTER TABLE profiles DROP COLUMN IF EXISTS rejected_at;
ALTER TABLE profiles DROP COLUMN IF EXISTS rejected_by;
ALTER TABLE profiles DROP COLUMN IF EXISTS rejection_reason;

-- Step 14: links 테이블의 외래키 재설정 (profiles.id 참조 유지)
-- 나중에 Clerk 마이그레이션 후 clerk_user_id로 변경 가능
ALTER TABLE links
ADD CONSTRAINT links_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Step 15: 완료 메시지
COMMENT ON TABLE profiles IS 'User profiles - migrated to Clerk auth on 2025-12-01. RLS policies removed - auth managed by Clerk at application level. clerk_user_id column added for Clerk integration.';
COMMENT ON TABLE links IS 'Links table - RLS policies removed, auth managed by Clerk at application level.';
