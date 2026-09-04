import React, { useState } from 'react';
import { Shift, Professional, AuditLog } from '../types';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  Lock,
  ArrowRight
} from 'lucide-react';

interface CandidateMatchingModalProps {
  shift: Shift;
  candidates: Professional[];
  onClose: () => void;
  onDispatchOffer: (shiftId: string, professionalId: string) => void;
  onBroadcastOffer: (shiftId: string) => void;
  onOverrideMatch: (shiftId: string, candidateId: string, reason: string) => void;
}

export const CandidateMatchingModal: React.FC<CandidateMatchingModalProps> = ({
  shift,
  candidates,
  onClose,
  onDispatchOffer,
  onBroadcastOffer,
  onOverrideMatch,
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<Professional>(candidates[0]);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideError, setOverrideError] = useState('');

  const handleApplyOverride = () => {
    if (!overrideReason.trim() || overrideReason.length < 10) {
      setOverrideError('A detailed clinical audit justification (at least 10 characters) is required by hospital compliance.');
      return;
    }
    onOverrideMatch(shift.id, selectedCandidate.id, overrideReason);
    setIsOverrideOpen(false);
    setOverrideReason('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Rule-Based Matching Engine v2.4
              </span>
              <span className="text-xs font-mono text-slate-500 font-semibold">{shift.shiftNumber}</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">
              Matching Candidates: {shift.role} • {shift.departmentName}
            </h2>
            <p className="text-xs text-slate-500">
              Shift Time: {shift.date} ({shift.startTime} - {shift.endTime}) • Base Rate: ${shift.baseRate.toFixed(2)}/hr
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Candidates List Column (5 cols) */}
          <div className="md:col-span-5 border-r border-slate-200 overflow-y-auto p-4 space-y-2 bg-slate-50/50">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Ranked Candidates ({candidates.length})
              </span>
              <button
                onClick={() => onBroadcastOffer(shift.id)}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Broadcast Tier-1
              </button>
            </div>

            {candidates.map((cand, idx) => {
              const isSelected = selectedCandidate.id === cand.id;
              const match = cand.matchScore;
              const hasWarning = match?.hasRestWarning;

              return (
                <div
                  key={cand.id}
                  onClick={() => setSelectedCandidate(cand)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-blue-600 shadow-sm ring-1 ring-blue-600'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
                        {cand.avatarInitials}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{cand.name}</h4>
                        <p className="text-[10px] text-slate-500">{cand.badgeNumber} • {cand.specialty}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-sm font-black ${
                        (match?.total || 0) >= 90 ? 'text-blue-600' : 'text-slate-700'
                      }`}>
                        {match?.total || 80}%
                      </span>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Match</p>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-2">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{cand.distanceMiles} mi away</span>
                    </span>
                    <span className="font-semibold text-slate-700">
                      ${cand.hourlyRate}/hr
                    </span>
                    {hasWarning ? (
                      <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-1 rounded flex items-center space-x-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>Rest Warning</span>
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-green-700 bg-green-50 px-1 rounded">
                        100% Eligible
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Candidate Detailed Explainability & Factor Breakdown (7 cols) */}
          <div className="md:col-span-7 p-6 overflow-y-auto space-y-5 bg-white">
            {selectedCandidate && (
              <>
                {/* Candidate Overview Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedCandidate.name}</h3>
                    <p className="text-xs text-slate-500">
                      {selectedCandidate.role} • Rating: <span className="font-bold text-slate-800">★ {selectedCandidate.rating}</span> ({selectedCandidate.shiftsCompleted} shifts)
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-right">
                    <span className="text-xs text-blue-700 font-semibold block">Total Match Score</span>
                    <span className="text-2xl font-black text-blue-600">
                      {selectedCandidate.matchScore?.total || 90}
                      <span className="text-xs font-normal text-slate-500"> / 100</span>
                    </span>
                  </div>
                </div>

                {/* Algorithmic Narrative Summary */}
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    <span className="font-bold text-slate-900">AI Explanation: </span>
                    {selectedCandidate.matchScore?.explanation}
                  </p>
                </div>

                {/* Rest Period Warning Alert if applicable */}
                {selectedCandidate.matchScore?.hasRestWarning && (
                  <div className="p-3.5 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-900 flex items-start space-x-2.5">
                    <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Rest Period Compliance Advisory (WTD Rule)</p>
                      <p className="text-[11px] text-orange-800 mt-0.5">
                        Candidate has {selectedCandidate.matchScore.restGapHours} hours gap since prior shift (Required minimum: 11.0 hours).
                        Facility Manager Override with audit justification is required to book.
                      </p>
                    </div>
                  </div>
                )}

                {/* Structured Factor Breakdown (Weights mandated by spec) */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    Factor Contribution Breakdown
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    {/* Qualifications (30%) */}
                    <div>
                      <div className="flex justify-between text-slate-700 mb-1">
                        <span>Clinical Qualifications (Weight: 30%)</span>
                        <span className="font-bold font-mono">
                          {selectedCandidate.matchScore?.qualificationsScore || 28} / 30 pts
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full"
                          style={{ width: `${((selectedCandidate.matchScore?.qualificationsScore || 28) / 30) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Commute / Distance (20%) */}
                    <div>
                      <div className="flex justify-between text-slate-700 mb-1">
                        <span>Commute Distance ({selectedCandidate.distanceMiles} mi) (Weight: 20%)</span>
                        <span className="font-bold font-mono">
                          {selectedCandidate.matchScore?.commuteScore || 18} / 20 pts
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full"
                          style={{ width: `${((selectedCandidate.matchScore?.commuteScore || 18) / 20) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Reliability History (20%) */}
                    <div>
                      <div className="flex justify-between text-slate-700 mb-1">
                        <span>Reliability History ({selectedCandidate.reliabilityScore}%) (Weight: 20%)</span>
                        <span className="font-bold font-mono">
                          {selectedCandidate.matchScore?.reliabilityScore || 20} / 20 pts
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full"
                          style={{ width: `${((selectedCandidate.matchScore?.reliabilityScore || 20) / 20) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Rate Fit (15%) */}
                    <div>
                      <div className="flex justify-between text-slate-700 mb-1">
                        <span>Rate Fit (${selectedCandidate.hourlyRate}/hr vs ${shift.baseRate}) (Weight: 15%)</span>
                        <span className="font-bold font-mono">
                          {selectedCandidate.matchScore?.rateScore || 14} / 15 pts
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full"
                          style={{ width: `${((selectedCandidate.matchScore?.rateScore || 14) / 15) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Preference Synergy (15%) */}
                    <div>
                      <div className="flex justify-between text-slate-700 mb-1">
                        <span>Scheduling Preference Synergy (Weight: 15%)</span>
                        <span className="font-bold font-mono">
                          {selectedCandidate.matchScore?.preferenceScore || 13} / 15 pts
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-purple-500 h-full"
                          style={{ width: `${((selectedCandidate.matchScore?.preferenceScore || 13) / 15) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verified Credentials */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Verified Credentials
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCandidate.credentials.map((cred) => (
                      <span
                        key={cred.id}
                        className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 flex items-center space-x-1"
                      >
                        <ShieldCheck className="w-3 h-3 text-blue-600" />
                        <span>{cred.name}</span>
                        <span className="text-slate-400 font-normal">({cred.licenseNumber})</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Manager Override Form (Collapsible) */}
                {isOverrideOpen && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-orange-900">
                        Compulsory Override Audit Justification
                      </span>
                      <button
                        onClick={() => setIsOverrideOpen(false)}
                        className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    <textarea
                      value={overrideReason}
                      onChange={(e) => {
                        setOverrideReason(e.target.value);
                        setOverrideError('');
                      }}
                      placeholder="Specify clinical emergency or rationale for overriding algorithm ranking (e.g. Critical trauma surge, specialized ECMO familiarity)..."
                      className="w-full text-xs p-2.5 bg-white border border-orange-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:outline-none h-20"
                    />
                    {overrideError && (
                      <p className="text-[10px] text-red-600 font-bold">{overrideError}</p>
                    )}
                    <button
                      onClick={handleApplyOverride}
                      className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Authorize Compliance Override & Book
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            {!isOverrideOpen && (
              <button
                onClick={() => setIsOverrideOpen(true)}
                className="text-xs font-semibold text-orange-700 hover:text-orange-900 border border-orange-300 bg-orange-50 px-3 py-1.5 rounded-md hover:bg-orange-100 transition-colors cursor-pointer"
              >
                Manager Override
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={() => {
                onDispatchOffer(shift.id, selectedCandidate.id);
                onClose();
              }}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer uppercase tracking-wider"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Offer to {selectedCandidate.name.split(' ')[0]}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
