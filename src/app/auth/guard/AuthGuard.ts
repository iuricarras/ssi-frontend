import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';


/**
 * authGuard
 * Função de guarda de rota (CanActivateFn).
 * É executada sempre que o utilizador tenta aceder a uma rota protegida.
 * Verifica se o utilizador está autenticado através do AuthService.
 * Se estiver autenticado, permite o acesso (retorna true).
 * Se não estiver autenticado ou ocorrer erro, redireciona para /auth/home-login e bloqueia o acesso.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.me().pipe(
    map(() => true),
    catchError(() => {
      router.navigateByUrl('/auth/home-login');
      return of(false);
    })
  );
};
