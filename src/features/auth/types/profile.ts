// Import types from the generated database types
import type { Database } from '@/shared/types/database.types';

// Define the enum types based on the database schema
export type UserStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'user' | 'admin';

// Define type aliases for the database types
type DbProfile = Database['public']['Tables']['profiles']['Row'];

// Re-export the database types with the same interface names
export type Profile = DbProfile;

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