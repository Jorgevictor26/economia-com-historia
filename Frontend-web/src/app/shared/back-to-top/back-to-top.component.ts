import { AfterViewInit, Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-back-to-top',
  template: `
    <button
      type="button"
      aria-label="Voltar ao topo"
      class="back-to-top-button"
      [class.is-visible]="visible"
      (click)="scrollToTop()"
    >
      ↑
    </button>
  `,
})
export class BackToTopComponent implements AfterViewInit {
  visible = false;

  ngAfterViewInit(): void {
    this.updateVisibility();
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  updateVisibility(): void {
    const footer = document.querySelector<HTMLElement>('.landing-footer');
    if (!footer) {
      this.visible = false;
      return;
    }

    const footerTop = footer.getBoundingClientRect().top;
    this.visible = window.scrollY > 300 && footerTop <= window.innerHeight + 160;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
