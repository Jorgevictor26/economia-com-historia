import { Injectable, signal } from '@angular/core';
import { Quiz } from '../models/quiz.model';

@Injectable({ providedIn: 'root' })
export class QuizService {
  readonly quizzes = signal<Quiz[]>([
    {
      id: 'angola-mercados',
      title: 'Mercados, inflação e Kwanza',
      topic: 'Economia',
      summary: 'Teste conceitos essenciais sobre preços, moeda e regulação económica em Angola.',
      difficulty: 'Inicial',
      xp: 40,
      streakReward: 1,
      estimatedMinutes: 4,
      relatedContent: {
        id: 'politica-monetaria-angola',
        title: 'Análise da Política Monetária de Angola',
        category: 'Economia monetária',
        route: '/app/contents/politica-monetaria-angola',
      },
      questions: [
        {
          id: 'q1',
          prompt: 'Qual conceito descreve a subida geral e sustentada dos preços?',
          options: ['Inflação', 'Exportação', 'Poupança', 'Crédito'],
          answerIndex: 0,
          explanation: 'Inflação é o aumento persistente do nível geral de preços, reduzindo o poder de compra da moeda.',
          contentLocation: 'Secção "Inflação e poder de compra" do conteúdo sobre política monetária.',
        },
        {
          id: 'q2',
          prompt: 'Quando o banco central sobe taxas de juro, o efeito esperado sobre o crédito é:',
          options: ['Crédito mais caro', 'Crédito gratuito', 'Mais moeda sem custo', 'Fim das importações'],
          answerIndex: 0,
          explanation: 'Taxas de juro mais altas tendem a encarecer o crédito e a reduzir a procura por financiamento.',
          contentLocation: 'Bloco "Instrumentos de regulação" do conteúdo relacionado.',
        },
        {
          id: 'q3',
          prompt: 'Qual instituição está diretamente associada à política monetária em Angola?',
          options: ['Banco Nacional de Angola', 'Assembleia Nacional', 'Tribunal Supremo', 'Administração Municipal'],
          answerIndex: 0,
          explanation: 'O Banco Nacional de Angola é a autoridade monetária responsável por instrumentos como taxas e liquidez.',
          contentLocation: 'Introdução do conteúdo "Análise da Política Monetária de Angola".',
        },
      ],
    },
    {
      id: 'cafe-dende',
      title: 'Café, dendém e dependência',
      topic: 'História económica',
      summary: 'Reforce a leitura sobre ciclos produtivos, monocultura e impactos sociais no território angolano.',
      difficulty: 'Intermédio',
      xp: 55,
      streakReward: 2,
      estimatedMinutes: 5,
      relatedContent: {
        id: 'caso-agro',
        title: 'Diversificação Económica: O Caso da Agro-Indústria',
        category: 'Agro-indústria',
        route: '/app/contents/caso-agro',
      },
      questions: [
        {
          id: 'q1',
          prompt: 'Por que a dependência de uma cultura de exportação pode ser arriscada?',
          options: ['Expõe a economia a choques de preço', 'Elimina custos logísticos', 'Garante sempre pleno emprego', 'Impede qualquer crise externa'],
          answerIndex: 0,
          explanation: 'Quando uma economia depende de poucos produtos, oscilações externas podem afetar receitas, emprego e investimento.',
          contentLocation: 'Parte "Riscos da concentração produtiva" no texto sobre agro-indústria.',
        },
        {
          id: 'q2',
          prompt: 'A diversificação económica procura principalmente:',
          options: ['Ampliar setores produtivos', 'Fechar mercados locais', 'Eliminar agricultura', 'Substituir estudo histórico'],
          answerIndex: 0,
          explanation: 'Diversificar é reduzir dependências e fortalecer vários setores capazes de gerar valor e resiliência.',
          contentLocation: 'Secção "Diversificação e resiliência" do conteúdo relacionado.',
        },
        {
          id: 'q3',
          prompt: 'No contexto agrícola, cadeias de valor significam:',
          options: ['Etapas da produção até ao mercado', 'Apenas o preço final', 'Uma lista de impostos', 'Um método de votação'],
          answerIndex: 0,
          explanation: 'Cadeias de valor incluem produção, transformação, transporte, distribuição e venda.',
          contentLocation: 'Quadro "Da produção ao mercado" no texto relacionado.',
        },
      ],
    },
    {
      id: 'reino-kongo',
      title: 'Rotas comerciais do Reino do Kongo',
      topic: 'História',
      summary: 'Identifique redes comerciais, diplomacia regional e formas tradicionais de circulação de valor.',
      difficulty: 'Avançado',
      xp: 70,
      streakReward: 3,
      estimatedMinutes: 6,
      relatedContent: {
        id: 'evolucao-comercio-kongo',
        title: 'A Evolução do Comércio no Reino do Kongo',
        category: 'Economias pré-coloniais',
        route: '/app/contents/evolucao-comercio-kongo',
      },
      questions: [
        {
          id: 'q1',
          prompt: 'As rotas comerciais pré-coloniais eram importantes porque:',
          options: ['Ligavam mercados, autoridade política e diplomacia', 'Impediam qualquer troca regional', 'Eram apenas estradas militares', 'Substituíam todas as formas de governo'],
          answerIndex: 0,
          explanation: 'As redes de troca também sustentavam alianças, circulação de bens e influência política.',
          contentLocation: 'Secção "Rotas, poder e diplomacia" do conteúdo sobre o Kongo.',
        },
        {
          id: 'q2',
          prompt: 'Uma leitura histórica da economia deve considerar:',
          options: ['Tempo, território e relações sociais', 'Somente números recentes', 'Apenas opiniões pessoais', 'Só produtos importados'],
          answerIndex: 0,
          explanation: 'Contexto histórico evita interpretações isoladas e ajuda a ligar dados a instituições e sociedades.',
          contentLocation: 'Introdução metodológica do conteúdo relacionado.',
        },
        {
          id: 'q3',
          prompt: 'O comércio tradicional pode revelar:',
          options: ['Formas locais de organização económica', 'Ausência total de mercados', 'Fim da diplomacia', 'Economia sem pessoas'],
          answerIndex: 0,
          explanation: 'As práticas comerciais mostram instituições, confiança, especialização e integração regional.',
          contentLocation: 'Conclusão do texto "A Evolução do Comércio no Reino do Kongo".',
        },
      ],
    },
  ]);

  findQuiz(id: string | null | undefined): Quiz | undefined {
    return this.quizzes().find((quiz) => quiz.id === id);
  }
}
