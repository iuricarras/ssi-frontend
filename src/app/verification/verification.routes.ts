import { Routes } from '@angular/router';
import { PedidosComponent } from './components/pedidos/pedidos';
import { VerificationComponent } from './components/id/verification';

export const VERIFICATION_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: 'pedidos', component: PedidosComponent },
      { path: ':id', component: VerificationComponent },
      { path: '**', redirectTo: 'pedidos' }
    ]
  }
];
