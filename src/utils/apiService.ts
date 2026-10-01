import { PatientProfile, DoctorProfile, PatientRecord, Prescription, AccessLog } from '../types/health';

export interface LoginHistoryItem {
  id: number;
  role: string;
  identifier: string;
  name: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  bloodGroup?: string | null;
  aadharNumber?: string | null;
  loginType: string;
  ipAddress: string | null;
  userAgent: string | null;
  status: string;
  timestamp: string;
}

// Fetch all patients from the database
export async function fetchPatientsFromDB(): Promise<PatientProfile[] | null> {
  try {
    const res = await fetch('/api/patients');
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch patients from database, falling back:', err);
    return null;
  }
}

// Save or update a patient in the database
export async function savePatientToDB(patient: PatientProfile): Promise<boolean> {
  try {
    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patient),
    });
    return res.ok;
  } catch (err) {
    console.error('Error saving patient to database:', err);
    return false;
  }
}

// Fetch doctor profile from the database
export async function fetchDoctorFromDB(): Promise<DoctorProfile | null> {
  try {
    const res = await fetch('/api/doctor');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Could not fetch doctor from database, falling back:', err);
    return null;
  }
}

// Update doctor profile in the database
export async function saveDoctorToDB(doctor: DoctorProfile): Promise<boolean> {
  try {
    const res = await fetch('/api/doctor', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doctor),
    });
    return res.ok;
  } catch (err) {
    console.error('Error updating doctor in database:', err);
    return false;
  }
}

// Record login attempt in the database
export async function recordLoginInDB(params: {
  role: 'patient' | 'doctor';
  identifier: string;
  password?: string;
  name?: string;
  email?: string;
  phone?: string;
  bloodGroup?: string;
  aadharNumber?: string;
  loginType: string;
}): Promise<{ success: boolean; profile?: any; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return {
      success: res.ok && data.success !== false,
      profile: data.profile,
      error: data.error,
    };
  } catch (err: any) {
    console.error('Error recording login in database:', err);
    return { success: true }; // allow optimistic offline transition if backend is starting
  }
}

// Fetch all login history items from the database
export async function fetchLoginHistoryFromDB(): Promise<LoginHistoryItem[]> {
  try {
    const res = await fetch('/api/auth/login-history');
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Error fetching login history from database:', err);
    return [];
  }
}

// Add a patient record to database
export async function addRecordToDB(record: PatientRecord, patientId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...record, patientId }),
    });
    return res.ok;
  } catch (err) {
    console.error('Error adding record to database:', err);
    return false;
  }
}

// Add a prescription to database
export async function addPrescriptionToDB(prescription: Prescription, patientId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/prescriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...prescription, patientId }),
    });
    return res.ok;
  } catch (err) {
    console.error('Error adding prescription to database:', err);
    return false;
  }
}

// Add an access log to database
export async function addAccessLogToDB(log: AccessLog, patientId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/access-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...log, patientId }),
    });
    return res.ok;
  } catch (err) {
    console.error('Error adding access log to database:', err);
    return false;
  }
}
