import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export function errorInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const toastr = inject(ToastrService);
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('ErrorInterceptor ejecutado', error);
      if (error.error && error.error.message) {
        toastr.error(error.error.message, 'Error', {
          // timeOut: 3000,
          extendedTimeOut: 5000
        });
      }
      return throwError(() => error);
    })
  );
}