import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

export const requestErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorToShow = error.error.message ? error.error.message : error.message;
      messageService.add({severity: 'error', summary: 'Error', detail: errorToShow, key: 'request-error', sticky: true});
      return throwError(() => error);
    })
  );
};
