import { PatientProfile, DoctorProfile } from '../types/health';

export const INITIAL_DOCTOR: DoctorProfile = {
  id: 'doc-01',
  name: 'Dr. Marcus Vance, MD',
  title: 'Chief of Interventional Cardiology',
  specialty: 'Cardiovascular & Internal Medicine',
  hospital: 'St. Jude Academic Medical Center',
  licenseId: 'MED-94021',
  npiNumber: '1948301928',
  avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=160&auto=format&fit=crop&q=80',
  activePatientsCount: 38,
  department: 'Heart & Vascular Institute',
  email: 'dr.vance@stjude.org',
  phone: '+91 98421 19483',
  aadharNumber: '7842 1948 3019',
  bloodGroup: 'B+',
  password: '9402'
};

export const INITIAL_PATIENTS: PatientProfile[] = [
  {
    id: 'pat-01',
    patientUid: 'DH-8824',
    idNumber: '8824',
    name: 'Gokul Velmurugan',
    dob: '1989-04-14',
    age: 36,
    gender: 'Male',
    email: 'gokulvelmurugan4555@gmail.com',
    phone: '+91 98765 43210',
    aadharNumber: '4589 1234 5678',
    bloodGroup: 'O+',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    takingMedication: 'yes',
    disease: 'Moderate Extrinsic Asthma, Mild Essential Hypertension',
    emergency: {
      fullName: 'Gokul Velmurugan',
      dob: 'April 14, 1989',
      bloodType: 'O+',
      allergies: ['Severe Penicillin (Anaphylaxis)', 'Latex', 'Sulfonamides'],
      chronicConditions: ['Moderate Asthma (Extrinsic)', 'Mild Essential Hypertension'],
      disease: 'Moderate Extrinsic Asthma, Mild Essential Hypertension',
      takingMedication: 'yes',
      medications: ['Atorvastatin 20mg daily', 'Albuterol HFA inhaler PRN', 'Lisinopril 10mg daily'],
      emergencyContacts: [
        { name: 'Family Contact / Caregiver', relationship: 'Primary Caregiver', phone: '+91 98765 43219' },
        { name: 'Dr. Marcus Vance', relationship: 'Primary Clinician', phone: '+1 (555) 882-9900' }
      ],
      organDonor: true,
      cloudSyncEnabled: true,
      lastSynced: 'Just now (Continuous)',
      qrCodeToken: 'DEGI-SEC-PATIENT-DH-8824-SIG-7F89B2'
    },
    prescriptions: [
      {
        id: 'rx-01',
        medication: 'Atorvastatin Calcium',
        dosage: '20 mg Oral Tablet',
        frequency: 'Once daily at bedtime',
        prescribedBy: 'Dr. Marcus Vance, MD',
        prescribedDate: '2026-08-12',
        refillsRemaining: 3,
        maxRefills: 4,
        pharmacy: 'CVS Pharmacy #4102 - Highland Ave',
        status: 'active',
        instructions: 'Take with or without food. Avoid excessive grapefruit consumption.'
      },
      {
        id: 'rx-02',
        medication: 'Lisinopril',
        dosage: '10 mg Oral Tablet',
        frequency: 'Once daily in the morning',
        prescribedBy: 'Dr. Alisha Patel, MD',
        prescribedDate: '2026-07-04',
        refillsRemaining: 2,
        maxRefills: 3,
        pharmacy: 'CVS Pharmacy #4102 - Highland Ave',
        status: 'active',
        instructions: 'Monitor blood pressure weekly. Report persistent dry cough if present.'
      },
      {
        id: 'rx-03',
        medication: 'Albuterol Sulfate HFA Inhaler',
        dosage: '90 mcg/actuation Aerosol',
        frequency: '1-2 puffs every 4 to 6 hours as needed',
        prescribedBy: 'Dr. Alisha Patel, MD',
        prescribedDate: '2026-05-18',
        refillsRemaining: 1,
        maxRefills: 3,
        pharmacy: 'Walgreens Pharmacy #1092',
        status: 'active',
        instructions: 'Rinse mouth after use. Keep rescue inhaler in carry pouch.'
      }
    ],
    doctorPermissions: [
      {
        id: 'perm-01',
        doctorName: 'Dr. Marcus Vance, MD',
        hospital: 'St. Jude Academic Medical Center',
        specialty: 'Interventional Cardiology',
        licenseNumber: 'MED-94021',
        grantedDate: '2026-08-12',
        expiresIn: 'Active (24-Hour Ephemeral Lease)',
        status: 'active',
        scopes: {
          timeline: true,
          prescriptions: true,
          labReports: true,
          imaging: true,
          emergencyOnly: false
        }
      },
      {
        id: 'perm-02',
        doctorName: 'Dr. Alisha Patel, MD',
        hospital: 'Metropolitan Community Health',
        specialty: 'Internal & Preventive Medicine',
        licenseNumber: 'MED-81204',
        grantedDate: '2026-01-15',
        expiresIn: 'Annual Authorized Caregiver',
        status: 'active',
        scopes: {
          timeline: true,
          prescriptions: true,
          labReports: true,
          imaging: true,
          emergencyOnly: false
        }
      },
      {
        id: 'perm-03',
        doctorName: 'Dr. David Kim, MD',
        hospital: 'Bay Radiology & Diagnostics Group',
        specialty: 'Diagnostic Radiology',
        licenseNumber: 'MED-66019',
        grantedDate: '2026-06-20',
        expiresIn: 'Single Imaging Encounter (Expired)',
        status: 'revoked',
        scopes: {
          timeline: false,
          prescriptions: false,
          labReports: false,
          imaging: true,
          emergencyOnly: false
        }
      }
    ],
    accessLogs: [
      {
        id: 'log-01',
        timestamp: '2026-09-29 08:42:11 UTC',
        actor: 'Dr. Marcus Vance, MD',
        role: 'Attending Cardiologist',
        facility: 'St. Jude Academic Medical Center',
        ipAddress: '142.250.190.44 (FedNet Node #3)',
        action: 'Queried Longitudinal Lipid & ECG Panel',
        resource: 'Diagnostic Lab Reports / Cardiology Timeline',
        purpose: 'Bi-annual Cardiovascular Follow-up',
        status: 'Authorized'
      },
      {
        id: 'log-02',
        timestamp: '2026-09-18 14:15:30 UTC',
        actor: 'Dr. Alisha Patel, MD',
        role: 'Primary Care Physician',
        facility: 'Metropolitan Community Health',
        ipAddress: '172.56.21.90 (FedNet Node #7)',
        action: 'Prescription Renewal Auth',
        resource: 'Active Prescriptions (Lisinopril 10mg)',
        purpose: 'Routine Prescription Refill Protocol',
        status: 'Authorized'
      },
      {
        id: 'log-03',
        timestamp: '2026-09-15 19:22:04 UTC',
        actor: 'Automated Ephemeral Key Vault',
        role: 'Cryptographic Engine',
        facility: 'DegiHealth Secure Enclave',
        ipAddress: '10.240.0.12 (Internal Node)',
        action: 'Purged Temporary Decryption Keys',
        resource: 'Session Cache / Cache-Token-0x99A',
        purpose: '15-min Session Expiration Sweep',
        status: 'Auto-Purged'
      },
      {
        id: 'log-04',
        timestamp: '2026-08-30 11:05:44 UTC',
        actor: 'St. Jude Emergency Triage',
        role: 'Paramedic / Triage Scanner',
        facility: 'St. Jude Emergency Center',
        ipAddress: '198.51.100.82 (FedNet Node #1)',
        action: 'Read Emergency Medical Card via QR Token',
        resource: 'Emergency Card (Allergies, Blood Type O+)',
        purpose: 'Emergency Intake Triage',
        status: 'Authorized'
      }
    ],
    records: [
      {
        id: 'rec-01',
        date: '2026-09-12',
        category: 'Consultation',
        title: 'Cardiovascular Comprehensive Consultation & ECG',
        facility: 'St. Jude Academic Medical Center - Suite 400',
        doctor: 'Dr. Marcus Vance, MD',
        specialty: 'Interventional Cardiology',
        summary: 'Patient presented for 6-month post-statin review. Reports good exercise tolerance with 4 miles weekly brisk walking. 12-lead resting ECG demonstrates normal sinus rhythm with regular PR interval (142 ms). No signs of ischemia or ST deviations. Blood pressure measured at 118/76 mmHg. Recommended continuation of current Atorvastatin 20mg regimen.',
        diagnosisCode: 'ICD-10: I10 (Essential Hypertension) / Z13.60',
        accessLevel: 'full',
        metrics: [
          { label: 'Resting Blood Pressure', value: '118/76', unit: 'mmHg', normalRange: '90/60 - 120/80', status: 'normal' },
          { label: 'Resting Heart Rate', value: '68', unit: 'bpm', normalRange: '60 - 100', status: 'normal' },
          { label: 'ECG QTc Interval', value: '412', unit: 'ms', normalRange: '< 450', status: 'normal' },
          { label: 'Body Mass Index', value: '23.4', unit: 'kg/m²', normalRange: '18.5 - 24.9', status: 'normal' }
        ],
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
        fileAttachment: 'Cardio_Consult_ECG_Sep2026.pdf'
      },
      {
        id: 'rec-02',
        date: '2026-08-28',
        category: 'Lab Report',
        title: 'Comprehensive Metabolic & Lipid Diagnostic Panel',
        facility: 'Quest Diagnostics Regional Reference Lab',
        doctor: 'Dr. Alisha Patel, MD',
        specialty: 'Internal Medicine',
        summary: 'Fasting lipid panel demonstrates notable reduction in LDL-C following adherence to statin therapy. Serum creatinine and eGFR confirm preserved renal filtration. Fasting plasma glucose within optimal glycemic boundaries.',
        diagnosisCode: 'ICD-10: E78.00 (Pure Hypercholesterolemia)',
        accessLevel: 'full',
        metrics: [
          { label: 'Total Cholesterol', value: '168', unit: 'mg/dL', normalRange: '< 200', status: 'normal' },
          { label: 'LDL-C (Calculated)', value: '88', unit: 'mg/dL', normalRange: '< 100', status: 'normal' },
          { label: 'HDL-C', value: '56', unit: 'mg/dL', normalRange: '> 50', status: 'normal' },
          { label: 'Serum Triglycerides', value: '120', unit: 'mg/dL', normalRange: '< 150', status: 'normal' },
          { label: 'Fasting Glucose', value: '92', unit: 'mg/dL', normalRange: '70 - 99', status: 'normal' },
          { label: 'eGFR (CKD-EPI)', value: '104', unit: 'mL/min/1.73m²', normalRange: '> 90', status: 'normal' }
        ],
        fileAttachment: 'Metabolic_Lipid_Panel_Aug2026.pdf'
      },
      {
        id: 'rec-03',
        date: '2026-06-20',
        category: 'Consultation',
        title: 'Cardiopulmonary Thoracic Consultation & Diagnostics',
        facility: 'Bay Clinical & Diagnostics Center',
        doctor: 'Dr. David Kim, MD',
        specialty: 'Internal Medicine',
        summary: 'Clinical consultation and thoracic examination. Bilateral pulmonary parenchyma clear of focal infiltrates or suspicious opacities. Dimensional parameters within normal limits.',
        diagnosisCode: 'ICD-10: J45.909 (Unspecified Asthma, uncomplicated)',
        accessLevel: 'full',
        imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
        fileAttachment: 'Thoracic_Diagnostic_Consult_Report.pdf'
      },
      {
        id: 'rec-04',
        date: '2026-03-10',
        category: 'Consultation',
        title: 'Pulmonary Function Testing & Pre/Post Bronchodilator Spirometry',
        facility: 'Metropolitan Respiratory Specialists',
        doctor: 'Dr. Rachel Adams, MD',
        specialty: 'Pulmonology',
        summary: 'Baseline spirometry showed mild airflow obstruction with FEV1/FVC ratio 74%. Following administration of 2 puffs Albuterol, FEV1 increased by 14% (280 mL), demonstrating significant reversibility consistent with extrinsic bronchial asthma.',
        diagnosisCode: 'ICD-10: J45.40 (Moderate Persistent Asthma)',
        accessLevel: 'full',
        metrics: [
          { label: 'Pre-Rx FEV1', value: '2.14', unit: 'L (76%)', normalRange: '> 80%', status: 'attention' },
          { label: 'Post-Rx FEV1', value: '2.44', unit: 'L (87%)', normalRange: '> 80%', status: 'normal' },
          { label: 'FEV1 / FVC Ratio', value: '78', unit: '%', normalRange: '> 70%', status: 'normal' }
        ],
        fileAttachment: 'PFT_Spirometry_Report.pdf'
      },
      {
        id: 'rec-05',
        date: '2025-11-14',
        category: 'Consultation',
        title: 'Annual Preventive Health & Wellness Examination',
        facility: 'Metropolitan Health Preventive Clinic',
        doctor: 'Dr. Alisha Patel, MD',
        specialty: 'Preventive Medicine',
        summary: 'Annual preventive wellness consultation and routine vitals assessment. Patient in good health, regular exercise tolerated without limitation.',
        diagnosisCode: 'ICD-10: Z00.00 (General adult medical examination)',
        accessLevel: 'full',
        fileAttachment: 'Wellness_Exam_Summary_2025.pdf'
      }
    ]
  },
  {
    id: 'pat-02',
    patientUid: 'DH-4109',
    name: 'Liam Chen',
    dob: '1978-11-03',
    age: 47,
    gender: 'Male',
    email: 'liam.chen@degihealth.net',
    phone: '+1 (555) 789-0144',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    takingMedication: 'yes',
    disease: 'Type 2 Diabetes Mellitus, Mild Coronary Artery Disease',
    emergency: {
      fullName: 'Liam Chen',
      dob: 'November 3, 1978',
      bloodType: 'A Rh+',
      allergies: ['Aspirin / NSAIDs (Bronchospasm)', 'Iodinated Radiocontrast'],
      chronicConditions: ['Type 2 Diabetes Mellitus', 'Coronary Artery Disease - Mild'],
      disease: 'Type 2 Diabetes Mellitus, Mild Coronary Artery Disease',
      takingMedication: 'yes',
      medications: ['Metformin 1000mg BID', 'Empagliflozin 10mg daily'],
      emergencyContacts: [
        { name: 'Mei-Ling Chen', relationship: 'Sister', phone: '+1 (555) 910-3344' }
      ],
      organDonor: true,
      cloudSyncEnabled: true,
      lastSynced: '12 mins ago',
      qrCodeToken: 'DEGI-SEC-PATIENT-DH-4109-SIG-3E41C9'
    },
    prescriptions: [
      {
        id: 'rx-04',
        medication: 'Metformin Hydrochloride ER',
        dosage: '1000 mg Oral Tablet',
        frequency: 'Twice daily with meals',
        prescribedBy: 'Dr. Marcus Vance, MD',
        prescribedDate: '2026-08-01',
        refillsRemaining: 4,
        maxRefills: 5,
        pharmacy: 'Rite Aid Pharmacy #2901',
        status: 'active',
        instructions: 'Take with morning and evening meal to avoid GI distress.'
      },
      {
        id: 'rx-05',
        medication: 'Empagliflozin (Jardiance)',
        dosage: '10 mg Oral Tablet',
        frequency: 'Once daily in the morning',
        prescribedBy: 'Dr. Marcus Vance, MD',
        prescribedDate: '2026-06-15',
        refillsRemaining: 3,
        maxRefills: 4,
        pharmacy: 'Rite Aid Pharmacy #2901',
        status: 'active',
        instructions: 'Maintain adequate daytime hydration.'
      }
    ],
    doctorPermissions: [
      {
        id: 'perm-10',
        doctorName: 'Dr. Marcus Vance, MD',
        hospital: 'St. Jude Academic Medical Center',
        specialty: 'Cardiovascular & Internal Medicine',
        licenseNumber: 'MED-94021',
        grantedDate: '2026-08-01',
        expiresIn: 'Active (24-Hour Ephemeral Lease)',
        status: 'active',
        scopes: {
          timeline: true,
          prescriptions: true,
          labReports: true,
          imaging: true,
          emergencyOnly: false
        }
      }
    ],
    accessLogs: [
      {
        id: 'log-10',
        timestamp: '2026-09-28 11:20:10 UTC',
        actor: 'Dr. Marcus Vance, MD',
        role: 'Attending Physician',
        facility: 'St. Jude Academic Medical Center',
        ipAddress: '142.250.190.44 (FedNet Node #3)',
        action: 'Evaluated HbA1c and Renal Microalbumin Panel',
        resource: 'Longitudinal Lab Reports',
        purpose: 'Diabetes Management Review',
        status: 'Authorized'
      }
    ],
    records: [
      {
        id: 'rec-10',
        date: '2026-09-05',
        category: 'Lab Report',
        title: 'Glycated Hemoglobin (HbA1c) & Renal Microalbumin',
        facility: 'St. Jude Academic Medical Center',
        doctor: 'Dr. Marcus Vance, MD',
        specialty: 'Internal Medicine',
        summary: 'HbA1c levels demonstrate sustained glycemic control at 6.4%, showing excellent response to lifestyle and biguanide regimen. Urine albumin-to-creatinine ratio is normal at 14 mg/g.',
        diagnosisCode: 'ICD-10: E11.9 (Type 2 Diabetes Mellitus without complications)',
        metrics: [
          { label: 'Hemoglobin A1c', value: '6.4', unit: '%', normalRange: '< 7.0 (Diabetic target)', status: 'normal' },
          { label: 'Estimated Average Glucose', value: '137', unit: 'mg/dL', normalRange: '100 - 150', status: 'normal' },
          { label: 'Urine Albumin/Creatinine', value: '14', unit: 'mg/g', normalRange: '< 30', status: 'normal' }
        ],
        accessLevel: 'full',
        fileAttachment: 'Liam_Chen_HbA1c_Sep2026.pdf'
      },
      {
        id: 'rec-11',
        date: '2026-07-18',
        category: 'Consultation',
        title: 'Cardiovascular Risk Stratification & Stress Echocardiogram',
        facility: 'St. Jude Heart & Vascular Institute',
        doctor: 'Dr. Marcus Vance, MD',
        specialty: 'Interventional Cardiology',
        summary: 'Patient completed 9 minutes on Bruce protocol treadmill achieving 88% predicted max heart rate. Stress echocardiography demonstrated preserved left ventricular ejection fraction (LVEF 60%) with no regional wall motion abnormalities during peak stress.',
        diagnosisCode: 'ICD-10: I25.10 (Atherosclerotic Heart Disease)',
        metrics: [
          { label: 'Resting Blood Pressure', value: '124/80', unit: 'mmHg', normalRange: '< 130/80', status: 'normal' },
          { label: 'Peak Exercise Heart Rate', value: '154', unit: 'bpm', normalRange: '145 - 165', status: 'normal' },
          { label: 'Left Ventricle EF', value: '60', unit: '%', normalRange: '50 - 70%', status: 'normal' }
        ],
        accessLevel: 'full',
        fileAttachment: 'Stress_Echo_Report_Jul2026.pdf'
      },
      {
        id: 'rec-12',
        date: '2026-05-12',
        category: 'Consultation',
        title: 'Annual Dilated Retinal Fundus Examination',
        facility: 'Bay Eye Institute',
        doctor: 'Dr. Arthur Liu, MD',
        specialty: 'Ophthalmology',
        summary: 'Bilateral dilated exam reveals clear media, sharp optic disc margins, and no evidence of diabetic microaneurysms, macular edema, or cotton wool spots. Next screening due in 12 months.',
        diagnosisCode: 'ICD-10: Z13.5 (Encounter for screening for eye disorders)',
        accessLevel: 'full',
        fileAttachment: 'Retinal_Screening_Report.pdf'
      }
    ]
  },
  {
    id: 'pat-03',
    patientUid: 'DH-7731',
    name: 'Elena Rostova',
    dob: '1995-02-19',
    age: 31,
    gender: 'Female',
    email: 'elena.rostova@degihealth.net',
    phone: '+1 (555) 432-6699',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    takingMedication: 'no',
    disease: 'Severe Anaphylactic Peanut & Bee Venom Allergy',
    emergency: {
      fullName: 'Elena Rostova',
      dob: 'February 19, 1995',
      bloodType: 'B Rh-',
      allergies: ['Peanuts (Severe Anaphylaxis)', 'Bee Venom (Apis mellifera)', 'Tree Nuts (Walnuts)'],
      chronicConditions: ['History of Anaphylaxis', 'Allergic Rhinitis'],
      disease: 'Severe Anaphylactic Peanut & Bee Venom Allergy',
      takingMedication: 'no',
      medications: ['EpiPen 0.3mg Auto-Injector PRN', 'Cetirizine 10mg daily PRN'],
      emergencyContacts: [
        { name: 'Alexei Rostov', relationship: 'Father', phone: '+1 (555) 432-8800' }
      ],
      organDonor: true,
      cloudSyncEnabled: true,
      lastSynced: '1 hour ago',
      qrCodeToken: 'DEGI-SEC-PATIENT-DH-7731-SIG-9A01B4'
    },
    prescriptions: [
      {
        id: 'rx-20',
        medication: 'EpiPen 2-Pak (Epinephrine Injection)',
        dosage: '0.3 mg / 0.3 mL Auto-Injector',
        frequency: 'Inject IM in outer thigh immediately for anaphylaxis',
        prescribedBy: 'Dr. Marcus Vance, MD',
        prescribedDate: '2026-07-10',
        refillsRemaining: 2,
        maxRefills: 2,
        pharmacy: 'Walgreens Pharmacy #8820',
        status: 'active',
        instructions: 'Carry 2 auto-injectors at all times. Seek immediate 911 emergency medical care post injection.'
      },
      {
        id: 'rx-21',
        medication: 'Cetirizine HCl (Zyrtec)',
        dosage: '10 mg Oral Tablet',
        frequency: 'Once daily as needed for allergic rhinitis',
        prescribedBy: 'Dr. Alisha Patel, MD',
        prescribedDate: '2026-04-12',
        refillsRemaining: 3,
        maxRefills: 4,
        pharmacy: 'Walgreens Pharmacy #8820',
        status: 'active',
        instructions: 'Take with water. May cause mild drowsiness.'
      }
    ],
    doctorPermissions: [
      {
        id: 'perm-20',
        doctorName: 'Dr. Marcus Vance, MD',
        hospital: 'St. Jude Academic Medical Center',
        specialty: 'Emergency & Internal Medicine',
        licenseNumber: 'MED-94021',
        grantedDate: '2026-07-10',
        expiresIn: 'Active (24-Hour Ephemeral Lease)',
        status: 'active',
        scopes: {
          timeline: true,
          prescriptions: true,
          labReports: true,
          imaging: true,
          emergencyOnly: false
        }
      }
    ],
    accessLogs: [
      {
        id: 'log-20',
        timestamp: '2026-09-29 07:14:02 UTC',
        actor: 'Dr. Marcus Vance, MD',
        role: 'Attending Clinician',
        facility: 'St. Jude Academic Medical Center',
        ipAddress: '142.250.190.44 (FedNet Node #3)',
        action: 'Accessed Emergency Allergy Profile & Serology Records',
        resource: 'Allergy Panel / Immunoglobulin IgE',
        purpose: 'Clinical Intake Pre-assessment',
        status: 'Authorized'
      }
    ],
    records: [
      {
        id: 'rec-20',
        date: '2026-07-10',
        category: 'Lab Report',
        title: 'Comprehensive Allergen-Specific IgE Blood Test Panel',
        facility: 'Quest Diagnostics Immunology Laboratory',
        doctor: 'Dr. Marcus Vance, MD',
        specialty: 'Allergy & Clinical Immunology',
        summary: 'ImmunoCAP specific IgE testing shows very high sensitization to Peanut (f13: >100 kU/L, Class 6) and Honeybee venom (i1: 28.4 kU/L, Class 4). Low sensitization to Birch pollen.',
        diagnosisCode: 'ICD-10: T78.01XA (Anaphylactic reaction due to peanuts)',
        metrics: [
          { label: 'Peanut Specific IgE (f13)', value: '> 100', unit: 'kU/L', normalRange: '< 0.35', status: 'critical' },
          { label: 'Bee Venom IgE (i1)', value: '28.4', unit: 'kU/L', normalRange: '< 0.35', status: 'attention' },
          { label: 'Total Serum IgE', value: '412', unit: 'IU/mL', normalRange: '< 100', status: 'attention' }
        ],
        accessLevel: 'full',
        fileAttachment: 'Elena_Rostova_Allergy_IgE_Panel.pdf'
      },
      {
        id: 'rec-21',
        date: '2026-02-14',
        category: 'Consultation',
        title: 'Emergency Department Encounter - Accidental Ingestion Triage',
        facility: 'St. Jude Emergency Medical Center',
        doctor: 'Dr. Katherine Miller, MD',
        specialty: 'Emergency Medicine',
        summary: 'Patient presented with acute generalized urticaria, perioral angioedema, and throat tightness 10 minutes following accidental peanut trace in bakery item. Intramuscular epinephrine (0.3mg) administered in field. Stable vitals after 6-hour observation. Prescribed 2 new EpiPens.',
        diagnosisCode: 'ICD-10: T78.2XXA (Anaphylactic shock, unspecified, initial)',
        metrics: [
          { label: 'Emergency Intake SpO2', value: '98', unit: '%', normalRange: '95 - 100%', status: 'normal' },
          { label: 'Intake Blood Pressure', value: '112/70', unit: 'mmHg', normalRange: '90/60 - 120/80', status: 'normal' },
          { label: 'Respiratory Rate', value: '18', unit: 'breaths/min', normalRange: '12 - 20', status: 'normal' }
        ],
        accessLevel: 'full',
        fileAttachment: 'Emergency_Discharge_Summary_Feb2026.pdf'
      },
      {
        id: 'rec-22',
        date: '2025-09-08',
        category: 'Consultation',
        title: 'Preventive Health Check & Clinical Follow-up',
        facility: 'Bay Area Family Practice',
        doctor: 'Dr. Alisha Patel, MD',
        specialty: 'Preventive Medicine',
        summary: 'Preventive health consultation and periodic immunological follow-up assessment. Vitals within expected baseline.',
        diagnosisCode: 'ICD-10: Z00.00 (General medical examination)',
        accessLevel: 'full',
        fileAttachment: 'Health_Check_Summary.pdf'
      }
    ]
  },
  {
    id: 'pat-04',
    patientUid: 'DH-5520',
    name: 'Marcus Brody',
    dob: '1968-07-22',
    age: 58,
    gender: 'Male',
    email: 'marcus.brody@degihealth.net',
    phone: '+1 (555) 621-3904',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
    takingMedication: 'yes',
    disease: 'Hypertension, Stage 2 Chronic Kidney Disease',
    emergency: {
      fullName: 'Marcus Brody',
      dob: 'July 22, 1968',
      bloodType: 'AB Rh+',
      allergies: ['Ciprofloxacin', 'Codeine'],
      chronicConditions: ['Stage 2 Chronic Kidney Disease', 'Essential Hypertension'],
      disease: 'Hypertension, Stage 2 Chronic Kidney Disease',
      takingMedication: 'yes',
      medications: ['Losartan Potassium 50mg daily', 'Amlodipine 5mg daily'],
      emergencyContacts: [
        { name: 'Clara Brody', relationship: 'Spouse', phone: '+1 (555) 621-8899' }
      ],
      organDonor: true,
      cloudSyncEnabled: true,
      lastSynced: '25 mins ago',
      qrCodeToken: 'DEGI-SEC-PATIENT-DH-5520-SIG-44A91D'
    },
    prescriptions: [
      {
        id: 'rx-30',
        medication: 'Losartan Potassium',
        dosage: '50 mg Oral Tablet',
        frequency: 'Once daily in the morning',
        prescribedBy: 'Dr. Marcus Vance, MD',
        prescribedDate: '2026-08-20',
        refillsRemaining: 3,
        maxRefills: 4,
        pharmacy: 'Kroger Pharmacy #118',
        status: 'active',
        instructions: 'Renal protective anti-hypertensive. Check serum potassium periodically.'
      }
    ],
    doctorPermissions: [],
    accessLogs: [],
    records: [
      {
        id: 'rec-30',
        date: '2026-08-15',
        category: 'Lab Report',
        title: 'Renal Function Panel & Estimated GFR (CKD-EPI)',
        facility: 'St. Jude Nephrology Laboratory',
        doctor: 'Dr. Marcus Vance, MD',
        specialty: 'Nephrology & Cardiology',
        summary: 'Serum creatinine measured at 1.28 mg/dL corresponding to eGFR of 71 mL/min/1.73m², reflecting stable Stage 2 CKD with mild renal filtration decline. Serum potassium is normal at 4.4 mmol/L.',
        diagnosisCode: 'ICD-10: N18.2 (Chronic kidney disease, stage 2)',
        metrics: [
          { label: 'Serum Creatinine', value: '1.28', unit: 'mg/dL', normalRange: '0.7 - 1.3', status: 'attention' },
          { label: 'eGFR (CKD-EPI)', value: '71', unit: 'mL/min/1.73m²', normalRange: '> 90', status: 'attention' },
          { label: 'Serum Potassium', value: '4.4', unit: 'mmol/L', normalRange: '3.5 - 5.0', status: 'normal' }
        ],
        accessLevel: 'full',
        fileAttachment: 'Marcus_Brody_Renal_Panel_Aug2026.pdf'
      },
      {
        id: 'rec-31',
        date: '2026-05-30',
        category: 'Imaging',
        title: 'Bilateral Renal Diagnostic Ultrasound & Doppler',
        facility: 'Bay Radiology & Ultrasound',
        doctor: 'Dr. David Kim, MD',
        specialty: 'Diagnostic Radiology',
        summary: 'Both kidneys show normal cortical thickness with preserved corticomedullary differentiation. Right kidney measures 11.2 cm, left measures 11.5 cm. No hydronephrosis, calculus, or solid cortical mass identified. Renal artery velocities normal.',
        diagnosisCode: 'ICD-10: N28.9 (Disorder of kidney and ureter, unspecified)',
        accessLevel: 'full',
        fileAttachment: 'Renal_Ultrasound_Report.pdf'
      }
    ]
  }
];
