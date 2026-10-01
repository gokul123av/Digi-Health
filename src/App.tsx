/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GatewayScreen } from './components/GatewayScreen';
import { PatientPortal } from './components/PatientPortal';
import { DoctorPortal } from './components/DoctorPortal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { NetworkStatusModal } from './components/modals/NetworkStatusModal';
import { ComplianceModal } from './components/modals/ComplianceModal';
import { QRScannerModal } from './components/modals/QRScannerModal';
import { LoginModal } from './components/modals/LoginModal';
import { DatabaseHistoryModal } from './components/modals/DatabaseHistoryModal';
import { INITIAL_PATIENTS, INITIAL_DOCTOR } from './data/mockHealthData';
import { PatientProfile, DoctorProfile } from './types/health';
import { getOrCreatePatientByNumber, registerFirstTimePatientWithEmail } from './utils/patientRegistry';
import { 
  fetchPatientsFromDB, 
  fetchDoctorFromDB, 
  savePatientToDB, 
  saveDoctorToDB 
} from './utils/apiService';

const PATIENTS_STORAGE_KEY = 'degihealth_patients_registry_v2';
const DOCTOR_STORAGE_KEY = 'degihealth_doctor_profile_v2';

export default function App() {
  // App views: 'gateway' | 'patient' | 'doctor'
  const [currentView, setCurrentView] = useState<'gateway' | 'patient' | 'doctor'>('gateway');
  const [patientInitialTab, setPatientInitialTab] = useState<'timeline' | 'prescriptions' | 'permissions'>('timeline');

  // Patients state with localStorage persistence
  const [patients, setPatients] = useState<PatientProfile[]>(() => {
    try {
      const saved = localStorage.getItem(PATIENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load saved patients', e);
    }
    return INITIAL_PATIENTS;
  });

  const [activePatientId, setActivePatientId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('degihealth_active_patient_id');
      if (saved) return saved;
    } catch (e) {}
    return patients[0]?.id || INITIAL_PATIENTS[0].id;
  });

  // Keep active patient ID in localStorage
  useEffect(() => {
    if (activePatientId) {
      try {
        localStorage.setItem('degihealth_active_patient_id', activePatientId);
      } catch (e) {}
    }
  }, [activePatientId]);
  
  // Doctor state with localStorage persistence
  const [doctor, setDoctor] = useState<DoctorProfile>(() => {
    try {
      const saved = localStorage.getItem(DOCTOR_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved doctor profile', e);
    }
    return INITIAL_DOCTOR;
  });

  // Sync patients to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
    } catch (e) {
      console.error('Failed to persist patients', e);
    }
  }, [patients]);

  // Sync doctor to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(DOCTOR_STORAGE_KEY, JSON.stringify(doctor));
    } catch (e) {
      console.error('Failed to persist doctor profile', e);
    }
  }, [doctor]);

  // Fetch initial data from PostgreSQL database on mount
  useEffect(() => {
    fetchPatientsFromDB().then((pats) => {
      if (pats && pats.length > 0) {
        setPatients(pats);
        try {
          const savedId = localStorage.getItem('degihealth_active_patient_id');
          if (savedId && pats.some(p => p.id === savedId)) {
            setActivePatientId(savedId);
          }
        } catch (e) {}
      }
    });
    fetchDoctorFromDB().then((doc) => {
      if (doc) {
        setDoctor(doc);
      }
    });
  }, []);

  // Update Doctor Profile & sync to database
  const handleUpdateDoctor = (updated: DoctorProfile) => {
    setDoctor(updated);
    saveDoctorToDB(updated);
  };

  // Search or dynamically retrieve patient by ID number
  const handleDoctorSearchPatientId = (idQuery: string): PatientProfile => {
    const { patient, isNew } = getOrCreatePatientByNumber(idQuery, patients);
    if (isNew) {
      setPatients(prev => [patient, ...prev]);
      savePatientToDB(patient);
    }
    setActivePatientId(patient.id);
    return patient;
  };

  // First time logginer registration with Mail ID and Mail Password
  const handleFirstTimeLoginWithEmail = (
    email: string,
    password?: string,
    fullName?: string,
    logginerDetails?: {
      bloodGroup?: string;
      aadharNumber?: string;
      phone?: string;
    }
  ): { patient: PatientProfile; randomId: string } => {
    const { patient, randomId, isNew } = registerFirstTimePatientWithEmail(email, patients, { 
      fullName, 
      password,
      bloodGroup: logginerDetails?.bloodGroup,
      aadharNumber: logginerDetails?.aadharNumber,
      phone: logginerDetails?.phone
    });
    if (isNew) {
      setPatients(prev => [patient, ...prev]);
    } else {
      setPatients(prev => prev.map(p => p.id === patient.id ? patient : p));
    }
    // Always persist to database
    savePatientToDB({ ...patient, password: password || 'password123' });
    setActivePatientId(patient.id);
    setPatientInitialTab('timeline');
    setCurrentView('patient');
    return { patient, randomId };
  };

  // Active patient object
  const activePatient = patients.find(p => p.id === activePatientId) || patients[0];

  // Modals state
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);
  const [complianceTab, setComplianceTab] = useState<'encryption' | 'compliance'>('encryption');
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  
  // Login Modal
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginRole, setLoginRole] = useState<'patient' | 'doctor'>('patient');
  const [loginFirstTimeMode, setLoginFirstTimeMode] = useState(true);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, description?: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, title, description, type };
    setToasts(prev => [newToast, ...prev.slice(0, 4)]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Gateway feature click router (makes all buttons and bullet points functional!)
  const handleGatewayFeatureClick = (featureKey: string) => {
    switch (featureKey) {
      case 'individual-portal':
        setLoginRole('patient');
        setIsLoginModalOpen(true);
        break;

      case 'timeline-records':
        setPatientInitialTab('timeline');
        setCurrentView('patient');
        addToast('Patient Timeline Loaded', `Viewing longitudinal health record for ${activePatient.name}.`, 'info');
        break;

      case 'doctor-permissions':
        setPatientInitialTab('permissions');
        setCurrentView('patient');
        addToast('Permission Controls Loaded', 'Reviewing active doctor licenses and immutable audit trail.', 'info');
        break;

      case 'licensed-staff':
        setLoginRole('doctor');
        setIsLoginModalOpen(true);
        break;

      case 'qr-verification':
        setIsQRScannerOpen(true);
        break;

      case 'ephemeral-logs':
        setCurrentView('doctor');
        addToast('Doctor Enclave Active', '15-minute ephemeral access lease initiated with auto-purge.', 'info');
        break;

      case 'diagnostic-tools':
        setCurrentView('doctor');
        addToast('Diagnostic Tools Ready', 'SOAP Note writer, Fast Rx, and Lab orders active.', 'info');
        break;

      default:
        break;
    }
  };

  return (
    <div className="relative min-h-screen text-slate-800 glossy-mesh font-sans antialiased selection:bg-cyan-500 selection:text-white overflow-x-hidden">
      {/* Glossy Ambient Luminous Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-300/25 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] bg-cyan-300/25 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-32 left-1/4 w-[28rem] h-[28rem] bg-blue-200/30 rounded-full blur-3xl" />
      </div>

      {/* Toast Manager */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Main View Router */}
      {currentView === 'gateway' && (
        <GatewayScreen
          onLoginPatientClick={(firstTime = false) => {
            setLoginRole('patient');
            setLoginFirstTimeMode(firstTime);
            setIsLoginModalOpen(true);
          }}
          onLoginDoctorClick={(firstTime = false) => {
            setLoginRole('doctor');
            setLoginFirstTimeMode(firstTime);
            setIsLoginModalOpen(true);
          }}
          onFeatureClick={handleGatewayFeatureClick}
          onOpenNetworkModal={() => setIsNetworkModalOpen(true)}
          onOpenComplianceModal={(tab) => {
            setComplianceTab(tab);
            setIsComplianceModalOpen(true);
          }}
          onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
        />
      )}

      {currentView === 'patient' && (
        <PatientPortal
          patient={activePatient}
          initialTab={patientInitialTab}
          onBackToGateway={() => setCurrentView('gateway')}
          onSwitchToDoctor={() => {
            setCurrentView('doctor');
            addToast('Switched to Doctor Enclave', 'Doctor portal activated.', 'info');
          }}
          onDoctorScanPatient={(scannedPatient) => {
            setActivePatientId(scannedPatient.id);
            setCurrentView('doctor');
            addToast(
              'Patient QR Verified & Unlocked',
              `Opened ${scannedPatient.name}'s profile & medication dossier in Doctor Portal.`,
              'success'
            );
          }}
          onUpdatePatient={(updated) => {
            setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
            savePatientToDB(updated);
          }}
          onShowToast={addToast}
        />
      )}

      {currentView === 'doctor' && (
        <DoctorPortal
          doctor={doctor}
          patients={patients}
          activePatient={activePatient}
          onSelectPatient={(p) => setActivePatientId(p.id)}
          onSearchPatientId={handleDoctorSearchPatientId}
          onUpdatePatient={(updated) => {
            setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
            savePatientToDB(updated);
          }}
          onUpdateDoctor={handleUpdateDoctor}
          onBackToGateway={() => setCurrentView('gateway')}
          onSwitchToPatient={() => {
            setCurrentView('patient');
            addToast('Switched to Patient Portal', `Now viewing patient records as ${activePatient.name}.`, 'info');
          }}
          onOpenQRScanner={() => setIsQRScannerOpen(true)}
          onShowToast={addToast}
        />
      )}

      {/* Shared Modals */}
      <NetworkStatusModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
      />

      <DatabaseHistoryModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
        patients={patients}
        doctor={doctor}
      />

      <ComplianceModal
        isOpen={isComplianceModalOpen}
        onClose={() => setIsComplianceModalOpen(false)}
        initialTab={complianceTab}
      />

      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        patients={patients}
        onSelectPatient={(p) => {
          setActivePatientId(p.id);
          setCurrentView('doctor');
        }}
        onSearchPatientId={handleDoctorSearchPatientId}
        onShowToast={addToast}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        role={loginRole}
        patients={patients}
        doctor={doctor}
        onLoginAsPatient={(patId, updatedDetails) => {
          let { patient, isNew } = getOrCreatePatientByNumber(patId, patients);
          if (updatedDetails) {
            patient = {
              ...patient,
              name: updatedDetails.name || patient.name,
              phone: updatedDetails.phone || patient.phone,
              aadharNumber: updatedDetails.aadharNumber || patient.aadharNumber,
              emergency: {
                ...patient.emergency,
                fullName: updatedDetails.name || patient.emergency.fullName,
                bloodType: updatedDetails.bloodGroup || patient.emergency.bloodType
              }
            };
            savePatientToDB(patient);
          }
          if (isNew) {
            setPatients(prev => [patient, ...prev]);
          } else {
            setPatients(prev => prev.map(p => p.id === patient.id ? patient : p));
          }
          setActivePatientId(patient.id);
          setPatientInitialTab('timeline');
          setCurrentView('patient');
        }}
        onFirstTimeLoginWithEmail={handleFirstTimeLoginWithEmail}
        onLoginAsDoctor={(doctorDetails) => {
          if (doctorDetails) {
            const updatedDoc: DoctorProfile = {
              ...doctor,
              name: doctorDetails.name || doctor.name,
              email: doctorDetails.email || doctor.email,
              phone: doctorDetails.phone || doctor.phone,
              bloodGroup: doctorDetails.bloodGroup || doctor.bloodGroup || 'O+',
              aadharNumber: doctorDetails.aadharNumber || doctor.aadharNumber || '',
              hospital: doctorDetails.hospital || doctor.hospital,
              specialty: doctorDetails.specialty || doctor.specialty
            };
            setDoctor(updatedDoc);
            saveDoctorToDB(updatedDoc);
          }
          setCurrentView('doctor');
        }}
        onShowToast={addToast}
        initialFirstTimeMode={loginFirstTimeMode}
      />
    </div>
  );
}
