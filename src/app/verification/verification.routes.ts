import { Routes } from '@angular/router';
import { PedidosComponent } from './components/pedidos/pedidos';
import { VerificationComponent } from './components/id/verification';
import { authGuard } from "../auth/guard/AuthGuard";


/**
 * VERIFICATION_ROUTES
 * Conjunto de rotas responsáveis pela gestão de verificações.
 * Define caminhos para listar todos os pedidos e visualizar detalhes de uma verificação específica.
 */
export const VERIFICATION_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: 'pedidos', component: PedidosComponent, canActivate: [authGuard] },
      { path: ':id', component: VerificationComponent, canActivate: [authGuard] },
      { path: '**', redirectTo: 'pedidos' }
    ]
  }
];
