import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../interfaces/admin.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:5000/api/admin';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  

updateUserStatus(id: string, status: string, role: string, banReason: string | null = null): Observable<any> {
  return this.http.put(`${this.apiUrl}/users/${id}/ban`, {
    status: status,
    role: role,
    ban_reason: banReason
  });
}
deleteUser(id: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/users/${id}`);
}
}
