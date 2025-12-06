import { Routes } from '@angular/router';
import { PedidosComponent } from './components/pedidos/pedidos';
import { VerificationComponent } from './components/id/verification';


/**
 * VERIFICATION_ROUTES
 * Conjunto de rotas responsáveis pela gestão de verificações.
 * Define caminhos para listar todos os pedidos e visualizar detalhes de uma verificação específica.
 */
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
