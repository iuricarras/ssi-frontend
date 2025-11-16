import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, catchError, switchMap, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class RefreshInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authService = inject(AuthService);

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Se não for 401 → repassa o erro
        if (error.status !== 401 || this.isRefreshing) {
          return throwError(() => error);
        }
        this.isRefreshing = true;
        return authService.refresh().pipe(
          switchMap(() => {
            this.isRefreshing = false;
            return next.handle(req);
          }),
          catchError((refreshError) => {
            this.isRefreshing = false;
            return throwError(() => refreshError);
          })
        );
      })
    );
  }
}
