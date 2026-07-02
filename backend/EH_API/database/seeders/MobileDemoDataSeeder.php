<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Comment;
use App\Models\CommentReply;
use App\Models\Content;
use App\Models\ContentType;
use App\Models\Forum;
use App\Models\ForumReply;
use App\Models\ForumTopic;
use App\Models\Notification;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\QuizAnswer;
use App\Models\QuizResult;
use App\Models\Reaction;
use App\Models\SavedContent;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class MobileDemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $categories = $this->seedCategories();
        $contentTypes = $this->seedContentTypes();

        $users = User::query()
            ->where('status', 'active')
            ->orderBy('id')
            ->get();

        if ($users->isEmpty()) {
            $this->command?->warn(
                'MobileDemoDataSeeder: nenhum utilizador ativo encontrado; dados dependentes de utilizador nao foram criados.'
            );

            return;
        }

        DB::transaction(function () use ($users, $categories, $contentTypes): void {
            $author = $users->first();
            $contents = $this->seedContents($author, $categories, $contentTypes);
            $quizzes = $this->seedQuizzes($author, $contents);

            $this->seedForums($users, $contents);
            $this->seedCommentsAndReactions($users, $contents);
            $this->seedSavedContents($users, $contents);
            $this->seedNotifications($users);
            $this->seedProgressAndResults($users, $contents, $quizzes);
        });
    }

    private function seedCategories(): array
    {
        $items = [
            [
                'name' => 'Economia',
                'description' => 'Temas economicos, mercados, moeda, comercio e desenvolvimento.',
            ],
            [
                'name' => 'Historia',
                'description' => 'Contextos historicos, memoria social e processos politicos.',
            ],
            [
                'name' => 'Moeda e Comercio',
                'description' => 'Rotas comerciais, moeda, inflacao e trocas regionais.',
            ],
            [
                'name' => 'Historia Economica',
                'description' => 'Processos historicos que explicam a economia angolana.',
            ],
            [
                'name' => 'Agricultura e Industria',
                'description' => 'Producao, transformacao local e diversificacao produtiva.',
            ],
            [
                'name' => 'Financas Publicas',
                'description' => 'Orcamento, impostos, divida publica e politicas sociais.',
            ],
        ];

        $categories = [];

        foreach ($items as $item) {
            $categories[$item['name']] = Category::updateOrCreate(
                ['name' => $item['name']],
                $item
            );
        }

        return $categories;
    }

    private function seedContentTypes(): array
    {
        $items = [
            [
                'name' => 'Texto',
                'slug' => 'texto',
                'description' => 'Artigos, leituras e materiais escritos.',
            ],
            [
                'name' => 'Video',
                'slug' => 'video',
                'description' => 'Conteudos em formato audiovisual.',
            ],
            [
                'name' => 'Podcast',
                'slug' => 'podcast',
                'description' => 'Episodios em formato audio.',
            ],
            [
                'name' => 'Jindungo',
                'slug' => 'jindungo',
                'description' => 'Conteudos premium com analise economica aprofundada.',
            ],
        ];

        $contentTypes = [];

        foreach ($items as $item) {
            $contentTypes[$item['slug']] = ContentType::updateOrCreate(
                ['slug' => $item['slug']],
                $item
            );
        }

        return $contentTypes;
    }

    private function seedContents(User $author, array $categories, array $contentTypes): array
    {
        $items = [
            'rota-sal' => [
                'category' => 'Historia Economica',
                'type' => 'texto',
                'title' => 'A rota do sal e os mercados costeiros de Angola',
                'summary' => 'Como o sal ajudou a ligar comunidades, portos e trocas locais.',
                'content' => 'As antigas rotas do sal mostram como a economia se organizava antes da industrializacao. O transporte, a confianca entre comerciantes e a circulacao de bens criaram redes que ainda ajudam a explicar a formacao de mercados urbanos e regionais.',
                'image_url' => 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
                'views_count' => 134,
            ],
            'kwanza-memoria' => [
                'category' => 'Moeda e Comercio',
                'type' => 'texto',
                'title' => 'O kwanza e a memoria monetaria nacional',
                'summary' => 'Uma leitura simples sobre moeda, inflacao e confianca social.',
                'content' => 'A moeda e mais do que um meio de pagamento. Ela carrega memoria, confianca e expectativas. Ao estudar a trajetoria do kwanza, percebemos como decisoes monetarias afetam salarios, poupanca, precos e escolhas quotidianas.',
                'image_url' => 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e',
                'views_count' => 211,
            ],
            'caminhos-ferro' => [
                'category' => 'Agricultura e Industria',
                'type' => 'video',
                'title' => 'Caminhos de ferro e integracao dos mercados',
                'summary' => 'Video sobre infraestrutura, comercio interno e circulacao de produtos.',
                'content' => 'Os caminhos de ferro reduziram distancias economicas e aproximaram zonas produtoras dos centros de consumo. A infraestrutura e uma ferramenta historica de integracao territorial.',
                'image_url' => 'https://images.unsplash.com/photo-1474487548417-781cb71495f3',
                'video_url' => 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
                'views_count' => 98,
            ],
            'portos-luanda' => [
                'category' => 'Historia',
                'type' => 'video',
                'title' => 'Portos, comercio e urbanizacao em Luanda',
                'summary' => 'Uma viagem visual pelo papel dos portos na cidade.',
                'content' => 'Luanda cresceu ligada ao mar, aos portos e aos circuitos comerciais. Observar a cidade pela lente economica ajuda a entender transportes, emprego e consumo.',
                'image_url' => 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
                'video_url' => 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4',
                'views_count' => 76,
            ],
            'inflacao-quotidiano' => [
                'category' => 'Financas Publicas',
                'type' => 'podcast',
                'title' => 'Conversas sobre inflacao no quotidiano',
                'summary' => 'Podcast sobre precos, salarios e escolhas das familias.',
                'content' => 'Neste episodio, discutimos como a inflacao aparece no mercado, no transporte, na alimentacao e nas decisoes de poupanca.',
                'image_url' => 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618',
                'audio_url' => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                'views_count' => 165,
            ],
            'roque-santeiro' => [
                'category' => 'Historia Economica',
                'type' => 'podcast',
                'title' => 'Memorias do mercado do Roque Santeiro',
                'summary' => 'Episodio sobre informalidade, comercio popular e memoria urbana.',
                'content' => 'O mercado informal tambem produz historia economica. O Roque Santeiro marcou praticas de compra, venda, transporte e empreendedorismo popular.',
                'image_url' => 'https://images.unsplash.com/photo-1516280440614-37939bbacd81',
                'audio_url' => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                'views_count' => 188,
            ],
            'jindungo-petroleo' => [
                'category' => 'Financas Publicas',
                'type' => 'jindungo',
                'title' => 'Jindungo: Petroleo, divida e soberania economica',
                'summary' => 'Analise premium sobre receitas petroliferas e escolhas fiscais.',
                'content' => 'O petroleo ampliou receitas, mas tambem tornou a economia vulneravel a choques externos. A soberania economica exige diversificacao produtiva, disciplina fiscal e investimento em capacidades locais.',
                'image_url' => 'https://images.unsplash.com/photo-1518709268805-4e9042af2176',
                'views_count' => 243,
            ],
            'jindungo-importacoes' => [
                'category' => 'Agricultura e Industria',
                'type' => 'jindungo',
                'title' => 'Jindungo: O custo historico das importacoes alimentares',
                'summary' => 'Conteudo premium sobre agricultura, cambio e seguranca alimentar.',
                'content' => 'A dependencia de importacoes alimentares pressiona reservas, precos e familias. A historia economica mostra que produzir localmente tambem e uma politica de estabilidade.',
                'image_url' => 'https://images.unsplash.com/photo-1498837167922-ddd27525d352',
                'views_count' => 197,
            ],
        ];

        $contents = [];

        foreach ($items as $key => $item) {
            $contents[$key] = Content::updateOrCreate(
                ['title' => $item['title']],
                [
                    'user_id' => $author->id,
                    'category_id' => $categories[$item['category']]->id,
                    'content_type_id' => $contentTypes[$item['type']]->id,
                    'summary' => $item['summary'],
                    'content' => $item['content'],
                    'image_url' => $item['image_url'],
                    'video_url' => $item['video_url'] ?? null,
                    'audio_url' => $item['audio_url'] ?? null,
                    'document_url' => null,
                    'visibility' => 'public',
                    'views_count' => $item['views_count'],
                ]
            );
        }

        return $contents;
    }

    private function seedQuizzes(User $author, array $contents): array
    {
        $items = [
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
                ],
            ],
        ];

        $quizzes = [];

        foreach ($items as $key => $item) {
            $content = $contents[$item['content']];
            $quiz = Quiz::updateOrCreate(
                ['title' => $item['title']],
                [
                    'user_id' => $author->id,
                    'content_id' => $content->id,
                    'category_id' => $content->category_id,
                    'description' => $item['description'],
                    'cover_url' => $content->image_url,
                    'difficulty' => $item['difficulty'],
                    'xp_per_question' => $item['xp_per_question'],
                    'time_limit' => $item['time_limit'],
                ]
            );

            foreach ($item['questions'] as $question) {
                $createdQuestion = Question::updateOrCreate(
                    [
                        'quiz_id' => $quiz->id,
                        'question' => $question['question'],
                    ],
                    [
                        'option_a' => $question['a'],
                        'option_b' => $question['b'],
                        'option_c' => $question['c'],
                        'option_d' => $question['d'],
                        'correct_option' => $question['correct'],
                        'explanation' => 'Revise o conteudo associado para aprofundar este ponto.',
                    ]
                );

                $createdQuestion->alternatives()->delete();

                foreach (['a', 'b', 'c', 'd'] as $option) {
                    $createdQuestion->alternatives()->create([
                        'text' => $question[$option],
                        'is_correct' => $question['correct'] === $option,
                    ]);
                }
            }

            $quizzes[$key] = $quiz->fresh('questions');
        }

        return $quizzes;
    }

    private function seedForums(Collection $users, array $contents): void
    {
        $items = [
            [
                'name' => 'Sala: Mercados de Luanda e memoria urbana',
                'description' => 'Debate sobre mercados populares, transportes e transformacoes da cidade.',
                'rules' => 'Use exemplos historicos, cite fontes quando possivel e respeite outros participantes.',
                'category' => 'Historia Economica',
                'visibility' => 'public',
                'content_permission' => 'public',
                'allow_attachments' => false,
                'contents' => ['rota-sal', 'roque-santeiro'],
                'topics' => [
                    ['title' => 'Que mercados marcaram a tua memoria familiar?', 'content' => 'Partilha exemplos de mercados que influenciaram consumo, trabalho ou mobilidade na tua comunidade.'],
                    ['title' => 'Como o transporte muda os precos?', 'content' => 'Vamos discutir como distancia, combustivel e estrada aparecem no preco final dos bens.'],
                ],
            ],
            [
                'name' => 'Sala: Industria nacional e diversificacao',
                'description' => 'Espaco para discutir producao local, cadeias de valor e emprego.',
                'rules' => 'Mantenha o foco em propostas economicas concretas e linguagem construtiva.',
                'category' => 'Agricultura e Industria',
                'visibility' => 'public',
                'content_permission' => 'subscribers',
                'allow_attachments' => true,
                'contents' => ['caminhos-ferro', 'jindungo-importacoes'],
                'topics' => [
                    ['title' => 'Que setores podem reduzir importacoes?', 'content' => 'Agricultura, transformacao alimentar e logistica aparecem sempre. Que outros setores devem entrar na conversa?'],
                    ['title' => 'Infraestrutura antes ou depois da industria?', 'content' => 'Debate sobre prioridades de investimento para criar mercado interno forte.'],
                ],
            ],
            [
                'name' => 'Sala: Clube Jindungo de leitura economica',
                'description' => 'Conversa guiada sobre conteudos premium e analises aprofundadas.',
                'rules' => 'Evite copiar conteudo integral. Traga perguntas, argumentos e interpretacoes.',
                'category' => 'Jindungo',
                'visibility' => 'private',
                'content_permission' => 'subscribers',
                'allow_attachments' => true,
                'contents' => ['jindungo-petroleo', 'jindungo-importacoes'],
                'topics' => [
                    ['title' => 'Como reduzir vulnerabilidade ao petroleo?', 'content' => 'Que politicas podem proteger o pais de choques externos sem travar investimento?'],
                    ['title' => 'Importar alimentos e uma questao cambial?', 'content' => 'Vamos relacionar importacoes, cambio, agricultura e seguranca alimentar.'],
                ],
            ],
        ];

        foreach ($items as $forumIndex => $item) {
            $forum = Forum::updateOrCreate(
                ['name' => $item['name']],
                [
                    'user_id' => $this->userAt($users, $forumIndex)->id,
                    'description' => $item['description'],
                    'rules' => $item['rules'],
                    'category' => $item['category'],
                    'image_url' => null,
                    'visibility' => $item['visibility'],
                    'content_permission' => $item['content_permission'],
                    'allow_attachments' => $item['allow_attachments'],
                    'status' => 'approved',
                    'reviewed_by' => null,
                    'reviewed_at' => null,
                ]
            );

            $forum->contents()->syncWithoutDetaching(
                collect($item['contents'])
                    ->map(fn (string $key): int => $contents[$key]->id)
                    ->all()
            );

            foreach ($item['topics'] as $topicIndex => $topicData) {
                $topic = ForumTopic::updateOrCreate(
                    [
                        'forum_id' => $forum->id,
                        'title' => $topicData['title'],
                    ],
                    [
                        'user_id' => $this->userAt($users, $forumIndex + $topicIndex)->id,
                        'content' => $topicData['content'],
                    ]
                );

                foreach ([0, 1] as $replyIndex) {
                    $replyUser = $this->userAt($users, $forumIndex + $topicIndex + $replyIndex + 1);
                    ForumReply::updateOrCreate(
                        [
                            'topic_id' => $topic->id,
                            'user_id' => $replyUser->id,
                            'reply' => $replyIndex === 0
                                ? 'Concordo com o ponto central. A historia ajuda a perceber que estas escolhas economicas nao surgem do nada.'
                                : 'Tambem acho importante ligar este debate a exemplos atuais de preco, emprego e acesso aos mercados.',
                        ],
                        []
                    );
                }
            }
        }
    }

    private function seedCommentsAndReactions(Collection $users, array $contents): void
    {
        $commentTexts = [
            'Este conteudo ajuda a ligar historia e economia de forma clara.',
            'Gostei do exemplo pratico. Seria interessante comparar com outras provincias.',
            'A parte sobre precos e transporte explica muito do nosso quotidiano.',
            'Boa base para discutir em sala de aula e no forum.',
        ];

        foreach (array_values($contents) as $index => $content) {
            $user = $this->userAt($users, $index);
            $comment = Comment::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'content_id' => $content->id,
                    'comment' => $commentTexts[$index % count($commentTexts)],
                ],
                ['hidden_at' => null]
            );

            if ($index < 4) {
                CommentReply::updateOrCreate(
                    [
                        'comment_id' => $comment->id,
                        'user_id' => $this->userAt($users, $index + 1)->id,
                        'reply' => 'Boa observacao. Este ponto tambem aparece nos debates do forum.',
                    ],
                    []
                );
            }

            foreach ($users->take(3) as $reactionIndex => $reactionUser) {
                Reaction::updateOrCreate(
                    [
                        'user_id' => $reactionUser->id,
                        'content_id' => $content->id,
                    ],
                    ['reaction_type' => $reactionIndex === 1 ? 'love' : 'like']
                );
            }
        }
    }

    private function seedSavedContents(Collection $users, array $contents): void
    {
        $contentIds = collect($contents)
            ->take(5)
            ->pluck('id')
            ->values();

        foreach ($users as $userIndex => $user) {
            foreach ($contentIds->slice($userIndex % 2, 3) as $contentId) {
                SavedContent::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'content_id' => $contentId,
                    ],
                    ['created_at' => now()->subDays($userIndex + 1)]
                );
            }
        }
    }

    private function seedNotifications(Collection $users): void
    {
        $items = [
            [
                'title' => 'Novo conteudo disponivel',
                'message' => 'Ja podes ler um novo artigo sobre moeda, comercio e memoria economica.',
                'is_read' => false,
            ],
            [
                'title' => 'Quiz recomendado',
                'message' => 'Ha um novo desafio sobre infraestruturas e mercado interno a tua espera.',
                'is_read' => false,
            ],
            [
                'title' => 'Discussao em destaque',
                'message' => 'A comunidade esta a debater mercados populares e urbanizacao em Luanda.',
                'is_read' => true,
            ],
        ];

        foreach ($users as $user) {
            foreach ($items as $item) {
                Notification::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'title' => $item['title'],
                    ],
                    [
                        'message' => $item['message'],
                        'is_read' => $item['is_read'],
                    ]
                );
            }
        }
    }

    private function seedProgressAndResults(Collection $users, array $contents, array $quizzes): void
    {
        $contentProgress = [
            ['key' => 'rota-sal', 'progress' => 100, 'position' => null],
            ['key' => 'kwanza-memoria', 'progress' => 65, 'position' => null],
            ['key' => 'inflacao-quotidiano', 'progress' => 45, 'position' => 240],
            ['key' => 'caminhos-ferro', 'progress' => 30, 'position' => 75],
        ];

        foreach ($users as $userIndex => $user) {
            foreach ($contentProgress as $itemIndex => $item) {
                $progress = max(0, min(100, $item['progress'] - ($userIndex * 5)));
                DB::table('content_progresses')->updateOrInsert(
                    [
                        'user_id' => $user->id,
                        'content_id' => $contents[$item['key']]->id,
                    ],
                    [
                        'progress_percent' => $progress,
                        'last_position_seconds' => $item['position'],
                        'completed_at' => $progress >= 100 ? now()->subDays($itemIndex + 1) : null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }

            foreach (array_values($quizzes) as $quizIndex => $quiz) {
                $questions = $quiz->questions()->orderBy('id')->get();
                if ($questions->isEmpty()) {
                    continue;
                }

                $answered = $questions
                    ->take(min(2 + $quizIndex, $questions->count()))
                    ->map(fn (Question $question): array => [
                        'question_id' => $question->id,
                        'selected_option' => $question->correct_option,
                    ])
                    ->values()
                    ->all();

                $progress = $quizIndex === 0 ? 100 : min(90, 25 + ($quizIndex * 20));
                DB::table('quiz_progresses')->updateOrInsert(
                    [
                        'user_id' => $user->id,
                        'quiz_id' => $quiz->id,
                    ],
                    [
                        'progress_percent' => $progress,
                        'current_question_index' => min($quizIndex, max($questions->count() - 1, 0)),
                        'answered_questions' => json_encode($answered),
                        'completed_at' => $progress >= 100 ? now()->subDays($quizIndex + 1) : null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );

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

        QuizResult::updateOrCreate(
            [
                'quiz_id' => $quiz->id,
                'user_id' => $user->id,
            ],
            [
                'score' => $score,
                'total_questions' => $total,
                'percentage' => $percentage,
                'earned_xp' => $earnedXp,
                'completed_at' => now()->subDays($quizIndex + 1),
            ]
        );

        foreach ($questions as $index => $question) {
            $isCorrect = $index < $score;
            $alternative = $isCorrect
                ? $question->alternatives()->where('is_correct', true)->first()
                : $question->alternatives()->where('is_correct', false)->first();

            QuizAnswer::updateOrCreate(
                [
                    'question_id' => $question->id,
                    'user_id' => $user->id,
                ],
                [
                    'quiz_alternative_id' => $alternative?->id,
                    'selected_option' => $isCorrect ? $question->correct_option : $this->wrongOption($question->correct_option),
                    'is_correct' => $isCorrect,
                ]
            );
        }
    }

    private function wrongOption(string $correctOption): string
    {
        return collect(['a', 'b', 'c', 'd'])
            ->first(fn (string $option): bool => $option !== $correctOption) ?? 'a';
    }

    private function userAt(Collection $users, int $index): User
    {
        return $users->values()->get($index % $users->count());
    }
}
