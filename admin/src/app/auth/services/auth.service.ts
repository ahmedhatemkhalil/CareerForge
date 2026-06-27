import { Injectable, inject } from "@angular/core"; // 1. أضيفي inject
import { HttpClient } from "@angular/common/http";    // 2. أضيفي HttpClient
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5000/api/auth';

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/login`, credentials);
  }

 isAdmin(): boolean {
  const userString = localStorage.getItem('user');
  if (!userString) return false;

  try {
    const user = JSON.parse(userString);
return user.role?.toLowerCase() === 'admin';  } catch (e) {
    return false;
  }
}
}
