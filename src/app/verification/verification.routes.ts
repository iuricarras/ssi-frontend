import { Routes } from '@angular/router';
import { VerificationComponent } from './components/verification';
export const VERIFICATION_ROUTES: Routes = [
  {
    path: ':id',
    component: VerificationComponent
  }
];
