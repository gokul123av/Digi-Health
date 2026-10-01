import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Activity, 
  CreditCard, 
  Lock, 
  Pill, 
  FileText, 
  Download, 
  Plus, 
  ShieldAlert, 
  ShieldCheck,
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  User, 
  Search, 
  Share2, 
  LogOut, 
  RefreshCw, 
  ChevronRight, 
  Phone,
  Eye,
  Hospital,
  Sparkles,
  Camera,
  Pencil,
  Heart,
  Image as ImageIcon,
  Maximize2,
  X,
  FolderDown,
  Trash2
} from 'lucide-react';
import { PatientProfile, PatientRecord, Prescription, DoctorPermission } from '../types/health';
import { EditProfileModal } from './modals/EditProfileModal';
import { 
  downloadMedicalReportPDF, 
  getSavedReportsFromMemory, 
  removeSavedReportFromMemory, 
  SavedReportItem 
} from '../utils/pdfGenerator';

interface PatientPortalProps {
  patient: PatientProfile;
  initialTab?: 'timeline' | 'prescriptions' | 'permissions';
  onBackToGateway: () => void;
  onSwitchToDoctor: () => void;
  onDoctorScanPatient?: (patient: PatientProfile) => void;
  onUpdatePatient: (updated: PatientProfile) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  patient,
  initialTab = 'timeline',
  onBackToGateway,
  onSwitchToDoctor,
  onDoctorScanPatient,
  onUpdatePatient,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'prescriptions' | 'permissions'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [records, setRecords] = useState<PatientRecord[]>(() =>
    patient.records.filter(r => r.category !== 'Imaging' && r.category !== 'Immunization')
  );
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(patient.prescriptions);
  const [permissions, setPermissions] = useState<DoctorPermission[]>(patient.doctorPermissions);
  const [selectedRecord, setSelectedRecord] = useState<PatientRecord | null>(null);
  const [viewingPatientImage, setViewingPatientImage] = useState<{ url: string; title: string; doctor?: string; date?: string } | null>(null);
  
  // PDF download & Memory storage state
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<string | null>(null);
  const [savedMemoryReports, setSavedMemoryReports] = useState<SavedReportItem[]>(() => getSavedReportsFromMemory(patient.id));
  const [isMemoryVaultOpen, setIsMemoryVaultOpen] = useState(false);

  // Profile editor modal
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Sync records, prescriptions, and permissions when patient prop updates from doctor enclave
  useEffect(() => {
    setRecords(patient.records.filter(r => r.category !== 'Imaging' && r.category !== 'Immunization'));
    setPrescriptions(patient.prescriptions);
    setPermissions(patient.doctorPermissions);
    setSavedMemoryReports(getSavedReportsFromMemory(patient.id));
  }, [patient.records, patient.prescriptions, patient.doctorPermissions, patient.id]);

  // Handle generating & downloading official Medical Report PDF with image & saving in memory
  const handleDownloadReport = async (rec: PatientRecord) => {
    setIsGeneratingPdf(rec.id);
    onShowToast(
      'Generating Medical Report PDF',
      rec.imageUrl ? 'Rendering clinical notes, biomarkers, and embedding attached diagnostic image...' : 'Compiling verified clinical report PDF...',
      'info'
    );
    try {
      const res = await downloadMedicalReportPDF(patient, rec);
      const updated = getSavedReportsFromMemory(patient.id);
      setSavedMemoryReports(updated);
      onShowToast(
        'Medical Report Downloaded & Saved in Memory',
        `${res.fileName} (${res.fileSizeKB} KB) downloaded as PDF with attached scan and archived in local memory storage.`,
        'success'
      );
    } catch (err) {
      console.error('Failed to generate medical report PDF:', err);
      onShowToast('PDF Generation Failed', 'Could not create PDF report. Please try again.', 'warning');
    } finally {
      setIsGeneratingPdf(null);
    }
  };

  // Handle removing a report from memory storage
  const handleRemoveSavedReport = (reportId: string, title: string) => {
    const updated = removeSavedReportFromMemory(patient.id, reportId);
    setSavedMemoryReports(updated);
    onShowToast('Report Removed from Memory', `"${title}" removed from memory vault.`, 'info');
  };

  // Handle refill request
  const handleRefillRequest = (id: string, medName: string) => {
    setPrescriptions(prev => prev.map(p => {
      if (p.id === id && p.refillsRemaining > 0) {
        return {
          ...p,
          refillsRemaining: p.refillsRemaining - 1,
          status: 'pending-refill'
        };
      }
      return p;
    }));

    onShowToast(
      'Refill Transmitted to Pharmacy',
      `Renewal request for ${medName} sent to CVS Pharmacy #4102. Pharmacist review in progress.`,
      'success'
    );
  };

  // Handle toggle permission status
  const handleTogglePermission = (permId: string) => {
    setPermissions(prev => prev.map(perm => {
      if (perm.id === permId) {
        const nextStatus = perm.status === 'active' ? 'revoked' : 'active';
        onShowToast(
          nextStatus === 'revoked' ? 'Physician Access Revoked' : 'Physician Access Granted',
          `${perm.doctorName} (${perm.specialty}) permission is now ${nextStatus.toUpperCase()}.`,
          nextStatus === 'revoked' ? 'warning' : 'success'
        );
        return { ...perm, status: nextStatus };
      }
      return perm;
    }));
  };

  // Filtered records (excluding Imaging and Immunization from patient pages)
  const filteredRecords = records
    .filter(r => r.category !== 'Imaging' && r.category !== 'Immunization')
    .filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.doctor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = categoryFilter === 'All' || r.category === categoryFilter;
      return matchesSearch && matchesCat;
    });

  // Always ensures record summaries and descriptions reflect this logged-in patient's name
  const sanitizePatientText = (text?: string): string => {
    if (!text) return '';
    return text
      .replace(/Sarah Jenkins/gi, patient.name)
      .replace(/Liam Chen/gi, patient.name)
      .replace(/Elena Rostova/gi, patient.name)
      .replace(/Marcus Brody/gi, patient.name)
      .replace(/Sophia Kowalski/gi, patient.name)
      .replace(/Robert Callahan/gi, patient.name);
  };

  return (
    <div className="min-h-screen glossy-mesh flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-white/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Left Brand & Exit */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToGateway}
              className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white/60 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Return to Gateway"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Gateway</span>
            </button>

            <div className="h-5 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#007b9e] to-[#004d6a] border border-white/30 shadow-md shadow-[#005a7d]/20 flex items-center justify-center text-white">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-3H8v-2h3V8h2v3h3v2h-3v3z" />
                </svg>
              </div>
              <div>
                <span className="text-base font-extrabold text-[#0f1d38]">Degi<span className="text-[#008ba3]">Health</span></span>
                <span className="ml-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-50/80 text-cyan-800 border border-cyan-200/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
                  PATIENT ENCLAVE
                </span>
              </div>
            </div>
          </div>

          {/* Right User Bar & Fast Actions */}
          <div className="flex items-center gap-3">
            {/* Profile Avatar Pill & Edit Trigger */}
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="group flex items-center gap-2 pl-2 pr-2 py-1 rounded-2xl hover:bg-white/70 transition-all border border-transparent hover:border-slate-200/80 text-left cursor-pointer"
              title="Click to edit profile picture, blood group, disease, and medication status"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-cyan-500 shadow-xs bg-cyan-100 shrink-0 flex items-center justify-center">
                {patient.avatar ? (
                  <img src={patient.avatar} alt={patient.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-cyan-800" />
                )}
                <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="hidden sm:block text-left text-xs leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">{patient.name}</span>
                  <Pencil className="w-3 h-3 text-slate-400 group-hover:text-cyan-700 transition-colors" />
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono mt-0.5">
                  <span className="text-cyan-700 font-semibold">{patient.patientUid}</span>
                  <span>·</span>
                  <span className="text-red-600 font-bold">{patient.emergency.bloodType}</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Patient Profile & Medical Vitals Strip with Specular Sheen */}
        <div className="bg-gradient-to-r from-slate-900/90 via-[#013f57]/90 to-[#005a7d]/90 backdrop-blur-2xl text-white px-4 sm:px-6 py-3.5 border-t border-white/10 shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Avatar & Patient Info */}
            <div className="flex items-center gap-3.5">
              <div 
                onClick={() => setIsEditProfileOpen(true)}
                className="relative group cursor-pointer shrink-0"
                title="Click to change profile picture"
              >
                <div className="w-13 h-13 rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-md bg-cyan-950 flex items-center justify-center">
                  {patient.avatar ? (
                    <img src={patient.avatar} alt={patient.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-7 h-7 text-cyan-300" />
                  )}
                </div>
                <div className="absolute inset-0 bg-slate-950/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-4 h-4 text-cyan-300" />
                </div>
                <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#005a7d] border border-white text-white shadow-xs">
                  <Pencil className="w-2.5 h-2.5" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{patient.name}</h2>
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-300/40 shadow-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Permanent ID: {patient.patientUid}</span>
                  </span>
                  {patient.email && (
                    <span className="text-xs text-cyan-200/80 font-mono hidden md:inline">
                      ({patient.email})
                    </span>
                  )}
                  <span className="text-xs text-slate-300">
                    {patient.age} yrs · {patient.gender}
                  </span>
                </div>
                
                {/* Diagnosed Disease & Conditions line */}
                <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-200 flex-wrap">
                  <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-slate-300 font-medium">Diagnosed Disease:</span>
                  <span className="font-semibold text-white bg-white/10 px-2 py-0.5 rounded border border-white/15">
                    {patient.disease || patient.emergency.disease || patient.emergency.chronicConditions.join(', ') || 'None Reported'}
                  </span>
                </div>
              </div>
            </div>

            {/* Blood Group, Medication Dropdown & Edit Button */}
            <div className="flex items-center gap-3 flex-wrap">
              
              {/* Blood Group Badge */}
              <div 
                onClick={() => setIsEditProfileOpen(true)}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-xl border border-white/15 text-xs cursor-pointer"
                title="Click to edit blood group"
              >
                <Heart className="w-4 h-4 text-red-400 fill-red-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-300 uppercase block font-semibold">Blood Group</span>
                  <span className="font-black text-red-300 text-sm leading-none">{patient.emergency.bloodType}</span>
                </div>
              </div>

              {/* Aadhaar Number Badge */}
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 text-xs">
                <CreditCard className="w-4 h-4 text-cyan-300 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-300 uppercase block font-semibold">Aadhaar No.</span>
                  <span className="font-mono font-bold text-white text-xs leading-none">
                    {patient.aadharNumber || '4589 1234 5678'}
                  </span>
                </div>
              </div>

              {/* Contact Phone */}
              {patient.phone && (
                <div className="hidden lg:flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 text-xs">
                  <Phone className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-300 uppercase block font-semibold">Contact Phone</span>
                    <span className="font-mono text-white text-xs leading-none">{patient.phone}</span>
                  </div>
                </div>
              )}

              {/* Medication Dropdown (Yes / No) */}
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 text-xs">
                <Pill className="w-4 h-4 text-cyan-300 shrink-0" />
                <div>
                  <label htmlFor="med-dropdown" className="text-[10px] text-slate-300 uppercase block font-semibold">
                    Medication?
                  </label>
                  <select
                    id="med-dropdown"
                    value={patient.takingMedication || patient.emergency.takingMedication || 'yes'}
                    onChange={(e) => {
                      const nextMed = e.target.value as 'yes' | 'no';
                      const updated: PatientProfile = {
                        ...patient,
                        takingMedication: nextMed,
                        emergency: {
                          ...patient.emergency,
                          takingMedication: nextMed,
                          lastSynced: 'Just now (Continuous)'
                        }
                      };
                      onUpdatePatient(updated);
                      onShowToast(
                        'Medication Status Updated',
                        nextMed === 'yes' ? 'Taking Medication: YES (Active Therapy)' : 'Taking Medication: NO (No Active Prescriptions)',
                        nextMed === 'yes' ? 'success' : 'info'
                      );
                    }}
                    className="bg-slate-900 text-white font-bold text-xs rounded px-2 py-0.5 border border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
                  >
                    <option value="yes">Yes (Taking Meds)</option>
                    <option value="no">No (None)</option>
                  </select>
                </div>
              </div>

              {/* Saved Reports Memory Vault Button */}
              <button
                onClick={() => setIsMemoryVaultOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-600/50 transition-all flex items-center gap-2 shadow-xs cursor-pointer shrink-0"
                title="View reports downloaded and archived in device memory storage"
              >
                <FolderDown className="w-3.5 h-3.5 text-cyan-300" />
                <span>Memory Vault</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                  {savedMemoryReports.length}
                </span>
              </button>

              {/* Edit Profile Button */}
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-cyan-700/80 hover:bg-cyan-600 border border-cyan-400/30 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Edit Photo & Vitals</span>
              </button>
            </div>

          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto gap-2 border-t border-slate-100 scrollbar-none">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'timeline'
                ? 'border-[#005a7d] text-[#005a7d]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Longitudinal Timeline</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600">
              {records.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'prescriptions'
                ? 'border-[#005a7d] text-[#005a7d]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Active Prescriptions</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600">
              {prescriptions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'permissions'
                ? 'border-[#005a7d] text-[#005a7d]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Doctor Permission Controls & Logs</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
        
        {/* ========================================================= */}
        {/* TAB 1: LONGITUDINAL TIMELINE RECORDS */}
        {/* ========================================================= */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            {/* Header controls bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex flex-1 items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search medical history, doctors, diagnoses, or lab values..."
                  className="w-full text-xs sm:text-sm bg-transparent focus:outline-none text-slate-800"
                />
              </div>

              {/* Category filters */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                {['All', 'Consultation', 'Lab Report'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      categoryFilter === cat
                        ? 'bg-[#005a7d] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Doctor Upload Only Badge */}
              <div 
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100/90 border border-slate-200/80 flex items-center gap-1.5 shrink-0 shadow-2xs"
                title="Medical records can only be uploaded and authenticated by attending doctors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Doctor Upload Only</span>
              </div>
            </div>

            {/* Timeline Stream */}
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {filteredRecords.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl text-center border border-slate-200">
                  <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No medical records match your criteria</p>
                  <p className="text-xs text-slate-400 mt-1">Try resetting the search or category filter</p>
                </div>
              ) : (
                filteredRecords.map((record) => (
                  <div key={record.id} className="relative group">
                    {/* Node Dot */}
                    <div className="absolute -left-6 sm:-left-8 top-5 w-6 h-6 rounded-full bg-white border-2 border-[#005a7d] flex items-center justify-center -translate-x-1/2 shadow-xs">
                      <div className="w-2 h-2 rounded-full bg-[#005a7d]"></div>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-cyan-50 text-[#005a7d] border border-cyan-200">
                              {record.category}
                            </span>
                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" /> {record.date}
                            </span>
                            {record.diagnosisCode && (
                              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {record.diagnosisCode}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                            {record.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <Hospital className="w-3.5 h-3.5 text-slate-400" />
                            <span>{record.facility}</span>
                            <span>·</span>
                            <span className="font-semibold text-slate-700">{record.doctor}</span>
                          </p>
                        </div>

                        {/* Fast Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleDownloadReport(record)}
                            disabled={isGeneratingPdf === record.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                            title="Download official PDF medical report with attached clinical scan"
                          >
                            <Download className="w-3.5 h-3.5 text-[#005a7d]" />
                            <span className="hidden sm:inline">
                              {isGeneratingPdf === record.id ? 'Generating...' : 'Download PDF'}
                            </span>
                          </button>
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#005a7d] hover:bg-[#004766] transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Full Details</span>
                          </button>
                        </div>
                      </div>

                      {/* Summary */}
                      <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                        {sanitizePatientText(record.summary)}
                      </p>

                      {/* Lab Metrics Mini-Grid if available */}
                      {record.metrics && record.metrics.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                            Extracted Biomarkers & Clinical Measurements
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {record.metrics.map((m, i) => (
                              <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                                <span className="text-[11px] text-slate-500 block truncate">{m.label}</span>
                                <div className="flex items-baseline gap-1 mt-0.5">
                                  <span className="text-sm font-bold text-slate-900 tabular-nums">{m.value}</span>
                                  <span className="text-[10px] text-slate-400">{m.unit}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 block mt-0.5">Ref: {m.normalRange}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Clinician Attached Diagnostic Image (Patient View) */}
                      {record.imageUrl && (
                        <div className="mt-3.5 pt-3 border-t border-slate-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-800 flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-cyan-600" />
                              <span>Clinician Attached Diagnostic Image</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setViewingPatientImage({ url: record.imageUrl!, title: record.title, doctor: record.doctor, date: record.date })}
                              className="text-[11px] font-semibold text-cyan-700 hover:text-cyan-900 flex items-center gap-1 cursor-pointer"
                            >
                              <Maximize2 className="w-3 h-3" />
                              <span>Enlarge Image</span>
                            </button>
                          </div>
                          <div
                            onClick={() => setViewingPatientImage({ url: record.imageUrl!, title: record.title, doctor: record.doctor, date: record.date })}
                            className="relative group rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs max-h-56 bg-slate-950 cursor-pointer flex items-center justify-center"
                          >
                            <img
                              src={record.imageUrl}
                              alt={record.title}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-85 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                              <span className="text-white text-xs font-medium flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5 text-cyan-300" /> Click to view high-resolution image
                              </span>
                              <span className="text-[10px] font-mono text-cyan-200 bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur-xs border border-white/20">
                                Clinician Verified
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ACTIVE PRESCRIPTIONS */}
        {/* ========================================================= */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Active Prescriptions & Refill Management</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Synchronized with national e-Prescribe network and verified community pharmacies.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Connected Pharmacy:</span>
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  CVS Pharmacy #4102 Active
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {prescriptions.map((rx) => (
                <div key={rx.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 text-[#005a7d] flex items-center justify-center">
                        <Pill className="w-5 h-5" />
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        rx.status === 'pending-refill'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {rx.status === 'pending-refill' ? 'Refill Pending' : 'Active Therapy'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">{rx.medication}</h3>
                    <p className="text-xs font-semibold text-[#005a7d] mt-0.5">{rx.dosage}</p>
                    <p className="text-xs text-slate-500 mt-2 font-medium">Frequency: {rx.frequency}</p>

                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                      <p className="font-medium text-slate-800">Special Instructions:</p>
                      <p className="text-[11px] mt-0.5 text-slate-500">{rx.instructions}</p>
                    </div>

                    <div className="mt-3 text-xs space-y-1 text-slate-500">
                      <p>Prescribed by: <span className="font-semibold text-slate-800">{rx.prescribedBy}</span></p>
                      <p>Date: <span className="font-medium text-slate-700">{rx.prescribedDate}</span></p>
                      <p>Pharmacy: <span className="font-medium text-slate-700">{rx.pharmacy}</span></p>
                    </div>
                  </div>

                  {/* Refill Action Bar */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Refills Left</span>
                      <span className="text-sm font-bold text-slate-800 tabular-nums">
                        {rx.refillsRemaining} of {rx.maxRefills}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRefillRequest(rx.id, rx.medication)}
                      disabled={rx.refillsRemaining === 0 || rx.status === 'pending-refill'}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        rx.refillsRemaining === 0 || rx.status === 'pending-refill'
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-[#005a7d] hover:bg-[#004766] text-white shadow-xs'
                      }`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{rx.status === 'pending-refill' ? 'Processing...' : 'Request Refill'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: DOCTOR PERMISSION CONTROLS & LOGS */}
        {/* ========================================================= */}
        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900">Doctor Permission Controls & Access Governance</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Zero-Knowledge Privacy: You retain ultimate cryptographic control. Revoking a physician removes their decryption keys immediately.
              </p>
            </div>

            {/* Permissions list */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Authorized Clinical Providers ({permissions.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {permissions.map((perm) => (
                  <div key={perm.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            perm.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {perm.status}
                          </span>
                          <h4 className="text-base font-bold text-slate-900 mt-1">{perm.doctorName}</h4>
                          <p className="text-xs text-[#005a7d] font-medium">{perm.specialty}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{perm.hospital}</p>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
                          {perm.licenseNumber}
                        </span>
                      </div>

                      {/* Scopes granted */}
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <span className="text-[11px] font-bold text-slate-600 block mb-2">Active Data Scopes:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs text-slate-600">
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={Boolean(perm.scopes?.timeline ?? true) && perm.status === 'active'} 
                              readOnly 
                              className="accent-[#005a7d]" 
                            />
                            <span>Timeline</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={Boolean(perm.scopes?.prescriptions ?? true) && perm.status === 'active'} 
                              readOnly 
                              className="accent-[#005a7d]" 
                            />
                            <span>Prescriptions</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={Boolean(perm.scopes?.labReports ?? true) && perm.status === 'active'} 
                              readOnly 
                              className="accent-[#005a7d]" 
                            />
                            <span>Lab Reports</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Revoke / Grant Button */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-400">{perm.expiresIn}</span>
                      <button
                        onClick={() => handleTogglePermission(perm.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          perm.status === 'active'
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                      >
                        {perm.status === 'active' ? 'Revoke Access' : 'Re-Authorize Provider'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Immutable Audit Log */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Immutable Access Audit Trail</h3>
                  <p className="text-xs text-slate-500">Every single retrieval of your records is recorded cryptographically.</p>
                </div>
                <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 font-mono text-xs">
                  {patient.accessLogs.length} Events Logged
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-medium">
                      <th className="py-2.5 font-medium">Timestamp</th>
                      <th className="py-2.5 font-medium">Provider / Enclave</th>
                      <th className="py-2.5 font-medium">Action Performed</th>
                      <th className="py-2.5 font-medium">Purpose</th>
                      <th className="py-2.5 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patient.accessLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 font-mono text-slate-600 whitespace-nowrap">{log.timestamp}</td>
                        <td className="py-3">
                          <span className="font-semibold text-slate-800 block">{log.actor}</span>
                          <span className="text-[11px] text-slate-400">{log.facility}</span>
                        </td>
                        <td className="py-3 text-slate-700 font-medium">{log.action}</td>
                        <td className="py-3 text-slate-500">{log.purpose}</td>
                        <td className="py-3 text-right">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {selectedRecord.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-1.5">{selectedRecord.title}</h3>
                <p className="text-xs text-slate-300 mt-0.5">{selectedRecord.doctor} · {selectedRecord.facility}</p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-sm text-slate-700">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Clinical Summary & Findings</span>
                <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {sanitizePatientText(selectedRecord.summary)}
                </p>
              </div>

              {selectedRecord.metrics && (
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Diagnostics & Values</span>
                  <div className="space-y-2">
                    {selectedRecord.metrics.map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <span className="font-semibold text-slate-700">{m.label}</span>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-900">{m.value} {m.unit}</span>
                          <span className="text-slate-400 block text-[10px]">Normal: {m.normalRange}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Diagnostic Image in Detail Modal */}
              {selectedRecord.imageUrl && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#005a7d]" />
                      <span>Attached Clinical Scan / Image</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setViewingPatientImage({ url: selectedRecord.imageUrl!, title: selectedRecord.title, doctor: selectedRecord.doctor, date: selectedRecord.date })}
                      className="text-xs font-semibold text-[#005a7d] hover:text-[#004766] flex items-center gap-1 cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Enlarge View</span>
                    </button>
                  </div>
                  <div 
                    onClick={() => setViewingPatientImage({ url: selectedRecord.imageUrl!, title: selectedRecord.title, doctor: selectedRecord.doctor, date: selectedRecord.date })}
                    className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 cursor-pointer flex items-center justify-center"
                  >
                    <img
                      src={selectedRecord.imageUrl}
                      alt={selectedRecord.title}
                      className="w-full max-h-60 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-3">
                      <span className="text-white text-xs font-medium flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-cyan-300" /> Click to inspect full resolution
                      </span>
                      <span className="text-[10px] font-mono text-cyan-200 bg-slate-900/80 px-2.5 py-0.5 rounded border border-white/20">
                        Cryptographically Sealed
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => handleDownloadReport(selectedRecord)}
                disabled={isGeneratingPdf === selectedRecord.id}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#005a7d] hover:bg-[#004766] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isGeneratingPdf === selectedRecord.id ? 'Generating Report PDF...' : 'Download Medical Report PDF (With Image)'}</span>
              </button>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        patient={patient}
        onSave={(updated) => {
          onUpdatePatient(updated);
        }}
        onShowToast={onShowToast}
      />

      {/* Patient Image Viewer Lightbox Modal */}
      {viewingPatientImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-700 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{viewingPatientImage.title}</h4>
                  <p className="text-[11px] text-slate-400">
                    {viewingPatientImage.doctor ? `Uploaded by: ${viewingPatientImage.doctor}` : ''} {viewingPatientImage.date ? `· ${viewingPatientImage.date}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(() => {
                  const currentRec = records.find(r => r.imageUrl === viewingPatientImage.url || r.title === viewingPatientImage.title);
                  if (!currentRec) return null;
                  return (
                    <button
                      onClick={() => handleDownloadReport(currentRec)}
                      disabled={isGeneratingPdf === currentRec.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#005a7d] hover:bg-[#004766] text-white transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                      title="Download complete Medical Report PDF with this image embedded"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isGeneratingPdf === currentRec.id ? 'Creating PDF...' : 'Download Report PDF (With Image)'}</span>
                    </button>
                  );
                })()}
                <a
                  href={viewingPatientImage.url}
                  download="Diagnostic_Medical_Scan.jpg"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Raw Image
                </a>
                <button
                  type="button"
                  onClick={() => setViewingPatientImage(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 flex items-center justify-center bg-black/70 overflow-hidden">
              <img
                src={viewingPatientImage.url}
                alt={viewingPatientImage.title}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-lg border border-white/10"
              />
            </div>
            <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                <ShieldCheck className="w-4 h-4" /> Clinician-Signed & Patient Verified Image
              </span>
              <button
                type="button"
                onClick={() => setViewingPatientImage(null)}
                className="px-4 py-1.5 rounded-lg bg-[#005a7d] hover:bg-[#004766] text-white font-bold text-xs cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Reports Memory Vault Modal */}
      {isMemoryVaultOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center">
                    <FolderDown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Downloaded Reports Memory Vault</h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Reports downloaded to device as PDF with attached diagnostic images & preserved in memory storage.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsMemoryVaultOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
              {savedMemoryReports.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <FolderDown className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-sm">No Medical Reports in Memory Vault Yet</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                      Click "Download PDF" on any medical record in your Longitudinal Timeline to generate an official PDF with attached diagnostic images and archive it here.
                    </p>
                  </div>
                </div>
              ) : (
                savedMemoryReports.map((item) => {
                  const originalRecord = records.find(r => r.id === item.recordId);

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-cyan-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        {item.thumbnailUrl ? (
                          <div
                            onClick={() => {
                              setIsMemoryVaultOpen(false);
                              setViewingPatientImage({
                                url: item.thumbnailUrl!,
                                title: item.title,
                                doctor: item.doctor,
                                date: item.date
                              });
                            }}
                            className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 cursor-pointer group relative"
                            title="Click to view attached scan"
                          >
                            <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center">
                              <Eye className="w-4 h-4 text-white opacity-80 group-hover:opacity-100" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-cyan-100/70 text-[#005a7d] shrink-0 flex items-center justify-center">
                            <FileText className="w-6 h-6" />
                          </div>
                        )}

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-100 text-cyan-800">
                              {item.category}
                            </span>
                            {item.hasImage && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" /> Image Embedded
                              </span>
                            )}
                            <span className="text-[11px] font-mono text-slate-400">
                              Downloaded {item.downloadedAt}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h4>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {item.fileName} · ~{Math.round(item.fileSizeBytes / 1024)} KB
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {originalRecord && (
                          <button
                            onClick={() => handleDownloadReport(originalRecord)}
                            disabled={isGeneratingPdf === originalRecord.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#005a7d] hover:bg-[#004766] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                            title="Re-download PDF to device"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{isGeneratingPdf === originalRecord.id ? 'Generating...' : 'Re-download PDF'}</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveSavedReport(item.id, item.title)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove from memory storage"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Persistent local memory cache · Offline-ready PDF reports
              </span>
              <button
                onClick={() => setIsMemoryVaultOpen(false)}
                className="px-5 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
