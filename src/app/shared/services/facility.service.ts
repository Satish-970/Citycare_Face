import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Facility, Staff } from '../models/models';

@Injectable({ providedIn: 'root' })
export class FacilityService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getAllFacilities(): Observable<ApiResponse<Facility[]>> {
    return this.http.get<ApiResponse<Facility[]>>(`${this.base}/facilities`);
  }
  getFacilityById(id: number): Observable<ApiResponse<Facility>> {
    return this.http.get<ApiResponse<Facility>>(`${this.base}/facilities/${id}`);
  }
  createFacility(body: { name: string; type?: string; location: string; capacity?: number }): Observable<ApiResponse<Facility>> {
    return this.http.post<ApiResponse<Facility>>(`${this.base}/facilities`, body);
  }
  updateFacility(id: number, body: any): Observable<ApiResponse<Facility>> {
    return this.http.put<ApiResponse<Facility>>(`${this.base}/facilities/${id}`, body);
  }
  updateFacilityStatus(id: number, status: string): Observable<ApiResponse<Facility>> {
    return this.http.patch<ApiResponse<Facility>>(`${this.base}/facilities/${id}/status?status=${status}`, {});
  }
  getFacilityStaff(id: number): Observable<ApiResponse<Staff[]>> {
    return this.http.get<ApiResponse<Staff[]>>(`${this.base}/facilities/${id}/staff`);
  }
}
