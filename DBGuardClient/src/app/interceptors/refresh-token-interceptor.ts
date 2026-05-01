import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { catchError, switchMap, throwError } from 'rxjs';

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return authService.refreshToken().pipe(
          switchMap(authResponse => {
            if(authResponse.success){
              const requestRetry = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${authService.getAccessToken()}`
                }
              });
              return next(requestRetry);
            }
            else {
              authService.logout().subscribe();
              return throwError(() => error);
            }
            }),
            catchError((refreshError: HttpErrorResponse) => {
              return throwError(() => refreshError);
            })
        );
      }
      return throwError(() => error);
    })
  );
};
