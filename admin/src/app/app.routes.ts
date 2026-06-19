import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './modules/admin/pages/admin-dashboard/admin-dashboard.component';
import { adminGuard } from './guards/admin.guard';
import { LoginComponent } from './auth/login/login.component';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [adminGuard]
  },
{ path: 'access-denied', component: AccessDeniedComponent },];
