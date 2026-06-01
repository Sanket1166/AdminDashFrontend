import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/api/admins';

  constructor(private http: HttpClient) {}

  getAdmins(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  updateAdmin(id: string, adminData: { fullName?: string; email?: string; password?: string }): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, adminData);
  }

  deleteAdmin(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
