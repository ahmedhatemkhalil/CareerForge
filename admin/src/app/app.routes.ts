import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './modules/admin/pages/admin-dashboard/admin-dashboard.component'; 
export const routes: Routes = [
{ path: '', redirectTo: 'admin', pathMatch: 'full' },
{ path: 'admin', component: AdminDashboardComponent }
];
