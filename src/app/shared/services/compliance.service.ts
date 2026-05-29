import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, ComplianceRecord, Audit, AuditLog } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ComplianceService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getComplianceRecords(): Observable<ApiResponse<ComplianceRecord[]>> {
    return this.http.get<ApiResponse<ComplianceRecord[]>>(`${this.base}/compliance/records`);
  }

  createComplianceRecord(body: { entityId: number; type: string; result: string; notes?: string }): Observable<ApiResponse<ComplianceRecord>> {
    return this.http.post<ApiResponse<ComplianceRecord>>(`${this.base}/compliance/records`, body);
  }

  getAudits(): Observable<ApiResponse<Audit[]>> {
    return this.http.get<ApiResponse<Audit[]>>(`${this.base}/compliance/audits`);
  }

  createAudit(body: any): Observable<ApiResponse<Audit>> {
    return this.http.post<ApiResponse<Audit>>(`${this.base}/compliance/audits`, body);
  }

  updateAuditStatus(id: number, status: string, findings?: string): Observable<ApiResponse<Audit>> {
    const f = findings ? `&findings=${encodeURIComponent(findings)}` : '';
    return this.http.patch<ApiResponse<Audit>>(`${this.base}/compliance/audits/${id}/status?status=${status}${f}`, {});
  }

  getAuditLogs(): Observable<ApiResponse<AuditLog[]>> {
    return this.http.get<ApiResponse<AuditLog[]>>(`${this.base}/compliance/logs`);
  }

  getAuditLogsByUser(userId: number): Observable<ApiResponse<AuditLog[]>> {
    return this.http.get<ApiResponse<AuditLog[]>>(`${this.base}/compliance/logs/user/${userId}`);
  }
}
