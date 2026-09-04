import React, { useState } from 'react';
import { Shift, Department } from '../types';
import { 
  Search, 
  Filter, 
  Clock, 
  DollarSign, 
  Radio, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Send,
  Calendar,
  ShieldCheck
} from 'lucide-react';

interface ShiftManagementProps {
  shifts: Shift[];
  departments: Department[];
  onOpenMatchModal: (shift: Shift) => void;
  onBroadcastOffer: (shiftId: string) => void;
  onOpenPostShift: () => void;
  selectedDeptFilter?: string;
  onClearDeptFilter?: () => void;
}

export const ShiftManagement: React.FC<ShiftManagementProps> = ({
  shifts,
  departments,
  onOpenMatchModal,
  onBroadcastOffer,
  onOpenPostShift,
  selectedDeptFilter,
  onClearDeptFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');

  const filteredShifts = shifts.filter((s) => {
    if (selectedDeptFilter && s.departmentId !== selectedDeptFilter) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (urgencyFilter !== 'all' && s.urgency !== urgencyFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        s.role.toLowerCase().includes(q) ||
        s.departmentName.toLowerCase().includes(q) ||
        s.shiftNumber.toLowerCase().includes(q) ||
        s.specialty.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: Shift['status']) => {
    switch (status) {
      case 'open':
        return <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-red-100 text-red-700">Open Vacancy</span>;
      case 'matching':
        return <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-blue-100 text-blue-700">Matching</span>;
      case 'offered':
        return <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-amber-100 text-amber-700">Offer Dispatched</span>;
      case 'confirmed':
        return <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-green-100 text-green-800">Confirmed</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-emerald-600 text-white animate-pulse">In Progress</span>;
      case 'completed':
        return <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-slate-100 text-slate-600">Completed</span>;
      default:
        return <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Bar: Search & Filter Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 flex items-center space-x-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search shifts by number, role, ward, specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {selectedDeptFilter && (
            <div className="flex items-center space-x-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1.5 rounded-lg">
              <span>Filtered by Ward</span>
              <button
                onClick={onClearDeptFilter}
                className="ml-1 font-bold text-blue-900 hover:text-red-600 cursor-pointer"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open Vacancies</option>
            <option value="matching">Matching</option>
            <option value="offered">Offer Dispatched</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {/* Urgency Filter */}
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Urgencies</option>
            <option value="critical">Critical Risk</option>
            <option value="high">High Urgency</option>
            <option value="normal">Standard Rotation</option>
          </select>

          <button
            onClick={onOpenPostShift}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer uppercase tracking-wider"
          >
            + Create Shift
          </button>
        </div>
      </div>

      {/* Shifts List / Cards matching Geometric Balance Design Theme */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">
            Hospital Shift Directory ({filteredShifts.length})
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">
            Showing verified hospital shifts
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredShifts.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No shifts found matching the selected criteria.
            </div>
          ) : (
            filteredShifts.map((shift) => {
              const isCritical = shift.urgency === 'critical';
              return (
                <div
                  key={shift.id}
                  className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-2.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {shift.shiftNumber}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{shift.role}</h4>
                      {getStatusBadge(shift.status)}
                      {isCritical && (
                        <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-red-500 text-white">
                          Critical Risk
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 font-medium">
                      <span className="font-bold text-slate-800">{shift.departmentName}</span> • {shift.specialty}
                    </p>

                    <div className="flex items-center space-x-4 text-xs text-slate-500 pt-0.5 flex-wrap gap-y-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{shift.date}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{shift.startTime} - {shift.endTime}</span>
                      </span>
                      <span className="flex items-center space-x-1 font-semibold text-slate-800">
                        <span>Base: ${shift.baseRate.toFixed(2)}/hr</span>
                        {shift.incentiveBonus ? (
                          <span className="text-emerald-600 font-bold ml-1">
                            (+${shift.incentiveBonus}/hr surge)
                          </span>
                        ) : null}
                      </span>
                    </div>

                    {/* Assigned professional or qualifications */}
                    <div className="flex items-center space-x-2 pt-1">
                      {shift.assignedProfessional ? (
                        <div className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md flex items-center space-x-2">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Assigned: <strong>{shift.assignedProfessional.name}</strong> ({shift.assignedProfessional.badgeNumber})</span>
                          <span className="text-emerald-600 text-[10px]">• {shift.assignedProfessional.status}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Required:</span>
                          {shift.requiredQualifications.map((q) => (
                            <span key={q} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                              {q}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center space-x-2.5 flex-shrink-0 self-start md:self-center">
                    {shift.status === 'open' || shift.status === 'matching' ? (
                      <>
                        <button
                          onClick={() => onOpenMatchModal(shift)}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 shadow-sm uppercase tracking-wider"
                        >
                          <Radio className="w-3.5 h-3.5" />
                          <span>Match Candidates</span>
                        </button>
                        <button
                          onClick={() => onBroadcastOffer(shift.id)}
                          className="px-3 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1"
                          title="Broadcast First-Accept-Wins offer to Tier 1 pool"
                        >
                          <Send className="w-3 h-3 text-slate-500" />
                          <span>Broadcast</span>
                        </button>
                      </>
                    ) : shift.status === 'offered' ? (
                      <button
                        onClick={() => onOpenMatchModal(shift)}
                        className="px-3.5 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md text-xs font-bold transition-colors cursor-pointer"
                      >
                        Review Offers
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold px-3 py-1.5 bg-slate-50 rounded-md">
                        Staffed & Locked
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
