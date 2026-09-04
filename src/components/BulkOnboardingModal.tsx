import React, { useState } from 'react';
import { Professional } from '../types';
import { 
  X, 
  UserPlus, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  FileText,
  Users,
  Send
} from 'lucide-react';

interface BulkOnboardingModalProps {
  onClose: () => void;
  onBatchOnboard: (newPros: Professional[]) => void;
}

export const BulkOnboardingModal: React.FC<BulkOnboardingModalProps> = ({
  onClose,
  onBatchOnboard,
}) => {
  const sampleCsvData = `Dr. Helena Vance, helena.vance@hse-trust.ie, RN-90214, Emergency / Trauma, $58.00, 4.2 miles
Marcus Chen, marcus.chen@nhs.net, HCA-44910, Elderly Care / Med-Surg, $34.00, 6.8 miles
Siobhan Kelly, siobhan.kelly@dublincare.org, RN-81029, Intensive Care / ICU, $62.00, 2.1 miles
Liam O'Connor, liam.oc@healthnet.com, RN-77402, Pediatric Acute, $56.00, 8.5 miles`;

  const [rawText, setRawText] = useState(sampleCsvData);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    validRecords: Partial<Professional>[];
    errors: string[];
    warnings: string[];
  } | null>(null);

  const handleValidateBatch = () => {
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
      const valid: Partial<Professional>[] = [];
      const errs: string[] = [];
      const warns: string[] = [];

      lines.forEach((line, idx) => {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length < 5) {
          errs.push(`Row ${idx + 1}: Insufficient fields. Expected (Name, Email, License/Badge, Specialty, Rate, Distance).`);
          return;
        }

        const [name, email, badge, specialty, rateStr, distStr] = parts;

        if (!name || name.length < 3) {
          errs.push(`Row ${idx + 1}: Name is too short.`);
          return;
        }

        if (!email.includes('@') || !email.includes('.')) {
          errs.push(`Row ${idx + 1}: Invalid email address syntax (${email}).`);
          return;
        }

        if (!badge || badge.length < 4) {
          errs.push(`Row ${idx + 1}: Invalid primary source license number (${badge}).`);
          return;
        }

        const rate = parseFloat(rateStr.replace(/[^0-9.]/g, '')) || 45.0;
        const dist = parseFloat(distStr?.replace(/[^0-9.]/g, '')) || 5.0;

        const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

        valid.push({
          id: `pro-bulk-${Date.now()}-${idx}`,
          name,
          role: specialty.includes('HCA') ? 'Healthcare Assistant (HCA)' : 'Registered Nurse (RN)',
          badgeNumber: badge,
          specialty,
          rating: 5.0,
          shiftsCompleted: 0,
          distanceMiles: dist,
          hourlyRate: rate,
          reliabilityScore: 100,
          status: 'active',
          avatarInitials: initials,
          credentials: [
            {
              id: `cred-${Date.now()}-${idx}-1`,
              name: specialty.includes('HCA') ? 'QQI Level 5 Healthcare Support' : 'NMBI / State Registered Nurse License',
              issuer: specialty.includes('HCA') ? 'QQI National Board' : 'Nursing & Midwifery Board',
              licenseNumber: badge,
              expiryDate: '2028-12-31',
              status: 'verified',
              verifiedAt: new Date().toISOString().split('T')[0],
              primarySource: 'National Registry Electronic Clearinghouse',
            },
            {
              id: `cred-${Date.now()}-${idx}-2`,
              name: 'Basic Life Support (BLS / CPR)',
              issuer: 'American Heart Association / ERC',
              licenseNumber: `BLS-${badge.slice(-4)}`,
              expiryDate: '2027-09-15',
              status: 'verified',
              verifiedAt: new Date().toISOString().split('T')[0],
              primarySource: 'AHA Direct Integration',
            },
          ],
        });
      });

      if (valid.length > 0) {
        warns.push(`Auto-assigned Tier 1 Provisional Credentials with primary-source verification hold.`);
      }

      setValidationResult({
        validRecords: valid,
        errors: errs,
        warnings: warns,
      });
    }, 500);
  };

  const handleCommitBatch = () => {
    if (!validationResult || validationResult.validRecords.length === 0) return;
    onBatchOnboard(validationResult.validRecords as Professional[]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Bulk Onboarding Engine
              </span>
              <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">
                Batch CSV / Roster Ingestion
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">
              Clinician Cohort Bulk Onboarding & Primary Source Vetting
            </h2>
            <p className="text-xs text-slate-500">
              Paste clinician registration data to validate license formats, establish initial credential registries, and batch provision portal accounts.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-bold text-slate-700 uppercase text-[10px]">
                Comma-Delimited Clinician Records (Name, Email, License, Specialty, Rate, Distance):
              </label>
              <button
                type="button"
                onClick={() => setRawText(sampleCsvData)}
                className="text-[10px] text-blue-600 hover:underline cursor-pointer"
              >
                Reset to Sample
              </button>
            </div>
            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setValidationResult(null);
              }}
              className="w-full font-mono text-[11px] bg-slate-50 border border-slate-300 rounded p-2.5 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Validation Feedback */}
          {validationResult && (
            <div className="space-y-3 animate-in fade-in">
              {validationResult.errors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-1">
                  <div className="flex items-center space-x-1.5 text-red-900 font-bold">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>Formatting Errors Found ({validationResult.errors.length})</span>
                  </div>
                  {validationResult.errors.map((err, i) => (
                    <p key={i} className="text-[11px] text-red-700">• {err}</p>
                  ))}
                </div>
              )}

              {validationResult.validRecords.length > 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-emerald-900 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{validationResult.validRecords.length} Clinicians Ready for Ingestion</span>
                    </div>
                    <span className="text-[10px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                      Pre-Validated 100%
                    </span>
                  </div>

                  <div className="space-y-1 divide-y divide-emerald-200/60 pt-1">
                    {validationResult.validRecords.map((r, i) => (
                      <div key={i} className="pt-1 first:pt-0 flex items-center justify-between text-[11px] text-emerald-900">
                        <span className="font-semibold">{r.name} ({r.badgeNumber})</span>
                        <span className="font-mono">${r.hourlyRate}/hr • {r.specialty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <div className="text-[10px] text-slate-500">
            Primary source background check: <strong className="text-slate-800">Automated Clearinghouse</strong>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>

            {!validationResult || validationResult.validRecords.length === 0 ? (
              <button
                onClick={handleValidateBatch}
                disabled={isValidating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold shadow-xs cursor-pointer uppercase tracking-wider flex items-center space-x-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isValidating ? 'Validating Registry...' : 'Validate Batch Roster'}</span>
              </button>
            ) : (
              <button
                onClick={handleCommitBatch}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold shadow-xs cursor-pointer uppercase tracking-wider flex items-center space-x-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Enroll {validationResult.validRecords.length} Clinicians</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
