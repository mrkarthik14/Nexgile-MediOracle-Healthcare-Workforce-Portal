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
  Calendar as CalendarIcon,
  ShieldCheck,
  LayoutList,
  CalendarDays,
  AlertTriangle,
  Layers,
  Download,
  Share2,
  MessageSquare
} from 'lucide-react';

interface ShiftManagementProps {
  shifts: Shift[];
  departments: Department[];
  onOpenMatchModal: (shift: Shift) => void;
  onBroadcastOffer: (shiftId: string) => void;
  onOpenPostShift: () => void;
  onOpenBulkGenerator?: () => void;
  onOpenBroadcastModal?: () => void;
  selectedDeptFilter?: string;
  onClearDeptFilter?: () => void;
}

export const ShiftManagement: React.FC<ShiftManagementProps> = ({
  shifts,
  departments,
  onOpenMatchModal,
  onBroadcastOffer,
  onOpenPostShift,
  onOpenBulkGenerator,
  onOpenBroadcastModal,
  selectedDeptFilter,
  onClearDeptFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [selectedShiftIds, setSelectedShiftIds] = useState<string[]>([]);
  const [bulkNotice, setBulkNotice] = useState<string | null>(null);

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

  const toggleSelectShift = (id: string) => {
    if (selectedShiftIds.includes(id)) {
      setSelectedShiftIds(selectedShiftIds.filter(i => i !== id));
    } else {
      setSelectedShiftIds([...selectedShiftIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedShiftIds.length === filteredShifts.length) {
      setSelectedShiftIds([]);
    } else {
      setSelectedShiftIds(filteredShifts.map(s => s.id));
    }
  };

  const handleBulkBroadcast = () => {
    if (selectedShiftIds.length === 0) return;
    selectedShiftIds.forEach(id => onBroadcastOffer(id));
    setBulkNotice(`Broadcast offers dispatched to AI-ranked candidates for ${selectedShiftIds.length} shifts!`);
    setTimeout(() => setBulkNotice(null), 3500);
    setSelectedShiftIds([]);
  };

  const handleBulkExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["ShiftNumber,Department,Role,Date,Hours,Rate,Status"].join(",") + "\n"
      + filteredShifts.map(s => `"${s.shiftNumber}","${s.departmentName}","${s.role}","${s.date}","${s.startTime}-${s.endTime}","${s.baseRate}","${s.status}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "medioracle_shifts_roster.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      case 'disputed':
        return <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-purple-100 text-purple-700">Disputed Hours</span>;
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

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1.5 rounded-md flex items-center space-x-1 cursor-pointer transition-all ${
                viewMode === 'table' ? 'bg-white text-blue-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Roster List</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-2.5 py-1.5 rounded-md flex items-center space-x-1 cursor-pointer transition-all ${
                viewMode === 'calendar' ? 'bg-white text-blue-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Calendar & Conflicts</span>
            </button>
          </div>

          <button
            onClick={handleBulkExport}
            title="Export Roster to CSV"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {onOpenBulkGenerator && (
            <button
              onClick={onOpenBulkGenerator}
              title="Launch Bulk Recurring Shift Schedule Generator"
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Bulk Shifts</span>
            </button>
          )}

          {onOpenBroadcastModal && (
            <button
              onClick={onOpenBroadcastModal}
              title="Dispatch Broadcast Announcement to Clinical Workforce"
              className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">Broadcast</span>
            </button>
          )}

          <button
            onClick={onOpenPostShift}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer uppercase tracking-wider"
          >
            + Create Shift
          </button>
        </div>
      </div>

      {/* Bulk Action Strip */}
      {selectedShiftIds.length > 0 && (
        <div className="bg-blue-900 text-white p-3 rounded-xl shadow-md flex items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center space-x-2">
            <span className="bg-blue-800 px-2 py-0.5 rounded font-black text-blue-200">
              {selectedShiftIds.length} Selected
            </span>
            <span className="font-semibold">Shifts selected for batch operations</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBulkBroadcast}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-3 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Offers to AI Shortlist</span>
            </button>
            <button
              onClick={() => setSelectedShiftIds([])}
              className="text-blue-300 hover:text-white px-2 py-1 text-[11px] cursor-pointer"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {bulkNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{bulkNotice}</span>
        </div>
      )}

      {/* VIEW MODE 1: INTERACTIVE 7-DAY CALENDAR & WORKING TIME CONFLICT DETECTOR */}
      {viewMode === 'calendar' ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                  <span>Ward Scheduling & Working Time Directive (WTD) Calendar</span>
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  Week 36 • Sep 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated detection of 11h rest gap violations, 48h working limits, and consecutive-shift fatigue.
              </p>
            </div>

            <div className="flex items-center space-x-3 text-[11px]">
              <span className="flex items-center space-x-1 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Rest Feasible</span>
              </span>
              <span className="flex items-center space-x-1 text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Rest Gap Alert</span>
              </span>
              <span className="flex items-center space-x-1 text-red-700">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span>Critical Vacancy</span>
              </span>
            </div>
          </div>

          {/* 7-Day Grid */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {[
              { day: 'Mon', date: 'Sep 01', count: 4, hasConflict: false },
              { day: 'Tue', date: 'Sep 02', count: 3, hasConflict: false },
              { day: 'Wed', date: 'Sep 03', count: 5, hasConflict: true, conflictType: '11h Rest Gap Overlap' },
              { day: 'Thu', date: 'Sep 04', count: 3, hasConflict: false },
              { day: 'Fri', date: 'Sep 05', count: 6, hasConflict: false },
              { day: 'Sat', date: 'Sep 06', count: 4, hasConflict: true, conflictType: 'Consecutive Shift Warning (Day 6)' },
              { day: 'Sun', date: 'Sep 07', count: 2, hasConflict: false },
            ].map((d, idx) => (
              <div key={idx} className="bg-slate-50/80 rounded-xl border border-slate-200 p-3 flex flex-col min-h-[300px]">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block">{d.day}</span>
                    <span className="text-xs font-bold text-slate-800">{d.date}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-white text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                    {d.count} shifts
                  </span>
                </div>

                {d.hasConflict && (
                  <div className="mb-2 p-1.5 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-800 font-bold flex items-start space-x-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{d.conflictType}</span>
                  </div>
                )}

                {/* Shift cards inside day */}
                <div className="space-y-2 flex-1">
                  {shifts.filter((_, i) => i % 7 === idx).slice(0, 3).map((s) => (
                    <div
                      key={s.id}
                      onClick={() => onOpenMatchModal(s)}
                      className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs hover:border-blue-400 transition-all cursor-pointer text-[11px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900 text-[10px]">{s.shiftNumber}</span>
                        {getStatusBadge(s.status)}
                      </div>
                      <p className="font-bold text-slate-800 truncate mt-1">{s.role}</p>
                      <p className="text-[10px] text-slate-500 truncate">{s.departmentName}</p>
                      <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100 text-[10px]">
                        <span className="text-slate-500">{s.startTime}-{s.endTime}</span>
                        <span className="font-bold text-emerald-700">${s.baseRate}/hr</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={onOpenPostShift}
                  className="w-full mt-2 py-1 text-[10px] font-bold text-slate-500 hover:text-blue-600 hover:bg-white rounded border border-dashed border-slate-300 transition-colors cursor-pointer"
                >
                  + Add Shift
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: TABLE ROSTER LIST */
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedShiftIds.length === filteredShifts.length && filteredShifts.length > 0}
                onChange={handleSelectAll}
                className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <h3 className="font-bold text-slate-800 text-sm">
                Hospital Shift Directory ({filteredShifts.length})
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Select shifts for bulk actions or click Match to rank candidates
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
                const isSelected = selectedShiftIds.includes(shift.id);

                return (
                  <div
                    key={shift.id}
                    className={`p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isSelected ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    {/* Left: Info with Checkbox */}
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectShift(shift.id)}
                        className="mt-1 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
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
                          {shift.acuityLevel && (
                            <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-slate-100 text-slate-700">
                              {shift.acuityLevel.split(' - ')[0]}
                            </span>
                          )}
                          {shift.patientRatio && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 text-slate-600">
                              Ratio {shift.patientRatio.split(' ')[0]}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 font-medium">
                          <span className="font-bold text-slate-800">{shift.departmentName}</span> • {shift.specialty}
                        </p>

                        <div className="flex items-center space-x-4 text-xs text-slate-500 pt-0.5 flex-wrap gap-y-1">
                          <span className="flex items-center space-x-1">
                            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                            <span>{shift.date}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{shift.startTime} - {shift.endTime}</span>
                          </span>
                          {shift.unpaidBreakMinutes && (
                            <span className="text-[11px] text-slate-400">
                              ({shift.unpaidBreakMinutes}m break)
                            </span>
                          )}
                        </div>

                        {/* Pay rate info */}
                        <div className="pt-0.5">
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
      )}
    </div>
  );
};
