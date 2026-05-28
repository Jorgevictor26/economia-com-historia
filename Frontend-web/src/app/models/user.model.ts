export type UserRole = 'student' | 'writer' | 'moderator' | 'admin' | 'super-admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  hasPremiumAccess: boolean;
  invitedForumIds?: string[];
  streakDays: number;
}
