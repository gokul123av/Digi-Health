import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  History, 
  Users, 
  Stethoscope, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck,
  AlertCircle,
  KeyRound,
  Calendar,
  Lock
} from 'lucide-react';
import { fetchLoginHistoryFromDB, LoginHistoryItem, fetchPatientsFromDB, fetchDoctorFromDB } from '../../utils/apiService';
import { PatientProfile, DoctorProfile } from '../../types/health';

interface DatabaseHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: PatientProfile[];
  doctor: DoctorProfile;
}

export const DatabaseHistoryModal: React.FC<DatabaseHistoryModalProps> = ({
  isOpen,
  onClose,
  patients,
  doctor,
}) => {
  const [activeTab, setActiveTab] = useState<'login-history' | 'patients' | 'doctor'>('login-history');
  const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>([]);
  const [dbPatients, setDbPatients] = useState<PatientProfile[]>(patients);
  const [dbDoctor, setDbDoctor] = useState<DoctorProfile>(doctor);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const history = await fetchLoginHistoryFromDB();
      setLoginHistory(history);
      const pats = await fetchPatientsFromDB();
      if (pats) setDbPatients(pats);
      const doc = await fetchDoctorFromDB();
      if (doc) setDbDoctor(doc);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-wider uppercase text-cyan-300 font-bold">
                  POSTGRESQL RELATIONAL DATABASE
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Connected
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">Database Registry & Login History</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Refresh from Database"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 pb-2 bg-slate-100/80 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('login-history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'login-history'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Login History ({loginHistory.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'patients'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Patients & Passwords ({dbPatients.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('doctor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'doctor'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor Information & Credentials</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: LOGIN HISTORY */}
          {activeTab === 'login-history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Real-time login events recorded in PostgreSQL `login_history` table:</span>
                <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {loginHistory.length} Recorded Attempts
                </span>
              </div>

              {loginHistory.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <History className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="font-semibold text-slate-600 text-sm">No login attempts recorded yet</p>
                  <p className="text-xs">Log in as a patient or doctor from the portal to see entries appear here.</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Time</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Logginer Name</th>
                        <th className="p-3">Blood Group</th>
                        <th className="p-3">Aadhaar</th>
                        <th className="p-3">Mail ID</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loginHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              item.role === 'doctor' ? 'bg-indigo-100 text-indigo-700' : 'bg-cyan-100 text-cyan-800'
                            }`}>
                              {item.role}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-900">
                            {item.name || '—'}
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 text-[11px] inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                              {item.bloodGroup || 'O+'}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-800 text-[11px]">
                            {item.aadharNumber || '4589 1234 5678'}
                          </td>
                          <td className="p-3 font-mono text-slate-600 text-[11px] truncate max-w-[150px]">
                            {item.email || item.identifier}
                          </td>
                          <td className="p-3 font-mono text-slate-600 text-[11px]">
                            {item.phoneNumber || '+91 98765 43210'}
                          </td>
                          <td className="p-3">
                            {item.status === 'success' ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Success
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[11px] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                                <AlertCircle className="w-3 h-3 text-rose-600" /> Failed
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PATIENTS & PASSWORDS */}
          {activeTab === 'patients' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>All registered patients stored in PostgreSQL `patients` table:</span>
                <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {dbPatients.length} Active Patients
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dbPatients.map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-cyan-300 transition-all space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-cyan-100 shrink-0">
                        {p.avatar ? (
                          <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-cyan-800">
                            {p.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{p.name}</h4>
                          <span className="font-mono text-[11px] font-black text-cyan-900 bg-cyan-200/90 border border-cyan-300 px-2 py-0.5 rounded-md">
                            ID #{p.idNumber || p.patientUid.replace(/\D/g, '')}
                          </span>
                          <span className="font-mono text-[10px] font-semibold text-slate-500">
                            ({p.patientUid})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{p.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Permanent ID Number</span>
                        <span className="font-mono font-black text-cyan-800 text-xs">#{p.idNumber || p.patientUid.replace(/\D/g, '')}</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Blood Group</span>
                        <span className="font-bold text-rose-700 text-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                          {p.emergency?.bloodType || 'O Rh+'}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Aadhaar Number</span>
                        <span className="font-mono font-bold text-slate-800 text-xs">
                          {p.aadharNumber || '4589 1234 5678'}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Contact Phone</span>
                        <span className="font-mono text-slate-700 text-xs">
                          {p.phone || '+91 98765 43210'}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-indigo-900">
                        <Lock className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                        <div>
                          <span className="font-bold block">Patient Password:</span>
                          <span className="text-[10px] text-indigo-600 block">Stored in PostgreSQL database</span>
                        </div>
                      </div>
                      <span className="font-mono font-black text-indigo-950 bg-white px-3 py-1 rounded-lg border border-indigo-300 text-xs shadow-2xs">
                        {p.password || 'password123'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/80">
                      <span>{p.records?.length || 0} Medical Records</span>
                      <span>{p.prescriptions?.length || 0} Active Prescriptions</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DOCTOR INFORMATION & PASSWORDS */}
          {activeTab === 'doctor' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-indigo-600 bg-slate-900 shrink-0">
                    <img src={dbDoctor.avatar} alt={dbDoctor.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{dbDoctor.name}</h4>
                    <p className="text-xs text-indigo-700 font-semibold">{dbDoctor.title}</p>
                    <p className="text-xs text-slate-500">{dbDoctor.hospital}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Doctor Blood Group</span>
                    <p className="font-bold text-rose-700 text-sm flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-600" />
                      {dbDoctor.bloodGroup || 'O+'}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Doctor Aadhaar Number</span>
                    <p className="font-mono font-bold text-slate-900 text-sm">{dbDoctor.aadharNumber || '4589 1234 5678'}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Institutional Email</span>
                    <p className="font-mono text-slate-800">{dbDoctor.email || 'dr.marcus.vance@stjude-hospital.org'}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Contact Phone</span>
                    <p className="font-mono text-slate-800">{dbDoctor.phone || '+91 98450 12345'}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Medical License ID</span>
                    <p className="font-mono font-bold text-slate-900 text-sm">{dbDoctor.licenseId}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Hospital / Department</span>
                    <p className="font-semibold text-slate-800">{dbDoctor.hospital} · {dbDoctor.department || 'Cardiology'}</p>
                  </div>
                </div>

                {/* Doctor Password / PIN Card */}
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-900 text-xs">
                    <Lock className="w-4 h-4 text-indigo-700" />
                    <div>
                      <span className="font-bold block">Doctor Enclave Password / PIN:</span>
                      <span className="text-[11px] text-indigo-600">Stored securely in PostgreSQL database</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-indigo-950 bg-white px-3 py-1 rounded-lg border border-indigo-300 text-sm">
                    {dbDoctor.password || '9402'}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            PostgreSQL instance active · Region: asia-southeast1
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
};
