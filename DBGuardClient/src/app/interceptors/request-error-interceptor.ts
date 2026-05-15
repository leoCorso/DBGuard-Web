import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth-service';

export const requestErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorToShow = error.error?.message ? error.error.message : error.message;
      let errorString = errorToShow;
      messageService.add({severity: 'error', summary: `Error ${error.status}`, detail: errorString, key: 'request-error', sticky: true});
      return throwError(() => error);
    })
  );
};
