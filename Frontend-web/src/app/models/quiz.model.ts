export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  contentLocation: string;
}

export interface Quiz {
  id: string;
  title: string;
  topic: string;
  summary: string;
  coverUrl?: string | null;
  difficulty: 'facil' | 'medio' | 'dificil';
  xp: number;
  streakReward: number;
  estimatedMinutes: number;
  relatedContent: {
    id: string;
    title: string;
    category: string;
    route: string;
  };
  questions: QuizQuestion[];
}
