import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Patient, Treatment, Emergency } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getAllPatients(): Observable<ApiResponse<Patient[]>> {
    return this.http.get<ApiResponse<Patient[]>>(`${this.base}/patients`);
  }
  getPatientById(id: number): Observable<ApiResponse<Patient>> {
    return this.http.get<ApiResponse<Patient>>(`${this.base}/patients/${id}`);
  }
  getPatientsByStatus(status: string): Observable<ApiResponse<Patient[]>> {
    return this.http.get<ApiResponse<Patient[]>>(`${this.base}/patients/status/${status}`);
  }
  getActivePatients(): Observable<ApiResponse<Patient[]>> {
    return this.http.get<ApiResponse<Patient[]>>(`${this.base}/patients/active`);
  }
  getDischargedPatients(): Observable<ApiResponse<Patient[]>> {
    return this.http.get<ApiResponse<Patient[]>>(`${this.base}/patients/discharged`);
  }
  admitPatient(body: { citizenId: number; emergencyId: number; ward: string; notes: string }): Observable<ApiResponse<Patient>> {
    return this.http.post<ApiResponse<Patient>>(`${this.base}/patients/admit`, body);
  }
  updatePatientStatus(id: number, status: string): Observable<ApiResponse<Patient>> {
    return this.http.patch<ApiResponse<Patient>>(`${this.base}/patients/${id}/status?status=${status}`, {});
  }
  getPatientEmergency(id: number): Observable<ApiResponse<Emergency>> {
    return this.http.get<ApiResponse<Emergency>>(`${this.base}/patients/${id}/emergency`);
  }
  getTreatmentsForPatient(id: number): Observable<ApiResponse<Treatment[]>> {
    return this.http.get<ApiResponse<Treatment[]>>(`${this.base}/patients/${id}/treatments`);
  }
  addTreatment(body: { patientId: number; description: string; medicationName: string; dosage: string }): Observable<ApiResponse<Treatment>> {
    return this.http.post<ApiResponse<Treatment>>(`${this.base}/treatments`, body);
  }
  getAllTreatments(): Observable<ApiResponse<Treatment[]>> {
    return this.http.get<ApiResponse<Treatment[]>>(`${this.base}/treatments`);
  }
  updateTreatmentStatus(id: number, status: 'ONGOING' | 'COMPLETED' | 'CANCELLED'): Observable<ApiResponse<Treatment>> {
    return this.http.patch<ApiResponse<Treatment>>(`${this.base}/treatments/${id}/${status}`, null);
  }
  getTreatmentsByDoctor(doctorId: number): Observable<ApiResponse<Treatment[]>> {
    return this.http.get<ApiResponse<Treatment[]>>(`${this.base}/treatments/assigned-by/${doctorId}`);
  }
}
