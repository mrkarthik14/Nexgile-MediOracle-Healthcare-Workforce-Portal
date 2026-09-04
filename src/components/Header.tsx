import React, { useState } from 'react';
import { Bell, Plus, ShieldCheck, Lock, Sparkles, Smartphone, LogOut } from 'lucide-react';
import { Role } from '../types';
import { ROLE_DEFINITIONS } from '../data/rbacConfig';

interface HeaderProps {
  onOpenPostShift: () => void;
  currentRole: Role;
  unreadNotificationsCount: number;
  onClearNotifications: () => void;
  onOpenRbacGuide?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPostShift,
  currentRole,
  unreadNotificationsCount,
  onClearNotifications,
  onOpenRbacGuide,
  onLogout,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const currentDef = ROLE_DEFINITIONS[currentRole] || ROLE_DEFINITIONS.facility_admin;

  const notifications = [
    { id: 'n1', text: 'Critical Risk: 4 RN vacancies in ER-1 for 19:00 shift', time: '5m ago', type: 'critical' },
    { id: 'n2', text: 'Nurse Sarah Chen clocked in at ICU (GPS verified 42m)', time: '18m ago', type: 'success' },
    { id: 'n3', text: 'Timesheet for Shift #SH-8825 pending your approval', time: '1h ago', type: 'info' },
  ];

  const canPostShift = currentRole === 'facility_admin' || currentRole === 'ward_lead' || currentRole === 'agency_admin';

  return (
    <header id="main-header" className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 flex-shrink-0 z-10">
      {/* Left: System Operational Status & Facility/Portal Context */}
      <div className="flex items-center space-x-3 sm:space-x-5">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          <p className="text-xs text-slate-500 font-medium tracking-tight">
            System: <span className="font-bold text-slate-700">Operational</span>
          </p>
        </div>

        <div className="hidden sm:flex items-center space-x-2 border-l border-slate-200 pl-4">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Active Role:</span>
          <span className={`text-xs font-extrabold px-3 py-1 rounded-lg border flex items-center space-x-2 shadow-xs ${
            currentDef.portal === 'professional'
              ? 'bg-cyan-50 text-cyan-950 border-cyan-300 ring-1 ring-cyan-400/30'
              : currentDef.portal === 'facility'
              ? 'bg-blue-50 text-blue-950 border-blue-300 ring-1 ring-blue-400/30'
              : 'bg-purple-50 text-purple-950 border-purple-300 ring-1 ring-purple-400/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              currentDef.portal === 'professional'
                ? 'bg-cyan-600 animate-pulse'
                : currentDef.portal === 'facility'
                ? 'bg-blue-600'
                : 'bg-purple-600'
            }`}></span>
            <span className="font-black">{currentDef.name}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
              currentDef.portal === 'professional'
                ? 'bg-cyan-200/80 text-cyan-900'
                : currentDef.portal === 'facility'
                ? 'bg-blue-200/80 text-blue-900'
                : 'bg-purple-200/80 text-purple-900'
            }`}>
              {currentDef.portalLabel.split(' ')[0]}
            </span>
          </span>
        </div>

        {/* Security & Access Scope Badge */}
        {onOpenRbacGuide && (
          <button
            onClick={onOpenRbacGuide}
            className="hidden md:flex items-center space-x-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-blue-200"
            title="Inspect Role Permissions and Protected Scopes"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>RBAC Security Guide</span>
          </button>
        )}
      </div>

      {/* Right: Notifications, Divider, and Primary Action Button */}
      <div className="flex items-center space-x-3 sm:space-x-5 relative">
        {/* Notifications Popover Trigger */}
        <div className="relative">
          <button
            id="notifications-button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) {
                onClearNotifications();
              }
            }}
            className="p-1.5 text-slate-500 hover:text-slate-800 transition-colors relative cursor-pointer rounded-md hover:bg-slate-100"
            title="System Alerts & Notifications"
          >
            {unreadNotificationsCount > 0 && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></div>
            )}
            <Bell className="w-5 h-5" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-800">Operational Notifications</span>
                <span className="text-[10px] text-blue-600 font-semibold cursor-pointer" onClick={() => setShowNotifications(false)}>
                  Close
                </span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2 bg-slate-50 rounded-lg text-xs hover:bg-slate-100 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        n.type === 'critical' ? 'bg-red-100 text-red-600' :
                        n.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {n.type}
                      </span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-slate-700 text-xs leading-relaxed">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <div className="h-7 w-[1px] bg-slate-200"></div>

        {/* Dynamic Action Button based on Role */}
        {canPostShift ? (
          <button
            id="post-shift-btn"
            onClick={onOpenPostShift}
            className="bg-blue-600 text-white px-3.5 py-2 rounded-md text-xs font-bold shadow-xs hover:bg-blue-700 transition-colors flex items-center space-x-1.5 cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ POST NEW SHIFT</span>
          </button>
        ) : currentRole === 'professional' ? (
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-bold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>GPS Clocked In</span>
            </span>
          </div>
        ) : (
          <div className="text-xs text-slate-500 font-medium px-2 py-1 bg-slate-100 rounded">
            Auditing Mode
          </div>
        )}

        {/* Log Out to Gateway Button */}
        {onLogout && (
          <button
            id="header-logout-btn"
            onClick={onLogout}
            title="Log Out & Return to Login Gateway"
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-2.5 py-2 rounded-md transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        )}
      </div>
    </header>
  );
};
