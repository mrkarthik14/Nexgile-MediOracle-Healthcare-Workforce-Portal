import React, { useState } from 'react';
import { DisputeEvidence, AuditLog } from '../types';
import { 
  X, 
  MapPin, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Clock, 
  FileSignature, 
  Scale,
  Sparkles
} from 'lucide-react';

interface DisputeEvidenceModalProps {
  dispute: DisputeEvidence;
  onClose: () => void;
  onResolveDispute: (
    disputeId: string, 
    action: 'uphold_original' | 'apply_adjustment' | 'recalculate_overtime',
    adjustmentAmount: number,
    notes: string
  ) => void;
}

export const DisputeEvidenceModal: React.FC<DisputeEvidenceModalProps> = ({
  dispute,
  onClose,
  onResolveDispute,
}) => {
  const [resolutionAction, setResolutionAction] = useState<'uphold_original' | 'apply_adjustment' | 'recalculate_overtime'>('apply_adjustment');
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(dispute.varianceAmount);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleResolve = () => {
    if (!resolutionNotes.trim() || resolutionNotes.length < 10) {
      setError('A formal dispute audit resolution memo (minimum 10 characters) is required.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onResolveDispute(
        dispute.id,
        resolutionAction,
        resolutionAction === 'apply_adjustment' ? adjustmentAmount : 0,
        resolutionNotes
      );
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                Dispute Evidence Dossier
              </span>
              <span className="text-xs font-mono text-slate-600 font-bold">
                Case #{dispute.id} • Shift {dispute.shiftNumber}
              </span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                dispute.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {dispute.status === 'resolved' ? 'Resolved & Audited' : 'Under Formal Evidence Review'}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">
              Timekeeping Variance Resolution: {dispute.clinicianName}
            </h2>
            <p className="text-xs text-slate-500">
              Facility: {dispute.facility} • Disputed Variance: {dispute.disputedHours}h (${dispute.varianceAmount.toFixed(2)})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dossier Body */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs">
          {/* Claim vs Recorded Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Clinician Claimed</span>
              <p className="text-lg font-black text-slate-900 mt-0.5">{dispute.claimedHours} hrs</p>
              <p className="text-[10px] text-slate-500">Includes emergency resus holdover</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Rostered / Facility Budget</span>
              <p className="text-lg font-black text-slate-900 mt-0.5">{(dispute.claimedHours - dispute.disputedHours).toFixed(1)} hrs</p>
              <p className="text-[10px] text-slate-500">Baseline approved shift schedule</p>
            </div>

            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <span className="text-[10px] uppercase font-bold text-amber-800">Variance in Dispute</span>
              <p className="text-lg font-black text-amber-900 mt-0.5">+{dispute.disputedHours} hrs (${dispute.varianceAmount})</p>
              <p className="text-[10px] text-amber-700 font-semibold">Requires formal resolution</p>
            </div>
          </div>

          {/* Statements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase text-blue-900 flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Clinician Testimony (David Okafor)</span>
              </span>
              <p className="text-slate-700 leading-relaxed italic">
                "{dispute.clinicianStatement}"
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-800 flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>Facility Reviewer Note (Cardiology Floor)</span>
              </span>
              <p className="text-slate-700 leading-relaxed italic">
                "{dispute.facilityStatement}"
              </p>
            </div>
          </div>

          {/* Primary Source Digital Evidence (GPS, BLE, Digital Signature) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Tamper-Resistant Digital Audit Telemetry</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* GPS Geofence Check */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1">
                <div className="flex items-center space-x-1.5 text-slate-800 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>GPS Geofence Validation</span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <p>Accuracy: <strong className="text-emerald-700 font-mono">±{dispute.gpsClockIn.distanceMeters}m</strong> (Within 50m radius)</p>
                  <p>Status: <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded text-[10px]">PASS (On-Site)</span></p>
                  <p className="text-[10px] text-slate-400 font-mono pt-1">{dispute.gpsClockIn.recordedTime}</p>
                </div>
              </div>

              {/* Bluetooth Beacon Check */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1">
                <div className="flex items-center space-x-1.5 text-slate-800 font-bold">
                  <Radio className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Ward BLE Beacon Pulse</span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <p>Beacon ID: <span className="font-mono font-bold text-slate-800">{dispute.beaconVerification.beaconId}</span></p>
                  <p>Location: {dispute.beaconVerification.wardLocation}</p>
                  <p className="text-[10px] text-slate-400 font-mono pt-1">Verified: {dispute.beaconVerification.verifiedAt}</p>
                </div>
              </div>

              {/* Supervisor Digital Signoff */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1">
                <div className="flex items-center space-x-1.5 text-slate-800 font-bold">
                  <FileSignature className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Clinical Lead Signoff</span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <p>Signee: <strong className="text-slate-900">{dispute.supervisorSignoff.supervisorName}</strong></p>
                  <p className="text-[10px] text-slate-500">{dispute.supervisorSignoff.supervisorRole}</p>
                  <p className="font-mono text-[9px] bg-slate-100 p-1 rounded text-slate-600 truncate mt-1">
                    Hash: {dispute.supervisorSignoff.digitalSignature}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Traceable Resolution Form */}
          {dispute.status !== 'resolved' ? (
            <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3">
              <div className="flex items-center space-x-1.5 text-slate-900 font-bold text-xs">
                <Scale className="w-4 h-4 text-blue-600" />
                <span>Execute Binding Resolution Action</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label className={`p-2.5 rounded-lg border flex flex-col cursor-pointer transition-all ${
                  resolutionAction === 'apply_adjustment'
                    ? 'bg-white border-blue-600 ring-1 ring-blue-600'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="resAction"
                      checked={resolutionAction === 'apply_adjustment'}
                      onChange={() => setResolutionAction('apply_adjustment')}
                    />
                    <span className="font-bold text-slate-900">Approve Adjustment</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">
                    Credit the clinician for documented emergency resuscitation hours
                  </span>
                </label>

                <label className={`p-2.5 rounded-lg border flex flex-col cursor-pointer transition-all ${
                  resolutionAction === 'recalculate_overtime'
                    ? 'bg-white border-blue-600 ring-1 ring-blue-600'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="resAction"
                      checked={resolutionAction === 'recalculate_overtime'}
                      onChange={() => setResolutionAction('recalculate_overtime')}
                    />
                    <span className="font-bold text-slate-900">Recalculate at 1.5x</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">
                    Apply statutory overtime premium multiplier
                  </span>
                </label>

                <label className={`p-2.5 rounded-lg border flex flex-col cursor-pointer transition-all ${
                  resolutionAction === 'uphold_original'
                    ? 'bg-white border-blue-600 ring-1 ring-blue-600'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="resAction"
                      checked={resolutionAction === 'uphold_original'}
                      onChange={() => setResolutionAction('uphold_original')}
                    />
                    <span className="font-bold text-slate-900">Uphold Original Roster</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">
                    Reject dispute based on absence of pre-approval
                  </span>
                </label>
              </div>

              {resolutionAction === 'apply_adjustment' && (
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                    Approved Credit Adjustment Amount ($):
                  </label>
                  <input
                    type="number"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(parseFloat(e.target.value) || 0)}
                    className="w-48 bg-white border border-slate-300 rounded p-1.5 font-mono text-xs text-slate-800"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                  Binding Audit Justification & Decision Memo:
                </label>
                <textarea
                  rows={2}
                  value={resolutionNotes}
                  onChange={(e) => {
                    setResolutionNotes(e.target.value);
                    setError('');
                  }}
                  placeholder="Specify findings, verified telemetry logs, and authorization reasoning for the immutable audit trail..."
                  className="w-full bg-white border border-slate-300 rounded p-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {error && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
              <div className="flex items-center space-x-2 text-emerald-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Dispute Settled & Cryptographically Sealed</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Action: <strong>{dispute.resolution?.action.replace('_', ' ').toUpperCase()}</strong> • Amount: ${dispute.resolution?.adjustmentAmount.toFixed(2)}
              </p>
              <p className="text-[10px] text-slate-500">
                Resolved by {dispute.resolution?.resolvedBy} at {dispute.resolution?.resolvedAt}. Reason: "{dispute.resolution?.notes}"
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <div className="text-[10px] text-slate-400">
            Immutable Audit Hash: <span className="font-mono">SHA256-DISP-9801A</span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close Dossier
            </button>

            {dispute.status !== 'resolved' && (
              <button
                onClick={handleResolve}
                disabled={isSubmitting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer uppercase tracking-wider"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Seal Formal Resolution</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
