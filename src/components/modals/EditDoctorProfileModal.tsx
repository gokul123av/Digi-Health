import React, { useState, useRef } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  Stethoscope, 
  Building2, 
  BadgeCheck, 
  Mail, 
  Phone, 
  FileBadge, 
  Check, 
  RefreshCw,
  Droplet,
  CreditCard
} from 'lucide-react';
import { DoctorProfile, ALL_BLOOD_GROUPS } from '../../types/health';

interface EditDoctorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: DoctorProfile;
  onSave: (updated: DoctorProfile) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning') => void;
}

const PRESET_DOCTOR_AVATARS = [
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80', // Male doctor in blue scrubs
  'https://images.unsplash.com/photo-1594824813583-e18e244b41b9?w=200&auto=format&fit=crop&q=80', // Female doctor with stethoscope
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80', // Female clinician in white coat
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80'  // Male physician smiling
];

const SPECIALTIES = [
  'Interventional Cardiology',
  'Cardiology & Vascular Medicine',
  'Internal Medicine',
  'Emergency Medicine & Triage',
  'Pulmonology & Critical Care',
  'Neurology & Neurophysiology',
  'Family Medicine & Primary Care',
  'Orthopedic Surgery',
  'Diagnostic Radiology',
  'Dermatology & Cutaneous Surgery'
];

export const EditDoctorProfileModal: React.FC<EditDoctorProfileModalProps> = ({
  isOpen,
  onClose,
  doctor,
  onSave,
  onShowToast,
}) => {
  const [avatar, setAvatar] = useState(doctor.avatar);
  const [name, setName] = useState(doctor.name);
  const [title, setTitle] = useState(doctor.title);
  const [specialty, setSpecialty] = useState(doctor.specialty);
  const [department, setDepartment] = useState(doctor.department || 'Cardiovascular Medicine');
  const [hospital, setHospital] = useState(doctor.hospital);
  const [licenseId, setLicenseId] = useState(doctor.licenseId);
  const [npiNumber, setNpiNumber] = useState(doctor.npiNumber || '1982736450');
  const [email, setEmail] = useState(doctor.email || `${doctor.name.toLowerCase().replace(/[^a-z]/g, '.').slice(0, 15)}@healthnet.org`);
  const [phone, setPhone] = useState(doctor.phone || '+1 (555) 882-9400 Ext. 402');
  const [bloodGroup, setBloodGroup] = useState(doctor.bloodGroup || 'B+');
  const [aadharNumber, setAadharNumber] = useState(doctor.aadharNumber || '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle local image file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        onShowToast('File Too Large', 'Please upload a clinician photo under 5MB.', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setAvatar(event.target.result);
          onShowToast('Doctor Photo Updated', 'Photo loaded. Click "Save Profile Changes" to apply.', 'info');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      onShowToast('Name Required', 'Please enter your professional clinician name.', 'warning');
      return;
    }
    if (!licenseId.trim()) {
      onShowToast('License Required', 'Please enter your medical license ID.', 'warning');
      return;
    }

    const updatedDoctor: DoctorProfile = {
      ...doctor,
      name: name.trim(),
      title: title.trim(),
      specialty: specialty.trim(),
      department: department.trim(),
      hospital: hospital.trim(),
      licenseId: licenseId.trim(),
      npiNumber: npiNumber.trim(),
      avatar,
      email: email.trim(),
      phone: phone.trim(),
      bloodGroup,
      aadharNumber: aadharNumber.trim()
    };

    onSave(updatedDoctor);
    onShowToast('Clinician Profile Saved', `Profile and cryptographic credentials updated for ${updatedDoctor.name}.`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-cyan-300">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-wider uppercase text-cyan-300 font-bold">
                CLINICAL CREDENTIALS ENCLAVE
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">Edit Doctor Profile & Credentials</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
          
          {/* Avatar Section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-indigo-600 shadow-md bg-slate-900">
                <img src={avatar} alt="Doctor Avatar" className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                Change
              </button>
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div>
                <span className="font-bold text-slate-900 text-sm block">Clinician Photograph</span>
                <span className="text-[11px] text-slate-500">
                  Visible on all signed prescription bundles, PDF reports, and patient portals.
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <span className="text-slate-400 text-[11px]">or choose preset:</span>
                <div className="flex items-center gap-1">
                  {PRESET_DOCTOR_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatar(url)}
                      className={`w-7 h-7 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                        avatar === url ? 'border-indigo-600 ring-2 ring-indigo-400 scale-105' : 'border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Preset ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Doctor Identity */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block border-b border-slate-200 pb-1">
              Physician Identification
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Full Clinician Name & Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Marcus Vance, MD, FACC"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Professional Title / Role <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chief of Interventional Cardiology"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Medical Specialty
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs cursor-pointer font-medium"
                >
                  {SPECIALTIES.map((spec, i) => (
                    <option key={i} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Department / Clinical Unit
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Cardiovascular Medicine & Cath Lab"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Hospital / Health Center / Clinical Affiliation <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  placeholder="e.g. St. Jude Academic Medical Center"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                  required
                />
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Section 2: Medical Licensing & Regulatory Credentials */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block border-b border-slate-200 pb-1">
              Regulatory Licensure & Prescribing Registry
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  State Medical License Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={licenseId}
                    onChange={(e) => setLicenseId(e.target.value)}
                    placeholder="e.g. MED-94021"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono font-bold"
                    required
                  />
                  <FileBadge className="w-4 h-4 text-indigo-600 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  National Provider Identifier (NPI)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={npiNumber}
                    onChange={(e) => setNpiNumber(e.target.value)}
                    placeholder="10-digit NPI e.g. 1982736450"
                    maxLength={10}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono font-bold"
                  />
                  <BadgeCheck className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Professional Contact */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block border-b border-slate-200 pb-1">
              Clinical Communication & Direct Pager
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Institutional Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. m.vance@stjude.org"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Clinical Office Phone / Extension
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000 Ext. 000"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>

            {/* Blood Group Dropdown & Aadhaar Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                    Doctor Blood Group
                  </label>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                    Dropdown (All Types)
                  </span>
                </div>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-bold text-slate-900 cursor-pointer"
                >
                  {ALL_BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                  Doctor Aadhaar Number (12 Digits)
                </label>
                <input
                  type="text"
                  value={aadharNumber}
                  onChange={(e) => setAadharNumber(e.target.value)}
                  placeholder="e.g. 4589 1234 5678"
                  maxLength={14}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Clinician Profile Changes</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
