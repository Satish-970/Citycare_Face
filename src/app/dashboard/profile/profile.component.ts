import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CitizenService } from '../../shared/services/citizen.service';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { CustomValidators } from '../../shared/validators/custom-validators';
import { CitizenProfile } from '../../shared/models/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  private citizenService = inject(CitizenService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  user = this.auth.getUser();
  initial = (this.user?.name || 'U')[0].toUpperCase();
  loading = signal(true);
  saving = signal(false);
  isCitizen = this.user?.role === 'CITIZEN';

  profileForm = this.fb.group({
    name: ['', [Validators.required, CustomValidators.alphabetsOnly()]],
    contactInfo: ['', [CustomValidators.phoneNumber()]],
    dateOfBirth: [''],
    gender: [''],
    address: [''],
    bloodGroup: ['']
  });

  get bloodGroupQuote() {
    const bloodGroup = this.profileForm.get('bloodGroup')?.value;
    if (!bloodGroup || typeof bloodGroup !== 'string') return null;
    
    const quotes: Record<string, {text: string, color: string}> = {
      'O-': { text: ' Universal Donor - You can save anyone!', color: 'text-danger fw-bold' },
      'O+': { text: ' Most Common Donor - High demand for your blood!', color: 'text-primary fw-bold' },
      'AB+': { text: ' Universal Recipient - You can receive from anyone!', color: 'text-success fw-bold' },
      'AB-': { text: ' Rare & Special - Only 1% of population!', color: 'text-warning fw-bold' },
      'A+': { text: ' Life Saver - Compatible with A+ and AB+!', color: 'text-info fw-bold' },
      'A-': { text: ' Rare Donor - Can help A-, A+, AB-, AB+!', color: 'text-danger-emphasis fw-bold' },
      'B+': { text: ' Strong Type - Compatible with B+ and AB+!', color: 'text-primary-emphasis fw-bold' },
      'B-': { text: ' Precious Blood - Only 2% have this type!', color: 'text-success-emphasis fw-bold' }
    };
    return quotes[bloodGroup] || null;
  }

  get roleDisplay() {
    const map: Record<string,string> = { 
      CITIZEN:'Citizen', DOCTOR:'Doctor', NURSE:'Nurse', DISPATCHER:'Dispatcher', 
      ADMIN:'Administrator', COMPLIANCE_OFFICER:'Compliance Officer'
    };
    return map[this.user?.role || ''] || this.user?.role || '';
  }

  ngOnInit() { 
    this.loadProfile(); 
  }

  loadProfile() {
    this.loading.set(true);
    this.citizenService.getCitizenProfile().subscribe({
      next: r => {
        this.loading.set(false);
        if (r.success && r.data) {
          const p = r.data;
          let dateValue = '';
          if (p.dateOfBirth) {
            const parts = p.dateOfBirth.split('-');
            if (parts.length === 3) {
              dateValue = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
          }
          this.profileForm.patchValue({
            name: p.name || this.user?.name || '',
            contactInfo: p.contactInfo || '',
            dateOfBirth: dateValue,
            gender: p.gender || '',
            address: p.address || '',
            bloodGroup: (p as any).bloodGroup || ''
          });
        } else {
          this.profileForm.patchValue({ name: this.user?.name || '' });
        }
      },
      error: () => { 
        this.loading.set(false); 
        this.profileForm.patchValue({ name: this.user?.name || '' });
      }
    });
  }

  saveProfile() {
    // Only validate name as required
    const nameValue = this.profileForm.get('name')?.value?.trim();
    if (!nameValue) {
      this.toast.error('Name is required.');
      return;
    }
    
    // Validate name format only if name is provided
    if (nameValue && this.profileForm.get('name')?.hasError('invalidName')) {
      this.toast.error('Name can only contain alphabets and spaces.');
      return;
    }
    
    // Validate phone only if provided and not empty
    const contactInfo = this.profileForm.get('contactInfo')?.value?.trim();
    if (contactInfo && this.profileForm.get('contactInfo')?.hasError('invalidPhone')) {
      this.toast.error('Phone number must be exactly 10 digits starting with 6, 7, 8, or 9.');
      return;
    }
    
    this.saving.set(true);
    const formData = this.profileForm.value;
    
    // Only send fields that have values
    const payload: any = {
      name: nameValue
    };
    
    if (contactInfo) payload.contactInfo = contactInfo;
    if (formData.gender) payload.gender = formData.gender;
    if (formData.address?.trim()) payload.address = formData.address.trim();
    if (formData.bloodGroup) payload.bloodGroup = formData.bloodGroup;
    
    // Handle date conversion only if date is provided
    if (formData.dateOfBirth) {
      const date = new Date(formData.dateOfBirth);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      payload.dateOfBirth = `${day}-${month}-${year}`;
    }
    this.citizenService.updateCitizenProfile(payload).subscribe({
      next: r => {
        this.saving.set(false);
        if (r.success) {
          this.toast.success('Profile updated!');
          if (this.user) {
            const updated = { ...this.user, name: formData.name || '' };
            localStorage.setItem('citycare_user', JSON.stringify(updated));
          }
        } else { 
          this.toast.error(r.message || 'Update failed.'); 
        }
      },
      error: () => { 
        this.saving.set(false); 
        this.toast.error('Failed to save profile.'); 
      }
    });
  }
}