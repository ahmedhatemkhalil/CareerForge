import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RevenueStats, Transaction, User } from '../interfaces/admin.interface';

@Injectable({ providedIn: 'root' })
export class AdminService {

  private apiUrl = 'http://localhost:5000/api/admin';

  constructor(private http: HttpClient) {}

getDashboardStats() {
  return this.http.get(`${this.apiUrl}/stats/dashboard`);
}

getUserActivityReport() {
  return this.http.get(`${this.apiUrl}/users/activity-report`);
}

  getUsers(): Observable<any[]> { return this.http.get<any[]>(`${this.apiUrl}/users`); }
  getAnalyses(): Observable<any> { return this.http.get(`${this.apiUrl}/analyses`); }
  getInterviews(): Observable<any> { return this.http.get(`${this.apiUrl}/interviews`); }
  getRoadmaps(): Observable<any> { return this.http.get(`${this.apiUrl}/roadmaps`); }
  getDashboardReport(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard-report`);
}

  // دوال الإدارة
  updateUserStatus(id: string, status: string, role: string, banReason: string | null = null): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}/ban`, { status, role, ban_reason: banReason });
  }

  deleteUser(id: string): Observable<any> { return this.http.delete(`${this.apiUrl}/users/${id}`); }

// في admin.service.ts
getRevenueStats(): Observable<RevenueStats> {
  return this.http.get<RevenueStats>(`http://localhost:5000/api/admin/revenue-stats`);
}

getAllTransactions(): Observable<Transaction[]> {
  return this.http.get<Transaction[]>(`http://localhost:5000/api/payments/all-transactions`);
}


// في admin.service.ts
private getHeaders() {
  const token = localStorage.getItem('token');
  return { 'Authorization': `Bearer ${token}` };
}

getAllPayments(): Observable<any[]> {
  return this.http.get<any[]>(`http://localhost:5000/api/payments`, { headers: this.getHeaders() });
}

getAllUsers(): Observable<any[]> {
  return this.http.get<any[]>(`http://localhost:5000/api/admin/users`, { headers: this.getHeaders() });
}

getStats(): Observable<any> {
  return this.http.get(`http://localhost:5000/api/payments/stats`);
}

updatePlan(planName: string, limits: any): Observable<any> {
  return this.http.put(`http://localhost:5000/api/plans/${planName}`, { limits });
}

getPlans(): Observable<any> {
  return this.http.get(`http://localhost:5000/api/plans`);
}

}


