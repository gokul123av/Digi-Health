import React from 'react';
import { X, ShieldCheck, Server, Globe2, Activity, Cpu, CheckCircle } from 'lucide-react';

interface NetworkStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NetworkStatusModal: React.FC<NetworkStatusModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 p-6 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-mono font-semibold tracking-wider text-cyan-300 uppercase">
                  FEDERATED CLINICAL NETWORK • v4.8-SEC
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">Decentralized Mesh & Security Cluster</h2>
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-xs text-slate-500 font-medium block">Cluster Status</span>
              <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
                <CheckCircle className="w-4 h-4" /> 100% Operational
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-xs text-slate-500 font-medium block">Verified Nodes</span>
              <span className="text-sm font-bold text-slate-800 tabular-nums mt-1">
                14 Hospital Mesh Nodes
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-xs text-slate-500 font-medium block">ZK Proof Latency</span>
              <span className="text-sm font-bold text-cyan-700 tabular-nums mt-1">
                18.4 ms avg
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-xs text-slate-500 font-medium block">Consensus Cipher</span>
              <span className="text-sm font-bold text-slate-800 mt-1">
                AES-256-GCM / Post-Quantum
              </span>
            </div>
          </div>

          {/* Active Nodes List */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-cyan-600" /> Connected Regional Federated Enclaves
            </h3>
            <div className="space-y-2">
              {[
                { name: 'St. Jude Academic Medical Center', node: 'Node-US-East-01', latency: '12ms', status: 'Master Verifier' },
                { name: 'Quest Diagnostics Reference Node', node: 'Node-US-East-04', latency: '19ms', status: 'Lab Peer' },
                { name: 'Bay Radiology & Diagnostics Enclave', node: 'Node-US-West-02', latency: '24ms', status: 'Imaging Peer' },
                { name: 'Metropolitan Community Health', node: 'Node-US-Central-08', latency: '16ms', status: 'EHR Peer' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200/70 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <div>
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <p className="text-slate-400 font-mono text-[11px]">{item.node}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {item.status}
                    </span>
                    <span className="block text-slate-400 font-mono text-[10px] mt-0.5">{item.latency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cryptographic Safeguard specs */}
          <div className="bg-cyan-50/60 border border-cyan-100 rounded-xl p-4">
            <h4 className="text-xs font-bold text-cyan-950 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-700" /> Zero-Knowledge Federated Architecture
            </h4>
            <p className="text-xs text-cyan-900/80 leading-relaxed">
              DegiHealth uses client-side ephemeral secret sharing. Patient records remain cryptographically encrypted at rest and in transit. Only authorized clinical keys with active patient leases can decrypt diagnostic timelines.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
