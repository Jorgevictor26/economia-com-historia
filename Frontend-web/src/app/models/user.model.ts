export type UserRole = 'student' | 'writer' | 'moderator' | 'admin' | 'super-admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  biography?: string;
  hasPremiumAccess: boolean;
  hasPendingJindungoRequest?: boolean;
  invitedForumIds?: string[];
  streakDays: number;
}
