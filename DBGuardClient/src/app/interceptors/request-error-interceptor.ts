import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

export const requestErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      messageService.add({severity: 'error', summary: 'Error', detail: error.message, key: 'request-error', sticky: true});
      return throwError(() => error);
    })
  );
};
