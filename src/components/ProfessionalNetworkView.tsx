import React, { useState } from 'react';
import { Professional } from '../types';
import { Search, ShieldCheck, MapPin, Star, Award, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ProfessionalNetworkViewProps {
  professionals: Professional[];
  onOpenClinicianProfile?: (pro: Professional) => void;
}

export const ProfessionalNetworkView: React.FC<ProfessionalNetworkViewProps> = ({
  professionals,
  onOpenClinicianProfile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

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
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, badge, specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-56"
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
        </div>
      </div>

      {/* Clinicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((pro) => (
          <div
            key={pro.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
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
              <span className="text-[10px] text-blue-600 font-semibold cursor-pointer hover:underline">
                View Full Dossier
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
