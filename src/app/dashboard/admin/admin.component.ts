import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { FacilityService } from '../../shared/services/facility.service';
import { PatientService } from '../../shared/services/patient.service';
import { EmergencyService } from '../../shared/services/emergency.service';
import { StaffService } from '../../shared/services/staff.service';
import { CitizenService } from '../../shared/services/citizen.service';
import { CitizenDocument, CitizenProfile, Facility, Patient, Emergency, Ambulance, Staff, UserProfile } from '../../shared/models/models';

type Tab = 'overview'|'facilities'|'patients'|'ambulances'|'staff'|'users'|'documents';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  private authSvc      = inject(AuthService);
  private facilityService = inject(FacilityService);
  private patientService  = inject(PatientService);
  private emergencyService= inject(EmergencyService);
  private staffService    = inject(StaffService);
  private citizenService  = inject(CitizenService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  tabs = [
    { key:'overview' as Tab,    label:'Overview',    icon:'bi-grid-3x3-gap' },
    { key:'facilities' as Tab,  label:'Facilities',  icon:'bi-building' },
    { key:'patients' as Tab,    label:'Patients',    icon:'bi-people' },
    { key:'ambulances' as Tab,  label:'Ambulances',  icon:'bi-truck' },
    { key:'staff' as Tab,       label:'Staff',       icon:'bi-person-badge' },
    { key:'users' as Tab,       label:'Users',       icon:'bi-people-fill' },
    { key:'documents' as Tab,   label:'Documents',   icon:'bi-file-earmark-check' },
  ];

  activeTab     = signal<Tab>('overview');
  facilities    = signal<Facility[]>([]);
  patients      = signal<Patient[]>([]);
  emergencies   = signal<Emergency[]>([]);
  dispatched    = signal<Emergency[]>([]);
  ambulances    = signal<Ambulance[]>([]);
  staff         = signal<Staff[]>([]);
  users         = signal<UserProfile[]>([]);
  citizens      = signal<CitizenProfile[]>([]);
  documents     = signal<(CitizenDocument & { citizenId: number; citizenName: string })[]>([]);
  loading         = signal(false);
  submitting      = signal(false);
  showFacModal  = signal(false);
  showAdmitModal= signal(false);
  showAmbModal  = signal(false);
  showStaffModal= signal(false);
  showDocModal  = signal(false);
  admitTarget   = signal<Emergency | null>(null);
  docTarget     = signal<(CitizenDocument & { citizenId: number; citizenName: string }) | null>(null);

  fForm = { name:'', type:'', location:'', capacity: 0 };
  aForm     = { citizenId: 0, emergencyId: 0, ward: '', notes: '' };
  ambForm   = { vehicleNumber:'', model:'' };
  staffForm = { name:'', email:'', password:'', role:'DOCTOR', phone:'', facilityId: 0 };

  activePatients() {
    return this.patients()
      .filter(p => p.status !== 'DISCHARGED')
      .sort((a, b) => new Date(b.createdAt || b.admissionDate || '').getTime() - new Date(a.createdAt || a.admissionDate || '').getTime())
      .slice(0, 5); // Show only 5 most recent
  }

  dischargedPatients() {
    return this.patients()
      .filter(p => p.status === 'DISCHARGED')
      .sort((a, b) => new Date(b.dischargeDate || b.updatedAt || '').getTime() - new Date(a.dischargeDate || a.updatedAt || '').getTime());
  }

  // Sorted lists for all data
  sortedFacilities() {
    return this.facilities(); // Return facilities in original order since createdAt doesn't exist
  }

  sortedEmergencies() {
    return this.emergencies()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  sortedDispatched() {
    return this.dispatched()
      .sort((a, b) => new Date(b.dispatchedAt || b.updatedAt).getTime() - new Date(a.dispatchedAt || a.updatedAt).getTime());
  }

  sortedStaff() {
    return this.staff(); // Return staff in original order since createdAt doesn't exist
  }

  sortedUsers() {
    return this.users()
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
  }

  sortedDocuments() {
    return this.documents()
      .sort((a, b) => new Date(b.uploadedDate || '').getTime() - new Date(a.uploadedDate || '').getTime());
  }

  sortedAmbulances() {
    return this.ambulances(); // Return ambulances in original order since createdAt doesn't exist
  }

  citizenName(citizenId: number) {
    return this.citizens().find(c => c.citizenId === citizenId)?.name || `Citizen ${citizenId}`;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      if (p['tab']) {
        this.activeTab.set(p['tab'] as Tab);
      } else {
        this.activeTab.set('overview');
      }
    });
    this.loadAll();
  }

  loadAll() {
    this.facilityService.getAllFacilities().subscribe(r => { if (r.success) this.facilities.set(r.data); });
    this.emergencyService.getPendingEmergencies().subscribe(r => { if (r.success) this.emergencies.set(r.data); });
    this.emergencyService.getDispatchedEmergencies().subscribe(r => { if (r.success) this.dispatched.set(r.data); });
    this.emergencyService.getAllAmbulances().subscribe({ next: r => { if (r.success) this.ambulances.set(r.data); }, error: () => this.toast.error('Failed to load ambulances.') });
    this.staffService.getAllStaff().subscribe({ next: r => { if (r.success) this.staff.set(r.data); }, error: () => this.toast.error('Failed to load staff.') });
    this.authSvc.getAllUsers().subscribe(r => { if (r.success) this.users.set(r.data); });
    this.citizenService.getAllCitizens().subscribe(r => {
      if (r.success) {
        this.citizens.set(r.data);
        this.loadDocuments(r.data);
      }
      this.patientService.getAllPatients().subscribe(r => { if (r.success) this.patients.set(r.data); });
    });
  }

  loadDocuments(citizens = this.citizens()) {
    this.documents.set([]);
    citizens.forEach(citizen => {
      this.citizenService.getCitizenDocuments(citizen.citizenId).subscribe(r => {
        if (r.success) {
          const enriched = r.data.map(d => ({ ...d, citizenId: citizen.citizenId, citizenName: citizen.name }));
          this.documents.update(current => [...current, ...enriched]);
        }
      });
    });
  }

  addFacility() {
    if (!this.fForm.name || !this.fForm.type || !this.fForm.location) { this.toast.error('Name, type and location are required.'); return; }
    if (this.submitting()) return;
    this.submitting.set(true);
    const payload: any = { name: this.fForm.name, type: this.fForm.type, location: this.fForm.location };
    if (this.fForm.capacity) payload.capacity = this.fForm.capacity;
    this.facilityService.createFacility(payload).subscribe({
      next: r => { this.submitting.set(false); if (r.success) { this.toast.success('Facility added.'); this.showFacModal.set(false); this.fForm = { name:'', type:'', location:'', capacity:0 }; this.loadAll(); } else { this.toast.error(r.message || 'Failed.'); } },
      error: (err) => { this.submitting.set(false); this.toast.error(err?.error?.message || 'Failed to add facility.'); }
    });
  }

  toggleFacStatus(f: Facility) {
    const next = f.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.facilityService.updateFacilityStatus(f.facilityId, next).subscribe(r => {
      if (r.success) { this.toast.success(`Facility ${next.toLowerCase()}.`); this.loadAll(); }
    });
  }

  openAdmit(e: Emergency) {
    this.admitTarget.set(e);
    this.aForm = { citizenId: e.citizenId, emergencyId: e.emergencyId, ward: '', notes: '' };
    this.showAdmitModal.set(true);
  }

  admitPatient() {
    if (!this.aForm.ward) { this.toast.error('Ward is required.'); return; }
    if (this.submitting()) return;
    this.submitting.set(true);
    this.patientService.admitPatient(this.aForm).subscribe({
      next: r => {
        this.submitting.set(false);
        if (r.success) {
          this.toast.success('Patient admitted.');
          this.showAdmitModal.set(false);
          const target = this.admitTarget();
          if (target?.emergencyId) {
            this.emergencyService.releaseAmbulance(target.emergencyId).subscribe();
          }
          this.loadAll();
        } else { this.toast.error(r.message || 'Failed.'); }
      },
      error: () => { this.submitting.set(false); this.toast.error('Failed to admit patient.'); }
    });
  }

  createStaff() {
    if (!this.staffForm.name || !this.staffForm.email || !this.staffForm.password || !this.staffForm.facilityId) {
      this.toast.error('All fields required.'); return;
    }
    if (this.submitting()) return;
    this.submitting.set(true);
    this.staffService.createStaffRecord(this.staffForm).subscribe({
      next: r => {
        this.submitting.set(false);
        if (r.success) { this.toast.success('Staff created successfully.'); this.showStaffModal.set(false); this.loadAll(); }
        else { this.toast.error(r.message || 'Staff creation failed.'); }
      },
      error: () => { this.submitting.set(false); this.toast.error('Failed to create staff.'); }
    });
  }

  dischargePatient(id: number) {
    const patient = this.patients().find(p => p.patientId === id);
    const msg = patient?.status === 'UNDER_OBSERVATION'
      ? 'This patient is currently under observation and may not be stable. Are you sure you want to discharge?'
      : 'Are you sure you want to discharge this patient?';
    if (!confirm(msg)) return;
    this.patientService.updatePatientStatus(id, 'DISCHARGED').subscribe(r => {
      if (r.success) { this.toast.success('Patient discharged.'); this.loadAll(); }
    });
  }

  openDocModal(d: CitizenDocument & { citizenId: number; citizenName: string }) {
    this.docTarget.set(d);
    this.showDocModal.set(true);
  }

  viewDocument() {
    const d = this.docTarget();
    if (!d) return;
    this.citizenService.viewCitizenDocument(d.citizenId, d.documentId).subscribe({
      next: (res: any) => {
        // API returns list of documents - find the matching one
        const docs = res.data || res;
        const docList = Array.isArray(docs) ? docs : [docs];
        const doc = docList.find((x: any) => x.documentId === d.documentId);
        if (!doc?.documentData) { this.toast.error('No document data found.'); return; }
        const byteChars = atob(doc.documentData);
        const byteArr = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
        let mime = 'application/octet-stream';
        if (byteArr[0] === 0xFF && byteArr[1] === 0xD8) mime = 'image/jpeg';
        else if (byteArr[0] === 0x89 && byteArr[1] === 0x50) mime = 'image/png';
        else if (byteArr[0] === 0x25 && byteArr[1] === 0x50) mime = 'application/pdf';
        const blob = new Blob([byteArr], { type: mime });
        window.open(URL.createObjectURL(blob));
      },
      error: () => this.toast.error('Failed to load document.')
    });
  }

  verifyDocumentFromModal(status: 'VERIFIED'|'REJECTED') {
    const d = this.docTarget();
    if (!d) return;
    if (this.submitting()) return;
    this.submitting.set(true);
    this.citizenService.verifyCitizenDocument(d.documentId, status).subscribe(r => {
      this.submitting.set(false);
      if (r.success) { this.toast.success(`Document ${status.toLowerCase()}.`); this.showDocModal.set(false); this.loadAll(); }
    });
  }

  toggleUserStatus(u: UserProfile) {
    const call = u.status === 'ACTIVE' ? this.authSvc.deactivateUser(u.userId) : this.authSvc.activateUser(u.userId);
    call.subscribe(r => {
      if (r.success) { this.toast.success(`User ${u.status === 'ACTIVE' ? 'deactivated' : 'activated'}.`); this.loadAll(); }
    });
  }

  changeAmbStatus(id: number, status: string) {
    // Find the ambulance to check current status
    const ambulance = this.ambulances().find(a => a.ambulanceId === id);
    
    // Prevent status change if ambulance is currently dispatched
    if (ambulance?.status === 'DISPATCHED' && (status === 'MAINTENANCE' || status === 'AVAILABLE')) {
      this.toast.error('Cannot change status - Ambulance is currently dispatched');
      return;
    }
    
    this.emergencyService.updateAmbulanceStatus(id, status).subscribe(r => {
      if (r.success) { 
        this.toast.success(`Ambulance set to ${status.toLowerCase()}.`); 
        this.loadAll(); 
      } else { 
        this.toast.error(r.message || 'Failed to update status.'); 
      }
    });
  }

  deleteStaff(id: number) {
    if (!confirm('Are you sure you want to remove this staff member? This will also deactivate their user account.')) return;
    
    // First get the staff details to find the associated userId
    const staff = this.staff().find(s => (s.staffId || s.id) === id);
    
    this.staffService.deleteStaff(id).subscribe({
      next: r => {
        if (r.success) {
          this.toast.success('Staff removed successfully.');
          
          // If staff has a userId, deactivate the user account
          if (staff?.userId) {
            this.authSvc.deactivateUser(staff.userId).subscribe({
              next: userRes => {
                if (userRes.success) {
                  this.toast.success('Associated user account deactivated.');
                }
              },
              error: () => {
                this.toast.info('Staff removed but failed to deactivate user account.');
              }
            });
          }
          
          this.loadAll();
        } else {
          this.toast.error(r.message || 'Failed to remove staff.');
        }
      },
      error: () => {
        this.toast.error('Failed to remove staff.');
      }
    });
  }

  addAmbulance() {
    if (!this.ambForm.vehicleNumber.trim()) { this.toast.error('Vehicle registration number is required.'); return; }
    if (this.submitting()) return;
    this.submitting.set(true);
    this.emergencyService.addAmbulance(this.ambForm).subscribe({
      next: r => {
        this.submitting.set(false);
        if (r.success) {
          this.toast.success('Ambulance added successfully.');
          this.showAmbModal.set(false);
          this.ambForm = { vehicleNumber: '', model: '' };
          this.loadAll();
        } else { this.toast.error(r.message || 'Failed to add ambulance.'); }
      },
      error: () => { this.submitting.set(false); this.toast.error('Failed to add ambulance.'); }
    });
  }
}
