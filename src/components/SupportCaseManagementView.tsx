import React, { useState } from 'react';
import { 
  Headphones, 
  AlertTriangle, 
  MessageSquare, 
  Radio, 
  CheckCircle2, 
  Clock, 
  Send, 
  Search, 
  Filter, 
  ShieldAlert, 
  User, 
  Building2, 
  PhoneCall, 
  BookOpen,
  ArrowUpRight,
  ExternalLink,
  LifeBuoy
} from 'lucide-react';
import { AuditLog } from '../types';

interface SupportCase {
  id: string;
  ticketNumber: string;
  subject: string;
  category: 'shift_dispute' | 'gps_clock_anomaly' | 'credential_appeal' | 'payroll_inquiry' | 'urgent_shortage';
  priority: 'urgent' | 'high' | 'normal';
  facilityName: string;
  professionalName: string;
  status: 'open' | 'investigating' | 'resolved';
  slaMinutesRemaining: number;
  reportedAt: string;
  assignedTo: string;
  latestMessage: string;
  notes: string[];
}

interface CentralBroadcast {
  id: string;
  targetPool: string;
  headline: string;
  urgency: 'critical' | 'priority' | 'info';
  dispatchedAt: string;
  recipientsCount: number;
  acknowledgedCount: number;
}

interface SupportCaseManagementViewProps {
  onAddAuditLog?: (log: Partial<AuditLog>) => void;
}

export const SupportCaseManagementView: React.FC<SupportCaseManagementViewProps> = ({
  onAddAuditLog,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'cases' | 'broadcast' | 'knowledge'>('cases');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCase, setSelectedCase] = useState<SupportCase | null>(null);
  const [replyText, setReplyText] = useState('');

  // Central Broadcast Composer State
  const [broadcastTarget, setBroadcastTarget] = useState('All Critical Care RNs (ER/ICU)');
  const [broadcastHeadline, setBroadcastHeadline] = useState('');
  const [broadcastUrgency, setBroadcastUrgency] = useState<'critical' | 'priority' | 'info'>('critical');
  const [broadcastSuccessNotice, setBroadcastSuccessNotice] = useState(false);

  // Mock Active Support Cases
  const [cases, setCases] = useState<SupportCase[]>([
    {
      id: 'case-01',
      ticketNumber: 'ESC-4401',
      subject: 'GPS Geofence Clock-In Anomaly (Hospital Ward East Basement)',
      category: 'gps_clock_anomaly',
      priority: 'urgent',
      facilityName: 'St. Jude Hospital (ICU Ward)',
      professionalName: 'Nurse Sarah Chen, RN',
      status: 'investigating',
      slaMinutesRemaining: 12,
      reportedAt: '18 mins ago',
      assignedTo: 'Chloe Davis (Support Helpdesk)',
      latestMessage: 'Clinician reported cellular shadow in basement radiology tunnel. GPS radius reported 118m vs 100m threshold.',
      notes: [
        'Checked facility Wi-Fi triangulation logs: IP matches St. Jude clinical network.',
        'Manager manual override permitted under Protocol 4.2.'
      ]
    },
    {
      id: 'case-02',
      ticketNumber: 'ESC-4399',
      subject: 'Timesheet Overtime Variance (Shift #SH-8825)',
      category: 'shift_dispute',
      priority: 'high',
      facilityName: 'Mercy General (ER-1)',
      professionalName: 'Nurse Marcus Vance, RN',
      status: 'open',
      slaMinutesRemaining: 44,
      reportedAt: '1 hour ago',
      assignedTo: 'Marcus Sterling (Payroll Remittance)',
      latestMessage: 'Timesheet submitted 13.5 hours; approved schedule was 12.0 hours due to trauma surgery turnover.',
      notes: [
        'Ward Charge Nurse Dr. Sterling confirmed handover extension.',
        'Awaiting updated digital manager sign-off.'
      ]
    },
    {
      id: 'case-03',
      ticketNumber: 'ESC-4395',
      subject: 'NMBI Pin Renewal OCR Verification Appeal',
      category: 'credential_appeal',
      priority: 'normal',
      facilityName: 'Platform Central',
      professionalName: 'Nurse Elena Rostova, RN',
      status: 'investigating',
      slaMinutesRemaining: 180,
      reportedAt: '3 hours ago',
      assignedTo: 'Patricia Ramos (Compliance Auditor)',
      latestMessage: 'Uploaded PDF certificate has watermark variance; primary source API verification in progress.',
      notes: [
        'Primary source NMBI online register query dispatched.',
        'Conditional green badge issued with 48h provisional expiry.'
      ]
    },
  ]);

  // Broadcast History
  const [broadcasts, setBroadcasts] = useState<CentralBroadcast[]>([
    {
      id: 'bc-1',
      targetPool: 'All ICU & Trauma Certified Nurses (Dublin / Leinster Region)',
      headline: 'Urgent Surge: 4 Night Shifts Open in St. Jude ICU ($75/hr + $20/hr Surge Bonus)',
      urgency: 'critical',
      dispatchedAt: '45 mins ago',
      recipientsCount: 42,
      acknowledgedCount: 29
    },
    {
      id: 'bc-2',
      targetPool: 'HSE Midwifery Specialists',
      headline: 'Notice: NMBI 2026 Annual Retention Certificates Due for Upload Before Sep 15',
      urgency: 'info',
      dispatchedAt: 'Yesterday, 14:00',
      recipientsCount: 118,
      acknowledgedCount: 94
    }
  ]);

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastHeadline.trim()) return;

    const newBc: CentralBroadcast = {
      id: 'bc-' + Date.now(),
      targetPool: broadcastTarget,
      headline: broadcastHeadline,
      urgency: broadcastUrgency,
      dispatchedAt: 'Just now',
      recipientsCount: 54,
      acknowledgedCount: 1
    };

    setBroadcasts([newBc, ...broadcasts]);
    setBroadcastHeadline('');
    setBroadcastSuccessNotice(true);
    setTimeout(() => setBroadcastSuccessNotice(false), 3000);

    if (onAddAuditLog) {
      onAddAuditLog({
        code: 'BC-CAST',
        title: 'Emergency Shift Broadcast Dispatched',
        actor: 'Support & Ops Team',
        actorRole: 'Operations Specialist',
        details: `Dispatched multi-channel broadcast to ${broadcastTarget}: "${newBc.headline}"`,
        severity: 'warning',
        targetType: 'Broadcast',
        targetId: newBc.id
      });
    }
  };

  const handleResolveCase = (caseId: string) => {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, status: 'resolved' as const } : c));
    if (selectedCase && selectedCase.id === caseId) {
      setSelectedCase(prev => prev ? { ...prev, status: 'resolved' } : null);
    }
    if (onAddAuditLog) {
      onAddAuditLog({
        code: 'CASE-RES',
        title: 'Support Incident Resolved',
        actor: 'Support Specialist (Chloe Davis)',
        actorRole: 'Support Helpdesk',
        details: `Support ticket ${caseId} resolved with verified resolution notes.`,
        severity: 'success',
        targetType: 'SupportTicket',
        targetId: caseId
      });
    }
  };

  const handleAddReply = () => {
    if (!replyText.trim() || !selectedCase) return;
    const updatedNotes = [...selectedCase.notes, `Agent Note (${new Date().toLocaleTimeString()}): ${replyText}`];
    const updatedCase = { ...selectedCase, notes: updatedNotes, latestMessage: replyText };
    setCases(prev => prev.map(c => c.id === selectedCase.id ? updatedCase : c));
    setSelectedCase(updatedCase);
    setReplyText('');
  };

  const filteredCases = cases.filter(c => {
    if (filterPriority !== 'all' && c.priority !== filterPriority) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        c.ticketNumber.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.facilityName.toLowerCase().includes(q) ||
        c.professionalName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-700 bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
              Agency Operations • Module 4
            </span>
            <span className="flex items-center space-x-1 text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>24/7 SLA Telemetry Active</span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center space-x-2">
            <Headphones className="w-5 h-5 text-purple-600" />
            <span>Support Case Escalation & Central Communications</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Resolve shift disputes, GPS geofence anomalies, credential appeals, and broadcast emergency fill requests.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-bold self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('cases')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeSubTab === 'cases' ? 'bg-white text-purple-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Incident Tickets ({cases.filter(c => c.status !== 'resolved').length})
          </button>
          <button
            onClick={() => setActiveSubTab('broadcast')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeSubTab === 'broadcast' ? 'bg-white text-purple-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Broadcast Alerts
          </button>
          <button
            onClick={() => setActiveSubTab('knowledge')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeSubTab === 'knowledge' ? 'bg-white text-purple-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SOP Knowledge Base
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: INCIDENT TICKETS & CASE MANAGEMENT */}
      {activeSubTab === 'cases' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Cases List (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Filter bar */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-xs">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by ticket #, clinician, facility..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-medium"
                />
              </div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-bold focus:outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent SLA</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
              </select>
            </div>

            {/* Cases Cards */}
            <div className="space-y-3">
              {filteredCases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`bg-white rounded-xl border p-4 transition-all cursor-pointer shadow-xs hover:border-purple-300 ${
                    selectedCase?.id === c.id 
                      ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/20' 
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                        {c.ticketNumber}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        c.priority === 'urgent' ? 'bg-red-100 text-red-700 border border-red-200' :
                        c.priority === 'high' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {c.priority} Priority
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        c.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                        c.status === 'investigating' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-[10px] font-bold text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>SLA: {c.slaMinutesRemaining}m left</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-2">
                    {c.subject}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                    <div className="flex items-center space-x-1 truncate">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{c.facilityName}</span>
                    </div>
                    <div className="flex items-center space-x-1 truncate">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className="truncate font-semibold">{c.professionalName}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded border border-slate-100 line-clamp-2">
                    {c.latestMessage}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Detail & Resolution Panel (5 Cols) */}
          <div className="lg:col-span-5">
            {selectedCase ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-md p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-700">
                      Ticket Dossier: {selectedCase.ticketNumber}
                    </span>
                    <h3 className="text-sm font-black text-slate-900">
                      {selectedCase.subject}
                    </h3>
                  </div>
                  {selectedCase.status !== 'resolved' ? (
                    <button
                      onClick={() => handleResolveCase(selectedCase.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black px-3 py-1.5 rounded-lg shadow-xs flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolve Case</span>
                    </button>
                  ) : (
                    <span className="text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded text-xs font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolved</span>
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Target Facility:</span>
                    <span className="font-bold text-slate-800">{selectedCase.facilityName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Clinician:</span>
                    <span className="font-bold text-slate-800">{selectedCase.professionalName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Assigned Agent:</span>
                    <span className="font-bold text-purple-700">{selectedCase.assignedTo}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Reported:</span>
                    <span className="text-slate-700">{selectedCase.reportedAt}</span>
                  </div>
                </div>

                {/* Audit & Notes Thread */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                    <span>Investigation Audit Log</span>
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedCase.notes.map((n, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
                        {n}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reply / Append Note Box */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Enter resolution notes, manager confirmation, or override reason..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleAddReply}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Append Resolution Note</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400 space-y-2">
                <Headphones className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-bold">Select an incident ticket on the left to view detailed logs and apply resolution.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BROADCAST ALERTS */}
      {activeSubTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Dispatch Composer (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
              <Radio className="w-5 h-5 text-purple-600 animate-pulse" />
              <div>
                <h3 className="text-sm font-black text-slate-900">Emergency Staffing Broadcast</h3>
                <p className="text-[11px] text-slate-500">Dispatch SMS & Push to qualified off-duty clinicians</p>
              </div>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Clinician Cohort</label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-purple-500"
                >
                  <option value="All Critical Care RNs (ER/ICU)">All Critical Care RNs (ER/ICU) - 54 Clinicians</option>
                  <option value="Available Surgical Scrub RNs">Available Surgical Scrub RNs - 28 Clinicians</option>
                  <option value="HSE Midwifery Specialists">HSE Midwifery Specialists - 35 Clinicians</option>
                  <option value="Certified HCAs Dublin North">Certified HCAs Dublin North - 72 Clinicians</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Urgency Level</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBroadcastUrgency('critical')}
                    className={`py-1.5 rounded-lg font-bold text-center border cursor-pointer ${
                      broadcastUrgency === 'critical' ? 'bg-red-600 text-white border-red-700 font-black shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    🚨 Critical
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastUrgency('priority')}
                    className={`py-1.5 rounded-lg font-bold text-center border cursor-pointer ${
                      broadcastUrgency === 'priority' ? 'bg-amber-600 text-white border-amber-700 font-black shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    ⚡ Priority
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastUrgency('info')}
                    className={`py-1.5 rounded-lg font-bold text-center border cursor-pointer ${
                      broadcastUrgency === 'info' ? 'bg-blue-600 text-white border-blue-700 font-black shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    ℹ️ Standard
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Broadcast Headline & Surge Details</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Critical Surge: 2 ICU Night Shifts available tonight in St. Jude. Rate: $82/hr including $20 surge bonus. Tap to confirm instantly."
                  value={broadcastHeadline}
                  onChange={(e) => setBroadcastHeadline(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>

              {broadcastSuccessNotice && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Broadcast successfully dispatched to mobile push & SMS gateway!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-2.5 rounded-lg shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer uppercase tracking-wider"
              >
                <Radio className="w-4 h-4" />
                <span>Transmit Mobile Broadcast</span>
              </button>
            </form>
          </div>

          {/* Broadcast History (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>Broadcast Telemetry & Acknowledgment Rates</span>
            </h3>

            <div className="space-y-3">
              {broadcasts.map((b) => (
                <div key={b.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      b.urgency === 'critical' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {b.urgency}
                    </span>
                    <span className="text-[10px] text-slate-400">{b.dispatchedAt}</span>
                  </div>

                  <p className="text-xs font-bold text-slate-800">{b.headline}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                    <span>Target: <strong className="text-slate-700">{b.targetPool}</strong></span>
                    <span className="text-purple-700 font-bold">
                      {b.acknowledgedCount} / {b.recipientsCount} Confirmed ({Math.round((b.acknowledgedCount / b.recipientsCount) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SOP KNOWLEDGE BASE */}
      {activeSubTab === 'knowledge' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-sm font-black text-slate-900">Standard Operating Procedures (SOP)</h3>
              <p className="text-[11px] text-slate-500">Hospital Staffing, WTD Compliance & Exception Handling Protocols</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                SOP-01 • GPS Geofencing
              </span>
              <h4 className="text-xs font-bold text-slate-900">Cellular Blindspot Override</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                If clinician clock-in fails due to basement/radiology shielding, ward manager can verify physical presence and trigger a cryptographic override logged in the audit trail.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                SOP-02 • Working Time
              </span>
              <h4 className="text-xs font-bold text-slate-900">11-Hour Rest Gap Exceptions</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Mandatory 11-hour rest period cannot be waived unless Clinical Director declares a Code Red Major Incident, requiring dual authorization and regulatory notification.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                SOP-03 • Instant Pay
              </span>
              <h4 className="text-xs font-bold text-slate-900">Debit Push Reconciliation</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Timesheets locked by charge nurse automatically qualify for instant pay debit card push rails (1.5% fee). Disputed hours remain sequestered until resolution.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
