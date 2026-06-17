import { ApplicationConfig } from '@angular/core'; // تأكدي من وجود هذا السطر بالكامل في الأعلى
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
};