export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { name: string; email: string; password: string; phone: string; }
export interface AuthResponse {
  userId: number; name: string; email: string;
  role: 'CITIZEN'|'DOCTOR'|'NURSE'|'DISPATCHER'|'ADMIN'|'COMPLIANCE_OFFICER'|'CITY_HEALTH_OFFICER';
  token: string; status?: string;
}
export interface ApiResponse<T> { success: boolean; message: string; data: T; }

// Citizen
export interface CitizenProfile {
  citizenId: number; name: string; dateOfBirth?: string; gender?: string;
  address?: string; contactInfo?: string; status?: string; bloodGroup?: string;
}
export interface CitizenDocument {
  documentId: number;
  verificationStatus: 'PENDING'|'VERIFIED'|'REJECTED';
  uploadedDate?: string;
}

// User
export interface UserProfile {
  userId: number; name: string; email: string; role: string;
  phone?: string; status?: 'ACTIVE'|'INACTIVE'; createdAt?: string; updatedAt?: string;
}

// Emergency
export interface Emergency {
  emergencyId: number; citizenId: number; type: string;
  location: string; description: string;
  status: 'REPORTED'|'DISPATCHED'|'ADMITTED'|'CLOSED';
  dispatcherId?: number; ambulance?: Ambulance;
  dispatchedAt?: string; createdAt: string; updatedAt: string;
}
export interface EmergencyRequest { type: string; location: string; description: string; }

// Ambulance
export interface Ambulance {
  ambulanceId: number; vehicleNumber: string; model: string;
  status: 'AVAILABLE'|'DISPATCHED'|'MAINTENANCE';
}

// Patient
export interface Patient {
  patientId: number; citizenId: number; emergencyId?: number;
  admissionDate?: string; dischargeDate?: string;
  ward?: string; notes?: string; admissionReason?: string;
  status: 'ADMITTED'|'UNDER_OBSERVATION'|'STABLE'|'DISCHARGED';
  createdAt: string; updatedAt?: string;
}

// Treatment
export interface Treatment {
  treatmentId: number;
  patient?: { patientId: number };
  patientId?: number;
  assignedById: number;
  description: string; medicationName: string; dosage: string;
  startDate?: string; endDate?: string;
  status: 'ONGOING'|'COMPLETED'|'CANCELLED';
  createdAt: string; updatedAt?: string;
}

// Staff
export interface Staff {
  staffId?: number; id?: number; name: string; role: string;
  contactInfo?: string; status?: string; facilityId: number; userId?: number;
}

// Facility — matches backend: contactNumber, totalBeds, availableBeds
export interface Facility {
  facilityId: number; name: string; type: string;
  location: string; contactNumber?: string;
  totalBeds?: number; availableBeds?: number; capacity?: number;
  status: 'ACTIVE'|'INACTIVE'|'MAINTENANCE';
}

// Compliance
export interface ComplianceRecord {
  complianceId: number; entityId: number; entityName?: string; type: string;
  result: string; notes?: string;
  officerId?: number; officerName?: string; createdAt: string; updatedAt?: string;
}
export interface Audit {
  auditId: number; officerId?: number; officerName?: string; scope?: string;
  findings?: string; date?: string;
  status: 'SCHEDULED'|'IN_PROGRESS'|'COMPLETED'|'CANCELLED';
  completedBy?: string; createdAt: string; updatedAt?: string;
}
export interface AuditLog {
  logId: number; userId: number; userName?: string; action: string;
  resource: string; timestamp: string;
}
