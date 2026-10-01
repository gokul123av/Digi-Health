import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

// Users table (Patient & Doctor auth credentials)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or Custom UID
  email: text('email').notNull(),
  role: text('role').notNull(), // 'patient' | 'doctor'
  passwordHash: text('password_hash'), // Patient or Doctor Password
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Doctors table (Clinician Profiles & Credentials)
export const doctors = pgTable('doctors', {
  id: text('id').primaryKey(), // e.g. 'doc-01'
  name: text('name').notNull(),
  title: text('title').notNull(),
  specialty: text('specialty').notNull(),
  hospital: text('hospital').notNull(),
  licenseId: text('license_id').notNull(),
  npiNumber: text('npi_number'),
  avatar: text('avatar'),
  department: text('department'),
  email: text('email'),
  phone: text('phone'),
  bloodGroup: text('blood_group'), // Doctor Blood Group
  aadharNumber: text('aadhar_number'), // 12-digit Aadhaar
  password: text('password'), // Doctor portal password / PIN
  activePatientsCount: integer('active_patients_count').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Patients table (Patient Profiles, Demographics & Credentials)
export const patients = pgTable('patients', {
  id: text('id').primaryKey(), // e.g. 'pat-01'
  patientUid: text('patient_uid').notNull().unique(), // e.g. 'DH-8824'
  idNumber: text('id_number'), // e.g. '8824'
  name: text('name').notNull(),
  dob: text('dob'),
  age: integer('age'),
  gender: text('gender'),
  email: text('email').notNull(),
  phone: text('phone'),
  aadharNumber: text('aadhar_number'), // 12-digit Aadhaar
  avatar: text('avatar'),
  disease: text('disease'),
  takingMedication: text('taking_medication'),
  password: text('password'), // Patient password
  bloodType: text('blood_type'),
  allergies: text('allergies'), // JSON array string
  chronicConditions: text('chronic_conditions'), // JSON array string
  medications: text('medications'), // JSON array string
  emergencyContacts: text('emergency_contacts'), // JSON array string
  qrCodeToken: text('qr_code_token'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Patient Records table (Clinical Notes, Diagnoses, Scans)
export const patientRecords = pgTable('patient_records', {
  id: text('id').primaryKey(),
  patientId: text('patient_id').notNull(),
  date: text('date').notNull(),
  category: text('category').notNull(),
  title: text('title').notNull(),
  facility: text('facility'),
  doctor: text('doctor'),
  specialty: text('specialty'),
  summary: text('summary'),
  diagnosisCode: text('diagnosis_code'),
  fileAttachment: text('file_attachment'),
  imageUrl: text('image_url'),
  accessLevel: text('access_level'),
  biomarkers: text('biomarkers'), // JSON array string
  createdAt: timestamp('created_at').defaultNow(),
});

// Prescriptions table
export const prescriptions = pgTable('prescriptions', {
  id: text('id').primaryKey(),
  patientId: text('patient_id').notNull(),
  medication: text('medication').notNull(),
  dosage: text('dosage').notNull(),
  frequency: text('frequency').notNull(),
  prescribedBy: text('prescribed_by').notNull(),
  prescribedDate: text('prescribed_date').notNull(),
  refillsRemaining: integer('refills_remaining').default(0),
  maxRefills: integer('max_refills').default(0),
  pharmacy: text('pharmacy'),
  status: text('status').notNull(),
  instructions: text('instructions'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Login History table (All Patient & Doctor login attempts)
export const loginHistory = pgTable('login_history', {
  id: serial('id').primaryKey(),
  role: text('role').notNull(), // 'patient' | 'doctor'
  identifier: text('identifier').notNull(), // Mail ID, Patient ID, or License
  name: text('name'),
  email: text('email'),
  phoneNumber: text('phone_number'),
  bloodGroup: text('blood_group'),
  aadharNumber: text('aadhar_number'),
  loginType: text('login_type').notNull(), // 'first-time-mail' | 'existing-id' | 'doctor-domain' | 'doctor-license'
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  status: text('status').notNull(), // 'success' | 'failed'
  timestamp: timestamp('timestamp').defaultNow(),
});

// Access Logs table (Audit compliance trail)
export const accessLogs = pgTable('access_logs', {
  id: text('id').primaryKey(),
  patientId: text('patient_id').notNull(),
  timestamp: text('timestamp').notNull(),
  actor: text('actor').notNull(),
  role: text('role').notNull(),
  facility: text('facility').notNull(),
  ipAddress: text('ip_address').notNull(),
  action: text('action').notNull(),
  resource: text('resource').notNull(),
  purpose: text('purpose').notNull(),
  status: text('status').notNull(),
});
