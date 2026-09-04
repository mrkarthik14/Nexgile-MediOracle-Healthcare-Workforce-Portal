import React, { useState } from 'react';
import { Shift, AuditLog } from '../types';
import { 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  Coffee, 
  DollarSign, 
  ShieldCheck,
  Radio,
  Smartphone
} from 'lucide-react';

interface MobileClinicianViewProps {
  shifts: Shift[];
  onAddAuditLog: (log: Partial<AuditLog>) => void;
}

export const MobileClinicianView: React.FC<MobileClinicianViewProps> = ({
  shifts,
  onAddAuditLog,
}) => {
  // GPS Simulator State
  const [gpsDistanceMeters, setGpsDistanceMeters] = useState<number>(42);
  const [clockStatus, setClockStatus] = useState<'not_clocked' | 'clocked_in' | 'on_break' | 'clocked_out'>('clocked_in');
  const [clockInTime, setClockInTime] = useState<string>('07:02 AM');
  const [clockOutTime, setClockOutTime] = useState<string | null>(null);
  const [breakMinutes, setBreakMinutes] = useState<number>(30);
  const [instantPayClaimed, setInstantPayClaimed] = useState(false);

  const isWithinGeofence = gpsDistanceMeters <= 100;

  const handleClockToggle = () => {
    if (!isWithinGeofence) {
      alert('Geofence Violation: Clinician must be within 100 meters of hospital coordinates to register clock events.');
      return;
    }

    if (clockStatus === 'not_clocked') {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setClockStatus('clocked_in');
      setClockInTime(now);
      onAddAuditLog({
        code: 'GEO-CLK1',
        title: 'GPS Geofence Clock-In Verified',
        actor: 'Nurse Sarah Chen',
        actorRole: 'Professional',
        details: `Clocked in at St. Jude Hospital Main Entrance (Calculated GPS offset: ${gpsDistanceMeters}m, accuracy: ±4.2m). Shift #SH-8825 activated.`,
        severity: 'success',
        targetType: 'Shift',
        targetId: 'shift-1',
      });
    } else if (clockStatus === 'clocked_in' || clockStatus === 'on_break') {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setClockStatus('clocked_out');
      setClockOutTime(now);
      onAddAuditLog({
        code: 'GEO-CLK2',
        title: 'GPS Geofence Clock-Out Verified',
        actor: 'Nurse Sarah Chen',
        actorRole: 'Professional',
        details: `Clocked out at St. Jude Hospital ER-1 exit bay (Distance: ${gpsDistanceMeters}m). Timesheet automatically submitted for ward manager approval.`,
        severity: 'info',
        targetType: 'Timesheet',
        targetId: 'ts-sarah-1',
      });
    }
  };

  const handleToggleBreak = () => {
    if (clockStatus === 'clocked_in') {
      setClockStatus('on_break');
      onAddAuditLog({
        code: 'BRK-01',
        title: 'Mandatory Rest Break Started',
        actor: 'Nurse Sarah Chen',
        actorRole: 'Professional',
        details: 'Nurse Sarah Chen registered mandatory 30-minute unpaid clinical rest break.',
        severity: 'info',
        targetType: 'Shift',
        targetId: 'shift-1',
      });
    } else if (clockStatus === 'on_break') {
      setClockStatus('clocked_in');
      onAddAuditLog({
        code: 'BRK-02',
        title: 'Rest Break Concluded',
        actor: 'Nurse Sarah Chen',
        actorRole: 'Professional',
        details: 'Nurse Sarah Chen resumed active clinical duty.',
        severity: 'info',
        targetType: 'Shift',
        targetId: 'shift-1',
      });
    }
  };

  const handleClaimInstantPay = () => {
    setInstantPayClaimed(true);
    onAddAuditLog({
      code: 'IP-9901',
      title: 'Instant Remittance Dispatched',
      actor: 'Nurse Sarah Chen',
      actorRole: 'Professional',
      details: 'Instant Pay transfer of $738.75 disbursed via card network push payment to account ending in 4410.',
      severity: 'success',
      targetType: 'Payment',
      targetId: 'pay-sarah',
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Clinician Profile Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-600 text-white font-bold flex items-center justify-center text-base shadow-sm">
            SC
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-900 text-base">Nurse Sarah Chen, RN</h3>
              <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold">
                Active Duty
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Badge: <span className="font-mono font-semibold text-slate-700">RN-882</span> • Critical Care & Emergency Specialist
            </p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Reliability</span>
          <p className="text-sm font-black text-slate-800">100% (48 shifts)</p>
        </div>
      </div>

      {/* Role Scoping & Privacy Guarantee (Addresses user prompt on Nurse vs Doctor data) */}
      <div className="bg-cyan-50/70 border border-cyan-200 rounded-xl p-4 flex items-start space-x-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-cyan-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-cyan-950">
            Clinician Portal Privacy Guarantee (Zero-Trust Scoped)
          </h4>
          <p className="text-cyan-900/90 leading-relaxed text-[11px]">
            You are viewing your personal clinical portal. You have access strictly to <strong>your shifts</strong>, <strong>GPS clock-ins</strong>, and <strong>instant earnings</strong>. For patient confidentiality and administrative separation, you cannot access Doctor handover charts, other clinicians' pay, or hospital administrative ledgers.
          </p>
        </div>
      </div>

      {/* GPS Geofence Simulator Controller */}
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">
              GPS Geofence Telemetry Simulator
            </span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
            isWithinGeofence ? 'bg-green-500/20 text-green-300 border border-green-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'
          }`}>
            {isWithinGeofence ? 'Within 100m Perimeter' : 'Geofence Blocked'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setGpsDistanceMeters(42)}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
              gpsDistanceMeters === 42 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Inside ER-1 (42m - Valid)
          </button>
          <button
            onClick={() => setGpsDistanceMeters(850)}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
              gpsDistanceMeters === 850 ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Outside Perimeter (850m - Reject)
          </button>
        </div>
        <p className="text-[10px] text-slate-400">
          Hospital Geofence: 37.7749° N, -122.4194° W. Required radius: &lt; 100 meters. Current: {gpsDistanceMeters}m.
        </p>
      </div>

      {/* Active Shift & Clock Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Active Assignment
            </span>
            <h4 className="text-base font-bold text-slate-900 mt-1">
              Emergency (ER-1) • Trauma Resuscitation
            </h4>
            <p className="text-xs text-slate-500">
              Shift #SH-8825 • Scheduled: 07:00 - 19:30 • Base: $58.00/hr + $15.00/hr Surge
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 font-semibold uppercase">Rate</span>
            <p className="text-xl font-black text-emerald-600 font-mono">$73.00<span className="text-xs text-slate-400 font-normal">/hr</span></p>
          </div>
        </div>

        {/* Live Status and Clock Times */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Clock-In Time</span>
            <span className="font-bold text-slate-800 font-mono">{clockInTime || '—'}</span>
            <span className="block text-[9px] text-green-600 font-semibold">GPS Verified</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Rest Break</span>
            <span className="font-bold text-slate-800 font-mono">{breakMinutes} mins</span>
            <span className="block text-[9px] text-slate-400">Unpaid statutory</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Current State</span>
            <span className={`font-bold uppercase text-[11px] ${
              clockStatus === 'clocked_in' ? 'text-green-600' :
              clockStatus === 'on_break' ? 'text-amber-600' : 'text-slate-700'
            }`}>
              {clockStatus.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleClockToggle}
            className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm ${
              clockStatus === 'not_clocked'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{clockStatus === 'not_clocked' ? 'Clock In with GPS' : 'Clock Out with GPS'}</span>
          </button>

          {clockStatus !== 'clocked_out' && clockStatus !== 'not_clocked' && (
            <button
              onClick={handleToggleBreak}
              className="px-5 py-3 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Coffee className="w-4 h-4 text-slate-500" />
              <span>{clockStatus === 'on_break' ? 'End Break' : 'Start 30m Break'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Instant Pay Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Instant Remittance Rail</h4>
              <p className="text-[11px] text-slate-500">Real-time push payment to debit card (1.5% fee)</p>
            </div>
          </div>
          <span className="text-lg font-black text-slate-900 font-mono">$738.75</span>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg text-xs flex justify-between items-center">
          <span className="text-slate-600">Available from Shift #SH-8825</span>
          <span className="text-slate-400 text-[10px]">Net of $11.25 fee</span>
        </div>

        <button
          onClick={handleClaimInstantPay}
          disabled={instantPayClaimed}
          className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            instantPayClaimed
              ? 'bg-green-100 text-green-800 cursor-default'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
          }`}
        >
          {instantPayClaimed ? '✓ Remittance Dispatched to Card (*4410)' : 'Claim Instant Pay ($738.75)'}
        </button>
      </div>
    </div>
  );
};
