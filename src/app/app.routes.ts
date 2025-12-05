import { Routes } from '@angular/router';
import { HomeLogin } from './auth/pages/home-login/home-login';

export const APP_ROUTES: Routes = [
  { path: '', redirectTo: 'home/main-page', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.routes').then(m => m.REGISTER_ROUTES),
  },
  {
    path: 'carteira',
    loadChildren: () => import('./carteira/carteira.routes').then(m => m.CARTEIRA_ROUTES),
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.routes').then(m => m.HOME_ROUTES),
  },
  {
  path: 'verification',
  loadChildren: () => import('./verification/verification.routes').then(m => m.VERIFICATION_ROUTES),
  },
  {
    path: 'notifications', 
    loadChildren: () => import('./notification/notification.routes').then(m => m.NOTIFICATION_ROUTES),
  },

  { path: '**', redirectTo: '' },
];