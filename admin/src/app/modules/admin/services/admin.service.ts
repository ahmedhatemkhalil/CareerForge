import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RevenueStats, Transaction } from '../interfaces/admin.interface';

@Injectable({ providedIn: 'root' })
export class AdminService {

  private apiUrl = `${environment.apiUrl}/admin`;
  private paymentsUrl = `${environment.apiUrl}/payments`;
  private plansUrl = `${environment.apiUrl}/plans`;

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

  updateUserStatus(id: string, status: string, role: string, banReason: string | null = null): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}/ban`, { status, role, ban_reason: banReason });
  }

  deleteUser(id: string): Observable<any> { return this.http.delete(`${this.apiUrl}/users/${id}`); }

getRevenueStats(): Observable<RevenueStats> {
  return this.http.get<RevenueStats>(`${this.apiUrl}/revenue-stats`);
}

getAllTransactions(): Observable<Transaction[]> {
  return this.http.get<Transaction[]>(`${this.paymentsUrl}/all-transactions`);
}

private getHeaders() {
  const token = localStorage.getItem('accessToken');
  return { 'Authorization': `Bearer ${token}` };
}

getAllPayments(): Observable<any[]> {
  return this.http.get<any[]>(this.paymentsUrl, { headers: this.getHeaders() });
}

getAllUsers(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/users`, { headers: this.getHeaders() });
}

getStats(): Observable<any> {
  return this.http.get(`${this.paymentsUrl}/stats`);
}

updatePlan(planName: string, limits: any): Observable<any> {
  return this.http.put(`${this.plansUrl}/${planName}`, { limits });
}

getPlans(): Observable<any> {
  return this.http.get(this.plansUrl);
}

}
