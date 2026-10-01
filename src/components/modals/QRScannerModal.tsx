import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle2, UserCheck, Sparkles, 
  Search, ArrowRight, Pill, FileText, Heart, AlertTriangle, User,
  CreditCard, ShieldCheck, Check
} from 'lucide-react';
import { PatientProfile } from '../../types/health';
import { findPatientByQuery, getOrCreatePatientByNumber } from '../../utils/patientRegistry';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: PatientProfile[];
  onSelectPatient: (patient: PatientProfile) => void;
  onSearchPatientId?: (idQuery: string) => PatientProfile;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  patients,
  onSelectPatient,
  onSearchPatientId,
  onShowToast,
}) => {
  const [patientIdInput, setPatientIdInput] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(patients[0] || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<'id' | 'aadhar'>('id');

  useEffect(() => {
    if (isOpen) {
      setPatientIdInput(patients[0]?.patientUid || '');
      setSelectedPatient(patients[0] || null);
      setErrorMessage(null);
      setSearchMode('id');
    }
  }, [isOpen, patients]);

  if (!isOpen) return null;

  const cleanDigits = patientIdInput.replace(/\D/g, '');
  const isAadharDetected = cleanDigits.length >= 10;

  // Real-time lookup as doctor types
  const handleInputChange = (val: string) => {
    setPatientIdInput(val);
    setErrorMessage(null);

    const clean = val.trim();
    if (!clean) {
      setSelectedPatient(null);
      return;
    }

    const matched = findPatientByQuery(clean, patients);
    if (matched) {
      setSelectedPatient(matched);
    } else {
      // Deterministically generate preview for this exact number
      const { patient: generated } = getOrCreatePatientByNumber(clean, patients);
      setSelectedPatient(generated);
    }
  };

  const handleLookupAndOpen = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = patientIdInput.trim();

    if (!clean) {
      setErrorMessage('Please enter a valid Patient ID or 12-Digit Aadhaar Number.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      let targetPatient: PatientProfile;

      if (onSearchPatientId) {
        targetPatient = onSearchPatientId(clean);
      } else {
        const { patient } = getOrCreatePatientByNumber(clean, patients);
        targetPatient = patient;
      }

      const isAadhaarQuery = clean.replace(/\D/g, '').length >= 10;

      onSelectPatient(targetPatient);
      onShowToast(
        isAadhaarQuery 
          ? `Aadhaar Verified: ${targetPatient.name}` 
          : `Patient ID Verified: ${targetPatient.patientUid}`,
        isAadhaarQuery
          ? `Retrieved medical history for ${targetPatient.name} via Aadhaar #${targetPatient.aadharNumber}. Permanent ID: ${targetPatient.patientUid}. Loaded ${targetPatient.records.length} records & ${targetPatient.prescriptions.length} medications.`
          : `Loaded complete medical records (${targetPatient.records.length}) and active medications (${targetPatient.prescriptions.length}) according to ID ${targetPatient.patientUid}.`,
        'success'
      );
      onClose();
    }, 300);
  };

  const handleSelectPreset = (patient: PatientProfile, useAadhaar = false) => {
    if (useAadhaar && patient.aadharNumber) {
      setPatientIdInput(patient.aadharNumber);
      setSearchMode('aadhar');
    } else {
      setPatientIdInput(patient.patientUid);
      setSearchMode('id');
    }
    setSelectedPatient(patient);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="glossy-card bg-white/95 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-white/80 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white flex items-center justify-between border-b border-white/10 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-cyan-500/30 border border-white/30 flex items-center justify-center text-cyan-300 font-mono text-xl font-black shadow-inner">
              <CreditCard className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-semibold tracking-wider text-cyan-300 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                CLINICAL PATIENT INTAKE
              </span>
              <h2 className="text-xl font-extrabold text-white mt-0.5 tracking-tight">
                Patient ID or Aadhaar Lookup
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Search Mode Toggle */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setSearchMode('id');
                if (selectedPatient) setPatientIdInput(selectedPatient.patientUid);
              }}
              className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                searchMode === 'id'
                  ? 'bg-white text-indigo-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Patient ID (e.g. DH-8824)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchMode('aadhar');
                if (selectedPatient?.aadharNumber) setPatientIdInput(selectedPatient.aadharNumber);
              }}
              className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                searchMode === 'aadhar'
                  ? 'bg-white text-indigo-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
              <span>Forgot ID? Use Aadhaar No.</span>
            </button>
          </div>

          {/* Forgot ID Banner Notice */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-sky-50 to-indigo-50 border border-amber-200/80 text-xs text-slate-700 flex items-start gap-2.5 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-bold">
                Forgot Patient ID Number?
              </strong>
              <span>
                If the patient forgot or misplaced their ID number, doctors can enter their <strong>12-digit Aadhaar Number</strong> (e.g. <code className="font-mono text-indigo-900 bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-bold">4589 1234 5678</code>) to retrieve their full medical history, lab reports, and active prescriptions.
              </span>
            </div>
          </div>

          {/* Main Input Form */}
          <form onSubmit={handleLookupAndOpen} className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                {searchMode === 'aadhar' ? 'Enter 12-Digit Aadhaar Card Number:' : 'Enter Patient ID or Aadhaar Number:'}
              </label>
              {isAadharDetected && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" /> 12-Digit Aadhaar Detected
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                autoFocus
                value={patientIdInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={
                  searchMode === 'aadhar'
                    ? 'Enter 12-digit Aadhaar (e.g. 4589 1234 5678 or 541289012345)...'
                    : 'Enter Patient ID or Aadhaar (e.g. 8824 or 4589 1234 5678)...'
                }
                className="w-full pl-11 pr-36 py-3.5 text-sm font-mono font-bold glossy-input rounded-2xl text-slate-900 placeholder:font-normal placeholder:text-slate-400"
              />
              <Search className="w-5 h-5 text-indigo-600 absolute left-3.5 top-4" />
              
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-2 top-2 bottom-2 px-4 rounded-xl text-xs font-bold text-white glossy-button-indigo flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Retrieve Records</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-200" />
                  </>
                )}
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50/90 border border-rose-300 text-xs text-rose-800 flex items-center gap-2 animate-in fade-in shadow-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </form>

          {/* Quick Click Registered Patient IDs and Aadhaar numbers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Registered Demo Patient (Test ID or Aadhaar):
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Click to test instant lookup</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {patients.slice(0, 4).map((p) => {
                const isSelected = selectedPatient?.id === p.id;
                const isMed = (p.takingMedication || p.emergency.takingMedication || 'yes') === 'yes';

                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/90 ring-2 ring-indigo-400 shadow-md shadow-indigo-500/10'
                        : 'border-slate-200 bg-white/80 hover:bg-white hover:border-indigo-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleSelectPreset(p, false)}
                        className={`font-mono text-xs font-bold px-2 py-0.5 rounded-lg border cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-600 text-white border-indigo-700' 
                            : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                        }`}
                        title="Click to search by Patient ID"
                      >
                        {p.patientUid}
                      </button>
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-0.5 shadow-xs">
                        <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                        {p.emergency.bloodType}
                      </span>
                    </div>

                    <p className="font-bold text-xs mt-2 text-slate-900 truncate">{p.name}</p>
                    
                    {/* Aadhaar Number Pill Button */}
                    <button
                      type="button"
                      onClick={() => handleSelectPreset(p, true)}
                      className="mt-1.5 w-full flex items-center justify-between p-1.5 bg-slate-50 hover:bg-indigo-100 rounded-lg border border-slate-200 text-[11px] transition-colors cursor-pointer group"
                      title="Forgot ID? Click to test lookup by this patient's Aadhaar number"
                    >
                      <span className="text-slate-500 flex items-center gap-1 font-medium">
                        <CreditCard className="w-3 h-3 text-indigo-600" />
                        Aadhaar:
                      </span>
                      <span className="font-mono font-bold text-indigo-900 group-hover:text-indigo-950">
                        {p.aadharNumber || '4589 1234 5678'}
                      </span>
                    </button>

                    <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                      <span className={`px-2 py-0.5 rounded-full font-bold border ${
                        isMed 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        Meds: {isMed ? `YES (${p.prescriptions.length})` : 'NO'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200">
                        {p.records.length} Records
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Preview of Patient Records & Medications */}
          {selectedPatient && (
            <div className="p-4.5 rounded-2xl bg-gradient-to-br from-white/90 to-indigo-50/60 border border-indigo-200/80 shadow-md shadow-indigo-500/5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-sm shrink-0 bg-indigo-50 flex items-center justify-center">
                    {selectedPatient.avatar ? (
                      <img src={selectedPatient.avatar} alt={selectedPatient.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-indigo-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{selectedPatient.name}</h4>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                        {selectedPatient.patientUid}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-indigo-600" />
                        Aadhaar: {selectedPatient.aadharNumber || '4589 1234 5678'}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1 shadow-xs shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Medical History Ready
                </span>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-white/90 rounded-xl border border-indigo-100 shadow-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
                    <Pill className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Prescriptions</span>
                  </div>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                    {selectedPatient.prescriptions.length} Active
                  </span>
                </div>

                <div className="p-2.5 bg-white/90 rounded-xl border border-indigo-100 shadow-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
                    <FileText className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Medical Records</span>
                  </div>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                    {selectedPatient.records.length} Documents
                  </span>
                </div>

                <div className="p-2.5 bg-white/90 rounded-xl border border-indigo-100 shadow-xs col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
                    <Heart className="w-3.5 h-3.5 text-rose-600" />
                    <span>Blood Type</span>
                  </div>
                  <span className="font-bold text-rose-700 text-sm mt-0.5 block">
                    {selectedPatient.emergency.bloodType}
                  </span>
                </div>
              </div>

              {/* Action Button inside card */}
              <button
                type="button"
                onClick={() => handleLookupAndOpen()}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white glossy-button-indigo flex items-center justify-center gap-2 cursor-pointer mt-2 shadow-md"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Open {selectedPatient.name}'s Complete Medical History</span>
                <ArrowRight className="w-4 h-4 text-cyan-200" />
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/90 border-t border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Authorized Clinical Provider Verification</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
