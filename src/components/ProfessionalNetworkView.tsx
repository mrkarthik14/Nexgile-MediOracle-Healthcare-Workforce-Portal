import React, { useState } from 'react';
import { Professional, AuditLog } from '../types';
import { 
  Search, 
  ShieldCheck, 
  MapPin, 
  Star, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  UserPlus, 
  Send, 
  Mail, 
  CheckSquare, 
  Square 
} from 'lucide-react';
import { BulkOnboardingModal } from './BulkOnboardingModal';

interface ProfessionalNetworkViewProps {
  professionals: Professional[];
  onOpenClinicianProfile?: (pro: Professional) => void;
  onBatchOnboard?: (newPros: Professional[]) => void;
  onAddAuditLog?: (log: Partial<AuditLog>) => void;
}

export const ProfessionalNetworkView: React.FC<ProfessionalNetworkViewProps> = ({
  professionals,
  onOpenClinicianProfile,
  onBatchOnboard,
  onAddAuditLog,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isBulkOnboardOpen, setIsBulkOnboardOpen] = useState(false);
  const [selectedProIds, setSelectedProIds] = useState<string[]>([]);
  const [batchNotice, setBatchNotice] = useState<string | null>(null);

  const toggleSelectPro = (id: string) => {
    setSelectedProIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProIds.length === filtered.length) {
      setSelectedProIds([]);
    } else {
      setSelectedProIds(filtered.map(p => p.id));
    }
  };

  const handleBatchDispatchWelcome = () => {
    if (selectedProIds.length === 0) return;
    setBatchNotice(`Dispatched digital welcome pack, NFC badge token, and portal credentials to ${selectedProIds.length} clinicians.`);
    if (onAddAuditLog) {
      onAddAuditLog({
        code: 'BULK-WELCOME',
        title: 'Bulk Clinician Welcome Packs Dispatched',
        actor: 'Workforce Onboarding Team',
        actorRole: 'Recruiter',
        details: `Dispatched compliance packets and mobile app access tokens to ${selectedProIds.length} clinicians.`,
        severity: 'info',
        targetType: 'Professional',
        targetId: 'batch-welcome',
      });
    }
    setSelectedProIds([]);
    setTimeout(() => setBatchNotice(null), 4500);
  };

  const filtered = professionals.filter((p) => {
    if (roleFilter !== 'all' && !p.role.toLowerCase().includes(roleFilter.toLowerCase())) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.badgeNumber.toLowerCase().includes(q) ||
        p.specialty.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Verified Clinician Pool
            </span>
            <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded font-bold">
              {professionals.length} Verified Professionals
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            Professional Network & Primary Source Registry
          </h2>
          <p className="text-xs text-slate-500">
            NMC / State Board verified nurses, healthcare assistants, and allied health staff ready for on-demand dispatch.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, badge, specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-52"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="nurse">Registered Nurses (RN)</option>
            <option value="hca">Healthcare Assistants (HCA)</option>
            <option value="allied">Allied Health</option>
          </select>

          <button
            onClick={() => setIsBulkOnboardOpen(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center space-x-1.5 uppercase tracking-wider"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Bulk Onboard</span>
          </button>
        </div>
      </div>

      {batchNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{batchNotice}</span>
        </div>
      )}

      {/* Multi-Select Toolbar */}
      {filtered.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSelectAll}
              className="text-slate-600 hover:text-slate-900 font-semibold flex items-center space-x-1.5 cursor-pointer"
            >
              {selectedProIds.length === filtered.length ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Select All ({filtered.length})</span>
            </button>
            {selectedProIds.length > 0 && (
              <span className="font-bold text-blue-700 font-mono">
                • {selectedProIds.length} Selected
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleBatchDispatchWelcome}
              disabled={selectedProIds.length === 0}
              className={`px-3 py-1 rounded text-xs font-bold flex items-center space-x-1 shadow-2xs uppercase tracking-wider ${
                selectedProIds.length > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Mail className="w-3 h-3" />
              <span>Dispatch Welcome Packets ({selectedProIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Clinicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((pro) => {
          const isSelected = selectedProIds.includes(pro.id);
          return (
            <div
              key={pro.id}
              className={`bg-white border rounded-xl p-5 shadow-xs transition-all flex flex-col justify-between ${
                isSelected ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectPro(pro.id)}
                      className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />

                    <div className="w-10 h-10 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                      {pro.avatarInitials}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{pro.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        {pro.badgeNumber} • {pro.role}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 flex items-center justify-end space-x-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{pro.rating}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      {pro.shiftsCompleted} shifts
                    </span>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400">Specialty</span>
                    <span className="font-semibold text-slate-800">{pro.specialty}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400">Commute Radius</span>
                    <span className="flex items-center space-x-1 font-medium">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{pro.distanceMiles} miles from campus</span>
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400">Base Hourly Rate</span>
                    <span className="font-bold text-slate-900 font-mono">${pro.hourlyRate}/hr</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400">Reliability Rate</span>
                    <span className="font-bold text-emerald-600">{pro.reliabilityScore}%</span>
                  </div>
                </div>

                {/* Verified Credentials Pills */}
                <div className="mt-3.5 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Verified Registries ({pro.credentials.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {pro.credentials.map((cred) => (
                      <span
                        key={cred.id}
                        className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium flex items-center space-x-1"
                      >
                        <ShieldCheck className="w-2.5 h-2.5 text-blue-600" />
                        <span>{cred.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  pro.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {pro.status}
                </span>
                <span 
                  onClick={() => onOpenClinicianProfile && onOpenClinicianProfile(pro)}
                  className="text-[10px] text-blue-600 font-semibold cursor-pointer hover:underline"
                >
                  View Full Dossier
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bulk Onboarding Modal */}
      {isBulkOnboardOpen && (
        <BulkOnboardingModal
          onClose={() => setIsBulkOnboardOpen(false)}
          onBatchOnboard={(newPros) => {
            if (onBatchOnboard) {
              onBatchOnboard(newPros);
            }
            if (onAddAuditLog) {
              onAddAuditLog({
                code: 'BULK-ONBOARD',
                title: 'Bulk Clinician Cohort Enrolled',
                actor: 'Workforce Operations',
                actorRole: 'Recruiter',
                details: `Enrolled ${newPros.length} verified clinicians into active registry with primary source clearinghouse validation.`,
                severity: 'success',
                targetType: 'Professional',
                targetId: 'batch-onboard-' + newPros.length,
              });
            }
            setBatchNotice(`Successfully onboarded & verified ${newPros.length} clinicians!`);
            setTimeout(() => setBatchNotice(null), 5000);
          }}
        />
      )}
    </div>
  );
};
