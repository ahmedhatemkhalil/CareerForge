import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../interfaces/admin.interface';

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
}

