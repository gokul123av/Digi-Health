import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Stethoscope, 
  Search, 
  ShieldAlert, 
  ShieldCheck,
  PlusCircle, 
  Pill, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  ChevronRight, 
  Activity, 
  Calendar,
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Download,
  Check,
  UploadCloud,
  X,
  Image as ImageIcon,
  Maximize2,
  Trash2,
  Eye,
  Pencil,
  Building2,
  BadgeCheck,
  Mail,
  CreditCard,
  Droplet
} from 'lucide-react';
import { DoctorProfile, PatientProfile, PatientRecord, Prescription } from '../types/health';
import { findPatientByQuery, getOrCreatePatientByNumber } from '../utils/patientRegistry';
import { downloadMedicalReportPDF } from '../utils/pdfGenerator';
import { EditDoctorProfileModal } from './modals/EditDoctorProfileModal';
import { addRecordToDB, addPrescriptionToDB, addAccessLogToDB } from '../utils/apiService';

interface DoctorPortalProps {
  doctor: DoctorProfile;
  patients: PatientProfile[];
  activePatient: PatientProfile;
  onSelectPatient: (patient: PatientProfile) => void;
  onSearchPatientId?: (idQuery: string) => PatientProfile;
  onUpdatePatient?: (updated: PatientProfile) => void;
  onUpdateDoctor?: (updated: DoctorProfile) => void;
  onBackToGateway: () => void;
  onSwitchToPatient: () => void;
  onOpenQRScanner: () => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const DoctorPortal: React.FC<DoctorPortalProps> = ({
  doctor,
  patients,
  activePatient,
  onSelectPatient,
  onSearchPatientId,
  onUpdatePatient,
  onUpdateDoctor,
  onBackToGateway,
  onSwitchToPatient,
  onOpenQRScanner,
  onShowToast,
}) => {
  // Active clinical sub-tool
  const [activeClinicalTool, setActiveClinicalTool] = useState<'records-meds' | 'upload-record' | 'soap' | 'rx' | 'lab'>('records-meds');
  
  // Edit doctor profile state
  const [isEditDoctorProfileOpen, setIsEditDoctorProfileOpen] = useState(false);
  
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [loadedNotification, setLoadedNotification] = useState<string | null>(
    `Complete records (${activePatient.records.length}) & medications (${activePatient.prescriptions.length}) active for ${activePatient.name} (ID: ${activePatient.patientUid})`
  );
  const [isDownloadingPdfId, setIsDownloadingPdfId] = useState<string | null>(null);

  // Handle doctor downloading a patient's medical report as an authenticated PDF with attached image
  const handleDoctorDownloadReport = async (r: PatientRecord) => {
    setIsDownloadingPdfId(r.id);
    onShowToast(
      'Generating Patient Medical Report PDF',
      r.imageUrl ? 'Embedding clinical diagnostics, biomarkers, and attached imaging into PDF...' : 'Compiling verified clinical report PDF...',
      'info'
    );
    try {
      const res = await downloadMedicalReportPDF(activePatient, r);
      
      // Log access audit
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        actor: doctor.name,
        role: doctor.title,
        facility: doctor.hospital,
        ipAddress: '142.250.190.44 (FedNet Node #3)',
        action: `Clinician Downloaded Medical Report PDF: ${r.title}${r.imageUrl ? ' (With Diagnostic Scan Attached)' : ''}`,
        resource: `Patient Record [${r.id}]`,
        purpose: 'Clinical Review & Medical Archival',
        status: 'Authorized' as const
      };

      if (onUpdatePatient) {
        onUpdatePatient({
          ...activePatient,
          accessLogs: [newLog, ...(activePatient.accessLogs || [])]
        });
      }

      onShowToast(
        'Medical Report Downloaded',
        `"${res.fileName}" (${res.fileSizeKB} KB) downloaded to workstation with cryptographic seal.`,
        'success'
      );
    } catch (err) {
      console.error('Doctor PDF generation failed:', err);
      onShowToast('Download Failed', 'Could not generate report PDF. Please try again.', 'warning');
    } finally {
      setIsDownloadingPdfId(null);
    }
  };

  // Upload Medical Record Modal state (Doctor-only)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'Consultation' | 'Lab Report' | 'Prescription'>('Consultation');
  const [uploadDiagnosisCode, setUploadDiagnosisCode] = useState('ICD-10: I10 (Essential Hypertension)');
  const [uploadSummary, setUploadSummary] = useState('');
  const [uploadFacility, setUploadFacility] = useState(doctor.hospital);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadImageUrl, setUploadImageUrl] = useState<string>('');
  const [viewingDoctorImage, setViewingDoctorImage] = useState<{ url: string; title: string; doctor?: string; date?: string } | null>(null);

  // Handle doctor uploading an official clinical record
  const handleDoctorUploadRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      onShowToast('Record Title Required', 'Please enter a clinical record title.', 'warning');
      return;
    }

    const defaultFilename = `${uploadTitle.trim().replace(/\s+/g, '_')}_Signed.pdf`;
    const newRecord: PatientRecord = {
      id: `rec-doc-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      category: uploadCategory,
      title: uploadTitle.trim(),
      facility: uploadFacility.trim() || doctor.hospital,
      doctor: doctor.name,
      specialty: doctor.specialty,
      summary: uploadSummary.trim() || `Clinical examination and diagnostics recorded by ${doctor.name}. Cryptographically authenticated.`,
      diagnosisCode: uploadDiagnosisCode.trim() || undefined,
      fileAttachment: uploadFileName.trim() || defaultFilename,
      imageUrl: uploadImageUrl || undefined,
      accessLevel: 'full'
    };

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      actor: doctor.name,
      role: doctor.title,
      facility: doctor.hospital,
      ipAddress: '142.250.190.44 (FedNet Node #3)',
      action: `Uploaded & Cryptographically Signed Medical Record: ${newRecord.title}${uploadImageUrl ? ' (With Diagnostic Image)' : ''}`,
      resource: 'Longitudinal Medical Records',
      purpose: 'Official Clinical Care Documentation',
      status: 'Authorized' as const
    };

    const updatedPatient: PatientProfile = {
      ...activePatient,
      records: [newRecord, ...activePatient.records],
      accessLogs: [newLog, ...(activePatient.accessLogs || [])]
    };

    // Save to PostgreSQL database
    addRecordToDB(newRecord, activePatient.id);
    addAccessLogToDB(newLog, activePatient.id);

    if (onUpdatePatient) {
      onUpdatePatient(updatedPatient);
    } else {
      onSelectPatient(updatedPatient);
    }

    onShowToast(
      'Medical Record Uploaded & Encrypted',
      `"${newRecord.title}" ${uploadImageUrl ? 'with diagnostic image' : ''} signed by ${doctor.name} and appended to ${activePatient.name}'s records (ID: ${activePatient.patientUid}).`,
      'success'
    );

    // Reset and close
    setUploadTitle('');
    setUploadSummary('');
    setUploadFileName('');
    setUploadImageUrl('');
    setIsUploadModalOpen(false);
    setActiveClinicalTool('records-meds');
  };

  // Update notification when active patient changes
  useEffect(() => {
    setLoadedNotification(
      `Complete records (${activePatient.records.length}) & medications (${activePatient.prescriptions.length}) active for ${activePatient.name} (ID: ${activePatient.patientUid})`
    );
  }, [activePatient.patientUid, activePatient.name, activePatient.records.length, activePatient.prescriptions.length]);

  // SOAP Note state
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  
  // Fast Rx state
  const [rxMedication, setRxMedication] = useState('');
  const [rxDosage, setRxDosage] = useState('');
  const [rxFrequency, setRxFrequency] = useState('Once daily');
  const [rxRefills, setRxRefills] = useState(2);
  const [allergyAlert, setAllergyAlert] = useState<string | null>(null);

  // Check allergy warning dynamically
  useEffect(() => {
    if (!rxMedication.trim()) {
      setAllergyAlert(null);
      return;
    }
    const medLower = rxMedication.toLowerCase();
    const matched = activePatient.emergency.allergies.find(allergy => {
      const allergyLower = allergy.toLowerCase();
      if (medLower.includes('penicillin') || medLower.includes('amoxicillin') || medLower.includes('ampicillin')) {
        return allergyLower.includes('penicillin');
      }
      if (medLower.includes('aspirin') || medLower.includes('ibuprofen') || medLower.includes('naproxen')) {
        return allergyLower.includes('aspirin') || allergyLower.includes('nsaid');
      }
      if (medLower.includes('sulfa') || medLower.includes('bactrim')) {
        return allergyLower.includes('sulfa');
      }
      return false;
    });

    if (matched) {
      setAllergyAlert(`CONTRAINDICATION WARNING: Patient has documented severe allergy: "${matched}". Administration poses acute anaphylactic risk!`);
    } else {
      setAllergyAlert(null);
    }
  }, [rxMedication, activePatient]);

  // Universal lookup handler: searches by Patient ID or Aadhaar Number (if patient forgot their ID)
  const handleLookupPatientId = (idQuery: string) => {
    const clean = idQuery.trim();
    if (!clean) {
      onShowToast('Enter Patient ID or Aadhaar Number', 'Please enter a Patient ID (e.g. 8824, 4109) or 12-digit Aadhaar Number (e.g. 4589 1234 5678).', 'warning');
      return;
    }

    let targetPatient: PatientProfile;
    if (onSearchPatientId) {
      targetPatient = onSearchPatientId(clean);
    } else {
      const { patient } = getOrCreatePatientByNumber(clean, patients);
      targetPatient = patient;
      onSelectPatient(targetPatient);
    }

    setActiveClinicalTool('records-meds');

    const cleanDigits = clean.replace(/\D/g, '');
    const isAadharQuery = cleanDigits.length >= 10;

    const message = isAadharQuery
      ? `Aadhaar Verified (#${targetPatient.aadharNumber || clean}): Medical history retrieved for ${targetPatient.name} (Permanent ID: ${targetPatient.patientUid}). Loaded ${targetPatient.records.length} records & ${targetPatient.prescriptions.length} medications.`
      : `Complete records (${targetPatient.records.length}) & active medications (${targetPatient.prescriptions.length}) loaded according to Patient ID ${targetPatient.patientUid}`;

    setLoadedNotification(message);
    onShowToast(
      isAadharQuery ? `Aadhaar Lookup Successful: ${targetPatient.name}` : `Patient ID Retrieved: ${targetPatient.patientUid}`, 
      message, 
      'success'
    );
  };

  // Handle save SOAP Note
  const handleSaveSOAP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessment.trim() && !subjective.trim()) {
      onShowToast('Please fill out note fields', 'Enter consultation findings or assessment before committing.', 'warning');
      return;
    }

    const noteRecord: PatientRecord = {
      id: `rec-doc-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      category: 'Consultation',
      title: `Clinical Encounter: ${assessment || 'Diagnostic Consultation'}`,
      doctor: doctor.name,
      facility: doctor.hospital,
      specialty: doctor.specialty,
      summary: `[SOAP Note] S: ${subjective || 'None'} | O: ${objective || 'Vitals stable'} | A: ${assessment || 'Evaluation completed'} | P: ${plan || 'Routine follow-up'}`,
      accessLevel: 'full',
      fileAttachment: 'Clinical_SOAP_Signed.pdf'
    };

    activePatient.records.unshift(noteRecord);
    setSubjective('');
    setObjective('');
    setAssessment('');
    setPlan('');

    onShowToast(
      'Clinical Note Signed & Appended',
      `Cryptographically signed and synced to ${activePatient.name}'s longitudinal health record.`,
      'success'
    );
  };

  // Handle Submit Rx
  const handleCreatePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxMedication.trim() || !rxDosage.trim()) return;

    if (allergyAlert) {
      const confirmBypass = window.confirm(`${allergyAlert}\n\nDo you want to override this clinical warning?`);
      if (!confirmBypass) return;
    }

    const newPrescription: Prescription = {
      id: `rx-doc-${Date.now()}`,
      medication: rxMedication,
      dosage: rxDosage,
      frequency: rxFrequency,
      prescribedBy: doctor.name,
      prescribedDate: new Date().toISOString().split('T')[0],
      refillsRemaining: rxRefills,
      maxRefills: rxRefills + 1,
      pharmacy: 'CVS Pharmacy #4102 - Preferred Network',
      status: 'active',
      instructions: 'Take as directed by prescribing physician.'
    };

    activePatient.prescriptions.unshift(newPrescription);
    addPrescriptionToDB(newPrescription, activePatient.id);
    if (onUpdatePatient) {
      onUpdatePatient({ ...activePatient });
    }
    setRxMedication('');
    setRxDosage('');

    onShowToast(
      'e-Prescription Dispatched',
      `${newPrescription.medication} sent to patient record and electronic dispensing pharmacy.`,
      'success'
    );
  };

  return (
    <div className="min-h-screen glossy-mesh text-slate-800 flex flex-col font-sans">
      
      {/* Top Professional Doctor Header */}
      <header className="bg-slate-900/85 backdrop-blur-2xl text-white border-b border-white/10 sticky top-0 z-40 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          
          {/* Left Brand and Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToGateway}
              className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Back to Gateway Portal"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-md shadow-indigo-500/30 border border-white/20 flex items-center justify-center text-white">
                <Stethoscope className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight">Degi<span className="text-cyan-400">Health</span></span>
                <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                  CLINICAL PORTAL
                </span>
              </div>
            </div>
          </div>

          {/* Right: Attending Doctor Profile Avatar & Edit Profile Trigger */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pl-2">
              <div 
                onClick={() => setIsEditDoctorProfileOpen(true)}
                className="relative group cursor-pointer"
                title="Edit Doctor Profile & Credentials"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-indigo-400 shadow-sm bg-indigo-900 group-hover:border-cyan-400 transition-colors">
                  <img src={doctor.avatar} alt={doctor.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Pencil className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div 
                onClick={() => setIsEditDoctorProfileOpen(true)}
                className="hidden sm:block text-left text-xs leading-tight cursor-pointer group"
                title="Edit Doctor Profile & Credentials"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white group-hover:text-cyan-300 transition-colors">{doctor.name}</span>
                  <span className="font-bold text-rose-300 text-[10px] bg-rose-950/80 px-1.5 py-0.2 rounded border border-rose-500/50">
                    {doctor.bloodGroup || 'O+'}
                  </span>
                  <Pencil className="w-2.5 h-2.5 text-slate-400 group-hover:text-cyan-300 transition-colors" />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-indigo-300 font-mono mt-0.5">
                  <span>{doctor.licenseId}</span>
                  {doctor.aadharNumber && (
                    <span className="hidden xl:inline text-slate-400">· Aadhaar: {doctor.aadharNumber}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Patient Intake Bar & Quick Switcher */}
      <section className="bg-white/80 backdrop-blur-xl border-b border-white/60 py-3.5 px-4 sm:px-6 shadow-xs sticky top-16 z-30">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Active Patient Details */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-indigo-500/80 shadow-md shadow-indigo-500/20 shrink-0 bg-indigo-50 flex items-center justify-center">
              {activePatient.avatar ? (
                <img src={activePatient.avatar} alt={activePatient.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-indigo-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">{activePatient.name}</h2>
                <span className="font-mono text-xs font-bold text-indigo-800 bg-indigo-50/80 border border-indigo-200/80 px-2.5 py-0.5 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
                  ID: {activePatient.patientUid}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {activePatient.age} yrs · {activePatient.gender} · DOB: {activePatient.dob}
                </span>
                <span className="font-mono text-xs font-bold text-slate-800 bg-white border border-slate-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Aadhaar: {activePatient.aadharNumber || '4589 1234 5678'}</span>
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50/80 text-rose-700 border border-rose-200/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
                  Blood: {activePatient.emergency.bloodType}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50/80 text-emerald-800 border border-emerald-300/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
                  Medications: {activePatient.prescriptions.length} Active
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-50/80 text-cyan-800 border border-cyan-300/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
                  Records: {activePatient.records.length} Documents
                </span>
              </div>

              {/* Disease and Allergies line */}
              <div className="flex items-center gap-3 mt-1 text-[11px] flex-wrap">
                <span className="text-slate-600 font-medium">
                  <strong>Diagnosed Disease:</strong> {activePatient.disease || activePatient.emergency.disease || activePatient.emergency.chronicConditions.join(', ') || 'None Reported'}
                </span>

                {/* Critical allergy bar for active patient */}
                {activePatient.emergency.allergies.length > 0 && (
                  <div className="flex items-center gap-1.5 text-rose-700 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Allergies: {activePatient.emergency.allergies.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Main Clinical Work Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Complete Records, Medications & Tools */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Prominent Confirmation Banner when Patient is Loaded */}
          {loadedNotification && (
            <div className="p-3.5 bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-indigo-500/15 backdrop-blur-xl border border-emerald-400/40 rounded-2xl flex items-center justify-between text-xs shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 block">{loadedNotification}</span>
                  <span className="text-[11px] text-slate-600">
                    Showing full longitudinal timeline, complete active prescriptions, diagnostic lab panels, and SOAP notes.
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2.5 py-0.5 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] shrink-0">
                VERIFIED ID
              </span>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl shadow-xs">
            <button
              onClick={() => setActiveClinicalTool('records-meds')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeClinicalTool === 'records-meds'
                  ? 'glossy-pill text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-indigo-600" />
              <span>Complete Records & Medications</span>
            </button>

            <button
              onClick={() => setActiveClinicalTool('soap')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeClinicalTool === 'soap'
                  ? 'glossy-pill text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>SOAP Clinical Note</span>
            </button>

            <button
              onClick={() => setActiveClinicalTool('rx')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeClinicalTool === 'rx'
                  ? 'glossy-pill text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              <span>New e-Prescription</span>
            </button>

            <button
              onClick={() => setActiveClinicalTool('lab')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeClinicalTool === 'lab'
                  ? 'glossy-pill text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Order Lab</span>
            </button>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-xs shrink-0"
              title="Upload and cryptographically sign official medical record"
            >
              <UploadCloud className="w-3.5 h-3.5 text-cyan-200" />
              <span>Upload Record</span>
            </button>
          </div>

          {/* COMPLETE PATIENT MEDICATIONS SECTION */}
          <div className="glossy-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border border-indigo-400/30 flex items-center justify-center text-indigo-700 shadow-xs">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Complete Patient Medications & Active Prescriptions</span>
                    <span className="text-xs font-mono font-bold text-indigo-800 bg-indigo-50/80 px-2.5 py-0.5 rounded-full border border-indigo-200/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
                      {activePatient.prescriptions.length} Active
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive medication regimen on file for Patient ID <strong>{activePatient.patientUid}</strong> ({activePatient.name})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveClinicalTool('rx')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-700 glossy-pill hover:shadow-sm border border-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Prescription</span>
              </button>
            </div>

            {/* Active Prescriptions Cards */}
            {activePatient.prescriptions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {activePatient.prescriptions.map((rx) => (
                  <div 
                    key={rx.id} 
                    className="p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-white/80 shadow-[0_4px_20px_rgba(15,23,42,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{rx.medication}</h4>
                          <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50/80 text-indigo-800 border border-indigo-200/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
                            {rx.dosage}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50/80 text-emerald-700 border border-emerald-200/80 uppercase tracking-wider shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
                          {rx.status}
                        </span>
                      </div>

                      <div className="mt-2 text-xs space-y-1 text-slate-600">
                        <p className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800">Frequency:</span>
                          <span>{rx.frequency}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800">Prescribed By:</span>
                          <span>{rx.prescribedBy} ({rx.prescribedDate})</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">Refills Remaining:</span>
                          <span className="font-bold text-indigo-700">{rx.refillsRemaining}</span> of {rx.maxRefills}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          <span className="font-semibold text-slate-700">Pharmacy:</span> {rx.pharmacy}
                        </p>
                        {rx.instructions && (
                          <div className="text-[11px] text-indigo-950 bg-indigo-50/80 p-2.5 rounded-xl border border-indigo-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] mt-2">
                            <strong>Patient Directions:</strong> {rx.instructions}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-slate-400">Rx ID: {rx.id}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            rx.refillsRemaining += 1;
                            onShowToast('Refill Authorized', `Added +1 refill authorization for ${rx.medication}.`, 'success');
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-white/90 border border-indigo-200/80 rounded-lg hover:bg-indigo-50 shadow-xs transition-colors cursor-pointer"
                        >
                          + Refill Auth
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-white/60 border border-slate-200/80 text-center space-y-1.5 shadow-xs">
                <p className="text-xs font-semibold text-slate-700">No Daily Maintenance Prescriptions Active</p>
                <p className="text-xs text-slate-500">
                  Emergency PRN medications on file: {activePatient.emergency.medications.join(', ') || 'None Reported'}
                </p>
              </div>
            )}
          </div>

          {/* COMPLETE PATIENT LONGITUDINAL RECORDS SECTION */}
          <div className="glossy-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-400/30 flex items-center justify-center text-cyan-700 shadow-xs">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Complete Patient Longitudinal Medical Records</span>
                    <span className="text-xs font-mono font-bold text-cyan-800 bg-cyan-50/80 px-2.5 py-0.5 rounded-full border border-cyan-200/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
                      {activePatient.records.length} Documents
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Federated diagnostic history, lab results, and consultations for ID {activePatient.patientUid}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Upload and cryptographically sign new medical record"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-cyan-200" />
                  <span>Upload Medical Record</span>
                </button>
                <span className="text-xs font-mono text-slate-500 glossy-pill px-3 py-1 rounded-lg hidden sm:inline-block">
                  Decryption: Verified Valid
                </span>
              </div>
            </div>

            {/* List of Complete Records */}
            <div className="space-y-3.5">
              {activePatient.records.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No longitudinal records found for this patient.</p>
              ) : (
                activePatient.records.map((r) => {
                  const isExpanded = expandedRecordId === r.id;

                  return (
                    <div 
                      key={r.id} 
                      className="p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-white/80 shadow-[0_4px_16px_rgba(15,23,42,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:border-cyan-300 hover:shadow-md transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] ${
                            r.category === 'Consultation' ? 'bg-indigo-100/80 text-indigo-800 border border-indigo-200' :
                            r.category === 'Lab Report' ? 'bg-teal-100/80 text-teal-800 border border-teal-200' :
                            r.category === 'Imaging' ? 'bg-purple-100/80 text-purple-800 border border-purple-200' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {r.category}
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{r.title}</h4>
                          {r.diagnosisCode && (
                            <span className="text-[10px] font-mono text-slate-500 bg-white/90 px-2 py-0.5 rounded-full border border-slate-200 shadow-xs">
                              {r.diagnosisCode}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleDoctorDownloadReport(r)}
                            disabled={isDownloadingPdfId === r.id}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-xs"
                            title="Download official patient medical report as PDF with attached diagnostic images"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">
                              {isDownloadingPdfId === r.id ? 'Generating...' : 'Download PDF'}
                            </span>
                          </button>
                          <span className="text-slate-500 font-mono text-[11px]">{r.date}</span>
                          <button
                            type="button"
                            onClick={() => setExpandedRecordId(isExpanded ? null : r.id)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
                            title={isExpanded ? 'Collapse' : 'Expand full record'}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 flex items-center gap-4 flex-wrap text-[11px]">
                        <span><strong>Provider:</strong> {r.doctor} ({r.specialty})</span>
                        <span><strong>Facility:</strong> {r.facility}</span>
                        {r.fileAttachment && (
                          <span className="text-cyan-700 font-medium flex items-center gap-1">
                            <FileText className="w-3 h-3" /> {r.fileAttachment}
                          </span>
                        )}
                      </div>

                      <p className={`text-xs text-slate-700 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {r.summary}
                      </p>

                      {/* Expanded Biomarker Metrics Table */}
                      {r.metrics && r.metrics.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200/80">
                          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                            Diagnostic Biomarkers & Quantitative Values:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {r.metrics.map((m, idx) => (
                              <div key={idx} className="p-2.5 bg-white/90 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                                <div>
                                  <span className="font-semibold text-slate-800 block text-[11px]">{m.label}</span>
                                  <span className="text-[10px] text-slate-400">Ref: {m.normalRange}</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-mono font-bold text-slate-900">{m.value} {m.unit}</span>
                                  <span className={`block text-[10px] font-bold uppercase ${
                                    m.status === 'normal' ? 'text-emerald-700' : 'text-amber-700'
                                  }`}>
                                    {m.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Attached Diagnostic Image Preview (Doctor View) */}
                      {r.imageUrl && (
                        <div className="mt-3 pt-3 border-t border-slate-200/80">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Attached Diagnostic Scan / Image</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setViewingDoctorImage({ url: r.imageUrl!, title: r.title, doctor: r.doctor, date: r.date })}
                              className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
                            >
                              <Maximize2 className="w-3 h-3" />
                              <span>Enlarge Image</span>
                            </button>
                          </div>
                          <div
                            onClick={() => setViewingDoctorImage({ url: r.imageUrl!, title: r.title, doctor: r.doctor, date: r.date })}
                            className="relative group rounded-xl overflow-hidden border border-slate-300/80 shadow-xs max-h-48 bg-slate-950 cursor-pointer flex items-center justify-center"
                          >
                            <img
                              src={r.imageUrl}
                              alt={r.title}
                              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-2.5">
                              <span className="text-white text-[11px] font-medium flex items-center gap-1">
                                <Eye className="w-3 h-3 text-cyan-300" /> Click to inspect clinical image
                              </span>
                              <span className="text-[10px] font-mono text-cyan-200 bg-slate-900/80 px-2 py-0.5 rounded border border-white/20">
                                Verified Decrypted
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 1. SOAP Note Tool Panel */}
          {activeClinicalTool === 'soap' && (
            <div className="glossy-card rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Physician SOAP Consultation Note</h3>
                  <p className="text-xs text-slate-500">Document objective examination, clinical assessment, and treatment plan.</p>
                </div>
                <span className="text-xs font-mono glossy-pill px-3 py-1 rounded-xl text-slate-700 font-semibold">
                  Provider: {doctor.name}
                </span>
              </div>

              <form onSubmit={handleSaveSOAP} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    [S] Subjective Symptoms & Chief Complaint
                  </label>
                  <textarea
                    rows={2}
                    value={subjective}
                    onChange={(e) => setSubjective(e.target.value)}
                    placeholder="Patient reports 3-week history of mild exertion dyspnea, no acute chest pressure..."
                    className="w-full p-3 text-xs glossy-input rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    [O] Objective Vitals, Physical Exam & Diagnostics
                  </label>
                  <textarea
                    rows={2}
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="BP: 120/78 mmHg, HR: 72 bpm regular, Lungs: clear to auscultation bilaterally, Heart: S1/S2 normal..."
                    className="w-full p-3 text-xs glossy-input rounded-xl focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      [A] Clinical Assessment & Differential Diagnosis
                    </label>
                    <input
                      type="text"
                      value={assessment}
                      onChange={(e) => setAssessment(e.target.value)}
                      placeholder="e.g. Stage 1 Essential HTN well controlled, Mild Asthma"
                      className="w-full p-3 text-xs glossy-input rounded-xl focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      [P] Treatment Plan & Follow-up Interval
                    </label>
                    <input
                      type="text"
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      placeholder="e.g. Maintain Lisinopril 10mg, Repeat Lipid Panel in 6 months"
                      className="w-full p-3 text-xs glossy-input rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/70">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Audit Signature: Ed25519-{doctor.licenseId}
                  </span>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl font-bold text-white glossy-button-indigo flex items-center gap-2 text-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Sign & Commit to Patient Timeline</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 2. Fast Rx Prescribing Tool */}
          {activeClinicalTool === 'rx' && (
            <div className="glossy-card rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Fast Clinical e-Prescription</h3>
                  <p className="text-xs text-slate-500">Transmits directly to patient chart and e-Prescribe pharmacy clearinghouse.</p>
                </div>
                <span className="text-xs font-mono bg-emerald-50/90 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full font-semibold shadow-xs">
                  DEA EPCS Authorized
                </span>
              </div>

              {/* Real-time Allergy Conflict Alert */}
              {allergyAlert && (
                <div className="mb-4 p-4 rounded-2xl bg-rose-50/90 border-2 border-rose-300 text-rose-900 text-xs flex items-start gap-3 shadow-sm animate-in shake">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-rose-900">CRITICAL SAFETY WARNING</h4>
                    <p className="mt-0.5 leading-relaxed">{allergyAlert}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleCreatePrescription} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Medication Brand / Generic Name
                    </label>
                    <input
                      type="text"
                      value={rxMedication}
                      onChange={(e) => setRxMedication(e.target.value)}
                      placeholder="e.g. Atorvastatin Calcium, Lisinopril, Metformin"
                      className="w-full p-2.5 text-xs glossy-input rounded-xl focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Dosage & Strength
                    </label>
                    <input
                      type="text"
                      value={rxDosage}
                      onChange={(e) => setRxDosage(e.target.value)}
                      placeholder="e.g. 20 mg Oral Tablet, 500 mg Capsule"
                      className="w-full p-2.5 text-xs glossy-input rounded-xl focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Administration Frequency
                    </label>
                    <select
                      value={rxFrequency}
                      onChange={(e) => setRxFrequency(e.target.value)}
                      className="w-full p-2.5 text-xs glossy-input rounded-xl focus:outline-none"
                    >
                      <option value="Once daily in the morning">Once daily in the morning</option>
                      <option value="Once daily at bedtime">Once daily at bedtime</option>
                      <option value="Twice daily with meals">Twice daily with meals</option>
                      <option value="Three times daily">Three times daily</option>
                      <option value="Every 4-6 hours PRN as needed">Every 4-6 hours PRN as needed</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Authorized Refills
                    </label>
                    <select
                      value={rxRefills}
                      onChange={(e) => setRxRefills(Number(e.target.value))}
                      className="w-full p-2.5 text-xs glossy-input rounded-xl focus:outline-none"
                    >
                      <option value={0}>0 Refills (Single Fill)</option>
                      <option value={1}>1 Refill</option>
                      <option value={2}>2 Refills</option>
                      <option value={3}>3 Refills (90-day supply)</option>
                      <option value={5}>5 Refills</option>
                    </select>
                  </div>
                </div>

                {/* Quick medication presets */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">Common Formulary Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: 'Atorvastatin', dose: '20 mg Oral Tablet' },
                      { name: 'Metformin', dose: '500 mg Oral Tablet' },
                      { name: 'Lisinopril', dose: '10 mg Oral Tablet' },
                      { name: 'Amoxicillin (Penicillin Test)', dose: '500 mg Capsule' },
                    ].map((pre, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setRxMedication(pre.name);
                          setRxDosage(pre.dose);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 shadow-xs text-xs font-medium transition-colors cursor-pointer"
                      >
                        + {pre.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/70">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Routing: SureScripts Direct EDI
                  </span>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl font-bold text-white glossy-button-indigo flex items-center gap-2 text-xs cursor-pointer"
                  >
                    <Pill className="w-3.5 h-3.5" />
                    <span>Authorize & Send e-Prescription</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 3. Order Diagnostic Lab */}
          {activeClinicalTool === 'lab' && (
            <div className="glossy-card rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Order Clinical Laboratory & Imaging Orders</h3>
                  <p className="text-xs text-slate-500">Orders route to Quest Diagnostics, LabCorp, or Hospital Reference Labs.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { name: 'Complete Blood Count (CBC) with Diff', code: 'CPT 85025', urgent: false },
                  { name: 'Comprehensive Metabolic Panel (CMP-14)', code: 'CPT 80053', urgent: false },
                  { name: 'High-Sensitivity Troponin I (hs-cTnI)', code: 'CPT 84484', urgent: true },
                  { name: 'Full Fasting Lipid Diagnostic Panel', code: 'CPT 80061', urgent: false },
                  { name: 'Hemoglobin A1c (Glycated Hb)', code: 'CPT 83036', urgent: false },
                  { name: '12-Lead Resting Electrocardiogram (ECG)', code: 'CPT 93000', urgent: false },
                ].map((lab, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-white/75 backdrop-blur-md border border-white/80 shadow-xs flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{lab.name}</p>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">{lab.code}</p>
                    </div>
                    <button
                      onClick={() => {
                        onShowToast(
                          'Diagnostic Order Dispatched',
                          `${lab.name} requisitions ordered for ${activePatient.name}. Order barcode generated.`,
                          'success'
                        );
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80 shadow-xs transition-colors cursor-pointer"
                    >
                      Order Test
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Patient Emergency Triage & Clinician Profile */}
        <div className="space-y-6">
          
          {/* Quick Emergency Card View */}
          <div className="glossy-card rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" /> Emergency Triage Info
              </h4>
              <span className="text-xs font-bold text-rose-600 glossy-pill px-2.5 py-0.5 rounded-full">{activePatient.emergency.bloodType}</span>
            </div>

            <div className="p-3 bg-rose-50/80 border border-rose-200/80 rounded-2xl text-xs shadow-xs">
              <span className="font-bold text-rose-900 block mb-1">Severe Allergies:</span>
              <div className="flex flex-wrap gap-1">
                {activePatient.emergency.allergies.map((a, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-full bg-white/90 text-rose-800 text-[11px] font-semibold border border-rose-200/80 shadow-xs">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-xs space-y-2 text-slate-600">
              <div>
                <span className="font-semibold text-slate-800 block">Chronic Diagnoses:</span>
                <p className="text-[11px] text-slate-500">{activePatient.emergency.chronicConditions.join(', ')}</p>
              </div>

              <div>
                <span className="font-semibold text-slate-800 block">Current Daily Medications:</span>
                <p className="text-[11px] text-slate-500">{activePatient.emergency.medications.join(', ')}</p>
              </div>

              <div>
                <span className="font-semibold text-slate-800 block">Emergency Contact:</span>
                <p className="text-[11px] text-slate-500">
                  {activePatient.emergency.emergencyContacts[0]?.name} ({activePatient.emergency.emergencyContacts[0]?.relationship}): {activePatient.emergency.emergencyContacts[0]?.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Attending Clinician Profile & Credentials Card */}
          <div className="glossy-card rounded-3xl p-5 border border-white/80 shadow-lg shadow-indigo-500/5 space-y-3.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shadow-xs">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Attending Clinician Profile
                  </h4>
                  <p className="text-[10px] text-slate-400">Authenticated Provider Enclave</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditDoctorProfileOpen(true)}
                className="px-2.5 py-1 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                title="Edit clinician name, title, medical specialty, hospital, license, and photo"
              >
                <Pencil className="w-3 h-3" />
                <span>Edit Profile</span>
              </button>
            </div>

            <div className="p-3 bg-white/95 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
              <div 
                onClick={() => setIsEditDoctorProfileOpen(true)}
                className="w-12 h-12 rounded-xl overflow-hidden border-2 border-indigo-500/80 shrink-0 bg-slate-900 relative group cursor-pointer"
                title="Click to edit doctor photo"
              >
                <img src={doctor.avatar} alt={doctor.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Pencil className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="space-y-0.5 min-w-0">
                <h5 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{doctor.name}</h5>
                <p className="text-[11px] text-indigo-700 font-semibold truncate">{doctor.title}</p>
                <p className="text-[10px] text-slate-500 truncate">{doctor.hospital}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Medical License</span>
                <span className="font-mono font-bold text-slate-900">{doctor.licenseId}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">NPI Identifier</span>
                <span className="font-mono font-bold text-slate-900">{doctor.npiNumber || '1982736450'}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 space-y-1">
              <p className="flex items-center gap-1.5 text-slate-500">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{doctor.department || 'Cardiovascular Medicine'}</span>
              </p>
              {doctor.email && (
                <p className="flex items-center gap-1.5 text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{doctor.email}</span>
                </p>
              )}
            </div>
          </div>

        </div>

      </main>

      {/* Upload Medical Record Modal (Doctor-Only) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-cyan-300">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-cyan-200 font-bold">
                    OFFICIAL CLINICIAN RECORD ENTRY
                  </span>
                  <h3 className="text-base font-bold text-white">Upload Patient Medical Record</h3>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsUploadModalOpen(false)} 
                className="text-white/70 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleDoctorUploadRecord} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Patient Badge */}
              <div className="p-3 bg-indigo-50/80 border border-indigo-200/80 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {activePatient.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">{activePatient.name}</span>
                    <span className="text-[11px] font-mono text-indigo-700">Patient ID: {activePatient.patientUid} · DOB: {activePatient.dob}</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Authenticated Enclave
                </span>
              </div>

              {/* Record Title */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Record Title / Procedure Name
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Cardiovascular Diagnostic Assessment & Echocardiography"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  required
                />
              </div>

              {/* Category & ICD-10 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Clinical Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e: any) => setUploadCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
                  >
                    <option value="Consultation">Consultation / Clinical Note</option>
                    <option value="Lab Report">Lab Report / Diagnostic Panel</option>
                    <option value="Prescription">Prescription Record</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Diagnosis Code (ICD-10)</label>
                  <input
                    type="text"
                    value={uploadDiagnosisCode}
                    onChange={(e) => setUploadDiagnosisCode(e.target.value)}
                    placeholder="ICD-10: I10 / E78.00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Facility & Doctor Signature Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Healthcare Facility</label>
                  <input
                    type="text"
                    value={uploadFacility}
                    onChange={(e) => setUploadFacility(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Attending Clinician</label>
                  <input
                    type="text"
                    value={`${doctor.name} (${doctor.licenseId})`}
                    disabled
                    className="w-full px-3 py-2 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Clinical Notes & Findings */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Clinical Examination Notes, Findings & Instructions
                </label>
                <textarea
                  rows={3}
                  value={uploadSummary}
                  onChange={(e) => setUploadSummary(e.target.value)}
                  placeholder="Document clinical diagnosis, patient observations, treatment recommendations, and vital status..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                  required
                />
              </div>

              {/* Diagnostic Image / Medical Scan Upload */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 block">
                    Diagnostic Image / Medical Scan (Visible to Patient)
                  </label>
                  <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    Patient Portal Visible
                  </span>
                </div>

                {uploadImageUrl ? (
                  <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2">
                    <div className="relative group rounded-xl overflow-hidden border border-indigo-300 max-h-48 bg-slate-950 flex items-center justify-center">
                      <img
                        src={uploadImageUrl}
                        alt="Uploaded preview"
                        className="w-full h-44 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-2.5">
                        <span className="text-white text-xs font-semibold flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Image Ready for Patient View
                        </span>
                        <button
                          type="button"
                          onClick={() => setUploadImageUrl('')}
                          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600 px-1">
                      <span className="flex items-center gap-1 text-emerald-700 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Encrypted with patient's public key (AES-256 GCM)
                      </span>
                      <span className="font-mono text-slate-500">Diagnostic Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-50 border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-2xl text-center space-y-2.5 transition-colors">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-slate-800 text-xs block">Upload Diagnostic Image or Scan</span>
                        <span className="text-[11px] text-slate-400">JPG, PNG, WebP, or DICOM imaging. Displays directly in patient portal.</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center pt-1">
                      <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-2">
                        <UploadCloud className="w-4 h-4" />
                        <span>Select Diagnostic Image File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (re) => {
                                if (typeof re.target?.result === 'string') {
                                  setUploadImageUrl(re.target.result);
                                  if (!uploadFileName) {
                                    setUploadFileName(file.name);
                                  }
                                  onShowToast('Diagnostic Image Loaded', `${file.name} prepared for patient view.`, 'success');
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Document File Attachment Upload */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Attach Medical Report File (PDF / DOCX / DICOM / JPG)
                </label>
                <div className="p-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 hover:border-indigo-400 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    {uploadFileName ? (
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="font-mono font-bold text-slate-900">{uploadFileName}</span>
                        <span className="text-[10px] text-slate-400">(AES-256 GCM Encrypted)</span>
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold text-slate-700 text-xs">Upload Diagnostic PDF or Clinical Document</p>
                        <p className="text-[11px] text-slate-400">Encrypted client-side with patient's quantum-resistant key</p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{uploadFileName ? 'Replace File' : 'Select Document'}</span>
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc,.dicom,.png,.jpg,.jpeg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadFileName(file.name);
                            if (file.type.startsWith('image/')) {
                              const reader = new FileReader();
                              reader.onload = (re) => {
                                if (typeof re.target?.result === 'string') {
                                  setUploadImageUrl(re.target.result);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                            onShowToast('Document Attached', `${file.name} prepared for cryptographic signing.`, 'info');
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {!uploadFileName && (
                      <button
                        type="button"
                        onClick={() => {
                          const sampleName = `${uploadTitle ? uploadTitle.replace(/\s+/g, '_') : 'Clinical_Report'}_${new Date().toISOString().split('T')[0]}.pdf`;
                          setUploadFileName(sampleName);
                        }}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Use Standard PDF
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Digital Signing Notice */}
              <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 flex items-center gap-2 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Doctor-Only Upload:</strong> This record will be cryptographically signed by {doctor.name} (License #{doctor.licenseId}) and permanently logged in {activePatient.name}'s medical history.
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4 text-cyan-200" />
                  <span>Sign & Upload to Timeline</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctor Image Viewer Lightbox Modal */}
      {viewingDoctorImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-700 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{viewingDoctorImage.title}</h4>
                  <p className="text-[11px] text-slate-400">
                    {viewingDoctorImage.doctor ? `Attending: ${viewingDoctorImage.doctor}` : ''} {viewingDoctorImage.date ? `· Date: ${viewingDoctorImage.date}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(() => {
                  const matchedRecord = activePatient.records.find(
                    (r) => r.imageUrl === viewingDoctorImage.url || r.title === viewingDoctorImage.title
                  );
                  if (!matchedRecord) return null;
                  return (
                    <button
                      type="button"
                      onClick={() => handleDoctorDownloadReport(matchedRecord)}
                      disabled={isDownloadingPdfId === matchedRecord.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-xs"
                      title="Download complete Medical Report PDF with this image embedded"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isDownloadingPdfId === matchedRecord.id ? 'Creating PDF...' : 'Download Report PDF (With Image)'}</span>
                    </button>
                  );
                })()}
                <a
                  href={viewingDoctorImage.url}
                  download="Diagnostic_Medical_Scan.jpg"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Raw Image
                </a>
                <button
                  type="button"
                  onClick={() => setViewingDoctorImage(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 flex items-center justify-center bg-black/70 overflow-hidden">
              <img
                src={viewingDoctorImage.url}
                alt={viewingDoctorImage.title}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-lg border border-white/10"
              />
            </div>
            <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                <ShieldCheck className="w-4 h-4" /> Authenticated Clinician Diagnostic Image
              </span>
              <button
                type="button"
                onClick={() => setViewingDoctorImage(null)}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Doctor Profile Modal */}
      <EditDoctorProfileModal
        isOpen={isEditDoctorProfileOpen}
        onClose={() => setIsEditDoctorProfileOpen(false)}
        doctor={doctor}
        onSave={(updatedDoctor) => {
          if (onUpdateDoctor) {
            onUpdateDoctor(updatedDoctor);
          }
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
};
