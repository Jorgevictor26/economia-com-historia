import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Quiz } from '../models/quiz.model';
import { normalizeMediaUrl } from './media-url.util';

interface BackendUser {
  id: number | string;
  name: string;
}

interface BackendContent {
  id: number | string;
  title: string;
  summary?: string | null;
  category?: { id: number | string; name: string } | null;
}

interface BackendQuizAlternative {
  id: number | string;
  question_id?: number | string;
  text: string;
  is_correct?: boolean | number;
  correta?: boolean | number;
}

export interface BackendQuestion {
  id: number | string;
  question: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_option?: 'a' | 'b' | 'c' | 'd';
  alternatives?: BackendQuizAlternative[];
  difficulty?: 'facil' | 'medio' | 'dificil' | null;
  time_seconds?: number | string | null;
  score?: number | string | null;
  xp?: number | string | null;
  order?: number | string | null;
  explanation?: string | null;
}

export interface BackendQuiz {
  id: number | string;
  title: string;
  description?: string | null;
  cover_url?: string | null;
  difficulty?: 'facil' | 'medio' | 'dificil' | null;
  xp_per_question?: number | null;
  time_limit?: number | null;
  category?: { id: number | string; name: string } | null;
  questions_count?: number;
  user?: BackendUser | null;
  content?: BackendContent | null;
  questions?: BackendQuestion[];
}

interface PaginatedResponse<T> {
  data: T[];
}

interface BackendQuizStats {
  score: number;
  completed_quizzes: number;
  completed_quiz_ids: Array<number | string>;
  total_xp?: number;
  level?: string;
}

interface BackendQuizResultsResponse extends PaginatedResponse<BackendQuizResult> {
  stats?: BackendQuizStats;
}

interface BackendQuizResult {
  quiz_id: number | string;
  score: number;
  total_questions: number;
  percentage: string | number;
  earned_xp?: number | null;
  ranking_position?: number | string | null;
  quiz?: BackendQuiz | null;
}

interface BackendQuizRanking {
  id: number | string;
  quiz_id: number | string;
  user_id: number | string;
  score: number | string;
  earned_xp?: number | string | null;
  duration_seconds?: number | string | null;
  completed_at?: string | null;
  user?: BackendUser | null;
}

export interface CreateQuizPayload {
  content_id: number | string;
  category_id: number | string;
  title: string;
  description?: string | null;
  cover_url?: string | null;
  difficulty: 'facil' | 'medio' | 'dificil';
  status?: 'active' | 'inactive';
}

export interface CreateQuestionPayload {
  question: string;
  order?: number;
  alternatives: Array<{
    text: string;
    is_correct: boolean;
  }>;
  explanation?: string | null;
}

export interface SubmitQuizPayload {
  started_at: string;
  elapsed_seconds?: number;
  answers: Array<{
    question_id: number | string;
    alternative_id?: number | string;
    selected_option?: 'a' | 'b' | 'c' | 'd';
    elapsed_seconds?: number;
  }>;
}

export interface QuizSubmitResult {
  score: number;
  total_questions: number;
  percentage: number;
  earned_xp: number;
  correct_answers: number;
  wrong_answers: number;
  duration_seconds: number;
  best_score: number;
  is_best: boolean;
  ranking_position?: number | null;
  user_level?: string | null;
  user_total_xp?: number | null;
}

export interface QuizUserStats {
  score: number;
  completedQuizzes: number;
  completedQuizIds: string[];
  rankingPosition?: number | null;
  totalXp?: number;
  level?: string;
}

export interface QuizRankingEntry {
  position: number;
  userId: string;
  name: string;
  score: number;
  earnedXp: number;
  durationSeconds: number;
  completedAt?: string | null;
  icon: string;
}

export interface BackendQuizProgress {
  id: number | string;
  user_id: number | string;
  quiz_id: number | string;
  progress_percent: number | string;
  current_question_index?: number | string | null;
  correct_count?: number | string | null;
  elapsed_seconds?: number | string | null;
  answered_questions?: Array<{
    question_id: number | string;
    alternative_id?: number | string;
    selected_option?: 'a' | 'b' | 'c' | 'd';
  }> | null;
  question_order?: Array<number | string> | null;
  completed_at?: string | null;
  quiz?: BackendQuiz | null;
}

export interface UpdateQuizProgressPayload {
  progress_percent: number;
  current_question_index?: number;
  correct_count?: number;
  elapsed_seconds?: number;
  answered_questions?: Array<{
    question_id: number | string;
    alternative_id?: number | string;
    selected_option?: 'a' | 'b' | 'c' | 'd';
  }>;
  question_order?: Array<number | string>;
}

@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly http = inject(HttpClient);

  readonly quizzes = signal<Quiz[]>([]);
  readonly userStats = signal<QuizUserStats>({
    score: 0,
    completedQuizzes: 0,
    completedQuizIds: [],
  });

  async loadAll(search = ''): Promise<Quiz[]> {
    let params = new HttpParams();

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    const response = await firstValueFrom(this.http.get<BackendQuiz[] | PaginatedResponse<BackendQuiz>>('/quizzes', { params }));
    const quizzes = (Array.isArray(response) ? response : response.data).map((quiz) => this.toQuiz(quiz));

    this.quizzes.set(quizzes);

    return quizzes;
  }

  async getById(id: string | number): Promise<Quiz> {
    const quiz = await firstValueFrom(this.http.get<BackendQuiz>(`/quizzes/${id}`));
    return this.toQuiz(quiz);
  }

  async create(payload: CreateQuizPayload): Promise<BackendQuiz> {
    const response = await firstValueFrom(this.http.post<{ data: BackendQuiz }>('/quizzes', payload));

    return response.data;
  }

  async createQuestion(quizId: string | number, payload: CreateQuestionPayload): Promise<BackendQuestion> {
    const response = await firstValueFrom(this.http.post<{ data: BackendQuestion }>(`/quizzes/${quizId}/questions`, payload));

    return response.data;
  }

  async submit(quizId: string | number, payload: SubmitQuizPayload): Promise<QuizSubmitResult> {
    const response = await firstValueFrom(this.http.post<{ data: QuizSubmitResult }>(`/quizzes/${quizId}/submit`, payload));

    return response.data;
  }

  async getRanking(quizId: string | number, limit = 5): Promise<QuizRankingEntry[]> {
    const response = await firstValueFrom(this.http.get<PaginatedResponse<BackendQuizRanking>>(`/quizzes/${quizId}/ranking`));

    return response.data.slice(0, limit).map((entry, index) => this.toRankingEntry(entry, index + 1));
  }

  async getProgress(limit = 6): Promise<BackendQuizProgress[]> {
    const params = new HttpParams().set('limit', String(limit));
    const response = await firstValueFrom(this.http.get<BackendQuizProgress[]>('/quiz-progress', { params }));

    return response;
  }

  async updateProgress(quizId: string | number, payload: UpdateQuizProgressPayload): Promise<BackendQuizProgress> {
    const response = await firstValueFrom(this.http.put<{ data: BackendQuizProgress }>(`/quizzes/${quizId}/progress`, payload));

    return response.data;
  }

  async loadMyStats(): Promise<QuizUserStats> {
    const response = await firstValueFrom(this.http.get<BackendQuizResultsResponse>('/my-results'));
    const results = response.data;
    const completedQuizIds = response.stats
      ? response.stats.completed_quiz_ids.map((quizId) => String(quizId))
      : [...new Set(results.map((result) => String(result.quiz_id)))];
    const score = response.stats?.score ?? results.reduce((total, result) => total + (result.earned_xp ?? 0), 0);
    const rankingPosition = results
      .map((result) => Number(result.ranking_position))
      .filter((position) => Number.isFinite(position) && position > 0)
      .sort((a, b) => a - b)[0] ?? null;
    const stats = {
      score,
      completedQuizzes: response.stats?.completed_quizzes ?? completedQuizIds.length,
      completedQuizIds,
      rankingPosition,
      totalXp: response.stats?.total_xp ?? score,
      level: response.stats?.level ?? 'Iniciante',
    };

    this.userStats.set(stats);

    return stats;
  }

  findQuiz(id: string | null | undefined): Quiz | undefined {
    return this.quizzes().find((quiz) => quiz.id === id);
  }

  private toQuiz(quiz: BackendQuiz): Quiz {
    const questions = quiz.questions ?? [];
    const content = quiz.content;
    const difficulty = this.toDifficulty(quiz.difficulty, quiz.time_limit);
    const rules = this.rulesForDifficulty(difficulty);
    const totalQuestions = questions.length || quiz.questions_count || 0;

    return {
      id: String(quiz.id),
      title: quiz.title,
      topic: quiz.category?.name ?? content?.category?.name ?? 'Quiz',
      summary: quiz.description || content?.summary || 'Teste os seus conhecimentos sobre este conteudo.',
      coverUrl: normalizeMediaUrl(quiz.cover_url) ?? null,
      difficulty,
      xp: Math.max(totalQuestions, 1) * rules.xp,
      streakReward: 0,
      estimatedMinutes: Math.max(Math.ceil((totalQuestions * rules.timeSeconds) / 60), 1),
      relatedContent: {
        id: String(content?.id ?? ''),
        title: content?.title ?? 'Conteudo relacionado',
        category: content?.category?.name ?? 'Conteudo',
        route: content?.id ? `/app/contents/${content.id}` : '/app/contents',
      },
      questions: questions.map((question) => this.toQuestion(question, content, rules)),
    };
  }

  private toQuestion(
    question: BackendQuestion,
    content: BackendContent | null | undefined,
    fallbackRules: { timeSeconds: number; score: number; xp: number },
  ): Quiz['questions'][number] {
    const optionKeys = ['a', 'b', 'c', 'd'] as const;
    const alternatives = question.alternatives ?? [];
    const options = alternatives.length
      ? alternatives.map((alternative) => alternative.text)
      : [question.option_a, question.option_b, question.option_c, question.option_d].filter((option): option is string => Boolean(option));
    const optionIds = alternatives.length
      ? alternatives.map((alternative) => String(alternative.id))
      : options.map((_, index) => optionKeys[index] ?? String(index));
    const correctAlternativeIndex = alternatives.findIndex((alternative) => Boolean(alternative.is_correct ?? alternative.correta));
    const answerIndex = correctAlternativeIndex >= 0
      ? correctAlternativeIndex
      : optionKeys.indexOf(question.correct_option ?? 'a');

    return {
      id: String(question.id),
      prompt: question.question,
      options,
      optionIds,
      answerIndex: Math.max(answerIndex, 0),
      explanation: question.explanation ?? '',
      contentLocation: content?.title ?? 'Conteudo relacionado',
      timeSeconds: question.time_seconds ? Number(question.time_seconds) : fallbackRules.timeSeconds,
      score: question.score ? Number(question.score) : fallbackRules.score,
      xp: question.xp ? Number(question.xp) : fallbackRules.xp,
    };
  }

  private toDifficulty(difficulty?: BackendQuiz['difficulty'], timeLimit?: number | null): Quiz['difficulty'] {
    if (difficulty === 'facil' || difficulty === 'medio' || difficulty === 'dificil') {
      return difficulty;
    }

    if (!timeLimit || timeLimit <= 5) {
      return 'facil';
    }

    if (timeLimit <= 10) {
      return 'medio';
    }

    return 'dificil';
  }

  private rulesForDifficulty(difficulty: Quiz['difficulty']): { timeSeconds: number; score: number; xp: number } {
    if (difficulty === 'dificil') {
      return { timeSeconds: 15, score: 30, xp: 30 };
    }

    if (difficulty === 'medio') {
      return { timeSeconds: 20, score: 20, xp: 20 };
    }

    return { timeSeconds: 30, score: 10, xp: 10 };
  }

  private toRankingEntry(entry: BackendQuizRanking, position: number): QuizRankingEntry {
    const icons = ['emoji_events', 'workspace_premium', 'military_tech', 'stars', 'auto_awesome'];

    return {
      position,
      userId: String(entry.user_id),
      name: entry.user?.name ?? 'Utilizador',
      score: Number(entry.score ?? 0),
      earnedXp: Number(entry.earned_xp ?? entry.score ?? 0),
      durationSeconds: Number(entry.duration_seconds ?? 0),
      completedAt: entry.completed_at ?? null,
      icon: icons[position - 1] ?? 'leaderboard',
    };
  }

}
