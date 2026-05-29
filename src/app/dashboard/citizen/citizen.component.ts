import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CitizenService } from '../../shared/services/citizen.service';
import { EmergencyService } from '../../shared/services/emergency.service';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { CitizenDocument, Emergency } from '../../shared/models/models';

@Component({
  selector: 'app-citizen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './citizen.html',
  styleUrl: './citizen.css'
})
export class CitizenComponent implements OnInit {
  private citizenService = inject(CitizenService);
  private emergencyService = inject(EmergencyService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  user = this.auth.getUser();
  emergencies = signal<Emergency[]>([]);
  healthTips = signal<any[]>([
    { id: 1, title: 'Stay Hydrated', message: 'Drink at least 8 glasses of water daily for optimal health.', icon: 'droplet-fill', color: 'text-info' },
    { id: 2, title: 'Regular Exercise', message: 'Aim for 30 minutes of physical activity 5 days a week.', icon: 'heart-pulse-fill', color: 'text-danger' },
    { id: 3, title: 'Balanced Diet', message: 'Include fruits, vegetables, and whole grains in your meals.', icon: 'apple', color: 'text-success' },
    { id: 4, title: 'Quality Sleep', message: 'Get 7-9 hours of sleep each night for better recovery.', icon: 'moon-stars-fill', color: 'text-primary' },
    { id: 5, title: 'Mental Wellness', message: 'Practice meditation or deep breathing for stress relief.', icon: 'brain', color: 'text-warning' }
  ]);
  documents = signal<CitizenDocument[]>([]);
  loading = signal(false);
  showModal = signal(false);
  submitting = signal(false);
  uploadingDocument = signal(false);
  selectedDocument: File | null = null;

  eForm = { type: '', location: '', description: '' };
  activeTab = signal<'active' | 'history'>('active');

  activeEmergencies = computed(() => this.emergencies().filter(e => e.status === 'REPORTED' || e.status === 'DISPATCHED'));
  historyEmergencies = computed(() => this.emergencies().filter(e => e.status === 'ADMITTED' || e.status === 'CLOSED'));
  displayedEmergencies = computed(() => this.activeTab() === 'active' ? this.activeEmergencies() : this.historyEmergencies());

  get activeCount() { return this.activeEmergencies().length; }

  isVerified = computed(() => this.documents().some(d => d.verificationStatus === 'VERIFIED'));

  citizenId = 0;

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      if (p['tab'] === 'history') this.activeTab.set('history');
    });
    this.citizenService.getCitizenProfile().subscribe(r => {
      if (r.success && r.data) {
        this.citizenId = r.data.citizenId;
        this.loadDocuments();
      }
    });
    this.loadEmergencies();
  }

  loadEmergencies() {
    this.loading.set(true);
    this.emergencyService.getMyEmergencies().subscribe({
      next: r => { this.loading.set(false); if (r.success) this.emergencies.set(r.data); },
      error: () => this.loading.set(false)
    });
  }



  openEmergencyModal() {
    if (!this.isVerified()) {
      this.toast.error('Admin must verify your document before you can report an emergency.');
      return;
    }
    this.eForm = { type: '', location: '', description: '' };
    this.showModal.set(true);
  }

  onDocumentSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSizeMB = 5;
    if (!allowedTypes.includes(file.type)) {
      this.toast.error('Invalid file type. Only JPG, PNG, and PDF are allowed.');
      input.value = '';
      this.selectedDocument = null;
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      this.toast.error(`File too large. Maximum allowed size is ${maxSizeMB}MB.`);
      input.value = '';
      this.selectedDocument = null;
      return;
    }
    this.selectedDocument = file;
  }

  uploadDocument() {
    if (!this.selectedDocument) { this.toast.error('Choose a document first.'); return; }
    if (!this.citizenId) { this.toast.error('Citizen profile not loaded.'); return; }
    this.uploadingDocument.set(true);
    this.citizenService.uploadCitizenDocument(this.citizenId, this.selectedDocument).subscribe({
      next: r => {
        this.uploadingDocument.set(false);
        if (r.success) {
          this.toast.success('Document uploaded for admin review.');
          this.selectedDocument = null;
          this.loadDocuments();
        }
      },
      error: () => { this.uploadingDocument.set(false); this.toast.error('Failed to upload document.'); }
    });
  }

  submitEmergency() {
    if (!this.isVerified()) { this.toast.error('Admin must verify your document before you can report an emergency.'); return; }
    if (!this.eForm.type || !this.eForm.location) { this.toast.error('Type and location are required.'); return; }
    this.submitting.set(true);
    this.emergencyService.reportEmergency(this.eForm).subscribe({
      next: r => {
        this.submitting.set(false);
        if (r.success) {
          this.toast.success('Emergency reported. Help is on the way!');
          this.showModal.set(false);
          this.loadEmergencies();
        }
      },
      error: () => { this.submitting.set(false); this.toast.error('Failed to report. Call 108 directly!'); }
    });
  }

  loadDocuments() {
    if (!this.citizenId) return;
    this.citizenService.getCitizenDocuments(this.citizenId).subscribe(r => {
      if (r.success) this.documents.set(r.data);
    });
  }

  statusClass(s: string) {
    return { 'badge-reported': s === 'REPORTED', 'badge-dispatched': s === 'DISPATCHED', 'badge-admitted': s === 'ADMITTED', 'badge-closed': s === 'CLOSED' };
  }
}
