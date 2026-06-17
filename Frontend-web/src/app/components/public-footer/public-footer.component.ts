import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-public-footer',
  imports: [RouterLink],
  template: `
    <footer class="landing-footer border-t border-[#d8c1c4]/50 bg-white pt-10">
      <div class="fluid-container">
        <div class="grid gap-8 pb-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_0.8fr_1fr]">
          <div>
            <h2 class="font-display text-[21px] font-bold text-[#40081a]">Economia com História: Angola</h2>
            <p class="mt-4 max-w-sm text-[14px] leading-6 text-[#534345]">
              Uma plataforma dedicada à preservação e disseminação do conhecimento histórico-económico angolano com rigor académico.
            </p>
            <div class="mt-5 flex flex-wrap gap-3">
              @for (social of socialLinks; track social) {
                <a href="#" class="grid size-9 place-items-center rounded-full bg-[#40081a]/5 text-[12px] font-bold text-[#40081a] transition hover:bg-[#40081a] hover:text-white" aria-label="Ligação social">{{ social[0].toUpperCase() }}</a>
              }
            </div>
          </div>

          <div>
            <h3 class="text-[12px] font-bold uppercase tracking-[0.14em] text-[#40081a]">Plataforma</h3>
            <ul class="mt-4 grid gap-3 text-[14px] text-[#5e5e5f]">
              <li><a routerLink="/" class="hover:text-[#40081a]">Missão</a></li>
              <li><a routerLink="/" class="hover:text-[#40081a]">Visão</a></li>
              <li><a routerLink="/app/contents" class="hover:text-[#40081a]">Equipa Académica</a></li>
              <li><a routerLink="/app/quizzes" class="hover:text-[#40081a]">Quizzes</a></li>
            </ul>
          </div>

          <div>
            <h3 class="text-[12px] font-bold uppercase tracking-[0.14em] text-[#40081a]">Suporte</h3>
            <ul class="mt-4 grid gap-3 text-[14px] text-[#5e5e5f]">
              <li><a routerLink="/" class="hover:text-[#40081a]">Contactos</a></li>
              <li><a routerLink="/" class="hover:text-[#40081a]">FAQ</a></li>
              <li><a routerLink="/" class="hover:text-[#40081a]">Termos de Uso</a></li>
              <li><a routerLink="/" class="hover:text-[#40081a]">Privacidade</a></li>
            </ul>
          </div>

          <div>
            <h3 class="text-[12px] font-bold uppercase tracking-[0.14em] text-[#40081a]">Institucional</h3>
            <p class="mt-4 text-[14px] italic leading-6 text-[#5e5e5f]">"Preservando o passado, construindo o futuro."</p>
            <div class="mt-4 rounded-[8px] bg-[#5c1e2f]/10 p-3">
              <p class="text-[12px] leading-5 text-[#40081a]">Projecto realizado em colaboração com instituições académicas nacionais.</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-start justify-between gap-3 border-t border-[#d8c1c4]/50 py-5 text-[12px] text-[#5e5e5f] sm:flex-row sm:items-center">
          <p>© 2026 Economia com História: Angola. Todos os direitos reservados.</p>
          <div class="flex flex-wrap gap-x-5 gap-y-2">
            <a routerLink="/" class="hover:text-[#40081a]">Mapa do Site</a>
            <a routerLink="/" class="hover:text-[#40081a]">Acessibilidade</a>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class PublicFooterComponent {
  readonly socialLinks = ['share', 'language', 'mail'];
}
