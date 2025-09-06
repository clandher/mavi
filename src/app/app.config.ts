import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './core/jwt.interceptor';
import { fakeBackendInterceptor } from './core/fake.interceptor';
import { errorInterceptor } from '@app/core/interceptors/error.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

import { registerLocaleData } from '@angular/common';
import localeEsMX from '@angular/common/locales/es-MX';
registerLocaleData(localeEsMX);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        fakeBackendInterceptor,
        jwtInterceptor,
        errorInterceptor
      ])
    ),
    { provide: LOCALE_ID, useValue: 'es-MX' },
    provideAnimations(), // required animations providers
    provideToastr(), // Toastr providers
  ]
};
