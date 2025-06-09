// Import types from the generated database types
import { UserStatus, UserRole, Profile as DbProfile, PendingUser as DbPendingUser } from '@/shared/types/database.types';

// Re-export the enum types for backward compatibility
export type { UserStatus, UserRole };

// Re-export the database types with the same interface names
export type Profile = DbProfile;
export type PendingUser = NonNullable<DbPendingUser>;

// Helper type guard functions
export const isUserStatus = (value: unknown): value is UserStatus => {
  return typeof value === 'string' && ['pending', 'approved', 'rejected'].includes(value);
};

export const isUserRole = (value: unknown): value is UserRole => {
  return typeof value === 'string' && ['user', 'admin'].includes(value);
};

// Constants for enum values
export const USER_STATUS = {
  PENDING: 'pending' as const,
  APPROVED: 'approved' as const,
  REJECTED: 'rejected' as const,
} satisfies Record<string, UserStatus>;

export const USER_ROLE = {
  USER: 'user' as const,
  ADMIN: 'admin' as const,
} satisfies Record<string, UserRole>;