import React, { useState } from 'react';
import { Department, BroadcastMessage } from '../types';
import { 
  X, 
  Send, 
  MessageSquare, 
  Smartphone, 
  Bell, 
  Mail, 
  CheckCircle2, 
  AlertTriangle,
  Users,
  ShieldAlert
} from 'lucide-react';

interface BroadcastMessageModalProps {
  departments: Department[];
  onClose: () => void;
  onSendBroadcast: (msg: Omit<BroadcastMessage, 'id' | 'sentAt'>) => void;
}

export const BroadcastMessageModal: React.FC<BroadcastMessageModalProps> = ({
  departments,
  onClose,
  onSendBroadcast,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetDepartment, setTargetDepartment] = useState('All Departments');
  const [targetRole, setTargetRole] = useState('All Roles');
  const [channels, setChannels] = useState<('sms' | 'push' | 'email')[]>(['push', 'sms']);
  const [priority, setPriority] = useState<'normal' | 'urgent' | 'critical'>('urgent');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Recipient pool simulator based on filter
  const getSimulatedRecipientCount = () => {
    let count = 48; // Base pool
    if (targetDepartment !== 'All Departments') count = Math.round(count * 0.35);
    if (targetRole !== 'All Roles') count = Math.round(count * 0.5);
    return Math.max(count, 4);
  };

  const recipientCount = getSimulatedRecipientCount();

  const toggleChannel = (ch: 'sms' | 'push' | 'email') => {
    if (channels.includes(ch)) {
      if (channels.length === 1) return; // Must have at least one channel
      setChannels(channels.filter(c => c !== ch));
    } else {
      setChannels([...channels, ch]);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.length < 5) {
      setError('A concise broadcast title (at least 5 characters) is required.');
      return;
    }
    if (!message.trim() || message.length < 15) {
      setError('Broadcast message body must be at least 15 characters to provide clinical clarity.');
      return;
    }

    onSendBroadcast({
      title,
      message,
      targetDepartment,
      targetRole,
      channels,
      recipientCount,
      priority,
      sender: 'Operations Center (Shift Dispatch Sentinel)',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Bulk Messaging Engine
              </span>
              <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">
                Omnichannel Gateway
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">
              Workforce Communications Broadcast
            </h2>
            <p className="text-xs text-slate-500">
              Dispatch high-priority notifications, shift callouts, or emergency floor alerts to targeted clinician cohorts.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSend} className="p-6 space-y-4 text-xs overflow-y-auto">
          {/* Target Audience */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                Target Department / Floor:
              </label>
              <select
                value={targetDepartment}
                onChange={(e) => setTargetDepartment(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded p-2 text-xs text-slate-800"
              >
                <option value="All Departments">All Departments (Hospital-wide)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                Target Clinical Cadre:
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded p-2 text-xs text-slate-800"
              >
                <option value="All Roles">All Verified Clinicians</option>
                <option value="Registered Nurse (RN)">Registered Nurses (RN)</option>
                <option value="Healthcare Assistant (HCA)">Healthcare Assistants (HCA)</option>
                <option value="Intensive Care Nurse">Critical Care Specialists</option>
              </select>
            </div>
          </div>

          {/* Delivery Channels */}
          <div>
            <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1.5">
              Active Delivery Channels:
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => toggleChannel('push')}
                className={`px-3 py-1.5 rounded-md font-bold flex items-center space-x-1.5 border cursor-pointer ${
                  channels.includes('push')
                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Mobile Push</span>
              </button>

              <button
                type="button"
                onClick={() => toggleChannel('sms')}
                className={`px-3 py-1.5 rounded-md font-bold flex items-center space-x-1.5 border cursor-pointer ${
                  channels.includes('sms')
                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>SMS Alert</span>
              </button>

              <button
                type="button"
                onClick={() => toggleChannel('email')}
                className={`px-3 py-1.5 rounded-md font-bold flex items-center space-x-1.5 border cursor-pointer ${
                  channels.includes('email')
                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Digest</span>
              </button>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
              Message Urgency Tier:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority('normal')}
                className={`py-1.5 rounded text-xs font-bold border text-center cursor-pointer ${
                  priority === 'normal'
                    ? 'bg-slate-800 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                Standard Notice
              </button>
              <button
                type="button"
                onClick={() => setPriority('urgent')}
                className={`py-1.5 rounded text-xs font-bold border text-center cursor-pointer ${
                  priority === 'urgent'
                    ? 'bg-amber-600 text-white border-amber-700'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                Urgent Callout
              </button>
              <button
                type="button"
                onClick={() => setPriority('critical')}
                className={`py-1.5 rounded text-xs font-bold border text-center cursor-pointer ${
                  priority === 'critical'
                    ? 'bg-red-600 text-white border-red-700'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                Code Critical
              </button>
            </div>
          </div>

          {/* Title & Body */}
          <div>
            <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
              Broadcast Subject / Headline:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              placeholder="e.g., Immediate Resus Coverage Needed - Night Shift Surge Bonus"
              className="w-full bg-white border border-slate-300 rounded p-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700 uppercase text-[10px]">
                Broadcast Message Content:
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {message.length}/320 characters
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={320}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setError('');
              }}
              placeholder="Provide clear shift timings, location specifics, patient ratio expectations, and contact information..."
              className="w-full bg-white border border-slate-300 rounded p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Cohort Recipient Summary Strip */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-blue-950 text-xs">
                Audience: ~{recipientCount} Qualified & Available Clinicians
              </span>
            </div>
            <span className="text-[10px] font-bold bg-white text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              Opt-in Validated
            </span>
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer uppercase tracking-wider"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Broadcast</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
