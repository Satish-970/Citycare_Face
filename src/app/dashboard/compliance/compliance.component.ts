import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ComplianceService } from '../../shared/services/compliance.service';
import { FacilityService } from '../../shared/services/facility.service';
import { PatientService } from '../../shared/services/patient.service';
import { EmergencyService } from '../../shared/services/emergency.service';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { ComplianceRecord, Audit, AuditLog, Facility, Patient, Emergency } from '../../shared/models/models';

@Component({
  selector: 'app-compliance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compliance.html',
  styleUrl: './compliance.css'
})
export class ComplianceComponent implements OnInit {
  private complianceService = inject(ComplianceService);
  private facilityService = inject(FacilityService);
  private patientService = inject(PatientService);
  private emergencyService = inject(EmergencyService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  tab            = signal<'records'|'audits'|'logs'>('records');
  records        = signal<ComplianceRecord[]>([]);
  audits         = signal<Audit[]>([]);
  logs           = signal<AuditLog[]>([]);
  loading        = signal(false);
  submitting     = signal(false);
  showRecModal   = signal(false);
  showAuditModal = signal(false);
  completeTarget = signal<Audit | null>(null);
  findings       = '';
  expandedNotes  = signal<Set<number>>(new Set<number>());
  expandedAudits = signal<Set<number>>(new Set<number>());

  facilities  = signal<Facility[]>([]);
  patients    = signal<Patient[]>([]);
  emergencies = signal<Emergency[]>([]);

  today = new Date().toISOString().split('T')[0];
  maxdate='';

  rForm     = { entityId: 0, type: '', result: '', notes: '' };
  auditForm = { scope: '', date: this.today, findings: '' };

  ngOnInit() {
    this.calculateMaxDate();
    this.route.queryParams.subscribe(p => {
      if (p['tab']) {
        this.tab.set(p['tab'] as 'records'|'audits'|'logs');
        if (p['tab'] === 'logs') {
          this.loadLogs();
        } else {
          this.loadAll();
        }
      } else {
        this.loadAll();
      }
    });
  }

  calculateMaxDate() {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    this.maxdate = date.toISOString().split('T')[0];
  }
loadAll() {
  this.loading.set(true);

  // 1. Load and Sort Compliance Records (Newest First)
  this.complianceService.getComplianceRecords().subscribe({
    next: r => { 
      if (r.success) {
        // Sort by createdAt date descending
        const sortedRecords = r.data.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.records.set(sortedRecords); 
      }
    },
    error: () => this.toast.error('Failed to load compliance records.')
  });
  
  // 2. Load and Sort Audits (Newest First)
  this.complianceService.getAudits().subscribe({
    next: r => { 
      if (r.success) {
        // Sort by date descending
        const sortedAudits = r.data.sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.audits.set(sortedAudits);
      }
      this.loading.set(false); 
    },
    error: () => { 
      this.loading.set(false); 
      this.toast.error('Failed to load audits.'); 
    }
  });
}

  onEntityTypeChange() {
    this.rForm.entityId = 0;
    if (this.rForm.type === 'FACILITY') this.loadFacilities();
    else if (this.rForm.type === 'PATIENT') this.loadPatients();
    else if (this.rForm.type === 'EMERGENCY') this.loadEmergencies();
  }

  loadFacilities() {
    this.facilityService.getAllFacilities().subscribe({
      next: r => { if (r.success) this.facilities.set(r.data); },
      error: () => { this.toast.error('Failed to load facilities.'); }
    });
  }

  loadPatients() {
    this.patientService.getAllPatients().subscribe({
      next: r => { if (r.success) this.patients.set(r.data); },
      error: () => { this.toast.error('Failed to load patients.'); }
    });
  }

  loadEmergencies() {
    this.emergencyService.getPendingEmergencies().subscribe({
      next: r => { if (r.success) this.emergencies.set(r.data); },
      error: () => { this.toast.error('Failed to load emergencies.'); }
    });
  }

  loadLogs() {
    this.complianceService.getAuditLogs().subscribe({
      next: r => { if (r.success) this.logs.set(r.data); },
      error: () => { this.toast.error('Failed to load audit logs.'); }
    });
  }

  createRecord() {
    const entityId = Number(this.rForm.entityId);
    if (!entityId || !this.rForm.type || !this.rForm.result) {
      this.toast.error('Fill all required fields.'); return;
    }
    if (this.rForm.notes && this.rForm.notes.length > 350) {
      this.toast.error('Notes must be at most 350 characters.'); return;
    }
    const token = this.auth.getToken();
    if (!token) {
      this.toast.error('Session expired. Please login again.');
      this.auth.logout(); return;
    }
    this.submitting.set(true);
    const payload: any = { entityId, type: this.rForm.type, result: this.rForm.result };
    if (this.rForm.notes) payload['notes'] = this.rForm.notes;
    this.complianceService.createComplianceRecord(payload).subscribe({
      next: r => {
        this.submitting.set(false);
        if (r.success) { this.toast.success('Record created.'); this.showRecModal.set(false); this.rForm = { entityId:0, type:'', result:'', notes:'' }; this.loadAll(); }
        else { this.toast.error(r.message || 'Failed.'); }
      },
      error: (err) => {
        this.submitting.set(false);
        if (err.status === 401) { this.toast.error('Session expired.'); this.auth.logout(); }
        else { this.toast.error('Failed to create record.'); }
      }
    });
  }

  createAudit() {
    const selectedDate = this.auditForm.date;
  if (selectedDate < this.today || selectedDate > this.maxdate) {
    this.toast.error('Please select a date between today and the next 30 days.');
    return;
  }
  
  if (!this.auditForm.scope || !this.auditForm.date) { 
    this.toast.error('Scope and date are required.'); 
    return; 
  }
    if (!this.auditForm.scope || !this.auditForm.date) { this.toast.error('Scope and date are required.'); return; }
    if (this.auditForm.findings && this.auditForm.findings.length > 350) {
      this.toast.error('Findings must be at most 350 characters.'); return;
    }
    this.submitting.set(true);
    const payload: any = { scope: this.auditForm.scope, date: this.auditForm.date };
    if (this.auditForm.findings) payload['findings'] = this.auditForm.findings;
    this.complianceService.createAudit(payload).subscribe({
      next: r => {
        this.submitting.set(false);
        if (r.success) { this.toast.success('Audit created.'); this.showAuditModal.set(false); this.auditForm = { scope:'', date: this.today, findings:'' }; this.loadAll(); }
        else { this.toast.error(r.message || 'Failed.'); }
      },
      error: (err) => { this.submitting.set(false); this.toast.error(err?.error?.message || 'Failed to create audit.'); }
    });
  }

  openComplete(a: Audit) { this.completeTarget.set(a); this.findings = ''; }

  doCompleteAudit() {
    const a = this.completeTarget();
    if (!a) return;
    if (this.findings && this.findings.length > 350) {
      this.toast.error('Findings must be at most 350 characters.'); return;
    }
    this.submitting.set(true);
    this.complianceService.updateAuditStatus(a.auditId, 'COMPLETED', this.findings).subscribe({
      next: r => { this.submitting.set(false); if (r.success) { this.toast.success('Audit completed.'); this.completeTarget.set(null); this.loadAll(); } else { this.toast.error(r.message || 'Failed.'); } },
      error: () => { this.submitting.set(false); this.toast.error('Failed to complete audit.'); }
    });
  }

  cancelAudit(auditId: number) {
    if (!confirm('Are you sure you want to cancel this audit?')) return;
    
    this.complianceService.updateAuditStatus(auditId, 'CANCELLED', 'Audit cancelled by user').subscribe({
      next: r => {
        if (r.success) {
          this.toast.success('Audit cancelled successfully.');
          this.loadAll();
        } else {
          this.toast.error(r.message || 'Failed to cancel audit.');
        }
      },
      error: () => {
        this.toast.error('Failed to cancel audit.');
      }
    });
  }

  startAudit(auditId: number) {
    this.complianceService.updateAuditStatus(auditId, 'IN_PROGRESS', 'Audit started').subscribe({
      next: r => {
        if (r.success) {
          this.toast.success('Audit started.');
          this.loadAll();
        } else {
          this.toast.error(r.message || 'Failed to start audit.');
        }
      },
      error: () => {
        this.toast.error('Failed to start audit.');
      }
    });
  }

  auditStatusClass(s: string) {
    return { 'badge-active': s==='COMPLETED', 'badge-dispatched': s==='IN_PROGRESS', 'badge-reported': s==='SCHEDULED', 'badge-inactive': s==='CANCELLED' };
  }

  toggleNote(id: number) {
    this.expandedNotes.update(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  toggleAudit(id: number) {
    this.expandedAudits.update(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
}
