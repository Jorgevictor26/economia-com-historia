import { Injectable } from '@angular/core';
import { ProfileDashboard } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  getDashboard(): ProfileDashboard {
    return {
      user: {
        name: 'Lisandro Acsátimo',
        email: 'lisandro.acsatimo@economiahistoria.ao',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80',
        accessLevel: 'Utilizador Comum',
        badge: 'Nível 44',
        description:
          'Dedicado ao estudo das estruturas macroeconómicas de Luanda e ao seu impacto histórico no desenvolvimento da África Austral.',
      },
      ranking: {
        currentPosition: 12,
        totalStudents: 1450,
        points: 2795,
        rows: [
          { position: 11, name: 'S. Gonçalves', points: 2840 },
          { position: 12, name: 'Tu (Utilizador)', points: 2795, isCurrentUser: true },
          { position: 13, name: 'M. Neto', points: 2710 },
        ],
      },
      domains: [
        {
          title: 'DOMÍNIO: HISTÓRIA DE ANGOLA',
          percent: 75,
          completedTopics: 18,
          pendingTopics: 6,
          color: '#5C1E2F',
        },
        {
          title: 'DOMÍNIO: ECONOMIA APLICADA',
          percent: 50,
          completedTopics: 12,
          pendingTopics: 12,
          color: '#D4AF37',
        },
      ],
      achievements: [
        { icon: 'graduation', name: 'Mestre Colonial', description: 'Rotas marítimas', unlocked: true },
        { icon: 'trend', name: 'Analista Júnior', description: '10 casos práticos', unlocked: true },
        { icon: 'archive', name: 'Arquivista', description: '50 documentos', unlocked: true },
        { icon: 'mentor', name: 'Mentor Sênior', description: 'Fórum activo', unlocked: true },
        { icon: 'medal', name: 'Doutorado', description: 'Bloqueado', unlocked: false },
        { icon: 'wallet', name: 'Investidor', description: 'Bloqueado', unlocked: false },
      ],
      learning: {
        title: 'MÓDULO AVANÇADO',
        subtitle: 'A Evolução do Kwanza no Contexto Regional',
        imageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=640&q=80',
        progress: 64,
      },
      stats: {
        studyHours: 124,
        completedCourses: 8,
        forumPosts: 42,
        completedQuizzes: 31,
      },
    };
  }
}
