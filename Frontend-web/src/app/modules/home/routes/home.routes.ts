import { AfterViewInit, Component, ElementRef, OnDestroy, inject } from '@angular/core';
import { CanActivateFn, Router, RouterLink, Routes } from '@angular/router';
import { AuthStateService } from '../../../services/auth-state.service';
import { BackToTopComponent } from '../../../shared/back-to-top/back-to-top.component';
import { PublicFooterComponent } from '../../../shared/public-footer/public-footer.component';
import { PublicNavbarComponent } from '../../../shared/public-navbar/public-navbar.component';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, PublicNavbarComponent, PublicFooterComponent, BackToTopComponent],
  template: `
    <main class="landing-redesign min-h-dvh bg-[#f8f9fa] font-sans text-[#191c1d]">
      <app-public-navbar />

      <section class="relative flex min-h-[85vh] items-center overflow-hidden pt-24">
        <div class="absolute inset-0">
          <img
            src="/assets/bna-hero.jpg"
            alt="Fachada do Banco Nacional de Angola em Luanda"
            class="landing-hero-image h-full w-full object-cover object-[58%_center] sm:object-[62%_center] xl:object-center"
          />
          <div class="absolute inset-0 bg-[linear-gradient(90deg,#f8f9fa_0%,rgba(248,249,250,0.9)_38%,rgba(248,249,250,0.36)_72%,transparent_100%)]"></div>
        </div>

        <div class="fluid-container relative z-10 py-16">
          <div class="max-w-[720px]">
            <p class="mb-5 text-[12px] font-bold uppercase tracking-[0.16em] text-[#735c00]">Economia com História: Angola</p>
            <h1 class="font-display text-[38px] font-extrabold leading-[1.04] text-[#40081a] sm:text-[48px] lg:text-[60px]">
              Onde o Passado Explica o Futuro
            </h1>
            <p class="mt-6 max-w-[620px] text-[17px] leading-8 text-[#534345]">
              Explore as raízes profundas da economia angolana. Uma jornada académica pela história, dados e políticas que moldaram a nossa nação.
            </p>
            <div class="mt-10 flex flex-wrap gap-4">
              <a routerLink="/app/contents" class="inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-[#40081a] px-7 text-[13px] font-bold text-white shadow-lg shadow-[#40081a]/15 transition hover:-translate-y-0.5 hover:shadow-xl">
                Explorar conteúdo <span aria-hidden="true">→</span>
              </a>
              <a routerLink="/auth/register" class="inline-flex min-h-12 items-center justify-center rounded-[8px] border border-[#40081a] px-7 text-[13px] font-bold text-[#40081a] transition hover:bg-[#40081a] hover:text-white">
                Criar conta
              </a>
            </div>
          </div>
        </div>
      </section>

      <section class="fluid-container py-20">
        <div class="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          @for (pillar of pillars; track pillar.title) {
            <article class="landing-card group overflow-hidden rounded-[8px] border border-[#d8c1c4]/60 bg-white transition duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div class="relative h-48 overflow-hidden bg-white">
                <img [src]="pillar.image" [alt]="pillar.title" class="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
              </div>
              <div class="p-6">
                <h3 class="font-display text-[24px] font-semibold text-[#40081a]">{{ pillar.title }}</h3>
                <p class="mt-3 min-h-[72px] text-[15px] leading-6 text-[#534345]">{{ pillar.text }}</p>
                <a [routerLink]="pillar.route" class="mt-4 inline-flex items-center gap-1 text-[13px] font-bold text-[#735c00] hover:underline">
                  {{ pillar.action }} <span aria-hidden="true">›</span>
                </a>
              </div>
            </article>
          }
        </div>
      </section>

      <section class="bg-white py-20">
        <div class="fluid-container">
          <div class="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 class="font-display text-[30px] font-semibold text-[#40081a]">Podcasts Académicos</h2>
              <p class="mt-3 text-[17px] text-[#5e5e5f]">Debates e análises profundas para ouvir em qualquer lugar.</p>
            </div>
            <a routerLink="/app/contents" class="inline-flex w-fit items-center gap-2 text-[13px] font-bold text-[#735c00] hover:underline">
              Ver todos os episódios <span aria-hidden="true">→</span>
            </a>
          </div>

          <div class="grid gap-8 md:grid-cols-3">
            @for (podcast of podcasts; track podcast.title) {
              <article class="group overflow-hidden rounded-[8px] border border-[#d8c1c4]/50 bg-white transition hover:shadow-xl">
                <div class="relative h-56 overflow-hidden bg-white">
                  <img [src]="podcast.image" [alt]="podcast.title" class="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                  <span class="absolute bottom-4 right-4 rounded-[4px] bg-[#40081a]/90 px-3 py-1 text-[12px] font-medium text-white backdrop-blur-sm">{{ podcast.duration }}</span>
                </div>
                <div class="p-6">
                  <h3 class="font-display text-[21px] font-semibold leading-7 text-[#40081a]">{{ podcast.title }}</h3>
                  <p class="mt-3 min-h-[48px] text-[15px] leading-6 text-[#534345]">{{ podcast.text }}</p>
                  <button type="button" class="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[#ffd9df] px-5 text-[13px] font-bold text-[#743141] transition hover:bg-[#40081a] hover:text-white">
                    <span aria-hidden="true">▶</span> Ouvir Agora
                  </button>
                </div>
              </article>
            }
          </div>
        </div>
      </section>

      <section class="bg-white py-20">
        <div class="fluid-container-narrow text-center">
          <h2 class="font-display text-[28px] font-semibold text-[#40081a] sm:text-[34px]">Rigor Académico e Preservação</h2>
          <p class="mt-7 text-[17px] leading-8 text-[#5e5e5f]">
            A nossa plataforma dedica-se à sistematização do conhecimento histórico-económico de Angola. Com curadoria de especialistas e académicos,
            transformamos dados brutos em narrativas de progresso, resiliência e identidade institucional.
          </p>
        </div>

        <div class="fluid-container mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (point of institutionalPoints; track point.title) {
            <article class="rounded-[8px] border border-[#d8c1c4]/55 bg-[#f8f9fa] p-5 text-left">
              <span class="text-[11px] font-bold uppercase tracking-[0.16em] text-[#735c00]">{{ point.label }}</span>
              <h3 class="mt-3 font-display text-[21px] font-semibold text-[#40081a]">{{ point.title }}</h3>
              <p class="mt-3 text-[15px] leading-6 text-[#534345]">{{ point.text }}</p>
            </article>
          }
        </div>
      </section>

      <section class="overflow-hidden bg-[#5c1e2f] py-20 text-[#d98496]">
        <div class="fluid-container flex flex-col items-center gap-16 lg:flex-row">
          <div class="space-y-8 lg:w-1/2">
            <span class="text-[12px] font-bold uppercase tracking-[0.18em] text-[#ffe088]">Gamificação Académica</span>
            <h2 class="font-display text-[38px] font-extrabold leading-tight text-white sm:text-[48px]">Domine o Conhecimento em Minutos</h2>
            <p class="text-[17px] leading-8 text-white/85">
              Teste o que aprendeu em cada lição. Ganhe insígnias de Historiador Sénior e Analista de Mercados enquanto sobe no ranking académico.
            </p>
            <div class="rounded-[8px] border border-[#ffb1c0]/20 bg-[#40081a]/35 p-4">
              <div class="flex items-center gap-4">
                <span class="grid size-12 place-items-center rounded-full bg-[#ffe088] text-[24px] text-[#4e3d00]">★</span>
                <div>
                  <strong class="block font-display text-[20px] text-white">Desafios Semanais</strong>
                  <span class="text-[15px] text-white/75">Novas questões baseadas nos factos da semana.</span>
                </div>
              </div>
            </div>
            <a routerLink="/app/quizzes" class="inline-flex min-h-12 items-center justify-center rounded-[999px] bg-[#cba72f] px-8 text-[15px] font-bold text-[#4e3d00] shadow-lg transition hover:scale-105">
              Jogar Agora
            </a>
          </div>

          <div class="relative lg:w-1/2">
            <article class="mx-auto max-w-sm rounded-[16px] border border-[#d8c1c4] bg-[#f8f9fa] p-8 text-[#191c1d] shadow-2xl">
              <div class="mb-8 flex items-center justify-between">
                <span class="text-[#40081a]">×</span>
                <div class="mx-4 h-2 flex-1 overflow-hidden rounded-full bg-[#e0dfdf]">
                  <span class="block h-full w-2/3 rounded-full bg-[#735c00]"></span>
                </div>
                <span class="font-bold text-[#735c00]">♥ 5</span>
              </div>
              <h3 class="font-display text-[22px] font-semibold text-[#40081a]">Qual foi o principal motor da economia do Reino do Kongo?</h3>
              <div class="mt-6 grid gap-3">
                <button type="button" class="rounded-[12px] border-2 border-[#857275] p-4 text-left text-[15px] transition hover:border-[#40081a]">Comércio de Sal e Marfim</button>
                <button type="button" class="rounded-[12px] border-2 border-[#40081a] bg-[#ffd9df] p-4 text-left text-[15px] text-[#3c0517]">Metalurgia e Agricultura</button>
                <button type="button" class="rounded-[12px] border-2 border-[#857275] p-4 text-left text-[15px] transition hover:border-[#40081a]">Indústria Têxtil</button>
              </div>
            </article>
            <span class="absolute -right-4 -top-8 grid size-20 rotate-12 place-items-center rounded-full bg-[#735c00] text-[34px] text-white shadow-xl">✦</span>
          </div>
        </div>
      </section>

      <section class="bg-[#f3f4f5] px-5 py-20 lg:px-10">
        <div class="fluid-container-narrow">
          <h2 class="text-center font-display text-[30px] font-extrabold text-[#40081a] sm:text-[34px]">Perguntas Frequentes</h2>
          <div class="mt-12 overflow-hidden rounded-[4px] border border-[#d8c1c4]/80 bg-white">
          @for (faq of faqs; track faq.question) {
            <details class="group border-b border-[#d8c1c4]/70 last:border-b-0">
              <summary class="flex min-h-[54px] cursor-pointer list-none items-center justify-between gap-6 px-5 py-4 text-[15px] font-medium text-[#40081a] transition hover:bg-[#fff6f8] group-open:bg-[#ffd9df] sm:px-7 sm:text-[16px] [&::-webkit-details-marker]:hidden">
                {{ faq.question }}
                <span class="text-[22px] leading-none text-[#40081a] transition group-open:rotate-180">⌄</span>
              </summary>
              <p class="px-5 pb-5 pt-1 text-[15px] leading-7 text-[#5e5e5f] sm:px-7">{{ faq.answer }}</p>
            </details>
          }
          </div>
        </div>
      </section>

      <section class="bg-[#e7e8e9] px-5 py-20 lg:px-10">
        <div class="fluid-container flex flex-col items-center justify-between gap-10 rounded-[16px] border border-[#d8c1c4]/70 bg-white py-8 md:flex-row md:py-12">
          <div class="max-w-md">
            <h2 class="font-display text-[30px] font-semibold text-[#40081a]">A Crónica Semanal</h2>
            <p class="mt-4 text-[16px] leading-7 text-[#5e5e5f]">Receba os destaques históricos e análises económicas diretamente no seu e-mail.</p>
          </div>
          <form class="flex w-full flex-col gap-4 sm:flex-row md:w-auto" (submit)="$event.preventDefault()">
            <input class="min-h-12 min-w-0 rounded-[8px] border border-[#d8c1c4] bg-[#f8f9fa] px-5 text-[15px] outline-none focus:border-[#40081a] sm:min-w-[300px]" placeholder="O seu e-mail" type="email" />
            <button class="min-h-12 rounded-[8px] bg-[#40081a] px-7 text-[13px] font-bold text-white transition hover:opacity-90" type="submit">Registar</button>
          </form>
        </div>
      </section>

      <app-public-footer />
      <app-back-to-top />
    </main>
  `,
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
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Economia',
      text: 'Análise rigorosa de fluxos, mercados e políticas de desenvolvimento nacional.',
      action: 'Explorar',
      route: '/app/contents',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Jindungo',
      text: 'Acesso a conteúdos exclusivos, relatórios detalhados e insights para subscritores.',
      action: 'Assinar',
      route: '/app/subscriptions',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Podcasts',
      text: 'Entrevistas e debates narrados por vozes experientes.',
      action: 'Ouvir',
      route: '/app/contents',
      image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=900&q=80',
    },
  ];

  readonly podcasts = [
    {
      title: 'As Rotas Comerciais do Reino do Kongo',
      text: 'Uma análise sobre como as trocas comerciais moldaram a diplomacia regional.',
      duration: '45 min',
      image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'A Evolução da Moeda em Angola',
      text: 'Do Zimbo ao Kwanza: uma jornada pela história numismática nacional.',
      duration: '38 min',
      image: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Desenvolvimento Industrial Pós-Independência',
      text: 'Os desafios e vitórias da industrialização angolana no século XX.',
      duration: '52 min',
      image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80',
    },
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
      element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 70}ms`);
    });

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.revealObserver?.unobserve(entry.target);
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
  selector: 'app-user-dashboard-page',
  template: `
    <section class="mx-auto max-w-6xl">
      <h1 class="text-3xl font-extrabold text-bordeaux">Dashboard do utilizador</h1>
      <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        @for (item of ['Conteúdos recentes', 'Quizzes', 'Fóruns', 'Podcasts', 'Textos com Jindungo']; track item) {
          <article class="rounded-lg bg-white p-5 shadow-sm">
            <h2 class="font-bold text-bordeaux">{{ item }}</h2>
            <p class="mt-2 text-sm text-black/60">Secção preparada para integração REST.</p>
          </article>
        }
      </div>
    </section>
  `,
})
export class UserDashboardPage {}

const redirectAuthenticatedToContents: CanActivateFn = () => {
  const auth = inject(AuthStateService);
  const router = inject(Router);

  return auth.isAuthenticated() ? router.createUrlTree(['/app/home']) : true;
};

export const HOME_ROUTES: Routes = [
  { path: '', canActivate: [redirectAuthenticatedToContents], component: LandingPage },
  { path: 'dashboard', redirectTo: '/app/home', pathMatch: 'full' },
];
