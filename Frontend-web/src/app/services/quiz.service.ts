import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Quiz } from '../models/quiz.model';

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

export interface BackendQuestion {
  id: number | string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'a' | 'b' | 'c' | 'd';
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
  quiz?: BackendQuiz | null;
}

export interface CreateQuizPayload {
  content_id: number | string;
  title: string;
  description?: string | null;
  cover_url?: string | null;
  difficulty: 'facil' | 'medio' | 'dificil';
  xp_per_question: 10 | 15 | 20;
  time_limit?: number | null;
}

export interface CreateQuestionPayload {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'a' | 'b' | 'c' | 'd';
  explanation?: string | null;
}

export interface SubmitQuizPayload {
  started_at: string;
  elapsed_seconds?: number;
  answers: Array<{
    question_id: number | string;
    selected_option: 'a' | 'b' | 'c' | 'd';
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
}

export interface QuizUserStats {
  score: number;
  completedQuizzes: number;
  completedQuizIds: string[];
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
    selected_option: 'a' | 'b' | 'c' | 'd';
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
    selected_option: 'a' | 'b' | 'c' | 'd';
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
    const stats = {
      score,
      completedQuizzes: response.stats?.completed_quizzes ?? completedQuizIds.length,
      completedQuizIds,
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
    const totalQuestions = questions.length || quiz.questions_count || 0;

    return {
      id: String(quiz.id),
      title: quiz.title,
      topic: content?.category?.name ?? 'Quiz',
      summary: quiz.description || content?.summary || 'Teste os seus conhecimentos sobre este conteudo.',
      coverUrl: quiz.cover_url ?? null,
      difficulty: this.toDifficulty(quiz.difficulty, quiz.time_limit),
      xp: Math.max(totalQuestions, 1) * 10 + (totalQuestions === 10 ? 10 : 0),
      streakReward: 0,
      estimatedMinutes: quiz.time_limit ?? Math.max(totalQuestions * 2, 1),
      relatedContent: {
        id: String(content?.id ?? ''),
        title: content?.title ?? 'Conteudo relacionado',
        category: content?.category?.name ?? 'Conteudo',
        route: content?.id ? `/app/contents/${content.id}` : '/app/contents',
      },
      questions: questions.map((question) => this.toQuestion(question, content)),
    };
  }

  private toQuestion(question: BackendQuestion, content?: BackendContent | null): Quiz['questions'][number] {
    const optionKeys = ['a', 'b', 'c', 'd'] as const;
    const answerIndex = optionKeys.indexOf(question.correct_option);

    return {
      id: String(question.id),
      prompt: question.question,
      options: [question.option_a, question.option_b, question.option_c, question.option_d],
      answerIndex: Math.max(answerIndex, 0),
      explanation: question.explanation ?? '',
      contentLocation: content?.title ?? 'Conteudo relacionado',
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

}
