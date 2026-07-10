import { ApplicationConfig } from '@angular/core'; // تأكدي من وجود هذا السطر بالكامل في الأعلى
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient , withInterceptors } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { authInterceptor } from './auth/auth.interceptor';
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
provideHttpClient(withInterceptors([authInterceptor])),
    provideToastr({ timeOut: 3000, positionClass: 'toast-top-right' }),
    provideAnimations(),
  ]
};
