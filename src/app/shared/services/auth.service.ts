import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, UserProfile } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  register(req: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.base}/api/auth/register`, req);
  }

  login(req: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.base}/api/auth/login`, req).pipe(
      tap(res => {
        if (res.success && res.data) {
          sessionStorage.setItem('citycare_token', res.data.token);
          sessionStorage.setItem('citycare_user',  JSON.stringify(res.data));
        }
      })
    );
  }

 

  logout() {
    sessionStorage.removeItem('citycare_token');
    sessionStorage.removeItem('citycare_user');
    this.router.navigate(['/login']);
  }

  getToken(): string | null { return sessionStorage.getItem('citycare_token'); }
  getRole(): string | null  { return this.getUser()?.role || null; }
  getUserId(): number       { return this.getUser()?.userId || 0; }
  getUser(): AuthResponse | null {
    const u = sessionStorage.getItem('citycare_user');
    return u ? JSON.parse(u) : null;
  }
  isLoggedIn(): boolean { return !!this.getToken(); }

  // Admin — user management
  getAllUsers(): Observable<ApiResponse<UserProfile[]>> {
    return this.http.get<ApiResponse<UserProfile[]>>(`${this.base}/api/admin/users`);
  }
  getUserById(id: number): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.base}/api/admin/users/${id}`);
  }
  activateUser(id: number): Observable<ApiResponse<UserProfile>> {
    return this.http.patch<ApiResponse<UserProfile>>(`${this.base}/api/admin/users/${id}/activate`, {});
  }
  deactivateUser(id: number): Observable<ApiResponse<UserProfile>> {
    return this.http.patch<ApiResponse<UserProfile>>(`${this.base}/api/admin/users/${id}/deactivate`, {});
  }
  // Admin — create staff login accounts
  createStaffUser(body: { name: string; email: string; password: string; phone: string; role: string }): Observable<ApiResponse<UserProfile>> {
    const roleMap: Record<string, string> = {
      DOCTOR: '/api/admin/staff', NURSE: '/api/admin/staff',
      DISPATCHER: '/api/admin/dispatchers',
      COMPLIANCE_OFFICER: '/api/admin/compliance-officers',
      CITY_HEALTH_OFFICER: '/api/admin/health-officers'
    };
    const path = roleMap[body.role] || '/api/admin/staff';
    return this.http.post<ApiResponse<UserProfile>>(`${this.base}${path}`, body);
  }
  getAdminStaff(): Observable<ApiResponse<UserProfile[]>> {
    return this.http.get<ApiResponse<UserProfile[]>>(`${this.base}/api/admin/staff`);
  }
  getAdminDispatchers(): Observable<ApiResponse<UserProfile[]>> {
    return this.http.get<ApiResponse<UserProfile[]>>(`${this.base}/api/admin/dispatchers`);
  }

  updateOwnProfile(userId: number, body: { name: string; contactInfo: string }): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.base}/api/users/${userId}/profile`, body);
  }

  redirectByRole() {
    const role = this.getRole();
    const routes: Record<string, string> = {
      CITIZEN:             '/dashboard/citizen',
      DOCTOR:              '/dashboard/doctor',
      NURSE:               '/dashboard/doctor',
      DISPATCHER:          '/dashboard/dispatcher',
      ADMIN:               '/dashboard/admin',
      COMPLIANCE_OFFICER:  '/dashboard/compliance',
      CITY_HEALTH_OFFICER: '/dashboard/compliance',
    };
    this.router.navigate([routes[role || ''] || '/login']);
  }
}
