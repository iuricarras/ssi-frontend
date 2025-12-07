import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';


/**
 * refreshInterceptor
 * Interceptor HTTP responsável por gerir erros de autenticação (401 Unauthorized).
 * É chamado em cada requisição HTTP da aplicação.
 * Se a requisição for para /auth/refresh, deixa passar sem alterações (evita loop infinito ao tentar refrescar o token).
 * Para outras requisições:
 *   - Se ocorrer erro diferente de 401, propaga o erro normalmente.
 *   - Se o erro for 401 (token expirado ou inválido):
 *     - Chama authService.refresh() para tentar renovar o token.
 *     - Se o refresh for bem-sucedido, repete a requisição original.
 *     - Se o refresh falhar, propaga o erro de refresh.
 */
export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (req.url.includes('/auth/refresh')) {
    return next(req);
  }
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }
      return authService.refresh().pipe(
        switchMap(() => {
          return next(req);
        }),
        catchError((refreshError) => {
          return throwError(() => refreshError);
        })
      );
    })
  );
};
