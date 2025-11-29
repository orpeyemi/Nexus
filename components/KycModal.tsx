import React, { useState } from 'react';
import { KYCLevel } from '../types';

interface KycModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (level: KYCLevel) => void;
}

export const KycModal: React.FC<KycModalProps> = ({ isOpen, onClose, onVerify }) => {
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleLevel1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleLevel2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
        setIsUploading(false);
        onVerify(KYCLevel.TIER_2);
        onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-surface border border-slate-700 w-full max-w-md rounded-lg shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Identity Verification</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
        </div>

        {step === 1 && (
            <form onSubmit={handleLevel1Submit} className="space-y-4">
                <div className="bg-blue-900/20 border border-blue-500/20 p-3 rounded text-sm text-blue-200">
                    Tier 1 Required for Trading. Please provide basic details.
                </div>
                <div>
                    <label className="block text-xs text-muted mb-1">Full Legal Name</label>
                    <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded p-2" />
                </div>
                <div>
                    <label className="block text-xs text-muted mb-1">Date of Birth</label>
                    <input required type="date" className="w-full bg-slate-900 border border-slate-700 rounded p-2" />
                </div>
                <div>
                    <label className="block text-xs text-muted mb-1">Nationality</label>
                    <select className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm">
                        <option>United States</option>
                        <option>United Kingdom</option>
                        <option>Canada</option>
                        <option>Japan</option>
                    </select>
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white py-2 rounded font-bold">
                    Continue to Document Upload
                </button>
            </form>
        )}

        {step === 2 && (
            <form onSubmit={handleLevel2Submit} className="space-y-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-600">
                        <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <p className="text-sm text-slate-300 mb-2">Upload ID or Passport</p>
                    <input type="file" required className="block w-full text-sm text-slate-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-slate-700 file:text-white
                        hover:file:bg-slate-600
                    "/>
                </div>

                <button 
                    type="submit" 
                    disabled={isUploading}
                    className="w-full bg-success hover:bg-emerald-600 text-white py-2 rounded font-bold flex justify-center items-center gap-2"
                >
                    {isUploading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Verifying...
                        </>
                    ) : 'Submit Verification'}
                </button>
            </form>
        )}
      </div>
    </div>
  );
};