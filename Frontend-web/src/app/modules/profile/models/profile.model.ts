export interface ProfileUser {
  name: string;
  email: string;
  avatarUrl: string;
  accessLevel: 'Utilizador Comum';
  badge: string;
  description: string;
}

export interface RankingRow {
  position: number;
  name: string;
  points: number;
  isCurrentUser?: boolean;
}

export interface DomainProgress {
  title: string;
  percent: number;
  completedTopics: number;
  pendingTopics: number;
  color: string;
}

export interface Achievement {
  icon: string;
  name: string;
  description: string;
  unlocked: boolean;
}

export interface LearningProgress {
  title: string;
  subtitle: string;
  imageUrl: string;
  progress: number;
}

export interface ProfileStats {
  studyHours: number;
  completedCourses: number;
  forumPosts: number;
  completedQuizzes: number;
}

export interface ProfileDashboard {
  user: ProfileUser;
  ranking: {
    currentPosition: number;
    totalStudents: number;
    points: number;
    rows: RankingRow[];
  };
  domains: DomainProgress[];
  achievements: Achievement[];
  learning: LearningProgress;
  stats: ProfileStats;
}
