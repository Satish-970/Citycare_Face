import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Emergency, EmergencyRequest, Ambulance } from '../models/models';

@Injectable({ providedIn: 'root' })
export class EmergencyService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  reportEmergency(req: EmergencyRequest): Observable<ApiResponse<Emergency>> {
    return this.http.post<ApiResponse<Emergency>>(`${this.base}/emergencies/report`, req);
  }
  getMyEmergencies(): Observable<ApiResponse<Emergency[]>> {
    return this.http.get<ApiResponse<Emergency[]>>(`${this.base}/emergencies/my`);
  }
  getPendingEmergencies(): Observable<ApiResponse<Emergency[]>> {
    return this.http.get<ApiResponse<Emergency[]>>(`${this.base}/emergencies/pending`);
  }
  getDispatchedEmergencies(): Observable<ApiResponse<Emergency[]>> {
    return this.http.get<ApiResponse<Emergency[]>>(`${this.base}/emergencies/dispatched`);
  }
  getEmergencyById(id: number): Observable<ApiResponse<Emergency>> {
    return this.http.get<ApiResponse<Emergency>>(`${this.base}/emergencies/${id}`);
  }
  updateEmergencyStatus(id: number, status: string): Observable<ApiResponse<Emergency>> {
    return this.http.put<ApiResponse<Emergency>>(`${this.base}/emergencies/${id}/status?status=${status}`, {});
  }
  dispatchAmbulance(id: number, body: { ambulanceId: number }): Observable<ApiResponse<Emergency>> {
    return this.http.post<ApiResponse<Emergency>>(`${this.base}/emergencies/${id}/dispatch`, body);
  }
  releaseAmbulance(emergencyId: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.base}/emergencies/${emergencyId}/release-ambulance`, {});
  }
  getAvailableAmbulances(): Observable<ApiResponse<Ambulance[]>> {
    return this.http.get<ApiResponse<Ambulance[]>>(`${this.base}/emergencies/ambulances/available`);
  }
  getAllAmbulances(): Observable<ApiResponse<Ambulance[]>> {
    return this.http.get<ApiResponse<Ambulance[]>>(`${this.base}/emergencies/admin/ambulances`);
  }
  addAmbulance(body: { vehicleNumber: string; model: string }): Observable<ApiResponse<Ambulance>> {
    return this.http.post<ApiResponse<Ambulance>>(`${this.base}/emergencies/admin/ambulances`, body);
  }
  updateAmbulanceStatus(id: number, status: string): Observable<ApiResponse<Ambulance>> {
    return this.http.patch<ApiResponse<Ambulance>>(`${this.base}/emergencies/admin/ambulances/${id}/status?status=${status}`, {});
  }
}
