import { Routes } from '@angular/router';
import { ForgotPasswordPage } from '../pages/forgot-password/forgot-password.page';
import { LoginComponent } from '../pages/login/login.component';
import { RegisterPage } from '../pages/register/register.page';
import { ResetPasswordPage } from '../pages/reset-password/reset-password.page';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterPage },
  { path: 'forgot-password', component: ForgotPasswordPage },
  { path: 'reset-password', component: ResetPasswordPage },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
];
