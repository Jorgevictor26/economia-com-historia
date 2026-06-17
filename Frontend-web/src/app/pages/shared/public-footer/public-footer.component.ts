import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-public-footer',
  imports: [RouterLink],
  templateUrl: './public-footer.component.html'
})
export class PublicFooterComponent {
  readonly socialLinks = ['share', 'language', 'mail'];
}
