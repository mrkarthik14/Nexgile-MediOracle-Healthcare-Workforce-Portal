import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CalendarClock, 
  Users, 
  ShieldCheck, 
  Receipt, 
  BarChart3, 
  Smartphone,
  ChevronDown,
  ChevronUp,
  Shield,
  Lock,
  Hospital,
  Building2,
  Check,
  Stethoscope,
  BadgeCheck,
  UserCog,
  Briefcase
} from 'lucide-react';
import { Role } from '../types';
import { ROLE_DEFINITIONS } from '../data/rbacConfig';
import { LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  onLogout?: () => void;
}

interface RoleOption {
  role: Role;
  name: string;
  subtitle: string;
  tag: string;
  initials: string;
  avatarBg: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  onLogout,
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentDef = ROLE_DEFINITIONS[currentRole] || ROLE_DEFINITIONS.facility_admin;

  // Handle click outside to close custom role dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    }
    if (isRoleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRoleDropdownOpen]);

  const navItems = [
    { id: 'floor', label: 'Floor Dashboard', icon: LayoutDashboard, category: 'facility' },
    { id: 'shifts', label: 'Shift Management', icon: CalendarClock, category: 'shared' },
    { id: 'clinician_mobile', label: 'Clinician App (GPS)', icon: Smartphone, category: 'professional' },
    { id: 'professionals', label: 'Professional Network', icon: Users, category: 'agency' },
    { id: 'compliance', label: 'Compliance & OCR', icon: ShieldCheck, category: 'agency' },
    { id: 'billing', label: 'Billing & Ledgers', icon: Receipt, category: 'shared' },
    { id: 'analytics', label: 'Analytics & KPIs', icon: BarChart3, category: 'shared' },
    { id: 'rbac_guide', label: 'Role Access (RBAC) Guide', icon: Shield, category: 'all', badge: 'Active' },
  ];

  const roleCategories: {
    portalTitle: string;
    portalSubtitle: string;
    icon: any;
    theme: {
      headerBg: string;
      headerText: string;
      border: string;
      badgeBg: string;
      badgeText: string;
    };
    options: RoleOption[];
  }[] = [
    {
      portalTitle: 'Hospital Facility Portal',
      portalSubtitle: 'Clinical Wards, Rostering & Administration',
      icon: Hospital,
      theme: {
        headerBg: 'bg-blue-950/80',
        headerText: 'text-blue-300',
        border: 'border-blue-800/60',
        badgeBg: 'bg-blue-500/20',
        badgeText: 'text-blue-300',
      },
      options: [
        {
          role: 'facility_admin',
          name: 'Facility Admin',
          subtitle: 'John Sterling • Hospital Admin',
          tag: 'Full CRUD',
          initials: 'JS',
          avatarBg: 'bg-blue-600 text-white',
        },
        {
          role: 'ward_lead',
          name: 'Ward Lead (Physician)',
          subtitle: 'Dr. Sterling, MD • ER / ICU Lead',
          tag: 'Acuity & Override',
          initials: 'DS',
          avatarBg: 'bg-emerald-600 text-white',
        },
        {
          role: 'finance',
          name: 'Hospital Finance',
          subtitle: 'Amanda Brooks, CPA • Controller',
          tag: 'Budget & Aging',
          initials: 'AB',
          avatarBg: 'bg-amber-600 text-white',
        },
      ],
    },
    {
      portalTitle: 'Clinician / Nurse Portal',
      portalSubtitle: 'Personal Shifts, GPS Geofencing & Instant Pay',
      icon: Stethoscope,
      theme: {
        headerBg: 'bg-cyan-950/80',
        headerText: 'text-cyan-300',
        border: 'border-cyan-800/60',
        badgeBg: 'bg-cyan-500/20',
        badgeText: 'text-cyan-300',
      },
      options: [
        {
          role: 'professional',
          name: 'Nurse / Clinician',
          subtitle: 'Sarah Chen, RN • Critical Care RN-882',
          tag: 'Zero-Trust Scoped',
          initials: 'SC',
          avatarBg: 'bg-cyan-500 text-slate-950 font-black',
        },
      ],
    },
    {
      portalTitle: 'Agency Staffing Portal',
      portalSubtitle: 'Compliance Verifications, Payroll & Matchmaking',
      icon: Building2,
      theme: {
        headerBg: 'bg-purple-950/80',
        headerText: 'text-purple-300',
        border: 'border-purple-800/60',
        badgeBg: 'bg-purple-500/20',
        badgeText: 'text-purple-300',
      },
      options: [
        {
          role: 'compliance_officer',
          name: 'Compliance Auditor',
          subtitle: 'Patricia Ramos • Regulatory Lead',
          tag: 'OCR & WTD Rules',
          initials: 'PR',
          avatarBg: 'bg-purple-600 text-white',
        },
        {
          role: 'payroll',
          name: 'Agency Payroll',
          subtitle: 'Marcus Sterling • Remittance Lead',
          tag: 'Instant Payouts',
          initials: 'MS',
          avatarBg: 'bg-indigo-600 text-white',
        },
        {
          role: 'support_agent',
          name: 'Support Helpdesk',
          subtitle: 'Chloe Davis • Ops Specialist',
          tag: 'Incident Cases',
          initials: 'CD',
          avatarBg: 'bg-pink-600 text-white',
        },
        {
          role: 'recruiter',
          name: 'Clinical Recruiter',
          subtitle: 'Jessica Gomez • Talent Lead',
          tag: 'Match Dispatch',
          initials: 'JG',
          avatarBg: 'bg-teal-600 text-white',
        },
        {
          role: 'business_leader',
          name: 'Business Leader',
          subtitle: 'Robert Vance, VP • Workforce Ops',
          tag: 'KPI Analytics',
          initials: 'RV',
          avatarBg: 'bg-orange-600 text-white',
        },
        {
          role: 'agency_admin',
          name: 'Agency Director',
          subtitle: 'Arthur Pendelton • Director',
          tag: 'Full Agency Scope',
          initials: 'AP',
          avatarBg: 'bg-violet-600 text-white',
        },
      ],
    },
  ];

  // Helper to switch role and navigate to appropriate landing tab
  const handleSelectRole = (newRole: Role) => {
    setCurrentRole(newRole);
    setIsRoleDropdownOpen(false);
    const targetDef = ROLE_DEFINITIONS[newRole];
    if (targetDef && !targetDef.allowedTabs.includes(activeTab)) {
      setActiveTab(targetDef.landingTab);
    }
  };

  // Find currently selected role meta
  const allRolesFlat = roleCategories.flatMap(c => c.options);
  const currentActiveOption = allRolesFlat.find(r => r.role === currentRole) || allRolesFlat[0];

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

      {/* Enhanced Role Switcher Component with Neatly Arranged Custom Popover */}
      <div className="p-3.5 mt-auto border-t border-slate-700/80 bg-slate-900/95 relative" ref={dropdownRef}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold flex items-center space-x-1">
            <UserCog className="w-3 h-3 text-blue-400" />
            <span>Simulate User Role</span>
          </span>
          <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-800/70">
            RBAC Active
          </span>
        </div>

        {/* Interactive Role Trigger Card */}
        <button
          type="button"
          id="role-switcher-custom-trigger"
          onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
          className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
            isRoleDropdownOpen 
              ? 'bg-slate-800 border-blue-500 ring-2 ring-blue-500/30' 
              : 'bg-slate-800/90 hover:bg-slate-800 border-slate-700 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg ${currentActiveOption.avatarBg} flex items-center justify-center font-extrabold text-xs flex-shrink-0 shadow-xs`}>
              {currentActiveOption.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-black text-white truncate">
                  {currentActiveOption.name}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate leading-tight font-medium">
                {currentActiveOption.subtitle.split('•')[0].trim()}
              </p>
            </div>
          </div>
          <div className="ml-2 flex-shrink-0 text-slate-400">
            {isRoleDropdownOpen ? (
              <ChevronUp className="w-4 h-4 text-blue-400" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {/* Custom Neatly Arranged Popover Menu with Enhanced Headings & Vibrant Colors */}
        {isRoleDropdownOpen && (
          <div 
            id="role-switcher-popover"
            className="absolute bottom-full left-2 right-2 mb-2 bg-[#0B1120] border-2 border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[480px] flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            {/* Popover Title Bar */}
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Select Simulated Role</span>
                </span>
                <p className="text-[10px] text-slate-400 font-medium">
                  Dashboards & permissions adapt instantly
                </p>
              </div>
              <span className="text-[9px] bg-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded border border-slate-700">
                10 Roles
              </span>
            </div>

            {/* Scrollable Role Categories List */}
            <div className="overflow-y-auto p-2.5 space-y-3.5 divide-y divide-slate-800/80">
              {roleCategories.map((cat, catIndex) => {
                const Icon = cat.icon;
                return (
                  <div key={cat.portalTitle} className={catIndex > 0 ? 'pt-3' : ''}>
                    {/* ENHANCED CATEGORY HEADING with vivid theme styling */}
                    <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg mb-2 border ${cat.theme.headerBg} ${cat.theme.border}`}>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded flex items-center justify-center">
                          <Icon className={`w-3.5 h-3.5 ${cat.theme.headerText}`} />
                        </div>
                        <div>
                          <h4 className={`text-[11px] font-black uppercase tracking-wider ${cat.theme.headerText}`}>
                            {cat.portalTitle}
                          </h4>
                        </div>
                      </div>
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${cat.theme.badgeBg} ${cat.theme.badgeText}`}>
                        {cat.options.length} Roles
                      </span>
                    </div>

                    {/* Role Items in this Category */}
                    <div className="space-y-1">
                      {cat.options.map((opt) => {
                        const isSelected = currentRole === opt.role;
                        return (
                          <button
                            key={opt.role}
                            id={`role-item-${opt.role}`}
                            onClick={() => handleSelectRole(opt.role)}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600/20 border border-blue-500/80 ring-1 ring-blue-500 shadow-sm'
                                : 'hover:bg-slate-800/90 border border-transparent hover:border-slate-700/60'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              {/* Avatar Icon */}
                              <div className={`w-7 h-7 rounded-lg ${opt.avatarBg} flex items-center justify-center text-[10px] font-black flex-shrink-0 shadow-xs`}>
                                {opt.initials}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-1.5">
                                  <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-white font-extrabold' : 'text-slate-200'}`}>
                                    {opt.name}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 truncate leading-snug">
                                  {opt.subtitle}
                                </p>
                              </div>
                            </div>

                            {/* Tag & Selection Indicator */}
                            <div className="flex items-center space-x-1.5 ml-2 flex-shrink-0">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tight ${
                                isSelected 
                                  ? 'bg-blue-500 text-white font-black' 
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}>
                                {opt.tag}
                              </span>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Helper Footer */}
            <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[9px] text-slate-400 font-medium">
                Switch role or return to gateway
              </span>
              {onLogout && (
                <button
                  type="button"
                  id="sidebar-logout-btn"
                  onClick={() => {
                    setIsRoleDropdownOpen(false);
                    onLogout();
                  }}
                  className="flex items-center space-x-1.5 text-[10px] text-red-400 hover:text-white font-bold bg-red-950/70 hover:bg-red-900 border border-red-800/80 px-2 py-1 rounded cursor-pointer transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Log Out</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
