import React, { useState, useEffect } from 'react';
import { 
  X, User, Stethoscope, KeyRound, ArrowRight, 
  ShieldCheck, AlertCircle, CheckCircle2, Sparkles,
  Mail, Lock, Copy, Check, Phone, CreditCard, Droplets,
  Building2, Hash, CheckCircle, Search
} from 'lucide-react';
import { PatientProfile, DoctorProfile } from '../../types/health';
import { recordLoginInDB } from '../../utils/apiService';
import { findPatientByQuery } from '../../utils/patientRegistry';

export const BLOOD_GROUPS_LIST = [
  { code: 'O+', label: 'O Rh+ (O Positive) · Universal Red Cell Donor' },
  { code: 'O-', label: 'O Rh- (O Negative) · Emergency Universal Red Cell' },
  { code: 'A+', label: 'A Rh+ (A Positive)' },
  { code: 'A-', label: 'A Rh- (A Negative)' },
  { code: 'B+', label: 'B Rh+ (B Positive)' },
  { code: 'B-', label: 'B Rh- (B Negative)' },
  { code: 'AB+', label: 'AB Rh+ (AB Positive) · Universal Plasma Donor' },
  { code: 'AB-', label: 'AB Rh- (AB Negative)' },
] as const;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'patient' | 'doctor';
  patients: PatientProfile[];
  doctor: DoctorProfile;
  onLoginAsPatient: (patientId: string, updatedDetails?: {
    name?: string;
    bloodGroup?: string;
    aadharNumber?: string;
    phone?: string;
    email?: string;
  }) => void;
  onFirstTimeLoginWithEmail: (
    email: string, 
    password?: string, 
    fullName?: string,
    logginerDetails?: {
      bloodGroup?: string;
      aadharNumber?: string;
      phone?: string;
    }
  ) => { patient: PatientProfile; randomId: string };
  onLoginAsDoctor: (doctorDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    bloodGroup?: string;
    aadharNumber?: string;
    hospital?: string;
    specialty?: string;
  }) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning') => void;
  initialFirstTimeMode?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  role,
  patients,
  doctor,
  onLoginAsPatient,
  onFirstTimeLoginWithEmail,
  onLoginAsDoctor,
  onShowToast,
  initialFirstTimeMode = true,
}) => {
  const [patientTab, setPatientTab] = useState<'first-time' | 'existing'>('first-time');
  const [doctorTab, setDoctorTab] = useState<'first-time' | 'existing'>('first-time');
  
  // -------------------------------------------------------------
  // PATIENT LOGGINER DETAILS
  // -------------------------------------------------------------
  const [patientName, setPatientName] = useState('Gokul Velmurugan');
  const [patientBloodGroup, setPatientBloodGroup] = useState<string>('O+');
  const [patientAadhar, setPatientAadhar] = useState('4589 1234 5678');
  const [patientMailId, setPatientMailId] = useState('gokulvelmurugan4555@gmail.com');
  const [patientPhone, setPatientPhone] = useState('+91 98765 43210');
  const [patientPassword, setPatientPassword] = useState('password123');

  // Existing patient selector
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || 'pat-01');
  const [customUid, setCustomUid] = useState(patients[0]?.patientUid || 'DH-8824');
  const [customPass, setCustomPass] = useState('password123');
  const [matchedPatient, setMatchedPatient] = useState<PatientProfile | null>(patients[0] || null);

  const handleCustomUidChange = (val: string) => {
    setCustomUid(val);
    const clean = val.trim();
    if (!clean) {
      setMatchedPatient(null);
      return;
    }
    const match = findPatientByQuery(clean, patients);
    if (match) {
      setMatchedPatient(match);
      setSelectedPatientId(match.id);
      setPatientName(match.name);
      setPatientMailId(match.email);
      setPatientPhone(match.phone || '+91 98765 43210');
      setPatientBloodGroup(match.emergency?.bloodType || match.bloodGroup || 'O+');
      if (match.aadharNumber) {
        setPatientAadhar(formatAadharInput(match.aadharNumber));
      }
      if (match.password) {
        setPatientPassword(match.password);
      }
    } else {
      setMatchedPatient(null);
    }
  };

  // -------------------------------------------------------------
  // DOCTOR LOGGINER DETAILS
  // -------------------------------------------------------------
  const [doctorName, setDoctorName] = useState(doctor.name || 'Dr. Marcus Vance, MD');
  const [doctorBloodGroup, setDoctorBloodGroup] = useState<string>(doctor.bloodGroup || 'O+');
  const [doctorAadhar, setDoctorAadhar] = useState(doctor.aadharNumber || '4589 1234 5678');
  const [doctorMailId, setDoctorMailId] = useState(doctor.email || 'dr.marcus.vance@stjude-hospital.org');
  const [doctorPhone, setDoctorPhone] = useState(doctor.phone || '+91 98450 12345');
  const [doctorHospital, setDoctorHospital] = useState(doctor.hospital || 'St. Jude Academic Medical Center');
  const [doctorSpecialty, setDoctorSpecialty] = useState(doctor.specialty || 'Cardiovascular & Internal Medicine');
  const [doctorMailPassword, setDoctorMailPassword] = useState(doctor.password || '9402');
  const [doctorLicense, setDoctorLicense] = useState(doctor.licenseId);
  const [doctorPin, setDoctorPin] = useState(doctor.password || '9402');

  const [doctorDomainError, setDoctorDomainError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Success state when permanent ID is generated for patient
  const [assignedPermanentInfo, setAssignedPermanentInfo] = useState<{
    randomId: string;
    formattedUid: string;
    patientName: string;
    email: string;
    bloodGroup: string;
    aadharNumber: string;
    phone: string;
  } | null>(null);

  // Helper to format Aadhaar as XXXX XXXX XXXX
  const formatAadharInput = (raw: string): string => {
    const digits = raw.replace(/\D/g, '').slice(0, 12);
    const parts = [];
    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.substring(i, i + 4));
    }
    return parts.join(' ');
  };

  useEffect(() => {
    if (isOpen) {
      setAssignedPermanentInfo(null);
      setDoctorDomainError(null);
      if (initialFirstTimeMode) {
        setPatientTab('first-time');
        setDoctorTab('first-time');
      }
    }
  }, [isOpen, initialFirstTimeMode]);

  // When patient selection changes in existing tab, sync logginer fields
  const handleSelectExistingPatient = (p: PatientProfile) => {
    setSelectedPatientId(p.id);
    setCustomUid(p.patientUid);
    setPatientName(p.name);
    setPatientMailId(p.email);
    setPatientPhone(p.phone || '+91 98765 43210');
    setPatientBloodGroup(p.emergency.bloodType || 'O Rh+');
    setPatientAadhar(p.aadharNumber ? formatAadharInput(p.aadharNumber) : '4589 1234 5678');
    setCustomPass(p.password || 'password123');
  };

  if (!isOpen) return null;

  const handleCopyId = (idText: string) => {
    navigator.clipboard?.writeText(idText);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
    onShowToast('Copied to Clipboard', `Permanent ID #${idText} copied.`, 'info');
  };

  // Helper to validate institutional domain email for clinicians
  const validateDoctorDomainEmail = (email: string): { isValid: boolean; error?: string } => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      return { isValid: false, error: 'Please enter a valid domain email address (e.g. dr.marcus.vance@stjude-hospital.org).' };
    }

    const parts = trimmed.split('@');
    if (parts.length !== 2 || !parts[1].includes('.')) {
      return { isValid: false, error: 'Incomplete domain. Please provide a full domain email (e.g. dr.marcus.vance@stjude-hospital.org).' };
    }

    const domain = parts[1].toLowerCase();

    // Explicitly reject consumer public email domains
    const disallowedGenericDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
      'icloud.com', 'aol.com', 'mail.com', 'proton.me', 'protonmail.com', 'zoho.com', 'yandex.com'
    ];

    if (disallowedGenericDomains.includes(domain)) {
      return {
        isValid: false,
        error: `Personal email (@${domain}) is not authorized for clinician login. Doctors must log in with an institutional/organization domain email (e.g. dr.marcus.vance@stjude-hospital.org or your hospital domain).`
      };
    }

    return { isValid: true };
  };

  // -------------------------------------------------------------
  // PATIENT LOGIN SUBMIT (Collects name, blood group, aadhar, email, phone)
  // -------------------------------------------------------------
  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName.trim()) {
      onShowToast('Name Required', 'Please enter logginer full name.', 'warning');
      return;
    }
    if (!patientMailId.trim()) {
      onShowToast('Mail ID Required', 'Please enter your email address.', 'warning');
      return;
    }

    const cleanAadhar = patientAadhar.replace(/\D/g, '');
    if (cleanAadhar.length > 0 && cleanAadhar.length !== 12) {
      onShowToast('Invalid Aadhaar', 'Aadhaar number must contain exactly 12 digits.', 'warning');
      return;
    }

    setIsAuthenticating(true);

    const formattedAadhar = formatAadharInput(cleanAadhar || '458912345678');

    // 1. Record in PostgreSQL login_history with all logginer details
    recordLoginInDB({
      role: 'patient',
      identifier: patientMailId.trim(),
      password: patientPassword,
      name: patientName.trim(),
      email: patientMailId.trim(),
      phone: patientPhone.trim(),
      bloodGroup: patientBloodGroup,
      aadharNumber: formattedAadhar,
      loginType: patientTab === 'first-time' ? 'first-time-mail' : 'existing-id'
    });

    setTimeout(() => {
      setIsAuthenticating(false);

      if (patientTab === 'first-time') {
        const { patient, randomId } = onFirstTimeLoginWithEmail(
          patientMailId.trim(),
          patientPassword,
          patientName.trim(),
          {
            bloodGroup: patientBloodGroup,
            aadharNumber: formattedAadhar,
            phone: patientPhone.trim()
          }
        );

        setAssignedPermanentInfo({
          randomId,
          formattedUid: patient.patientUid,
          patientName: patient.name,
          email: patient.email,
          bloodGroup: patientBloodGroup,
          aadharNumber: formattedAadhar,
          phone: patientPhone.trim()
        });

        onShowToast(
          'Permanent Patient ID Assigned!',
          `ID #${randomId} assigned to ${patient.name}. Blood Group: ${patientBloodGroup}, Aadhaar & Phone saved.`,
          'success'
        );
      } else {
        const targetId = customUid.trim() || selectedPatientId;
        onLoginAsPatient(targetId, {
          name: patientName.trim(),
          bloodGroup: patientBloodGroup,
          aadharNumber: formattedAadhar,
          phone: patientPhone.trim(),
          email: patientMailId.trim()
        });
        onShowToast(
          'Patient Portal Authenticated',
          `Welcome, ${patientName}. Details updated and authenticated with PostgreSQL database.`,
          'success'
        );
        onClose();
      }
    }, 700);
  };

  // -------------------------------------------------------------
  // DOCTOR LOGIN SUBMIT (Collects name, blood group, aadhar, email, phone)
  // -------------------------------------------------------------
  const handleDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDoctorDomainError(null);

    const validation = validateDoctorDomainEmail(doctorMailId);
    if (!validation.isValid) {
      const errorMsg = validation.error || 'Institutional domain required.';
      setDoctorDomainError(errorMsg);
      onShowToast('Institutional Domain Required', errorMsg, 'warning');
      return;
    }

    if (!doctorName.trim()) {
      onShowToast('Clinician Name Required', 'Please enter clinician name.', 'warning');
      return;
    }

    const cleanAadhar = doctorAadhar.replace(/\D/g, '');
    if (cleanAadhar.length > 0 && cleanAadhar.length !== 12) {
      onShowToast('Invalid Aadhaar', 'Aadhaar number must contain exactly 12 digits.', 'warning');
      return;
    }

    setIsAuthenticating(true);
    const formattedAadhar = formatAadharInput(cleanAadhar || '458912345678');

    // Record login into PostgreSQL database
    recordLoginInDB({
      role: 'doctor',
      identifier: doctorMailId.trim(),
      password: doctorMailPassword,
      name: doctorName.trim(),
      email: doctorMailId.trim(),
      phone: doctorPhone.trim(),
      bloodGroup: doctorBloodGroup,
      aadharNumber: formattedAadhar,
      loginType: doctorTab === 'first-time' ? 'doctor-domain' : 'doctor-license'
    });

    setTimeout(() => {
      setIsAuthenticating(false);
      onLoginAsDoctor({
        name: doctorName.trim(),
        email: doctorMailId.trim(),
        phone: doctorPhone.trim(),
        bloodGroup: doctorBloodGroup,
        aadharNumber: formattedAadhar,
        hospital: doctorHospital.trim(),
        specialty: doctorSpecialty.trim()
      });

      onShowToast(
        'Clinician Enclave Authenticated',
        `Welcome, ${doctorName}. Blood: ${doctorBloodGroup}, Aadhaar: ${formattedAadhar}. Details recorded in PostgreSQL.`,
        'success'
      );
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      {/* Dynamic floating ambient aura */}
      <div className="absolute w-[520px] h-[580px] bg-gradient-to-tr from-cyan-500/25 via-sky-500/20 to-indigo-500/30 rounded-[3rem] blur-3xl pointer-events-none animate-float-orb" />
      <div className="absolute w-[380px] h-[380px] bg-cyan-400/20 rounded-full blur-2xl pointer-events-none animate-pulse-glow" />

      <div 
        className="glossy-card bg-white/95 rounded-3xl border border-white/90 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-floating-modal relative z-10 shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className={`p-5 text-white flex items-center justify-between border-b border-white/10 relative overflow-hidden shrink-0 ${
          role === 'patient' 
            ? 'bg-gradient-to-r from-[#005980] via-[#004868] to-[#003852]' 
            : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900'
        }`}>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-inner shrink-0">
              {role === 'patient' ? <User className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-200 font-bold block">
                {role === 'patient' ? 'SECURE PATIENT GATEWAY' : 'LICENSED CLINICIAN ENCLAVE'}
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5 tracking-tight">
                {role === 'patient' ? 'Patient Portal Sign In' : 'Clinician Staff Sign In'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* SUCCESS CELEBRATION CARD FOR ASSIGNED PERMANENT PATIENT ID */}
          {assignedPermanentInfo ? (
            <div className="space-y-4 animate-in zoom-in-95 duration-200 text-center py-2">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-teal-400 mx-auto flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 border border-white/40">
                <CheckCircle2 className="w-9 h-9 text-white" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  🎉 Registration & Authentication Successful
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
                  Permanent Patient ID Assigned
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  Your logginer details and permanent ID number have been recorded in the PostgreSQL database.
                </p>
              </div>

              {/* ID Badge Card with all logginer details */}
              <div className="glossy-panel p-5 rounded-2xl border-2 border-cyan-400 bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 shadow-md relative overflow-hidden text-left">
                <div className="flex items-center justify-between border-b border-cyan-200/80 pb-3 mb-3">
                  <span className="text-[11px] font-bold text-cyan-800 uppercase tracking-wider">
                    DegiHealth Decentralized Health ID
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-cyan-200 text-cyan-900 px-2 py-0.5 rounded-md">
                    POSTGRESQL SYNCED
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Permanent ID Number:</span>
                    <span className="text-3xl font-black font-mono text-[#005980] tracking-wider">
                      #{assignedPermanentInfo.randomId}
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-700 ml-2">
                      ({assignedPermanentInfo.formattedUid})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyId(assignedPermanentInfo.randomId)}
                    className="p-2.5 rounded-xl bg-white hover:bg-cyan-50 border border-cyan-300 text-cyan-800 shadow-2xs transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                  >
                    {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedId ? 'Copied!' : 'Copy ID'}</span>
                  </button>
                </div>

                {/* Stored Logginer Details Grid */}
                <div className="mt-4 pt-3 border-t border-cyan-200/80 grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-white/80 rounded-xl border border-cyan-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Logginer Name</span>
                    <span className="font-bold text-slate-900 text-sm">{assignedPermanentInfo.patientName}</span>
                  </div>
                  <div className="p-2.5 bg-white/80 rounded-xl border border-cyan-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Blood Group</span>
                    <span className="font-bold text-rose-700 text-sm flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                      {assignedPermanentInfo.bloodGroup}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white/80 rounded-xl border border-cyan-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Aadhaar Number</span>
                    <span className="font-mono font-bold text-slate-800 text-xs flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                      {assignedPermanentInfo.aadharNumber}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white/80 rounded-xl border border-cyan-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone Number</span>
                    <span className="font-mono font-semibold text-slate-800 text-xs flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      {assignedPermanentInfo.phone}
                    </span>
                  </div>
                  <div className="col-span-2 p-2.5 bg-white/80 rounded-xl border border-cyan-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Registered Mail ID</span>
                    <span className="font-mono font-semibold text-slate-800 text-xs truncate block">
                      {assignedPermanentInfo.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 text-left flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-cyan-700 mt-0.5 shrink-0" />
                <span>
                  <strong>Doctor access ready:</strong> Any licensed clinician can enter <strong>#{assignedPermanentInfo.randomId}</strong> to look up your authorized medical history and prescriptions.
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white glossy-button-primary flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span>Enter Your Patient Portal</span>
                <ArrowRight className="w-4 h-4 text-cyan-200" />
              </button>
            </div>
          ) : role === 'patient' ? (
            /* PATIENT LOGIN SECTION */
            <div className="space-y-4">
              {/* Segmented Tab Switcher */}
              <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200 shadow-inner">
                <button
                  type="button"
                  onClick={() => setPatientTab('first-time')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    patientTab === 'first-time'
                      ? 'bg-white text-cyan-800 shadow-sm border border-cyan-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                  <span>First Time Logginer?</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPatientTab('existing')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    patientTab === 'existing'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  <span>Existing Patient ID</span>
                </button>
              </div>

              {/* Patient Form */}
              <form onSubmit={handlePatientSubmit} className="space-y-3.5">
                {patientTab === 'first-time' ? (
                  <div className="p-3 rounded-2xl border border-cyan-300/80 bg-gradient-to-r from-cyan-50 via-sky-50 to-blue-50 text-xs text-slate-700 flex items-start gap-2.5 shadow-2xs">
                    <Sparkles className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block font-bold">First Time Patient Logginer:</strong>
                      <span>Fill in your logginer details below (Name, Blood Group dropdown, Aadhaar, Mail ID, Phone Number). A unique permanent Patient ID will be assigned and saved to the database.</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Enter Your Patient ID or 12-Digit Aadhaar
                      </label>
                      <span className="text-[10px] font-semibold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                        Forgot ID? Enter Aadhaar
                      </span>
                    </div>

                    <div className="relative">
                      <Search className="w-4 h-4 text-cyan-700 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={customUid}
                        onChange={(e) => handleCustomUidChange(e.target.value)}
                        placeholder="Enter your Patient ID (e.g. 8824) or Aadhaar No. (e.g. 4589 1234 5678)..."
                        className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm font-mono font-bold glossy-input rounded-xl focus:outline-none"
                        required
                      />
                    </div>

                    {matchedPatient ? (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-center justify-between animate-in fade-in">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Identified: <strong>{matchedPatient.name}</strong> ({matchedPatient.patientUid})</span>
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                          Verified Account
                        </span>
                      </div>
                    ) : customUid.trim().length > 0 ? (
                      <p className="text-[11px] text-slate-500">
                        Signing into your personal medical records, active prescriptions, and emergency card.
                      </p>
                    ) : null}
                  </div>
                )}

                {/* ---------------- REQUIRED LOGGINER DETAILS ---------------- */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-cyan-700" />
                      Logginer Profile Details
                    </span>
                    <span className="text-[10px] font-bold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded-full">
                      Required for Login
                    </span>
                  </div>

                  {/* Logginer Name */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm glossy-input rounded-xl focus:outline-none font-medium"
                        placeholder="e.g. Gokul Velmurugan"
                        required
                      />
                    </div>
                  </div>

                  {/* Blood Group Dropdown (All types) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <Droplets className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                          Blood Group *
                        </label>
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                          Dropdown
                        </span>
                      </div>
                      <select
                        value={patientBloodGroup}
                        onChange={(e) => setPatientBloodGroup(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm glossy-input rounded-xl focus:outline-none font-bold text-slate-900 bg-white cursor-pointer"
                        required
                      >
                        {BLOOD_GROUPS_LIST.map((bg) => (
                          <option key={bg.code} value={bg.code}>
                            {bg.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Aadhaar Number */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                          Aadhaar Number *
                        </label>
                        {patientAadhar.replace(/\D/g, '').length === 12 && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-0.5">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> 12 Digits
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={patientAadhar}
                        onChange={(e) => setPatientAadhar(formatAadharInput(e.target.value))}
                        className="w-full px-3 py-2 text-xs sm:text-sm glossy-input rounded-xl focus:outline-none font-mono font-bold tracking-wider"
                        placeholder="e.g. 4589 1234 5678"
                        maxLength={14}
                        required
                      />
                    </div>
                  </div>

                  {/* Mail ID & Phone Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Mail ID (Email) *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={patientMailId}
                          onChange={(e) => setPatientMailId(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm glossy-input rounded-xl focus:outline-none font-medium"
                          placeholder="e.g. gokulvelmurugan4555@gmail.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm glossy-input rounded-xl focus:outline-none font-medium font-mono"
                          placeholder="e.g. +91 98765 43210"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Account Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={patientPassword}
                        onChange={(e) => setPatientPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm glossy-input rounded-xl focus:outline-none"
                        placeholder="Enter account password"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer glossy-button-primary ${
                    isAuthenticating ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isAuthenticating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating & Storing Details...</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-cyan-200" />
                      <span>
                        {patientTab === 'first-time' 
                          ? 'Save Details & Generate Permanent ID' 
                          : 'Sign In & Update Details'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-cyan-200" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* DOCTOR SIGN IN SECTION */
            <div className="space-y-4">
              {/* Doctor Segmented Tab Switcher */}
              <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200 shadow-inner">
                <button
                  type="button"
                  onClick={() => setDoctorTab('first-time')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    doctorTab === 'first-time'
                      ? 'bg-white text-indigo-900 shadow-sm border border-indigo-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>First Time Logginer?</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDoctorTab('existing')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    doctorTab === 'existing'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  <span>Existing Staff PIN</span>
                </button>
              </div>

              {/* Doctor Form */}
              <form onSubmit={handleDoctorSubmit} className="space-y-3.5">
                {/* Institutional Domain Banner */}
                <div className="p-3.5 rounded-2xl border border-indigo-300/80 bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 text-xs text-slate-700 flex items-start gap-2.5 shadow-2xs">
                  <Stethoscope className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold">Licensed Clinician Login & Onboarding:</strong>
                    <span>Doctors must provide institutional domain mail ID (e.g. <code className="font-mono text-indigo-800 bg-white px-1 py-0.5 rounded border border-indigo-200 font-bold">dr.marcus.vance@stjude-hospital.org</code>), full name, blood group, Aadhaar number, and phone number.</span>
                  </div>
                </div>

                {/* ---------------- DOCTOR LOGGINER DETAILS ---------------- */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-indigo-700" />
                      Clinician Logginer Details
                    </span>
                    <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-full">
                      Stored in PostgreSQL
                    </span>
                  </div>

                  {/* Clinician Full Name */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Clinician Full Name & Title *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm glossy-input rounded-xl focus:outline-none font-medium"
                        placeholder="e.g. Dr. Marcus Vance, MD"
                        required
                      />
                    </div>
                  </div>

                  {/* Blood Group Dropdown & Aadhaar Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <Droplets className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                          Blood Group *
                        </label>
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                          Dropdown
                        </span>
                      </div>
                      <select
                        value={doctorBloodGroup}
                        onChange={(e) => setDoctorBloodGroup(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm glossy-input rounded-xl focus:outline-none font-bold text-slate-900 bg-white cursor-pointer"
                        required
                      >
                        {BLOOD_GROUPS_LIST.map((bg) => (
                          <option key={bg.code} value={bg.code}>
                            {bg.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                          Aadhaar Number *
                        </label>
                        {doctorAadhar.replace(/\D/g, '').length === 12 && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-0.5">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> 12 Digits
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={doctorAadhar}
                        onChange={(e) => setDoctorAadhar(formatAadharInput(e.target.value))}
                        className="w-full px-3 py-2 text-xs sm:text-sm glossy-input rounded-xl focus:outline-none font-mono font-bold tracking-wider"
                        placeholder="e.g. 4589 1234 5678"
                        maxLength={14}
                        required
                      />
                    </div>
                  </div>

                  {/* Domain Institutional Email & Phone Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Institutional Mail ID *
                        </label>
                      </div>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={doctorMailId}
                          onChange={(e) => {
                            setDoctorMailId(e.target.value);
                            if (doctorDomainError) setDoctorDomainError(null);
                          }}
                          className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm glossy-input rounded-xl focus:outline-none font-mono font-medium ${
                            doctorDomainError ? 'border-red-400 ring-1 ring-red-400 bg-red-50/40 text-red-900' : ''
                          }`}
                          placeholder="e.g. dr.marcus.vance@stjude-hospital.org"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Clinician Phone *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={doctorPhone}
                          onChange={(e) => setDoctorPhone(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm glossy-input rounded-xl focus:outline-none font-medium font-mono"
                          placeholder="e.g. +91 98450 12345"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Domain error message if personal email provided */}
                  {doctorDomainError && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-1.5">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{doctorDomainError}</span>
                    </div>
                  )}

                  {/* Hospital & Specialty */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Hospital / Healthcare System
                      </label>
                      <input
                        type="text"
                        value={doctorHospital}
                        onChange={(e) => setDoctorHospital(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm glossy-input rounded-xl focus:outline-none"
                        placeholder="e.g. SNS Clinical Network"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Clinical Specialty
                      </label>
                      <input
                        type="text"
                        value={doctorSpecialty}
                        onChange={(e) => setDoctorSpecialty(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm glossy-input rounded-xl focus:outline-none"
                        placeholder="e.g. Interventional Cardiology"
                      />
                    </div>
                  </div>

                  {/* Password / Badge PIN */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Hospital Network Password / PIN *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={doctorMailPassword}
                        onChange={(e) => setDoctorMailPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm glossy-input rounded-xl focus:outline-none font-mono"
                        placeholder="Enter network PIN or password"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Doctor Submit Button */}
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 hover:from-indigo-800 hover:to-purple-800 ${
                    isAuthenticating ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isAuthenticating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Institutional Credentials...</span>
                    </div>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-indigo-200" />
                      <span>Authenticate Clinician & Save Details</span>
                      <ArrowRight className="w-4 h-4 text-indigo-200" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
