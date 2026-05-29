import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, CitizenProfile, CitizenDocument } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CitizenService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getCitizenProfile(): Observable<ApiResponse<CitizenProfile>> {
    return this.http.get<ApiResponse<CitizenProfile>>(`${this.base}/api/citizens/profile`);
  }
  updateCitizenProfile(body: { name: string; dateOfBirth?: string; gender?: string; address?: string; contactInfo?: string }): Observable<ApiResponse<CitizenProfile>> {
    return this.http.put<ApiResponse<CitizenProfile>>(`${this.base}/api/citizens/profile`, body);
  }
  getAllCitizens(): Observable<ApiResponse<CitizenProfile[]>> {
    return this.http.get<ApiResponse<CitizenProfile[]>>(`${this.base}/api/citizens`);
  }
  getCitizenById(id: number): Observable<ApiResponse<CitizenProfile>> {
    return this.http.get<ApiResponse<CitizenProfile>>(`${this.base}/api/citizens/${id}`);
  }
  getCitizenDocuments(citizenId: number): Observable<ApiResponse<CitizenDocument[]>> {
    return this.http.get<ApiResponse<CitizenDocument[]>>(`${this.base}/api/citizens/${citizenId}/documents`);
  }
  uploadCitizenDocument(citizenId: number, file: File): Observable<ApiResponse<CitizenDocument>> {
    const body = new FormData();
    body.append('file', file);
    return this.http.post<ApiResponse<CitizenDocument>>(`${this.base}/api/citizens/${citizenId}/documents`, body);
  }
  verifyCitizenDocument(documentId: number, status: 'VERIFIED' | 'REJECTED'): Observable<ApiResponse<CitizenDocument>> {
    return this.http.patch<ApiResponse<CitizenDocument>>(`${this.base}/api/citizens/documents/${documentId}/verify?status=${status}`, {});
  }
  viewCitizenDocument(citizenId: number, docId: number): Observable<any> {
    return this.http.get<any>(`${this.base}/api/citizens/${citizenId}/documents`);
  }
}
