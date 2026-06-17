import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileUser } from '../../../../../models/profile.model';

@Component({
  selector: 'app-profile-header',
  imports: [RouterLink],
  templateUrl: './profile-header.component.html',
  styleUrl: './profile-header.component.scss',
})
export class ProfileHeaderComponent {
  readonly user = input.required<ProfileUser>();
}


