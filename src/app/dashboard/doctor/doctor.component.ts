import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../shared/services/patient.service';
import { CitizenService } from '../../shared/services/citizen.service';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { CitizenProfile, Patient, Treatment } from '../../shared/models/models';

@Component({
  selector: 'app-doctor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor.html',
  styleUrl: './doctor.css'
})
export class DoctorComponent implements OnInit {
  private patientService = inject(PatientService);
  private citizenService = inject(CitizenService);
  private auth  = inject(AuthService);
  private toast = inject(ToastService);

  patients          = signal<Patient[]>([]);
  citizens          = signal<CitizenProfile[]>([]);
  myTreatments      = signal<Treatment[]>([]);
  patientTreatments = signal<Treatment[]>([]);
  selectedPatient   = signal<Patient | null>(null);
  loading           = signal(false);
  submitting        = signal(false);

  tForm = { description: '', medicationName: '', dosage: '' };

  get criticalCount() { return this.patients().filter(p => p.status === 'UNDER_OBSERVATION').length; }
  get admittedCount()  { return this.patients().filter(p => p.status === 'ADMITTED').length; }

  ngOnInit() { this.loadAll(); }

  loadAll() {
    this.loading.set(true);
    this.patientService.getAllPatients().subscribe({
      next: r => {
        this.loading.set(false);
        if (r.success) {
          this.patients.set(r.data);
          const uniqueIds = [...new Set(r.data.map(p => p.citizenId))];
          uniqueIds.forEach(id => {
            this.citizenService.getCitizenById(id).subscribe(cr => {
              if (cr.success && cr.data) {
                this.citizens.update(list => {
                  if (list.find(c => c.citizenId === id)) return list;
                  return [...list, cr.data];
                });
              }
            });
          });
        }
      },
      error: () => this.loading.set(false)
    });
    this.patientService.getTreatmentsByDoctor(this.auth.getUserId()).subscribe(r => {
      if (r.success) this.myTreatments.set(r.data);
    });
  }

  citizenName(citizenId: number) {
    return this.citizens().find(c => c.citizenId === citizenId)?.name || `Citizen ${citizenId}`;
  }

  selectPatient(p: Patient) {
    this.selectedPatient.set(p);
    this.patientTreatments.set([]);
    this.tForm = { description: '', medicationName: '', dosage: '' };
    this.patientService.getTreatmentsForPatient(p.patientId).subscribe(r => {
      if (r.success) this.patientTreatments.set(r.data);
    });
  }

  addTreatment() {
    const p = this.selectedPatient();
    if (!p || !this.tForm.description || !this.tForm.medicationName) {
      this.toast.error('Description and medication are required.'); return;
    }
    this.submitting.set(true);
    this.patientService.addTreatment({ patientId: p.patientId, ...this.tForm }).subscribe({
      next: r => {
        this.submitting.set(false);
        if (r.success) {
          this.toast.success('Treatment added.');
          this.tForm = { description: '', medicationName: '', dosage: '' };
          this.selectPatient(p);
        } else { this.toast.error(r.message || 'Failed.'); }
      },
      error: () => { this.submitting.set(false); this.toast.error('Failed to add treatment.'); }
    });
  }

  updateTreatment(id: number, status: 'ONGOING'|'COMPLETED'|'CANCELLED') {
    this.patientService.updateTreatmentStatus(id, status).subscribe({
      next: r => {
        if (r.success) {
          this.toast.success(`Treatment ${status.toLowerCase()}.`);
          const p = this.selectedPatient();
          if (p) this.selectPatient(p);
        } else { this.toast.error(r.message || 'Failed.'); }
      },
      error: (err) => { this.toast.error(err?.error?.message || 'Failed to update treatment.'); }
    });
  }

  updateStatus(id: number, status: string) {
    this.patientService.updatePatientStatus(id, status).subscribe(r => {
      if (r.success) {
        this.toast.success(`Patient marked as ${status}.`);
        this.loadAll();
        this.selectedPatient.set(null);
      }
    });
  }

  statusClass(s: string) {
    return {
      'badge-reported':    s === 'UNDER_OBSERVATION',
      'badge-dispatched':  s === 'ADMITTED',
      'badge-admitted':    s === 'STABLE',
      'badge-closed':      s === 'DISCHARGED'
    };
  }
}
