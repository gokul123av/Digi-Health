import React, { useState, useRef } from 'react';
import { 
  X, Camera, Upload, Heart, Pill, Activity, User, UserX,
  Check, AlertTriangle, Sparkles, RefreshCw 
} from 'lucide-react';
import { PatientProfile } from '../../types/health';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  onSave: (updated: PatientProfile) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning') => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'
];

const BLOOD_GROUPS = [
  'O Rh+', 'O Rh-', 
  'A Rh+', 'A Rh-', 
  'B Rh+', 'B Rh-', 
  'AB Rh+', 'AB Rh-'
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSave,
  onShowToast,
}) => {
  const [avatar, setAvatar] = useState(patient.avatar);
  const [name, setName] = useState(patient.name);
  const [email, setEmail] = useState(patient.email);
  const [phone, setPhone] = useState(patient.phone);
  const [aadharNumber, setAadharNumber] = useState(patient.aadharNumber || '4589 1234 5678');
  
  // Blood group state
  const [bloodType, setBloodType] = useState(patient.emergency.bloodType || 'O Rh+');
  
  // Disease state
  const [disease, setDisease] = useState(
    patient.disease || 
    patient.emergency.disease || 
    patient.emergency.chronicConditions.join(', ') || 
    'Moderate Asthma (Extrinsic)'
  );
  
  // Medication dropdown (Yes / No)
  const [takingMedication, setTakingMedication] = useState<'yes' | 'no'>(
    patient.takingMedication || patient.emergency.takingMedication || 'yes'
  );

  const [medicationDetails, setMedicationDetails] = useState(
    patient.emergency.medications.join(', ') || 'Atorvastatin 20mg daily, Albuterol HFA PRN'
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle local image file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        onShowToast('Invalid file format', 'Please upload a PNG, JPEG, or WebP photo.', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setAvatar(uploadEvent.target.result as string);
          onShowToast('Photo Selected', 'New profile picture preview loaded.', 'info');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle removing profile picture (No profile picture option)
  const handleRemoveAvatar = () => {
    setAvatar('');
    onShowToast('Profile Picture Removed', 'Selected "No Profile Picture" option. A neutral silhouette will be shown.', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse diseases into array
    const chronicArray = disease
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    // Parse medications if yes
    const medArray = takingMedication === 'yes'
      ? medicationDetails.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const updatedPatient: PatientProfile = {
      ...patient,
      name,
      email,
      phone,
      aadharNumber: aadharNumber.trim(),
      avatar,
      disease,
      takingMedication,
      emergency: {
        ...patient.emergency,
        fullName: name,
        bloodType,
        disease,
        chronicConditions: chronicArray.length > 0 ? chronicArray : ['None Reported'],
        takingMedication,
        medications: medArray,
        lastSynced: 'Just now (Continuous)'
      }
    };

    onSave(updatedPatient);
    onShowToast(
      'Profile & Medical Vitals Updated',
      `Blood Group: ${bloodType} · Medications: ${takingMedication.toUpperCase()} · ${avatar ? 'Photo updated' : 'No profile picture set'}.`,
      'success'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#005a7d] via-[#014d6b] to-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-cyan-300">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono tracking-wider uppercase text-cyan-200 font-semibold">
                PATIENT PROFILE & HEALTH VITALS
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">Edit Profile Picture & Medical Data</h2>
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* 1. Profile Picture Editor with No Profile Picture Option */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md ring-2 ring-[#005a7d]/30 bg-slate-200 flex items-center justify-center">
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                    <User className="w-10 h-10 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500 mt-0.5">No Picture</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-slate-900/50 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Change Photo"
              >
                <Camera className="w-6 h-6" />
                <span className="text-[10px] font-bold mt-1">Upload</span>
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2.5">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#005a7d] hover:bg-[#004766] rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                </button>

                {/* NO PROFILE PICTURE BUTTON */}
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border cursor-pointer ${
                    !avatar
                      ? 'bg-rose-50 border-rose-300 text-rose-700 ring-2 ring-rose-400/40 shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-300 shadow-2xs'
                  }`}
                  title="Remove picture and display neutral silhouette"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>No Profile Picture</span>
                </button>
              </div>

              {/* Quick Preset Avatars including "No Photo" option */}
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">
                  Or select a preset portrait or no picture:
                </span>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1.5 flex-wrap">
                  {/* Preset Tile: No Picture */}
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    title="No Profile Picture"
                    className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer ${
                      !avatar
                        ? 'border-[#005a7d] bg-[#005a7d] text-white scale-110 shadow-sm ring-2 ring-[#005a7d]/40'
                        : 'border-slate-300 bg-slate-200 text-slate-600 hover:border-slate-400 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <UserX className="w-3.5 h-3.5" />
                  </button>

                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(url)}
                      title={`Preset Portrait ${idx + 1}`}
                      className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                        avatar === url ? 'border-[#005a7d] scale-110 shadow-sm ring-2 ring-[#005a7d]/40' : 'border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Patient Blood Group & Disease */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Blood Group Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                <span>Patient Blood Group</span>
              </label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005a7d] font-bold text-slate-900"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Required for emergency blood transfusion & triage.
              </span>
            </div>

            {/* Medication Dropdown (Yes / No) */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Pill className="w-3.5 h-3.5 text-[#005a7d]" />
                <span>Taking Daily Medication?</span>
              </label>
              <select
                value={takingMedication}
                onChange={(e) => setTakingMedication(e.target.value as 'yes' | 'no')}
                className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005a7d] font-bold ${
                  takingMedication === 'yes'
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                    : 'bg-slate-50 border-slate-300 text-slate-700'
                }`}
              >
                <option value="yes">Yes - Currently on Medication</option>
                <option value="no">No - Not taking medication</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {takingMedication === 'yes' ? 'Prescriptions and refill management active.' : 'No active prescription therapy flagged.'}
              </span>
            </div>

          </div>

          {/* 3. Disease / Diagnosed Medical Conditions */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-600" />
              <span>Diagnosed Disease / Medical Conditions</span>
            </label>
            <input
              type="text"
              value={disease}
              onChange={(e) => setDisease(e.target.value)}
              placeholder="e.g. Asthma, Hypertension, Type 2 Diabetes, Migraine..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005a7d]"
              required
            />
            
            {/* Quick condition suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400 font-medium">Quick Add:</span>
              {[
                'Asthma', 
                'Essential Hypertension', 
                'Type 2 Diabetes', 
                'Hyperlipidemia',
                'Seasonal Rhinitis',
                'None Reported'
              ].map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => {
                    if (cond === 'None Reported') {
                      setDisease('None Reported');
                    } else if (disease.includes(cond)) {
                      // Already present
                    } else if (!disease || disease === 'None Reported') {
                      setDisease(cond);
                    } else {
                      setDisease(`${disease}, ${cond}`);
                    }
                  }}
                  className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  + {cond}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Medication Detail Field when Yes is selected */}
          {takingMedication === 'yes' && (
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
              <label className="text-xs font-bold text-emerald-950 block">
                Active Medications & Dosage Schedule:
              </label>
              <input
                type="text"
                value={medicationDetails}
                onChange={(e) => setMedicationDetails(e.target.value)}
                placeholder="e.g. Atorvastatin 20mg daily, Lisinopril 10mg daily..."
                className="w-full px-3.5 py-2 text-xs bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-800"
              />
              <span className="text-[11px] text-emerald-800/80 block">
                Synced with your DegiHealth digital pharmacy profile.
              </span>
            </div>
          )}

          {/* Demographic details (Name, Contact, Aadhaar) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005a7d]"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Emergency Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005a7d]"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Aadhaar (12 Digits)</label>
              <input
                type="text"
                value={aadharNumber}
                onChange={(e) => setAadharNumber(e.target.value)}
                placeholder="4589 1234 5678"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005a7d] font-mono font-bold"
              />
            </div>
          </div>

        </form>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 text-xs font-bold text-white bg-[#005a7d] hover:bg-[#004766] rounded-xl transition-all shadow-md shadow-[#005a7d]/20 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save Profile & Health Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
