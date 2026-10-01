export type UserRole = 'guest' | 'patient' | 'doctor';

export interface PatientRecord {
  id: string;
  date: string;
  category: 'Consultation' | 'Lab Report' | 'Prescription' | string;
  title: string;
  facility: string;
  doctor: string;
  specialty: string;
  summary: string;
  metrics?: { label: string; value: string; unit: string; normalRange: string; status: 'normal' | 'attention' | 'critical' }[];
  diagnosisCode?: string;
  fileAttachment?: string;
  imageUrl?: string;
  biomarkers?: { name: string; value: string; unit: string; range: string; status: 'normal' | 'elevated' | 'critical' }[];
  accessLevel: 'full' | 'restricted' | 'confidential';
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  prescribedDate: string;
  refillsRemaining: number;
  maxRefills: number;
  pharmacy: string;
  status: 'active' | 'completed' | 'pending-refill';
  instructions: string;
}

export interface DoctorPermission {
  id: string;
  doctorName: string;
  hospital: string;
  specialty: string;
  licenseNumber: string;
  grantedDate: string;
  expiresIn: string;
  status: 'active' | 'revoked' | 'expired';
  scopes: {
    timeline: boolean;
    prescriptions: boolean;
    labReports: boolean;
    imaging: boolean;
    emergencyOnly: boolean;
  };
}

export interface AccessLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  facility: string;
  ipAddress: string;
  action: string;
  resource: string;
  purpose: string;
  status: 'Authorized' | 'Auto-Purged' | 'Flagged';
}

export const ALL_BLOOD_GROUPS = [
  'O+',
  'O-',
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-'
] as const;

export type BloodGroupType = typeof ALL_BLOOD_GROUPS[number];

export interface EmergencyInfo {
  fullName: string;
  dob: string;
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
  medications: string[];
  takingMedication: 'yes' | 'no';
  disease: string;
  emergencyContacts: {
    name: string;
    relationship: string;
    phone: string;
  }[];
  organDonor: boolean;
  cloudSyncEnabled: boolean;
  lastSynced: string;
  qrCodeToken: string;
}

export interface PatientProfile {
  id: string;
  name: string;
  dob: string;
  age: number;
  gender: string;
  patientUid: string; // e.g. DH-8824
  idNumber?: string; // e.g. 8824
  aadharNumber?: string; // 12-digit Aadhaar Number
  bloodGroup?: string; // Blood group e.g. 'O+'
  email: string;
  phone: string;
  avatar: string;
  takingMedication?: 'yes' | 'no';
  disease?: string;
  password?: string;
  emergency: EmergencyInfo;
  records: PatientRecord[];
  prescriptions: Prescription[];
  doctorPermissions: DoctorPermission[];
  accessLogs: AccessLog[];
}

export interface DoctorProfile {
  id: string;
  name: string;
  title: string;
  specialty: string;
  hospital: string;
  licenseId: string;
  npiNumber: string;
  avatar: string;
  activePatientsCount: number;
  department: string;
  email?: string;
  phone?: string;
  bloodGroup?: string;
  aadharNumber?: string;
  password?: string;
}
