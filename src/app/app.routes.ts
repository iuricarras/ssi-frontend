import { Routes } from '@angular/router';
import { HomeLogin } from './auth/components/home-login/home-login';

export const APP_ROUTES: Routes = [
  { path: '', component: HomeLogin },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
