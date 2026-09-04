import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Coffee, 
  Radio, 
  Wifi, 
  Smartphone, 
  UserCheck, 
  Edit3, 
  Filter, 
  RotateCw, 
  FileText, 
  Check, 
  X,
  AlertCircle,
  Timer,
  Zap,
  TrendingUp,
  Download
} from 'lucide-react';
import { TimecardPunch, AuditLog } from '../types';
import { INITIAL_TIMECARDS } from '../data/mockData';

interface TimekeepingViewProps {
  onAddAuditLog?: (log: Partial<AuditLog>) => void;
  onSyncToTimesheets?: () => void;
}

export const TimekeepingView: React.FC<TimekeepingViewProps> = ({
  onAddAuditLog,
  onSyncToTimesheets
}) => {
  const [timecards, setTimecards] = useState<TimecardPunch[]>(INITIAL_TIMECARDS);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'roster' | 'geofence_telemetry' | 'fatigue_breaks'>('roster');

  // Adjustment Modal State
  const [selectedCardForAdjustment, setSelectedCardForAdjustment] = useState<TimecardPunch | null>(null);
  const [adjustClockIn, setAdjustClockIn] = useState<string>('');
  const [adjustClockOut, setAdjustClockOut] = useState<string>('');
  const [adjustReasonCode, setAdjustReasonCode] = useState<string>('EXCEPTION_RESUS_OVERTIME');
  const [adjustSupervisorNote, setAdjustSupervisorNote] = useState<string>('');

  // Quick punch simulation state
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [simClinicianName, setSimClinicianName] = useState('Nurse Sarah Chen');
  const [simDepartment, setSimDepartment] = useState('Intensive Care (ICU)');
  const [simAction, setSimAction] = useState<'clock_in' | 'clock_out' | 'start_break' | 'end_break'>('clock_out');

  // Banner feedback notices
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 4000);
  };

  // Metrics
  const onDutyCount = timecards.filter(t => t.status === 'on_duty').length;
  const onBreakCount = timecards.filter(t => t.status === 'on_break').length;
  const flaggedCount = timecards.filter(t => t.status === 'flagged' || !t.geofenceVerified).length;
  const fatigueAlertCount = timecards.filter(t => t.hasFatigueWarning).length;
  const totalOvertimeHours = timecards.reduce((sum, t) => sum + (t.overtimeHours || 0), 0);

  // Filtered Roster
  const filteredTimecards = timecards.filter(tc => {
    const matchesDept = selectedDepartment === 'all' || tc.departmentId === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || tc.status === selectedStatus;
    const matchesSearch = searchQuery === '' || 
      tc.clinicianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tc.shiftNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tc.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesStatus && matchesSearch;
  });

  // Approve punch
  const handleApprovePunch = (cardId: string) => {
    const card = timecards.find(t => t.id === cardId);
    if (!card) return;

    setTimecards(prev => prev.map(t => {
      if (t.id === cardId) {
        return {
          ...t,
          supervisorApprovalStatus: 'approved',
          supervisorApprovedBy: 'John Sterling (Admin)',
          supervisorApprovedAt: 'Just now'
        };
      }
      return t;
    }));

    if (onAddAuditLog) {
      onAddAuditLog({
        code: 'TIMECARD-APPRV',
        title: 'Supervisor Approved Timecard Punch',
        actor: 'John Sterling',
        actorRole: 'Facility Admin',
        details: `Approved shift punch for ${card.clinicianName} on ${card.shiftNumber} (${card.departmentName}). Total: ${card.elapsedHoursFormatted}.`,
        severity: 'success',
        targetType: 'TimecardPunch',
        targetId: cardId,
      });
    }

    showToast(`Punch approved for ${card.clinicianName} (${card.shiftNumber}). Stamped in immutable audit log.`);
  };

  // Open adjustment modal
  const handleOpenAdjustmentModal = (card: TimecardPunch) => {
    setSelectedCardForAdjustment(card);
    setAdjustClockIn(card.actualClockIn || '07:00');
    setAdjustClockOut(card.actualClockOut || '19:30');
    setAdjustReasonCode('EXCEPTION_RESUS_OVERTIME');
    setAdjustSupervisorNote('');
  };

  // Save adjustment
  const handleSaveAdjustment = () => {
    if (!selectedCardForAdjustment) return;

    const reasonLabels: Record<string, string> = {
      EXCEPTION_RESUS_OVERTIME: 'Code Blue / Emergency Trauma Resuscitation Handover',
      EXCEPTION_GEOFENCE_CORRECTION: 'Decontamination Bay GPS Drift / Basement Ward Attenuation',
      EXCEPTION_MISSED_PUNCH: 'Device Battery Depleted - Ward Sister In-Person Attestation',
      EXCEPTION_MEAL_RELIEF_OVERRIDE: 'Continuous High-Acuity Patient Monitoring Without Break Relief'
    };

    const fullReason = `${reasonLabels[adjustReasonCode] || adjustReasonCode}: ${adjustSupervisorNote}`;

    setTimecards(prev => prev.map(t => {
      if (t.id === selectedCardForAdjustment.id) {
        return {
          ...t,
          actualClockIn: adjustClockIn,
          actualClockOut: adjustClockOut,
          supervisorApprovalStatus: 'adjusted',
          supervisorApprovedBy: 'John Sterling (Admin)',
          supervisorApprovedAt: 'Just now',
          adjustmentReason: fullReason,
          disputeFlag: false,
          status: 'completed'
        };
      }
      return t;
    }));

    if (onAddAuditLog) {
      onAddAuditLog({
        code: 'TIMECARD-ADJUST',
        title: 'Supervisor Adjusted Punch & Resolved Exception',
        actor: 'John Sterling',
        actorRole: 'Facility Admin',
        details: `Adjusted punch for ${selectedCardForAdjustment.clinicianName} on ${selectedCardForAdjustment.shiftNumber}. In: ${adjustClockIn}, Out: ${adjustClockOut}. Reason: ${fullReason}`,
        severity: 'warning',
        targetType: 'TimecardPunch',
        targetId: selectedCardForAdjustment.id,
      });
    }

    showToast(`Punch adjustment saved for ${selectedCardForAdjustment.clinicianName}. Audit record logged.`);
    setSelectedCardForAdjustment(null);
  };

  // Batch approve all pending verified punches
  const handleBatchApproveVerified = () => {
    const pendingCount = timecards.filter(t => t.supervisorApprovalStatus === 'pending' && t.geofenceVerified).length;
    if (pendingCount === 0) {
      showToast('No pending verified punches found to approve.');
      return;
    }

    setTimecards(prev => prev.map(t => {
      if (t.supervisorApprovalStatus === 'pending' && t.geofenceVerified) {
        return {
          ...t,
          supervisorApprovalStatus: 'approved',
          supervisorApprovedBy: 'John Sterling (Admin)',
          supervisorApprovedAt: 'Just now'
        };
      }
      return t;
    }));

    if (onAddAuditLog) {
      onAddAuditLog({
        code: 'BATCH-PUNCH-APPRV',
        title: 'Batch Punch Verification Executed',
        actor: 'John Sterling',
        actorRole: 'Facility Admin',
        details: `Batch approved ${pendingCount} pending verified timecard punches meeting <100m geofence criteria.`,
        severity: 'success',
        targetType: 'TimecardBatch',
        targetId: 'batch-' + Date.now(),
      });
    }

    showToast(`Batch approved ${pendingCount} verified timecard punches.`);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
              <Clock className="w-3 h-3 text-emerald-600" />
              <span>Real-Time Clinical Workforce Telemetry</span>
            </span>
            <span className="text-xs text-slate-500 font-bold">
              GPS Geofencing • BLE Beacons • Break Relief
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Timekeeping & Attendance Control
          </h2>
          <p className="text-xs text-slate-500">
            Monitor on-duty floor staffing, verify &lt;100m geofence coordinates, track meal break coverage, and audit punch exceptions.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap gap-2">
          <button
            onClick={handleBatchApproveVerified}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Batch Approve Verified</span>
          </button>

          <button
            onClick={() => {
              if (onSyncToTimesheets) {
                onSyncToTimesheets();
              }
              if (onAddAuditLog) {
                onAddAuditLog({
                  code: 'PAYROLL-SYNC',
                  title: 'Timekeeping Synced to Payroll Timesheets',
                  actor: 'John Sterling',
                  actorRole: 'Facility Admin',
                  details: 'Synchronized 6 verified clinical punch cards into locked timesheets for instant pay rails.',
                  severity: 'info',
                  targetType: 'PayrollFeed',
                  targetId: 'sync-' + Date.now(),
                });
              }
              showToast('Timecard hours successfully synchronized to Payroll Timesheets & Invoicing.');
            }}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sync to Timesheets</span>
          </button>

          <button
            onClick={() => setIsSimulateModalOpen(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Punch Event</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback Notification */}
      {toastNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Real-Time Telemetry Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Active On-Duty</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{onDutyCount} Clinicians</div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Currently on ward floor</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">On Meal Break</span>
            <Coffee className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{onBreakCount} Active</div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Relief coverage assigned</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">GPS Geofence Match</span>
            <MapPin className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1">98.4%</div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">&lt; 100m ward perimeter</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Fatigue & WTD Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">{fatigueAlertCount} Alert</div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">&lt; 11h mandatory rest gap</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Overtime Incurred</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-700 mt-1">{totalOvertimeHours}h</div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Approved handover surge</p>
        </div>
      </div>

      {/* Tabs for Timekeeping Views */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'roster'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Live Floor Punch Roster</span>
        </button>

        <button
          onClick={() => setActiveTab('geofence_telemetry')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'geofence_telemetry'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>GPS & BLE Ward Beacon Telemetry</span>
        </button>

        <button
          onClick={() => setActiveTab('fatigue_breaks')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'fatigue_breaks'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>Meal Breaks & Fatigue Governance (WTD)</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'roster' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden space-y-4 p-5">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search clinician, shift #, or role..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={selectedDepartment}
                onChange={e => setSelectedDepartment(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-semibold"
              >
                <option value="all">All Hospital Wards</option>
                <option value="dept-er1">Emergency (ER-1)</option>
                <option value="dept-icu">Intensive Care (ICU)</option>
                <option value="dept-peds">Pediatrics</option>
                <option value="dept-medsurg">General Medicine</option>
                <option value="dept-oncol">Oncology Unit</option>
              </select>

              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-semibold"
              >
                <option value="all">All Punch Statuses</option>
                <option value="on_duty">Clocked In (On Duty)</option>
                <option value="on_break">On Meal Break</option>
                <option value="completed">Shift Completed</option>
                <option value="late">Late Arrival</option>
                <option value="flagged">GPS Variance Flagged</option>
              </select>
            </div>
          </div>

          {/* Timecards List */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {filteredTimecards.map((card) => {
              const isOnDuty = card.status === 'on_duty';
              const isOnBreak = card.status === 'on_break';
              const isFlagged = card.status === 'flagged';
              const isLate = card.status === 'late';

              return (
                <div 
                  key={card.id}
                  className={`p-4 transition-colors ${
                    isFlagged ? 'bg-rose-50/40 hover:bg-rose-50/70' :
                    isOnBreak ? 'bg-amber-50/30 hover:bg-amber-50/60' :
                    'bg-white hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Left: Clinician info and punch status */}
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs ${
                        isOnDuty ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        isOnBreak ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        isFlagged ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {card.clinicianAvatar}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-slate-900 text-sm">{card.clinicianName}</h4>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded font-semibold">
                            {card.shiftNumber}
                          </span>
                          
                          {/* Punch Status Badge */}
                          {isOnDuty && (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                              <span>On Duty ({card.elapsedHoursFormatted})</span>
                            </span>
                          )}
                          {isOnBreak && (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                              <Coffee className="w-3 h-3 text-amber-600" />
                              <span>On Break ({card.breakMinutesTaken}m)</span>
                            </span>
                          )}
                          {isFlagged && (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-300">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              <span>GPS Variance Flagged</span>
                            </span>
                          )}
                          {card.status === 'completed' && (
                            <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                              Shift Completed ({card.elapsedHoursFormatted})
                            </span>
                          )}
                          {isLate && (
                            <span className="text-[10px] font-bold uppercase bg-orange-100 text-orange-800 px-2 py-0.5 rounded border border-orange-300">
                              Late Arrival
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 mt-0.5">
                          {card.role} • <span className="font-semibold text-slate-700">{card.departmentName}</span> • ${card.hourlyRate}/hr
                        </p>

                        {/* Location proofs line */}
                        <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-500">
                          <span className="flex items-center space-x-1 font-mono">
                            <MapPin className={`w-3 h-3 ${card.geofenceVerified ? 'text-emerald-600' : 'text-rose-600'}`} />
                            <span className={card.geofenceVerified ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                              {card.distanceMeters}m from ward ({card.geofenceVerified ? '<100m PASS' : 'GEOFENCE BREACH'})
                            </span>
                          </span>

                          {card.beaconVerified && (
                            <span className="flex items-center space-x-1 font-mono text-blue-700">
                              <Radio className="w-3 h-3 text-blue-500" />
                              <span>{card.beaconId}</span>
                            </span>
                          )}

                          {card.wifiBssid && (
                            <span className="hidden sm:flex items-center space-x-1 font-mono text-slate-600">
                              <Wifi className="w-3 h-3 text-slate-400" />
                              <span>{card.wifiBssid}</span>
                            </span>
                          )}
                        </div>

                        {/* Note / Exception Reason */}
                        {card.adjustmentReason && (
                          <div className="mt-2 p-2 bg-slate-100 border border-slate-200 rounded text-[11px] text-slate-700 font-medium">
                            <span className="font-bold text-slate-900">Adjustment / Exception Audit:</span> {card.adjustmentReason}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Middle: Shift Times & Elapsed Bar */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-2 text-xs">
                      <div className="text-left lg:text-right">
                        <div className="font-bold text-slate-700">
                          Sched: {card.scheduledStart} - {card.scheduledEnd}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Clock In: <span className="font-mono font-bold text-slate-900">{card.actualClockIn || 'Pending'}</span>
                          {card.actualClockOut && (
                            <> • Clock Out: <span className="font-mono font-bold text-slate-900">{card.actualClockOut}</span></>
                          )}
                        </div>
                      </div>

                      {/* Approval Status & Action Buttons */}
                      <div className="flex items-center space-x-2 mt-1">
                        {card.supervisorApprovalStatus === 'approved' ? (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Approved by {card.supervisorApprovedBy?.split(' ')[0]}</span>
                          </span>
                        ) : card.supervisorApprovalStatus === 'adjusted' ? (
                          <span className="text-[10px] font-bold text-purple-800 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded flex items-center space-x-1">
                            <Edit3 className="w-3 h-3 text-purple-600" />
                            <span>Adjusted & Signed</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApprovePunch(card.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold cursor-pointer transition-colors shadow-2xs flex items-center space-x-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve Punch</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenAdjustmentModal(card)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-bold cursor-pointer transition-colors flex items-center space-x-1"
                          title="Adjust punch hours or resolve exception"
                        >
                          <Edit3 className="w-3 h-3 text-slate-500" />
                          <span>Adjust</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Geofence & BLE Telemetry Map / Matrix View */}
      {activeTab === 'geofence_telemetry' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Hospital Geofencing Perimeter & Hardware Beacon Sensor Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time radius verification ensuring zero ghost hours and strict physical ward attendance.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                Centroid: Lat 37.7749, Lng -122.4194 (St. Jude Medical)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between font-bold text-slate-800 text-xs mb-2">
                  <span className="flex items-center space-x-1.5">
                    <Radio className="w-4 h-4 text-blue-600" />
                    <span>Emergency (ER-1) Zone</span>
                  </span>
                  <span className="text-emerald-600">Online (Active)</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">Perimeter: 75-meter polygon ring • Beacon: BEACON-ER-02</p>
                <div className="text-xs font-semibold text-slate-700">
                  Clinicians Inside Zone: <span className="font-bold text-blue-700">2 RNs, 1 HCA</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between font-bold text-slate-800 text-xs mb-2">
                  <span className="flex items-center space-x-1.5">
                    <Radio className="w-4 h-4 text-purple-600" />
                    <span>ICU & Critical Care Floor</span>
                  </span>
                  <span className="text-emerald-600">Online (Active)</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">Perimeter: 50-meter cleanroom zone • Beacon: BEACON-ICU-04</p>
                <div className="text-xs font-semibold text-slate-700">
                  Clinicians Inside Zone: <span className="font-bold text-purple-700">Nurse Sarah Chen (28m)</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between font-bold text-slate-800 text-xs mb-2">
                  <span className="flex items-center space-x-1.5">
                    <Radio className="w-4 h-4 text-emerald-600" />
                    <span>Pediatrics Ward</span>
                  </span>
                  <span className="text-emerald-600">Online (Active)</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">Perimeter: 80-meter family wing • Beacon: BEACON-PEDS-01</p>
                <div className="text-xs font-semibold text-slate-700">
                  Clinicians Inside Zone: <span className="font-bold text-emerald-700">Marcus Brody, HCA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fatigue & Meal Breaks Tab */}
      {activeTab === 'fatigue_breaks' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Working Time Directive (WTD) & Meal Break Relief Governance
                </h3>
                <p className="text-xs text-slate-500">
                  Mandatory 11-hour rest intervals between shifts and designated relief staff during 30-min unpaid meal breaks.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {timecards.map(t => (
                <div key={t.id} className="py-3 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="font-bold text-slate-900">{t.clinicianName}</span>
                    <span className="text-slate-400 text-[11px] ml-2 font-mono">({t.shiftNumber})</span>
                    <p className="text-[11px] text-slate-500">
                      Break Relief Nurse: <span className="font-semibold text-slate-700">{t.breakReliefNurse || 'Self-Relief / Co-Nurse'}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-slate-600">
                      Rest Gap: <span className={t.restGapHoursSinceLastShift < 11 ? 'text-rose-600 font-black' : 'text-emerald-600 font-bold'}>
                        {t.restGapHoursSinceLastShift}h
                      </span>
                    </span>

                    {t.hasFatigueWarning ? (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded font-bold text-[10px]">
                        ⚠️ Rest Gap Violation (&lt;11h)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-bold text-[10px]">
                        ✓ WTD Compliant
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Adjustment Modal */}
      {selectedCardForAdjustment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Adjust Punch & Resolve Exception</h3>
                <p className="text-xs text-slate-500">
                  Supervisor edit for {selectedCardForAdjustment.clinicianName} ({selectedCardForAdjustment.shiftNumber})
                </p>
              </div>
              <button 
                onClick={() => setSelectedCardForAdjustment(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Clock In Time:</label>
                  <input
                    type="time"
                    value={adjustClockIn}
                    onChange={e => setAdjustClockIn(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Clock Out Time:</label>
                  <input
                    type="time"
                    value={adjustClockOut}
                    onChange={e => setAdjustClockOut(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Exception Reason Code:</label>
                <select
                  value={adjustReasonCode}
                  onChange={e => setAdjustReasonCode(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-semibold text-slate-800"
                >
                  <option value="EXCEPTION_RESUS_OVERTIME">Code Blue / Emergency Trauma Resuscitation Handover</option>
                  <option value="EXCEPTION_GEOFENCE_CORRECTION">Decontamination Bay GPS Drift / Basement Ward Attenuation</option>
                  <option value="EXCEPTION_MISSED_PUNCH">Device Battery Depleted - Ward Sister In-Person Attestation</option>
                  <option value="EXCEPTION_MEAL_RELIEF_OVERRIDE">Continuous High-Acuity Patient Monitoring Without Break</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Supervisor Digital Notes & Rationale:</label>
                <textarea
                  rows={3}
                  value={adjustSupervisorNote}
                  onChange={e => setAdjustSupervisorNote(e.target.value)}
                  placeholder="Enter detailed clinical rationale (e.g. Attending physician signed handover form at 08:15)..."
                  className="w-full border border-slate-200 rounded-lg p-2 font-medium"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 font-medium">
                <span className="font-bold">Permanent Audit Trail:</span> This modification will be stamped with your supervisor identity (John Sterling) and permanently recorded in the SHA-256 chained audit ledger.
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedCardForAdjustment(null)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAdjustment}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Adjustment & Sign</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulate Punch Event Modal */}
      {isSimulateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Simulate Punch Event</h3>
                <p className="text-xs text-slate-500">Test live geofenced punch-in or clock-out</p>
              </div>
              <button 
                onClick={() => setIsSimulateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Clinician:</label>
                <select
                  value={simClinicianName}
                  onChange={e => setSimClinicianName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 font-semibold bg-white"
                >
                  <option value="Nurse Sarah Chen">Nurse Sarah Chen (ICU - RN-882)</option>
                  <option value="Elena Rostova">Elena Rostova (ER-1 - RN-401)</option>
                  <option value="Marcus Brody">Marcus Brody (Pediatrics - HCA-309)</option>
                  <option value="David Kim">David Kim (Med-Surg - RN-512)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Punch Event Type:</label>
                <select
                  value={simAction}
                  onChange={e => setSimAction(e.target.value as any)}
                  className="w-full border border-slate-200 rounded-lg p-2 font-semibold bg-white"
                >
                  <option value="clock_in">Clock In (Shift Start)</option>
                  <option value="start_break">Start Meal Break (30m)</option>
                  <option value="end_break">End Meal Break (Resume Duty)</option>
                  <option value="clock_out">Clock Out (Shift End)</option>
                </select>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900 font-medium">
                GPS Simulator: Coordinates checked against hospital geofence (&lt;32 meters from Ward Entrance). Beacon BEACON-ICU-04 verified.
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsSimulateModalOpen(false)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsSimulateModalOpen(false);
                  if (onAddAuditLog) {
                    onAddAuditLog({
                      code: 'PUNCH-SIM',
                      title: `Punch Recorded: ${simAction.toUpperCase()}`,
                      actor: simClinicianName,
                      actorRole: 'Clinician',
                      details: `Simulated ${simAction} for ${simClinicianName} at ${simDepartment}. GPS Geofence: 24m (Verified PASS).`,
                      severity: 'success',
                      targetType: 'TimecardPunch',
                      targetId: 'punch-' + Date.now(),
                    });
                  }
                  showToast(`Punch event '${simAction}' successfully logged for ${simClinicianName}.`);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simulate Event</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
