<?php

namespace Database\Seeders;

use App\Models\Content;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\QuizAnswer;
use App\Models\QuizResult;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class QuizDemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $author = User::query()
            ->where('status', 'active')
            ->orderBy('id')
            ->first();

        if (! $author) {
            $this->command?->warn('QuizDemoDataSeeder: nenhum utilizador ativo encontrado.');

            return;
        }

        DB::transaction(function () use ($author): void {
            $contents = $this->contentsByKey();

            $this->clearQuizData();
            $quizzes = $this->seedQuizzes($author, $contents);
            $this->seedProgressAndResults($quizzes);
        });
    }

    private function clearQuizData(): void
    {
        DB::table('quiz_rankings')->delete();
        DB::table('quiz_answers')->delete();
        DB::table('quiz_results')->delete();
        DB::table('quiz_progresses')->delete();
        DB::table('quiz_alternatives')->delete();
        DB::table('questions')->delete();
        DB::table('quizzes')->delete();
    }

    private function contentsByKey(): array
    {
        $titles = [
            'kwanza-memoria' => 'O kwanza e a memoria monetaria nacional',
            'caminhos-ferro' => 'Caminhos de ferro e integracao dos mercados',
            'jindungo-petroleo' => 'Jindungo: Petroleo, divida e soberania economica',
            'roque-santeiro' => 'Memorias do mercado do Roque Santeiro',
        ];

        $contents = Content::query()
            ->whereIn('title', array_values($titles))
            ->get()
            ->keyBy('title');

        return collect($titles)
            ->mapWithKeys(function (string $title, string $key) use ($contents): array {
                $content = $contents->get($title);

                if (! $content) {
                    throw new RuntimeException("Conteudo necessario para quiz nao encontrado: {$title}");
                }

                return [$key => $content];
            })
            ->all();
    }

    private function seedQuizzes(User $author, array $contents): array
    {
        $quizzes = [];

        foreach ($this->quizItems() as $key => $item) {
            $content = $contents[$item['content']];
            $quiz = Quiz::create([
                'user_id' => $author->id,
                'content_id' => $content->id,
                'category_id' => $content->category_id,
                'title' => $item['title'],
                'description' => $item['description'],
                'status' => 'active',
                'cover_url' => $content->image_url,
                'difficulty' => $item['difficulty'],
                'xp_per_question' => $item['xp_per_question'],
                'time_limit' => $item['time_limit'],
            ]);

            foreach ($item['questions'] as $index => $question) {
                $createdQuestion = Question::create([
                    'quiz_id' => $quiz->id,
                    'question' => $question['question'],
                    'order' => $index + 1,
                    'option_a' => $question['a'],
                    'option_b' => $question['b'],
                    'option_c' => $question['c'],
                    'option_d' => $question['d'],
                    'correct_option' => $question['correct'],
                    'explanation' => 'Revise o conteudo associado para aprofundar este ponto.',
                ]);

                foreach (['a', 'b', 'c', 'd'] as $option) {
                    $createdQuestion->alternatives()->create([
                        'text' => $question[$option],
                        'is_correct' => $question['correct'] === $option,
                    ]);
                }
            }

            $quizzes[$key] = $quiz->fresh('questions.alternatives');
        }

        return $quizzes;
    }

    private function seedProgressAndResults(array $quizzes): void
    {
        $users = User::query()
            ->where('status', 'active')
            ->orderBy('id')
            ->get();

        foreach ($users as $userIndex => $user) {
            foreach (array_values($quizzes) as $quizIndex => $quiz) {
                $questions = $quiz->questions()->orderBy('order')->orderBy('id')->get();
                $questionCount = max($questions->count(), 1);
                $answeredCount = $quizIndex === 0
                    ? $questions->count()
                    : min(2 + $quizIndex, max($questions->count() - 1, 1));
                $answeredQuestions = $questions->take($answeredCount);
                $progress = $quizIndex === 0
                    ? 100
                    : (int) round(($answeredQuestions->count() / $questionCount) * 100);
                $currentQuestionIndex = $progress >= 100
                    ? max($questions->count() - 1, 0)
                    : min($answeredQuestions->count(), max($questions->count() - 1, 0));

                DB::table('quiz_progresses')->insert([
                    'user_id' => $user->id,
                    'quiz_id' => $quiz->id,
                    'progress_percent' => $progress,
                    'current_question_index' => $currentQuestionIndex,
                    'correct_count' => $answeredQuestions->count(),
                    'elapsed_seconds' => 45 + ($quizIndex * 20) + ($userIndex * 5),
                    'answered_questions' => json_encode($answeredQuestions
                        ->map(fn (Question $question): array => [
                            'question_id' => $question->id,
                            'selected_option' => $question->correct_option,
                        ])
                        ->values()
                        ->all()),
                    'question_order' => json_encode($questions->pluck('id')->values()->all()),
                    'completed_at' => $progress >= 100 ? now()->subDays($quizIndex + 1) : null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                if ($quizIndex < 2) {
                    $this->seedQuizResult($user, $quiz, $questions, $quizIndex);
                }
            }
        }
    }

    private function seedQuizResult(User $user, Quiz $quiz, Collection $questions, int $quizIndex): void
    {
        $score = max(1, $questions->count() - $quizIndex);
        $total = $questions->count();
        $percentage = round(($score / max($total, 1)) * 100, 2);
        $earnedXp = $score * (int) $quiz->xp_per_question;

        $result = QuizResult::create([
            'quiz_id' => $quiz->id,
            'user_id' => $user->id,
            'score' => $score,
            'total_questions' => $total,
            'correct_answers' => $score,
            'wrong_answers' => max(0, $total - $score),
            'percentage' => $percentage,
            'earned_xp' => $earnedXp,
            'duration_seconds' => 90 + ($quizIndex * 30),
            'is_best' => true,
            'completed_at' => now()->subDays($quizIndex + 1),
        ]);

        foreach ($questions as $index => $question) {
            $isCorrect = $index < $score;
            $alternative = $isCorrect
                ? $question->alternatives->firstWhere('is_correct', true)
                : $question->alternatives->firstWhere('is_correct', false);

            QuizAnswer::create([
                'quiz_result_id' => $result->id,
                'question_id' => $question->id,
                'quiz_alternative_id' => $alternative?->id,
                'user_id' => $user->id,
                'selected_option' => $isCorrect ? $question->correct_option : $this->wrongOption($question->correct_option),
                'is_correct' => $isCorrect,
                'elapsed_seconds' => 15 + $index,
            ]);
        }
    }

    private function wrongOption(string $correctOption): string
    {
        return collect(['a', 'b', 'c', 'd'])
            ->first(fn (string $option): bool => $option !== $correctOption) ?? 'a';
    }

    private function quizItems(): array
    {
        return [
            'moeda-comercio' => [
                'content' => 'kwanza-memoria',
                'title' => 'Quiz: Moeda e comercio em Angola',
                'description' => 'Teste conhecimentos sobre moeda, precos e confianca economica.',
                'difficulty' => 'medio',
                'xp_per_question' => 20,
                'time_limit' => 12,
                'questions' => [
                    ['question' => 'Qual e uma funcao basica da moeda?', 'a' => 'Medir valor', 'b' => 'Substituir producao', 'c' => 'Eliminar impostos', 'd' => 'Impedir comercio', 'correct' => 'a'],
                    ['question' => 'A inflacao afeta diretamente que elemento?', 'a' => 'A cor das notas', 'b' => 'O poder de compra', 'c' => 'O nome dos mercados', 'd' => 'A geografia do pais', 'correct' => 'b'],
                    ['question' => 'A confianca na moeda depende de que fator?', 'a' => 'Somente do papel usado', 'b' => 'Estabilidade e aceitacao social', 'c' => 'Distancia entre cidades', 'd' => 'Numero de portos', 'correct' => 'b'],
                    ['question' => 'No comercio, os precos ajudam a comunicar:', 'a' => 'Sinais de escassez e procura', 'b' => 'Regras de transito', 'c' => 'Limites administrativos', 'd' => 'Idade dos produtos', 'correct' => 'a'],
                    ['question' => 'Quando a moeda perde valor rapidamente, as familias tendem a:', 'a' => 'Adiar todas as compras essenciais', 'b' => 'Procurar proteger o rendimento e rever gastos', 'c' => 'Ignorar completamente os precos', 'd' => 'Deixar de usar mercados locais', 'correct' => 'b'],
                ],
            ],
            'infraestruturas' => [
                'content' => 'caminhos-ferro',
                'title' => 'Quiz: Infraestruturas e mercado interno',
                'description' => 'Perguntas sobre transportes, producao e integracao economica.',
                'difficulty' => 'facil',
                'xp_per_question' => 10,
                'time_limit' => 10,
                'questions' => [
                    ['question' => 'Como os caminhos de ferro ajudam a economia?', 'a' => 'Aumentam isolamento', 'b' => 'Reduzem custos de transporte', 'c' => 'Impedem comercio', 'd' => 'Eliminam producao agricola', 'correct' => 'b'],
                    ['question' => 'Integracao de mercados significa:', 'a' => 'Maior ligacao entre produtores e consumidores', 'b' => 'Fechar mercados locais', 'c' => 'Eliminar cidades', 'd' => 'Trocar moeda por sal', 'correct' => 'a'],
                    ['question' => 'Uma infraestrutura economica pode ser:', 'a' => 'Estrada ou porto', 'b' => 'Apenas uma lei antiga', 'c' => 'Uma cor oficial', 'd' => 'Um sobrenome', 'correct' => 'a'],
                    ['question' => 'Menor custo logistico tende a:', 'a' => 'Facilitar circulacao de bens', 'b' => 'Parar a producao', 'c' => 'Reduzir conhecimento', 'd' => 'Apagar memoria historica', 'correct' => 'a'],
                    ['question' => 'A ligacao entre zonas produtoras e cidades pode melhorar:', 'a' => 'O acesso a mercados e abastecimento', 'b' => 'O isolamento das familias', 'c' => 'A ausencia de comercio', 'd' => 'A perda de informacao sobre precos', 'correct' => 'a'],
                ],
            ],
            'financas-publicas' => [
                'content' => 'jindungo-petroleo',
                'title' => 'Quiz Jindungo: Petroleo e divida',
                'description' => 'Desafio sobre receitas petroliferas, divida e politica fiscal.',
                'difficulty' => 'dificil',
                'xp_per_question' => 30,
                'time_limit' => 15,
                'questions' => [
                    ['question' => 'Uma economia dependente do petroleo fica mais sensivel a:', 'a' => 'Choques no preco internacional', 'b' => 'Mudancas de calendario escolar', 'c' => 'Tipos de papel', 'd' => 'Nomes de bairros', 'correct' => 'a'],
                    ['question' => 'Diversificacao produtiva significa:', 'a' => 'Depender de um unico produto', 'b' => 'Ampliar setores de producao', 'c' => 'Reduzir aprendizagem', 'd' => 'Parar investimento local', 'correct' => 'b'],
                    ['question' => 'Divida publica deve ser analisada junto com:', 'a' => 'Capacidade de pagamento e investimento', 'b' => 'Apenas tamanho do territorio', 'c' => 'Numero de capitais', 'd' => 'Cor dos documentos', 'correct' => 'a'],
                    ['question' => 'Receitas volateis exigem:', 'a' => 'Planeamento fiscal prudente', 'b' => 'Gastos sem limite', 'c' => 'Fim da poupanca', 'd' => 'Ignorar reservas', 'correct' => 'a'],
                    ['question' => 'Uma politica fiscal prudente procura:', 'a' => 'Equilibrar receitas, despesas e prioridades sociais', 'b' => 'Eliminar investimento publico essencial', 'c' => 'Aumentar divida sem criterio', 'd' => 'Ignorar choques externos', 'correct' => 'a'],
                ],
            ],
            'mercados-populares' => [
                'content' => 'roque-santeiro',
                'title' => 'Quiz: Mercados populares e memoria urbana',
                'description' => 'Perguntas sobre comercio informal e dinamicas urbanas.',
                'difficulty' => 'medio',
                'xp_per_question' => 20,
                'time_limit' => 12,
                'questions' => [
                    ['question' => 'Mercados populares revelam:', 'a' => 'Praticas de comercio e sobrevivencia', 'b' => 'Ausencia total de economia', 'c' => 'Fim das trocas', 'd' => 'Somente lazer', 'correct' => 'a'],
                    ['question' => 'A informalidade pode indicar:', 'a' => 'Adaptacao a oportunidades e restricoes', 'b' => 'Falta de qualquer regra social', 'c' => 'Inexistencia de consumidores', 'd' => 'Ausencia de transporte', 'correct' => 'a'],
                    ['question' => 'A memoria urbana ajuda a entender:', 'a' => 'Mudancas em trabalho, consumo e territorio', 'b' => 'Apenas datas comemorativas', 'c' => 'Somente clima', 'd' => 'Nada sobre economia', 'correct' => 'a'],
                    ['question' => 'Empreendedorismo popular esta ligado a:', 'a' => 'Iniciativa economica de pequena escala', 'b' => 'Fim do mercado', 'c' => 'Ausencia de clientes', 'd' => 'Fecho das cidades', 'correct' => 'a'],
                    ['question' => 'O estudo de mercados urbanos permite observar:', 'a' => 'Redes de abastecimento, credito informal e consumo', 'b' => 'A inexistencia de trabalho', 'c' => 'A ausencia de historia economica', 'd' => 'Somente organizacao desportiva', 'correct' => 'a'],
                ],
            ],
        ];
    }
}
