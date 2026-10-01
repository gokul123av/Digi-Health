import React from 'react';
import { X, ShieldCheck, Lock, FileCheck2, CheckCircle2, Award } from 'lucide-react';

interface ComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'encryption' | 'compliance';
}

export const ComplianceModal: React.FC<ComplianceModalProps> = ({ 
  isOpen, 
  onClose, 
  initialTab = 'encryption' 
}) => {
  const [activeTab, setActiveTab] = React.useState<'encryption' | 'compliance'>(initialTab);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              {activeTab === 'encryption' ? <Lock className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase">
                  SECURITY ATTESTATION & COMPLIANCE
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">
                {activeTab === 'encryption' ? 'End-to-End Cryptographic Encryption' : 'HIPAA & GDPR Compliance Verification'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 px-6 pt-3 bg-slate-50 gap-4">
          <button
            onClick={() => setActiveTab('encryption')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'encryption'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-4 h-4" /> End-to-End Encryption
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'compliance'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> HIPAA & GDPR Certification
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-sm text-slate-600">
          {activeTab === 'encryption' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-50/60 border border-cyan-100 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Zero-Knowledge Key Derivation</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Patient health data is encrypted client-side using individual 256-bit symmetric keys before leaving the device. DegiHealth servers cannot read, index, or sell private health information.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="text-xs text-slate-400 font-medium">Cipher Specification</span>
                  <p className="font-semibold text-slate-900 mt-0.5">AES-256-GCM + XChaCha20</p>
                  <p className="text-xs text-slate-500 mt-1">Authenticated payload encryption with integrity tagging.</p>
                </div>
                <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="text-xs text-slate-400 font-medium">Key Exchange</span>
                  <p className="font-semibold text-slate-900 mt-0.5">Curve25519 (ECDH)</p>
                  <p className="text-xs text-slate-500 mt-1">Perfect forward secrecy for every doctor-patient session.</p>
                </div>
                <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="text-xs text-slate-400 font-medium">Data at Rest</span>
                  <p className="font-semibold text-slate-900 mt-0.5">Hardware HSM Enclave</p>
                  <p className="text-xs text-slate-500 mt-1">FIPS 140-2 Level 3 validated security modules.</p>
                </div>
                <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="text-xs text-slate-400 font-medium">Data in Transit</span>
                  <p className="font-semibold text-slate-900 mt-0.5">TLS 1.3 Strict HSTS</p>
                  <p className="text-xs text-slate-500 mt-1">PFS with automated certificate pinning.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                <Award className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-emerald-950 text-sm">Annual SOC 2 Type II & HIPAA Attestation</h4>
                  <p className="text-xs text-emerald-900/80 mt-1 leading-relaxed">
                    Audited by independent AICPA certified assessors. Fully compliant with HIPAA Security Rule 45 CFR Part 160 and Part 164 Subparts A, C, and E.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { title: 'HIPAA Security & Privacy Rule Compliant', desc: 'Covered entity and Business Associate Agreement (BAA) enforced across all connected clinics.' },
                  { title: 'GDPR Right to Be Forgotten & Data Portability', desc: 'One-click export in standard HL7/FHIR & PDF format, with instant irreversible cryptographic key shredding.' },
                  { title: 'Immutable Tamper-Proof Audit Trail', desc: 'Every record query, download, and doctor lease is written to an immutable append-only verification log.' },
                  { title: 'Granular Patient Consent Controls', desc: 'Patients can revoke clinician access instantly or restrict access to emergency-only scopes at any second.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">Certificate: DEGI-SEC-2026-A194</span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
