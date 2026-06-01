import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admins`;

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
