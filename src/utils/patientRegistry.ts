import { PatientProfile, PatientRecord, Prescription } from '../types/health';

/**
 * Searches for an existing patient by various ID formats:
 * - 12-digit Aadhaar Number (with or without spaces, e.g. "4589 1234 5678" or "458912345678")
 * - Exact match: "DH-8824"
 * - Just numbers: "8824" matches "DH-8824"
 * - Case-insensitive: "dh-8824"
 * - Patient Name: "Sarah" or "Liam"
 * - Phone number: e.g. "9876543210"
 */
export function findPatientByQuery(query: string, patients: PatientProfile[]): PatientProfile | undefined {
  const clean = query.trim().toLowerCase();
  if (!clean) return undefined;

  const numericOnly = clean.replace(/\D/g, '');

  return patients.find(p => {
    const pUidLower = p.patientUid.toLowerCase();
    const pIdLower = p.id.toLowerCase();
    const pNameLower = p.name.toLowerCase();
    const pNum = p.patientUid.replace(/\D/g, '');
    const pAadhar = (p.aadharNumber || '').replace(/\D/g, '');
    const pPhone = (p.phone || '').replace(/\D/g, '');

    // 1. Aadhaar Number Match (Full 12-digit or 8+ digit match)
    if (numericOnly.length >= 8 && pAadhar.length >= 8) {
      if (pAadhar === numericOnly || pAadhar.includes(numericOnly) || numericOnly.includes(pAadhar)) {
        return true;
      }
    }

    // 2. Exact or direct string match
    if (pUidLower === clean || pIdLower === clean) return true;
    
    // 3. Numeric ID match (e.g. searching "8824" matches "DH-8824")
    if (numericOnly.length >= 2 && pNum === numericOnly) return true;

    // 4. Phone number match
    if (numericOnly.length >= 10 && pPhone.length >= 10) {
      if (pPhone === numericOnly || pPhone.includes(numericOnly)) return true;
    }

    // 5. Partial contains
    if (pUidLower.includes(clean) || (numericOnly.length >= 3 && pNum.includes(numericOnly))) return true;

    // 6. Name match
    if (pNameLower.includes(clean)) return true;

    return false;
  });
}

/**
 * Deterministically generates or retrieves complete records and medications
 * according to any Patient ID Number or 12-Digit Aadhaar Number searched by the clinician.
 */
export function getOrCreatePatientByNumber(
  query: string, 
  existingPatients: PatientProfile[]
): { patient: PatientProfile; isNew: boolean } {
  const existing = findPatientByQuery(query, existingPatients);
  if (existing) {
    return { patient: existing, isNew: false };
  }

  // Normalize the ID according to this number
  const trimmed = query.trim();
  const numericOnly = trimmed.replace(/\D/g, '');
  
  const isAadhar = numericOnly.length === 12;
  const formattedAadhar = isAadhar
    ? `${numericOnly.slice(0, 4)} ${numericOnly.slice(4, 8)} ${numericOnly.slice(8, 12)}`
    : undefined;

  // Format as DH-XXXX if numeric, or maintain the user's custom ID code
  let formattedUid: string;
  let idNumber: string;

  if (isAadhar) {
    idNumber = numericOnly.slice(-4);
    formattedUid = `DH-${idNumber}`;
  } else if (/^dh-/i.test(trimmed)) {
    formattedUid = trimmed.toUpperCase();
    idNumber = formattedUid.replace(/\D/g, '') || trimmed;
  } else if (numericOnly.length > 0) {
    idNumber = numericOnly;
    formattedUid = `DH-${numericOnly}`;
  } else {
    idNumber = trimmed;
    formattedUid = `DH-${trimmed.toUpperCase()}`;
  }

  // Derive deterministic traits from the number for consistent realistic data
  const seedNum = numericOnly.length > 0 
    ? parseInt(numericOnly.slice(-6), 10) 
    : trimmed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const sampleNames = [
    { name: 'Robert Callahan', gender: 'Male', dob: '1984-07-12', age: 42, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80' },
    { name: 'Maya Lin Patel', gender: 'Female', dob: '1991-03-24', age: 35, avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80' },
    { name: 'Jonathan Reyes', gender: 'Male', dob: '1979-10-18', age: 47, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80' },
    { name: 'Sophia Kowalski', gender: 'Female', dob: '1994-11-05', age: 32, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80' },
    { name: 'Carlos Mendoza', gender: 'Male', dob: '1986-09-30', age: 40, avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80' },
  ];

  const profilePick = sampleNames[seedNum % sampleNames.length];
  const bloodTypes = ['O Rh+', 'A Rh+', 'B Rh+', 'AB Rh+', 'O Rh-'];
  const bloodType = bloodTypes[seedNum % bloodTypes.length];

  const diseases = [
    'Essential Hypertension (Stage 1), Dyslipidemia',
    'Type 2 Diabetes Mellitus, Mild Peripheral Neuropathy',
    'Extrinsic Bronchial Asthma, Chronic Seasonal Rhinitis',
    'Coronary Artery Disease, Hypercholesterolemia',
    'Chronic Gastritis, Mild Gastroesophageal Reflux'
  ];
  const disease = diseases[seedNum % diseases.length];

  const today = new Date().toISOString().split('T')[0];

  // Complete Medications according to this patient number
  const prescriptions: Prescription[] = [
    {
      id: `rx-${formattedUid}-01`,
      medication: (seedNum % 2 === 0) ? 'Atorvastatin Calcium' : 'Rosuvastatin Zinc',
      dosage: (seedNum % 2 === 0) ? '20 mg Oral Tablet' : '10 mg Oral Tablet',
      frequency: 'Once daily at bedtime',
      prescribedBy: 'Dr. Marcus Vance, MD',
      prescribedDate: '2026-08-15',
      refillsRemaining: 3,
      maxRefills: 4,
      pharmacy: 'CVS Pharmacy #4102 - Highland Ave',
      status: 'active',
      instructions: 'Take with or without food at bedtime. Avoid grapefruit consumption.'
    },
    {
      id: `rx-${formattedUid}-02`,
      medication: (seedNum % 3 === 0) ? 'Metformin Hydrochloride ER' : 'Lisinopril Dihydrate',
      dosage: (seedNum % 3 === 0) ? '1000 mg Extended Release' : '10 mg Oral Tablet',
      frequency: (seedNum % 3 === 0) ? 'Twice daily with meals' : 'Once daily in the morning',
      prescribedBy: 'Dr. Marcus Vance, MD',
      prescribedDate: '2026-07-20',
      refillsRemaining: 2,
      maxRefills: 3,
      pharmacy: 'CVS Pharmacy #4102 - Highland Ave',
      status: 'active',
      instructions: 'Take regularly with morning meal. Monitor weekly resting vitals.'
    },
    {
      id: `rx-${formattedUid}-03`,
      medication: 'Coenzyme Q10 + Vitamin D3 Supplementation',
      dosage: '200 mg / 2000 IU Capsule',
      frequency: 'Once daily with breakfast',
      prescribedBy: 'Dr. Alisha Patel, MD',
      prescribedDate: '2026-06-10',
      refillsRemaining: 4,
      maxRefills: 5,
      pharmacy: 'Walgreens Community Pharmacy',
      status: 'active',
      instructions: 'Cardioprotective lipid adjuvant therapy.'
    }
  ];

  // Complete Longitudinal Records according to this patient number
  const records: PatientRecord[] = [
    {
      id: `rec-${formattedUid}-01`,
      date: '2026-09-15',
      category: 'Consultation',
      title: `Comprehensive Internal Medicine & Cardiology Evaluation (${formattedUid})`,
      facility: 'St. Jude Academic Medical Center',
      doctor: 'Dr. Marcus Vance, MD',
      specialty: 'Cardiovascular & Internal Medicine',
      summary: `Patient ID ${formattedUid} attended routine follow-up. Vital signs: BP 122/78 mmHg, HR 68 bpm regular, Oxygen Sat 99% on room air. Cardiac auscultation demonstrates crisp S1/S2 without murmurs or gallops. Patient reports adherence to prescribed oral pharmacotherapy without adverse symptoms. Assessment: Clinical stability established under current regimen.`,
      diagnosisCode: 'ICD-10: I10 (Essential Primary Hypertension)',
      accessLevel: 'full',
      fileAttachment: `Consultation_Summary_${formattedUid}.pdf`
    },
    {
      id: `rec-${formattedUid}-02`,
      date: '2026-08-28',
      category: 'Lab Report',
      title: `Diagnostic Lipid Panel & Comprehensive Metabolic Profile (ID: ${formattedUid})`,
      facility: 'Metropolitan Clinical Reference Laboratory',
      doctor: 'Dr. Marcus Vance, MD',
      specialty: 'Diagnostic Pathology',
      summary: `Fasting biochemical analysis for patient ${formattedUid}. Lipid fractions indicate optimal target attainment with statin therapy. Serum creatinine 0.88 mg/dL with eGFR > 90 mL/min/1.73m2 demonstrating preserved renal filtration.`,
      metrics: [
        { label: 'Total Cholesterol', value: '172', unit: 'mg/dL', normalRange: '125 - 200', status: 'normal' },
        { label: 'HDL Cholesterol', value: '54', unit: 'mg/dL', normalRange: '> 40', status: 'normal' },
        { label: 'LDL Calculated', value: '94', unit: 'mg/dL', normalRange: '< 100', status: 'normal' },
        { label: 'Triglycerides', value: '120', unit: 'mg/dL', normalRange: '< 150', status: 'normal' },
        { label: 'Fasting Blood Glucose', value: '92', unit: 'mg/dL', normalRange: '70 - 99', status: 'normal' }
      ],
      diagnosisCode: 'CPT 80061 (Lipid Panel)',
      accessLevel: 'full',
      fileAttachment: `Lab_Report_CMP_${formattedUid}.pdf`
    },
    {
      id: `rec-${formattedUid}-03`,
      date: '2026-06-12',
      category: 'Imaging',
      title: `12-Lead Electrocardiogram & Transthoracic Echocardiogram (${formattedUid})`,
      facility: 'Bay Cardiovascular Imaging Center',
      doctor: 'Dr. David Kim, MD',
      specialty: 'Cardiovascular Imaging',
      summary: `12-lead ECG confirms normal sinus rhythm at 68 bpm. PR interval 146 ms, QRS duration 88 ms, QTc 418 ms. 2D Transthoracic Echo: Left ventricular ejection fraction preserved at 62%. Normal wall thickness, no regional wall motion abnormalities detected.`,
      diagnosisCode: 'CPT 93306 (TTE Complete)',
      accessLevel: 'full',
      fileAttachment: `Echo_Diagnostic_Report_${formattedUid}.pdf`
    },
    {
      id: `rec-${formattedUid}-04`,
      date: '2025-11-20',
      category: 'Immunization',
      title: `Preventive Influenza & Respiratory Vaccination Record (${formattedUid})`,
      facility: 'St. Jude Outpatient Preventive Center',
      doctor: 'Dr. Alisha Patel, MD',
      specialty: 'Preventive Medicine',
      summary: `Administered 0.5 mL Quadrivalent Inactivated Influenza vaccine (IM left deltoid). Patient tolerance verified with zero localized or systemic adverse reactions.`,
      diagnosisCode: 'CVX 197 / CPT 90686',
      accessLevel: 'full',
      fileAttachment: `Immunization_Certificate_${formattedUid}.pdf`
    }
  ];

  const newPatient: PatientProfile = {
    id: `pat-${formattedUid.toLowerCase()}`,
    patientUid: formattedUid,
    idNumber: idNumber || numericOnly || formattedUid.replace(/\D/g, '') || trimmed,
    aadharNumber: formattedAadhar || `${Math.floor(1000 + (seedNum % 8999))} ${Math.floor(1000 + (seedNum * 3 % 8999))} ${Math.floor(1000 + (seedNum * 7 % 8999))}`,
    bloodGroup: bloodType,
    password: 'password123',
    name: profilePick.name,
    dob: profilePick.dob,
    age: profilePick.age,
    gender: profilePick.gender,
    email: `${profilePick.name.toLowerCase().replace(/\s+/g, '.')}@degihealth.net`,
    phone: `+91 9845${(seedNum % 900000 + 100000)}`,
    avatar: profilePick.avatar,
    takingMedication: 'yes',
    disease,
    emergency: {
      fullName: profilePick.name,
      dob: profilePick.dob,
      bloodType,
      allergies: ['Penicillin (Mild urticaria)', 'Latex'],
      chronicConditions: [disease.split(',')[0].trim()],
      disease,
      takingMedication: 'yes',
      medications: prescriptions.map(p => `${p.medication} ${p.dosage}`),
      emergencyContacts: [
        { name: 'Family Contact / Caregiver', relationship: 'Primary Caregiver', phone: `+91 9845${(seedNum % 900000 + 100000)}` }
      ],
      organDonor: true,
      cloudSyncEnabled: true,
      lastSynced: 'Just now (Instant Query)',
      qrCodeToken: `DEGI-SEC-PATIENT-${formattedUid}-SIG-${seedNum.toString(16).toUpperCase()}`
    },
    prescriptions,
    doctorPermissions: [],
    accessLogs: [
      {
        id: `log-${formattedUid}-01`,
        timestamp: `${today} 08:30:00 UTC`,
        actor: 'Dr. Marcus Vance, MD',
        role: 'Attending Clinician',
        facility: 'St. Jude Academic Medical Center',
        ipAddress: '142.250.190.44 (FedNet Node #3)',
        action: isAadhar
          ? `Patient Medical History Retrieved via 12-Digit Aadhaar Identification (${formattedAadhar})`
          : `Patient ID ${formattedUid} Records Retrieved via Direct Query`,
        resource: `Patient Dossier ${formattedUid}`,
        purpose: 'Clinical Encounter & Treatment',
        status: 'Authorized'
      }
    ],
    records
  };

  return { patient: newPatient, isNew: true };
}

/**
 * Generates a unique, random permanent 4-digit patient ID number (e.g. "6492")
 * ensuring it does not collide with existing registered patients.
 */
export function generateRandomPermanentId(existingPatients: PatientProfile[]): string {
  for (let attempts = 0; attempts < 100; attempts++) {
    // Generate a random 4-digit number between 1000 and 9999
    const randomNum = Math.floor(1000 + Math.random() * 9000).toString();
    const formatted = `DH-${randomNum}`;
    const collision = existingPatients.some(p => 
      p.patientUid.toLowerCase() === formatted.toLowerCase() || 
      p.id.toLowerCase() === `pat-${randomNum}` ||
      p.patientUid.replace(/\D/g, '') === randomNum
    );
    if (!collision) {
      return randomNum;
    }
  }
  return Math.floor(10000 + Math.random() * 90000).toString();
}

/**
 * Registers or logs in a first-time patient with their Mail ID and Password.
 * Generates a random permanent ID number, creates the permanent profile with
 * complete records & prescriptions, and returns both the patient and the assigned random ID.
 */
export function registerFirstTimePatientWithEmail(
  email: string,
  existingPatients: PatientProfile[],
  options?: { 
    fullName?: string; 
    password?: string;
    bloodGroup?: string;
    aadharNumber?: string;
    phone?: string;
  }
): { patient: PatientProfile; randomId: string; isNew: boolean } {
  const cleanEmail = email.trim().toLowerCase();

  // If already registered by this email, retrieve the permanent profile
  const existing = existingPatients.find(p => p.email && p.email.toLowerCase() === cleanEmail);
  if (existing) {
    const existingNum = existing.patientUid.replace(/\D/g, '') || existing.patientUid;
    const updatedExisting: PatientProfile = {
      ...existing,
      name: options?.fullName?.trim() || existing.name,
      password: options?.password || existing.password || 'password123',
      aadharNumber: options?.aadharNumber || existing.aadharNumber || '',
      phone: options?.phone || existing.phone || '+91 98765 43210',
      emergency: {
        ...existing.emergency,
        fullName: options?.fullName?.trim() || existing.emergency.fullName,
        bloodType: options?.bloodGroup || existing.emergency.bloodType || 'O Rh+',
      }
    };
    return { patient: updatedExisting, randomId: existingNum, isNew: false };
  }

  // Generate a random permanent ID number
  const randomId = generateRandomPermanentId(existingPatients);
  const formattedUid = `DH-${randomId}`;

  // Derive human-readable name from email or provided name
  let displayName = options?.fullName?.trim();
  if (!displayName) {
    const handle = cleanEmail.split('@')[0];
    displayName = handle
      .split(/[._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ')
      .trim();
    if (!displayName || displayName.length < 2) {
      displayName = `Patient ${randomId}`;
    }
  }

  // Create patient base from deterministic generator
  const { patient: basePatient } = getOrCreatePatientByNumber(randomId, existingPatients);

  // Customize with user's permanent mail ID and name
  const permanentPatient: PatientProfile = {
    ...basePatient,
    id: `pat-${randomId}`,
    patientUid: formattedUid,
    idNumber: randomId,
    aadharNumber: options?.aadharNumber || '',
    phone: options?.phone || basePatient.phone || '+91 98765 43210',
    password: options?.password || 'password123',
    name: displayName,
    email: cleanEmail,
    emergency: {
      ...basePatient.emergency,
      fullName: displayName,
      bloodType: options?.bloodGroup || basePatient.emergency.bloodType || 'O Rh+',
      qrCodeToken: `DEGI-${formattedUid}-TOKEN`
    }
  };

  return { patient: permanentPatient, randomId, isNew: true };
}
