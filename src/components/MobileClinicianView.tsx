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
  Smartphone,
  QrCode,
  WifiOff,
  ClipboardList,
  AlertTriangle,
  MessageSquare,
  Send,
  LifeBuoy,
  FileText
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

  // Advanced Mobile Capabilities: Offline, QR Beacon, Handover, Incident, Chat
  const [clockMethod, setClockMethod] = useState<'gps' | 'qr_beacon'>('gps');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [qrVerified, setQrVerified] = useState(true);
  const [activeTab, setActiveTab] = useState<'clock' | 'handover' | 'incident' | 'chat'>('clock');

  // Handover state (ISBAR format)
  const [handoverSituation, setHandoverSituation] = useState('4 Trauma admissions stable. Bay 2 pending chest tube re-evaluation.');
  const [handoverAssessment, setHandoverAssessment] = useState('All vitals within normal parameters. Patient in Bed 4 on high-flow nasal cannula.');
  const [handoverSaved, setHandoverSaved] = useState(false);

  // Incident state
  const [incidentCategory, setIncidentCategory] = useState<'medication' | 'fall' | 'equipment' | 'staffing_ratio'>('staffing_ratio');
  const [incidentNotes, setIncidentNotes] = useState('');
  const [incidentReported, setIncidentReported] = useState(false);

  // Ward Lead Chat state
  const [chatMessages, setChatMessages] = useState<{ id: string; sender: string; text: string; time: string; isClinician: boolean }[]>([
    { id: '1', sender: 'Ward Lead Maria Rossi', text: 'Welcome Sarah. ER-1 is at Level 1 acuity. You are assigned Bays 1 & 2.', time: '07:05 AM', isClinician: false },
    { id: '2', sender: 'Sarah Chen, RN', text: 'Received Maria, I have reviewed the vitals and commenced handover.', time: '07:08 AM', isClinician: true }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const isWithinGeofence = gpsDistanceMeters <= 100;

  const handleClockToggle = () => {
    if (clockMethod === 'gps' && !isWithinGeofence && !isOfflineMode) {
      alert('Geofence Violation: Clinician must be within 100 meters of hospital coordinates to register clock events.');
      return;
    }

    if (clockStatus === 'not_clocked') {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setClockStatus('clocked_in');
      setClockInTime(now);
      onAddAuditLog({
        code: isOfflineMode ? 'OFF-CLK1' : 'GEO-CLK1',
        title: isOfflineMode ? 'Offline Stored Clock-In Verified' : 'GPS Geofence Clock-In Verified',
        actor: 'Nurse Sarah Chen',
        actorRole: 'Professional',
        details: `Clocked in at St. Jude Hospital (${clockMethod === 'qr_beacon' ? 'Bluetooth BLE Beacon #ER-BCN-04' : `Calculated GPS offset: ${gpsDistanceMeters}m`}). Shift #SH-8825 activated.`,
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

  const handleSaveHandover = (e: React.FormEvent) => {
    e.preventDefault();
    setHandoverSaved(true);
    onAddAuditLog({
      code: 'HND-01',
      title: 'Clinical Handover Notes Recorded (ISBAR)',
      actor: 'Nurse Sarah Chen',
      actorRole: 'Professional',
      details: `Clinical handover submitted for Shift #SH-8825. Situation: "${handoverSituation.slice(0, 45)}...". Transferred to oncoming charge nurse.`,
      severity: 'info',
      targetType: 'Shift',
      targetId: 'shift-1',
    });
    setTimeout(() => setHandoverSaved(false), 3000);
  };

  const handleSubmitIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentNotes) return;
    setIncidentReported(true);
    onAddAuditLog({
      code: 'INC-911',
      title: `Patient Safety / Incident Flag: ${incidentCategory.toUpperCase()}`,
      actor: 'Nurse Sarah Chen',
      actorRole: 'Professional',
      details: `Safety flag raised in ER-1: "${incidentNotes}". Ward Lead and Agency Incident Coordinator notified immediately.`,
      severity: 'warning',
      targetType: 'Incident',
      targetId: 'inc-sarah-1',
    });
    setIncidentNotes('');
    setTimeout(() => setIncidentReported(false), 4000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msg = {
      id: Date.now().toString(),
      sender: 'Sarah Chen, RN',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isClinician: true
    };
    setChatMessages([...chatMessages, msg]);
    setNewMessage('');
  };

  const triggerEmergencyDistress = () => {
    onAddAuditLog({
      code: 'EMERG-SOS',
      title: 'CRITICAL: Clinician Distress / Rapid Escalation Triggered',
      actor: 'Nurse Sarah Chen',
      actorRole: 'Professional',
      details: 'Duress signal sent from Bed 2 in ER-1 Trauma. Hospital security and clinical supervisor alerted.',
      severity: 'warning',
      targetType: 'SafetySignal',
      targetId: 'sos-er1',
    });
    alert('🚨 Emergency Alert Transmitted: Hospital Security and Floor Lead Maria Rossi have been dispatched to your GPS location (ER-1 Trauma Bay).');
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
              {isOfflineMode && (
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold flex items-center space-x-1">
                  <WifiOff className="w-3 h-3" />
                  <span>Offline Stored</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Badge: <span className="font-mono font-semibold text-slate-700">RN-882</span> • Critical Care & Emergency Specialist
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={triggerEmergencyDistress}
            className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 rounded-lg text-xs font-black flex items-center space-x-1 cursor-pointer transition-all shadow-2xs"
            title="Immediate duress / rapid security escalation trigger"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>SOS Alarm</span>
          </button>
        </div>
      </div>

      {/* Clinician Module Navigation Tabs */}
      <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('clock')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            activeTab === 'clock' ? 'bg-white text-blue-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Clock & Geofence</span>
        </button>
        <button
          onClick={() => setActiveTab('handover')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            activeTab === 'handover' ? 'bg-white text-blue-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Handover Notes</span>
        </button>
        <button
          onClick={() => setActiveTab('incident')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            activeTab === 'incident' ? 'bg-white text-blue-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Safety / Incident</span>
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            activeTab === 'chat' ? 'bg-white text-blue-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Ward Chat ({chatMessages.length})</span>
        </button>
      </div>

      {/* TAB 1: CLOCK & GEOFENCE / QR BEACON */}
      {activeTab === 'clock' && (
        <div className="space-y-5">
          {/* GPS Geofence Simulator Controller */}
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Verification Engine: {clockMethod === 'gps' ? 'GPS Perimeter' : 'BLE Beacon / QR Code'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsOfflineMode(!isOfflineMode)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    isOfflineMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isOfflineMode ? 'Offline Mode ON' : 'Online Mode'}
                </button>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  isWithinGeofence ? 'bg-green-500/20 text-green-300 border border-green-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'
                }`}>
                  {isWithinGeofence ? 'Perimeter Verified' : 'Perimeter Blocked'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setClockMethod('gps')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${clockMethod === 'gps' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                GPS Geofence
              </button>
              <button
                onClick={() => setClockMethod('qr_beacon')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer flex items-center space-x-1 ${clockMethod === 'qr_beacon' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                <QrCode className="w-3 h-3" />
                <span>Ward QR / BLE Beacon</span>
              </button>

              <div className="ml-auto flex items-center space-x-1.5">
                <button
                  onClick={() => setGpsDistanceMeters(42)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer ${gpsDistanceMeters === 42 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Inside ER (42m)
                </button>
                <button
                  onClick={() => setGpsDistanceMeters(850)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer ${gpsDistanceMeters === 850 ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Outside (850m)
                </button>
              </div>
            </div>
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
                <span className="block text-[9px] text-green-600 font-semibold">
                  {clockMethod === 'qr_beacon' ? 'BLE Beacon #04' : 'GPS Verified'}
                </span>
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
                <span>{clockStatus === 'not_clocked' ? 'Clock In' : 'Clock Out'}</span>
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
      )}

      {/* TAB 2: SHIFT HANDOVER NOTES (ISBAR) */}
      {activeTab === 'handover' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                <ClipboardList className="w-4 h-4 text-blue-600" />
                <span>Clinical Acuity Handover Protocol (ISBAR)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Standardized handover documentation transferred to the incoming nursing roster.
              </p>
            </div>
            <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              ER-1 Trauma
            </span>
          </div>

          <form onSubmit={handleSaveHandover} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                Situation & Background:
              </label>
              <textarea
                rows={3}
                value={handoverSituation}
                onChange={(e) => setHandoverSituation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                Assessment & High-Risk Patient Recommendations:
              </label>
              <textarea
                rows={3}
                value={handoverAssessment}
                onChange={(e) => setHandoverAssessment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              />
            </div>

            {handoverSaved && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-bold flex items-center space-x-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Handover signed and recorded in the departmental EHR transition log!</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold uppercase tracking-wider text-xs shadow-sm cursor-pointer transition-colors"
            >
              Sign & Save Handover Record
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: SAFETY / INCIDENT REPORTING */}
      {activeTab === 'incident' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Patient Safety & Incident Escalation Flag</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Confidential whistleblowing and clinical hazard reporting channel.
              </p>
            </div>
            <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
              No Retaliation Policy
            </span>
          </div>

          <form onSubmit={handleSubmitIncident} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                Incident Category:
              </label>
              <select
                value={incidentCategory}
                onChange={(e) => setIncidentCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="staffing_ratio">Unsafe Patient-to-Staff Ratio Violation</option>
                <option value="medication">Medication Dispensing Variance / Discrepancy</option>
                <option value="fall">Patient Fall or Physical Injury</option>
                <option value="equipment">Biomedical Equipment Malfunction</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                Incident Description & Clinical Narrative:
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe what occurred, any interventions taken, and immediate patient status..."
                value={incidentNotes}
                onChange={(e) => setIncidentNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              />
            </div>

            {incidentReported && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 font-bold flex items-center space-x-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Incident logged. Escalated to Clinical Risk Management and Ward Lead Maria Rossi.</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold uppercase tracking-wider text-xs shadow-sm cursor-pointer transition-colors"
            >
              Submit Confidential Safety Flag
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: REAL-TIME WARD LEAD CHAT */}
      {activeTab === 'chat' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Ward Lead Direct Messaging Channel</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Encrypted shift coordination channel with Ward Lead Maria Rossi.
              </p>
            </div>
            <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Ward Lead Online</span>
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 h-64 overflow-y-auto space-y-3 border border-slate-200 text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isClinician ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center space-x-1 text-[10px] text-slate-400 mb-0.5">
                  <span className="font-bold">{msg.sender}</span>
                  <span>• {msg.time}</span>
                </div>
                <div
                  className={`p-2.5 rounded-lg max-w-[80%] leading-relaxed ${
                    msg.isClinician
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-2xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Type message to Ward Lead..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
