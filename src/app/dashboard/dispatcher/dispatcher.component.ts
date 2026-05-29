import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmergencyService } from '../../shared/services/emergency.service';
import { CitizenService } from '../../shared/services/citizen.service';
import { ToastService } from '../../shared/services/toast.service';
import { Ambulance, CitizenProfile, Emergency } from '../../shared/models/models';

@Component({
  selector: 'app-dispatcher',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dispatcher.html',
  styleUrl: './dispatcher.css'
})
export class DispatcherComponent implements OnInit {
  private emergencyService = inject(EmergencyService);
  private citizenService   = inject(CitizenService);
  private toast = inject(ToastService);

  pending       = signal<Emergency[]>([]);
  dispatched    = signal<Emergency[]>([]);
  availableAmbs = signal<Ambulance[]>([]);
  citizens      = signal<CitizenProfile[]>([]);
  loading       = signal(false);
  showDispatch  = signal(false);
  submitting    = signal(false);
  dispatchTarget = signal<Emergency | null>(null);
  selectedAmbId: number | null = null;

  ngOnInit() { this.loadAll(); }

  loadAll() {
    this.loading.set(true);
    this.emergencyService.getPendingEmergencies().subscribe(r => { if (r.success) this.pending.set(r.data); this.loading.set(false); });
    this.emergencyService.getDispatchedEmergencies().subscribe(r => { if (r.success) this.dispatched.set(r.data); });
    this.emergencyService.getAvailableAmbulances().subscribe(r => { if (r.success) this.availableAmbs.set(r.data); });
    this.citizenService.getAllCitizens().subscribe(r => { if (r.success) this.citizens.set(r.data); });
  }

  citizenName(citizenId: number) {
    return this.citizens().find(c => c.citizenId === citizenId)?.name || `Citizen ${citizenId}`;
  }

  openDispatch(e: Emergency) { this.dispatchTarget.set(e); this.selectedAmbId = null; this.showDispatch.set(true); }

  confirmDispatch() {
    const e = this.dispatchTarget();
    if (!e || !this.selectedAmbId) return;
    this.submitting.set(true);
    this.emergencyService.dispatchAmbulance(e.emergencyId, { ambulanceId: this.selectedAmbId }).subscribe({
      next: r => {
        this.submitting.set(false);
        if (r.success) { this.toast.success('Ambulance dispatched!'); this.showDispatch.set(false); this.loadAll(); }
        else { this.toast.error(r.message || 'Dispatch failed.'); }
      },
      error: () => { this.submitting.set(false); this.toast.error('Dispatch failed.'); }
    });
  }

  updateStatus(id: number, status: string) {
    this.emergencyService.updateEmergencyStatus(id, status).subscribe(r => {
      if (r.success) { this.toast.success(`Status updated to ${status}`); this.loadAll(); }
    });
  }
}
