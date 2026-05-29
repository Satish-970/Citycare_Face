import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Staff } from '../models/models';

@Injectable({ providedIn: 'root' })
export class StaffService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getAllStaff(): Observable<ApiResponse<Staff[]>> {
    return this.http.get<ApiResponse<Staff[]>>(`${this.base}/staff`);
  }
  getStaffByFacility(facilityId: number): Observable<ApiResponse<Staff[]>> {
    return this.http.get<ApiResponse<Staff[]>>(`${this.base}/staff/facility/${facilityId}`);
  }
  getStaffByRole(role: string): Observable<ApiResponse<Staff[]>> {
    return this.http.get<ApiResponse<Staff[]>>(`${this.base}/staff/role/${role}`);
  }
  createStaffRecord(body: { name: string; email: string; password: string; role: string; phone: string; facilityId: number }): Observable<ApiResponse<Staff>> {
    return this.http.post<ApiResponse<Staff>>(`${this.base}/staff`, body);
  }
  updateStaffStatus(id: number, status: string): Observable<ApiResponse<Staff>> {
    return this.http.patch<ApiResponse<Staff>>(`${this.base}/staff/${id}/status?status=${status}`, {});
  }
  deleteStaff(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/staff/${id}`);
  }
}
