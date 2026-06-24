import { Routes } from '@angular/router';
import { ForgotPasswordPage } from './forgot-password/forgot-password.page';
import { LoginComponent } from './login/login.component';
import { RegisterPage } from './register/register.page';
import { ResetPasswordPage } from './reset-password/reset-password.page';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterPage },
  { path: 'forgot-password', component: ForgotPasswordPage },
  { path: 'reset-password/:token', component: ResetPasswordPage },
  { path: 'reset-password', component: ResetPasswordPage },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
];
