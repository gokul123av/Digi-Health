import React from 'react';
import { 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  Stethoscope, 
  Sparkles,
  Database,
  Download
} from 'lucide-react';
import { PatientProfile, DoctorProfile } from '../types/health';

interface GatewayScreenProps {
  onLoginPatientClick: (firstTime?: boolean) => void;
  onLoginDoctorClick: (firstTime?: boolean) => void;
  onFeatureClick: (featureKey: string) => void;
  onOpenNetworkModal: () => void;
  onOpenComplianceModal: (tab: 'encryption' | 'compliance') => void;
  onOpenDatabaseModal?: () => void;
}

export const GatewayScreen: React.FC<GatewayScreenProps> = ({
  onLoginPatientClick,
  onLoginDoctorClick,
  onFeatureClick,
  onOpenNetworkModal,
  onOpenComplianceModal,
  onOpenDatabaseModal,
}) => {
  return (
    <div className="relative min-h-screen glossy-mesh flex flex-col justify-between overflow-x-hidden selection:bg-cyan-500 selection:text-white">
      {/* Background Soft Architectural Depth Blocks with Specular Gloss, Floating Orbs & Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        {/* Ambient floating glowing orbs */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-cyan-400/25 rounded-full blur-3xl animate-float-orb" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-500/25 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute top-1/2 -left-24 w-80 h-80 bg-sky-300/20 rounded-full blur-3xl animate-float-orb" />

        {/* Floating subtle ambient particles */}
        <div className="absolute top-28 left-1/6 w-3 h-3 rounded-full bg-cyan-400/40 blur-[1px] animate-float-particle-1" />
        <div className="absolute bottom-36 left-1/4 w-2 h-2 rounded-full bg-indigo-400/40 blur-[1px] animate-float-particle-2" />
        <div className="absolute top-48 right-1/5 w-3.5 h-3.5 rounded-full bg-sky-400/35 blur-[1px] animate-float-particle-3" />
        <div className="absolute bottom-24 right-1/6 w-2.5 h-2.5 rounded-full bg-teal-400/40 blur-[1px] animate-float-particle-1" />
        
        {/* Vertical center frosted block with subtle float */}
        <div className="w-[460px] h-[95%] bg-white/45 backdrop-blur-3xl rounded-[2.5rem] border border-white/70 shadow-[inset_0_1px_3px_rgba(255,255,255,0.9),0_20px_50px_rgba(0,0,0,0.03)]" />
        {/* Horizontal cross block */}
        <div className="absolute w-[940px] h-[400px] bg-indigo-100/25 backdrop-blur-2xl rounded-[3rem] border border-white/50 -z-10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.6)]" />
      </div>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col items-center justify-center">
        
        {/* Top Tag / Pill Badge */}
        <button
          onClick={onOpenNetworkModal}
          className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full glossy-pill hover:shadow-md transition-all text-xs font-semibold text-[#2563eb] mb-6 cursor-pointer animate-float-badge"
          title="Click to view Federated Clinical Network status and active nodes"
        >
          <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-pulse"></span>
          <span className="tracking-wider">FEDERATED CLINICAL NETWORK</span>
          <span className="text-[#93c5fd]">·</span>
          <span className="font-mono text-[11px] text-[#3b82f6]">v4.8-SEC</span>
        </button>

        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3.5 mb-4 animate-float-badge">
          {/* Logo icon with high-gloss shine */}
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#007b9e] to-[#004d6a] shadow-lg shadow-[#005a7d]/25 border border-white/30 flex items-center justify-center text-white relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent pointer-events-none" />
            <svg
              className="w-7 h-7 relative z-10"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-3H8v-2h3V8h2v3h3v2h-3v3z" />
            </svg>
          </div>

          <div className="text-3xl sm:text-4xl font-black tracking-tight flex items-baseline">
            <span className="text-[#0f1d38]">Degi</span>
            <span className="text-[#008ba3] ml-0.5">Health</span>
          </div>
        </div>

        {/* Heading & Subtitle */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f1d38] tracking-tight">
            Welcome to DegiHealth
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2.5 font-normal">
            Securely manage and access medical history with confidence.
          </p>
        </div>

        {/* Dual Cards Grid with Floating Levitation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full max-w-[840px] mx-auto">
          
          {/* 1. PATIENT LOGIN CARD (Floating Effect) */}
          <div className="glossy-card rounded-3xl p-7 flex flex-col justify-between animate-float-card hover:shadow-[0_30px_70px_-15px_rgba(0,123,158,0.3)] transition-all duration-300 relative group">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />
            <div>
              {/* Card Top Row */}
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#edf5fd] to-[#d8eafc] border border-white/80 shadow-xs flex items-center justify-center text-[#006087] group-hover:scale-105 transition-transform">
                  <div className="w-6 h-6 rounded-md border-2 border-[#006087] flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-[#006087]"></span>
                  </div>
                </div>
                <button
                  onClick={() => onFeatureClick('individual-portal')}
                  className="px-3.5 py-1 rounded-full text-xs font-semibold glossy-pill text-[#2563eb] hover:shadow-xs transition-colors cursor-pointer"
                >
                  Individual Portal
                </button>
              </div>

              {/* Card Title & Desc */}
              <h2 className="text-xl font-bold text-[#0f1d38]">Patient Login</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Access your personal medical history, active prescriptions, and diagnostic lab reports securely from anywhere.
              </p>

              {/* First Time Logginer Prompt Box */}
              <div className="mt-6 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-50/95 via-sky-50/85 to-blue-50/90 border border-cyan-200/90 shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-600 to-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4 text-cyan-100" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">First time logginer?</h3>
                    <p className="text-[11px] text-slate-500">Sign in with Mail ID to get a permanent ID</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onLoginPatientClick(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-cyan-50 text-cyan-800 text-[11px] font-bold border border-cyan-300 shadow-2xs transition-all shrink-0 cursor-pointer"
                >
                  Mail Sign In →
                </button>
              </div>
            </div>

            {/* CTA Button: Login as Patient -> */}
            <div className="mt-8">
              <button
                onClick={() => onLoginPatientClick(false)}
                className="w-full py-3.5 px-5 rounded-xl font-bold text-white glossy-button-primary flex items-center justify-center gap-2 text-sm cursor-pointer shadow-md group-hover:shadow-lg transition-all"
              >
                <span>Login as Patient</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. DOCTOR LOGIN CARD (Counter-Floating Effect) */}
          <div className="glossy-card rounded-3xl p-7 flex flex-col justify-between animate-float-delayed hover:shadow-[0_30px_70px_-15px_rgba(79,70,229,0.3)] transition-all duration-300 relative group">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-60" />
            <div>
              {/* Card Top Row */}
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#eff3ff] to-[#dbe4fe] border border-white/80 shadow-xs flex items-center justify-center text-[#3b82f6] group-hover:scale-105 transition-transform">
                  <Stethoscope className="w-6 h-6 stroke-[1.75]" />
                </div>
                <button
                  onClick={() => onFeatureClick('licensed-staff')}
                  className="px-3.5 py-1 rounded-full text-xs font-semibold glossy-pill text-[#2563eb] hover:shadow-xs transition-colors cursor-pointer"
                >
                  Licensed Staff
                </button>
              </div>

              {/* Card Title & Desc */}
              <h2 className="text-xl font-bold text-[#0f1d38]">Doctor Login</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Verify patients through unique Patient ID to securely access authorized records, prescriptions & triage data.
              </p>

              {/* First Time Logginer Prompt Box for Doctors */}
              <div className="mt-6 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/95 via-purple-50/85 to-blue-50/90 border border-indigo-200/90 shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4 text-indigo-100" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">First time logginer?</h3>
                    <p className="text-[11px] text-slate-500">Sign in with domain email (snsct.org)</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onLoginDoctorClick(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-indigo-50 text-indigo-800 text-[11px] font-bold border border-indigo-300 shadow-2xs transition-all shrink-0 cursor-pointer"
                >
                  Domain Sign In →
                </button>
              </div>
            </div>

            {/* CTA Button: Login as Doctor -> */}
            <div className="mt-8">
              <button
                onClick={() => onLoginDoctorClick(false)}
                className="w-full py-3.5 px-5 rounded-xl font-bold text-white glossy-button-indigo flex items-center justify-center gap-2 text-sm cursor-pointer shadow-md group-hover:shadow-lg transition-all"
              >
                <span>Login as Doctor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* Bottom Footer Trust Badges */}
      <footer className="relative z-10 w-full py-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-[#005a7d]">
        <button
          onClick={() => onOpenComplianceModal('encryption')}
          className="flex items-center gap-2 hover:text-[#003c54] transition-colors cursor-pointer"
          title="Click to view End-to-End Encryption Specifications"
        >
          <Lock className="w-4 h-4 text-[#005a7d]" />
          <span>End-to-End Encrypted Health Records</span>
        </button>

        <button
          onClick={() => onOpenComplianceModal('compliance')}
          className="flex items-center gap-2 hover:text-[#003c54] transition-colors cursor-pointer"
          title="Click to view HIPAA and GDPR Certification Seals"
        >
          <ShieldCheck className="w-4 h-4 text-[#005a7d]" />
          <span>HIPAA & GDPR Compliant</span>
        </button>

        {onOpenDatabaseModal && (
          <button
            onClick={onOpenDatabaseModal}
            className="flex items-center gap-2 text-indigo-700 bg-indigo-50/90 hover:bg-indigo-100/90 px-3.5 py-1.5 rounded-full border border-indigo-200 transition-all cursor-pointer shadow-xs"
            title="Inspect PostgreSQL Database Tables, Stored Patients, Doctors & Login History"
          >
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span>Database & Login History</span>
          </button>
        )}

        <a
          href="/api/download-zip"
          download="degihealth-project.zip"
          className="flex items-center gap-1.5 text-cyan-800 bg-cyan-50/90 hover:bg-cyan-100 px-3.5 py-1.5 rounded-full border border-cyan-300 transition-all cursor-pointer shadow-xs font-semibold"
          title="Download the entire web application codebase as a ZIP archive"
        >
          <Download className="w-3.5 h-3.5 text-cyan-700" />
          <span>Download Code (ZIP)</span>
        </a>
      </footer>
    </div>
  );
};
