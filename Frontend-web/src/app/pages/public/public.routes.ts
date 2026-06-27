import { AfterViewInit, Component, ElementRef, OnDestroy, inject } from '@angular/core';
import { CanActivateFn, Router, RouterLink, Routes } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';
import { BackToTopComponent } from '../shared/back-to-top/back-to-top.component';
import { PublicFooterComponent } from '../shared/public-footer/public-footer.component';
import { PublicNavbarComponent } from '../shared/public-navbar/public-navbar.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink, PublicNavbarComponent, PublicFooterComponent, BackToTopComponent],
  templateUrl: './landing.page.html'
})
export class LandingPage implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private revealObserver?: IntersectionObserver;

  readonly pillars = [
    {
      title: 'História',
      text: 'Investigação profunda desde as origens pré-coloniais até à modernidade.',
      action: 'Explorar',
      route: '/app/contents',
      queryParams: { categoria: 'História' },
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Economia',
      text: 'Análise rigorosa de fluxos, mercados e políticas de desenvolvimento nacional.',
      action: 'Explorar',
      route: '/app/contents',
      queryParams: { categoria: 'Economia' },
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Jindungo',
      text: 'Acesso a conteúdos exclusivos, relatórios detalhados e insights para subscritores.',
      action: 'Explorar',
      route: '/app/contents',
      queryParams: { tipo: 'Jindungo' },
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Podcasts',
      text: 'Entrevistas e debates narrados por vozes experientes.',
      action: 'Explorar',
      route: '/app/contents',
      queryParams: { tipo: 'Podcast' },
      image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=900&q=80',
    },
  ];

  readonly podcasts = [
    {
      title: 'Ep. 42: O Boom do Petr\u00f3leo e o Futuro',
      duration: '45 min',
      visual: 'mic',
      displayTitle: 'Ep. 42: O Boom do Petr\u00f3leo e o Futuro',
    },
    {
      title: 'Ep. 41: Mem\u00f3rias da Rota do Sul',
      duration: '38 min',
      visual: 'radio',
      displayTitle: 'Ep. 41: Mem\u00f3rias da Rota do Sul',
    },
    {
      title: 'Ep. 40: Entrevista com a Reitora do ISPTEC',
      duration: '52 min',
      visual: 'wave',
      displayTitle: 'Ep. 40: Entrevista com a Reitora do ISPTEC',
    },
  ];

  readonly forumHighlights = [
    {
      title: 'O Impacto da Diversifica\u00e7\u00e3o Econ\u00f3mica no Kwanza',
      meta: 'Iniciado por Dr. Manuel dos Santos - h\u00e1 2 horas',
      comments: '45',
      views: '1.2k',
    },
    {
      title: 'Arqueologia Industrial no Sul de Angola',
      meta: 'Iniciado por Prof.\u00aa Ana Paula - h\u00e1 5 horas',
      comments: '12',
      views: '300',
    },
  ];

  readonly forumChannels = [
    { icon: 'public', label: 'F\u00f3rum Aberto: Atualidade' },
    { icon: 'lock', label: 'Grupo de Investiga\u00e7\u00e3o: ISPTEC' },
    { icon: 'groups', label: 'Semin\u00e1rio de Pos-Gradua\u00e7\u00e3o' },
  ];

  readonly podcastMeterBars = [
    { height: '10px' },
    { height: '16px' },
    { height: '8px' },
    { height: '20px' },
  ];

  readonly institutionalPoints = [
    {
      label: 'Missão',
      title: 'Preservar e explicar',
      text: 'Organizar a memória histórico-económica de Angola em conteúdos claros, verificáveis e úteis para estudantes, docentes e curiosos.',
    },
    {
      label: 'Visão',
      title: 'Ser uma referência nacional',
      text: 'Tornar-se uma biblioteca digital viva sobre a economia angolana, ligando investigação académica, dados e linguagem acessível.',
    },
    {
      label: 'Compromisso',
      title: 'Conhecimento com contexto',
      text: 'Valorizar fontes, cronologias e debate crítico para que cada tema seja compreendido dentro do seu tempo, território e impacto social.',
    },
  ];

  readonly faqs = [
    {
      question: 'Como posso aceder aos conteúdos Jindungo?',
      answer:
        'O acesso Jindungo é exclusivo para membros com subscrição ativa. Pode subscrever através da sua área de perfil e aceder a relatórios premium e análises profundas.',
    },
    {
      question: 'Qual é a metodologia académica utilizada?',
      answer:
        'Trabalhamos com curadoria editorial, revisão de conteúdos e fontes históricas documentadas, combinando arquivos, dados económicos e interpretação contextual.',
    },
    {
      question: 'Posso utilizar os conteúdos para fins académicos?',
      answer:
        'Sim. Incentivamos a utilização educativa, desde que a plataforma Economia com História: Angola seja devidamente citada conforme os termos de uso.',
    },
  ];

  ngAfterViewInit(): void {
    const revealTargets = Array.from(
      this.elementRef.nativeElement.querySelectorAll<HTMLElement>(
        'main > section, main > footer, section article, section details, section h2, section h3',
      ),
    );

    if (!('IntersectionObserver' in window)) {
      revealTargets.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    revealTargets.forEach((element, index) => {
      element.classList.add('scroll-reveal');
      element.classList.remove('is-visible');
      element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 70}ms`);
    });

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          } else {
            entry.target.classList.remove('is-visible');
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    );

    revealTargets.forEach((element) => this.revealObserver?.observe(element));
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
  }
}

@Component({
  selector: 'app-public-dashboard-page',
  standalone: true,
  templateUrl: './public-dashboard.page.html'
})
export class PublicDashboardPage {}

const redirectAuthenticatedToContents: CanActivateFn = () => {
  const auth = inject(AuthStateService);
  const router = inject(Router);

  return auth.isAuthenticated() ? router.createUrlTree(['/app/home']) : true;
};

export const HOME_ROUTES: Routes = [
  { path: '', canActivate: [redirectAuthenticatedToContents], component: LandingPage },
  { path: 'dashboard', redirectTo: '/app/home', pathMatch: 'full' },
];



