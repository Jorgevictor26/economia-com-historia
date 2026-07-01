import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  @HostListener('document:click', ['$event'])
  closeOpenDetails(event: MouseEvent): void {
    const target = event.target as Node | null;

    document.querySelectorAll('details[open]').forEach((details) => {
      if (target && details.contains(target)) {
        return;
      }

      details.removeAttribute('open');
    });
  }
}
