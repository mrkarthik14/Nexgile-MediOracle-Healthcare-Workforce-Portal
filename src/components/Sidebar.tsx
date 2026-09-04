import React from 'react';
import { 
  LayoutDashboard, 
  CalendarClock, 
  Users, 
  ShieldCheck, 
  Receipt, 
  BarChart3, 
  Smartphone,
  Shield,
  Lock,
  Hospital,
  Building2,
  Stethoscope,
  Star,
  Headphones,
  Network,
  Clock,
  LogOut,
  CheckCircle2
} from 'lucide-react';
import { Role } from '../types';
import { ROLE_DEFINITIONS } from '../data/rbacConfig';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: Role;
  setCurrentRole?: (role: Role) => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  onLogout,
}) => {
  const currentDef = ROLE_DEFINITIONS[currentRole] || ROLE_DEFINITIONS.facility_admin;

  const navItems = [
    { id: 'floor', label: 'Floor Dashboard', icon: LayoutDashboard, category: 'facility' },
    { id: 'shifts', label: 'Shift Management', icon: CalendarClock, category: 'shared' },
    { id: 'timekeeping', label: 'Timekeeping & Attendance', icon: Clock, category: 'shared', badge: 'Live' },
    { id: 'clinician_mobile', label: 'Clinician App (GPS)', icon: Smartphone, category: 'professional' },
    { id: 'professionals', label: 'Professional Network', icon: Users, category: 'agency' },
    { id: 'compliance', label: 'Compliance & OCR', icon: ShieldCheck, category: 'agency' },
    { id: 'billing', label: 'Billing & Ledgers', icon: Receipt, category: 'shared' },
    { id: 'analytics', label: 'Analytics & KPIs', icon: BarChart3, category: 'shared' },
    { id: 'quality', label: 'Quality & 360 Reviews', icon: Star, category: 'shared' },
    { id: 'support', label: 'Support & Help Desk', icon: Headphones, category: 'agency' },
    { id: 'integrations', label: 'Integrations & APIs', icon: Network, category: 'shared' },
    { id: 'rbac_guide', label: 'Role Access (RBAC) Guide', icon: Shield, category: 'all' },
  ];

  return (
    <aside id="main-sidebar" className="w-64 bg-[#0F172A] text-white flex flex-col flex-shrink-0 border-r border-slate-800 select-none relative">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-700/80">
        <h1 className="text-lg font-bold tracking-tight text-white flex items-center">
          NEXGILE <span className="text-blue-400 ml-1.5 font-black">MEDIORACLE</span>
        </h1>
        <div className="flex items-center space-x-1.5 mt-1.5">
          {currentDef.portal === 'professional' ? (
            <span className="flex items-center space-x-1 text-[9px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-700">
              <Smartphone className="w-3 h-3 text-cyan-400" />
              <span>Clinician Portal</span>
            </span>
          ) : currentDef.portal === 'facility' ? (
            <span className="flex items-center space-x-1 text-[9px] font-black uppercase tracking-wider text-blue-300 bg-blue-950/90 px-2 py-0.5 rounded border border-blue-700">
              <Hospital className="w-3 h-3 text-blue-400" />
              <span>Facility Portal</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 text-[9px] font-black uppercase tracking-wider text-purple-300 bg-purple-950/90 px-2 py-0.5 rounded border border-purple-700">
              <Building2 className="w-3 h-3 text-purple-400" />
              <span>Agency Portal</span>
            </span>
          )}
          <span className="text-[10px] text-slate-400 font-mono">v2.4</span>
        </div>
      </div>

      {/* Navigation Links with Role Authorization awareness */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          Available Workspaces
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAllowed = currentDef.allowedTabs.includes(item.id);

          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : isAllowed
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
              }`}
            >
              <div className={`w-4 h-4 flex items-center justify-center ${isActive ? 'opacity-100' : isAllowed ? 'opacity-80' : 'opacity-40'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="truncate flex-1">{item.label}</span>
              
              {/* Badges and restriction indicator */}
              {!isAllowed ? (
                <span title="Restricted by Role (403)" className="text-[9px] text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded flex items-center space-x-1">
                  <Lock className="w-2.5 h-2.5 text-slate-400" />
                </span>
              ) : item.badge ? (
                <span className="text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded uppercase">
                  {item.badge}
                </span>
              ) : item.id === 'shifts' ? (
                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-red-500/90 text-white rounded">
                  4
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* User Session Profile Footer (Role switcher removed as requested) */}
      <div className="p-3.5 mt-auto border-t border-slate-800 bg-slate-900/95">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs flex-shrink-0 shadow-xs">
              JS
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-white truncate">
                  John Sterling
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate leading-tight font-medium">
                Hospital Administrator
              </p>
            </div>
          </div>

          {onLogout && (
            <button
              id="sidebar-logout-btn"
              type="button"
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>St. Jude Medical</span>
          </span>
          <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800/60">
            SESSION ACTIVE
          </span>
        </div>
      </div>
    </aside>
  );
};

