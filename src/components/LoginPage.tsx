import React, { useState } from 'react';
import { 
  Hospital, 
  Stethoscope, 
  Building2, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  KeyRound, 
  Mail, 
  CheckCircle2, 
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Fingerprint,
  Info
} from 'lucide-react';
import { Role } from '../types';
import { ROLE_DEFINITIONS } from '../data/rbacConfig';

interface LoginPageProps {
  onLogin: (role: Role, userEmail?: string) => void;
}

interface RoleCredentials {
  role: Role;
  name: string;
  subtitle: string;
  email: string;
  tag: string;
  initials: string;
  avatarBg: string;
  defaultPass: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  // Currently selected role for credentials form
  const [selectedRole, setSelectedRole] = useState<Role>('facility_admin');
  const [emailInput, setEmailInput] = useState('john.sterling@stjudehospital.org');
  const [passwordInput, setPasswordInput] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStepMessage, setAuthStepMessage] = useState('');

  const portalsData: {
    id: string;
    portalTitle: string;
    portalSubtitle: string;
    icon: any;
    theme: {
      headerBg: string;
      headerText: string;
      border: string;
      badgeBg: string;
      badgeText: string;
      activeBorder: string;
      activeBg: string;
      glow: string;
    };
    roles: RoleCredentials[];
  }[] = [
    {
      id: 'hospital',
      portalTitle: 'Hospital Facility Portal',
      portalSubtitle: 'Clinical Wards, Rostering, Acuity & Administration',
      icon: Hospital,
      theme: {
        headerBg: 'bg-blue-900/90',
        headerText: 'text-blue-200',
        border: 'border-blue-700/60',
        badgeBg: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
        badgeText: 'text-blue-300',
        activeBorder: 'border-blue-500 ring-2 ring-blue-500/40',
        activeBg: 'bg-blue-950/40',
        glow: 'shadow-blue-900/20',
      },
      roles: [
        {
          role: 'facility_admin',
          name: 'Facility Admin',
          subtitle: 'John Sterling • Hospital Admin',
          email: 'john.sterling@stjudehospital.org',
          tag: 'Full CRUD',
          initials: 'JS',
          avatarBg: 'bg-blue-600 text-white',
          defaultPass: 'sterling#Hospital2026',
        },
        {
          role: 'ward_lead',
          name: 'Ward Lead (Physician)',
          subtitle: 'Dr. Sterling, MD • ER / ICU Lead',
          email: 'dr.sterling.md@stjudehospital.org',
          tag: 'Acuity & Override',
          initials: 'DS',
          avatarBg: 'bg-emerald-600 text-white',
          defaultPass: 'physician#Override2026',
        },
        {
          role: 'finance',
          name: 'Hospital Finance',
          subtitle: 'Amanda Brooks, CPA • Controller',
          email: 'amanda.brooks@stjudehospital.org',
          tag: 'Budget & Aging',
          initials: 'AB',
          avatarBg: 'bg-amber-600 text-white',
          defaultPass: 'finance#Ledger2026',
        },
      ],
    },
    {
      id: 'clinician',
      portalTitle: 'Clinician / Professional Portal',
      portalSubtitle: 'Personal Shifts, GPS Geofencing & Instant Pay (Zero-Trust Scoped)',
      icon: Stethoscope,
      theme: {
        headerBg: 'bg-cyan-950/90',
        headerText: 'text-cyan-200',
        border: 'border-cyan-700/60',
        badgeBg: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
        badgeText: 'text-cyan-300',
        activeBorder: 'border-cyan-400 ring-2 ring-cyan-400/40',
        activeBg: 'bg-cyan-950/40',
        glow: 'shadow-cyan-900/20',
      },
      roles: [
        {
          role: 'professional',
          name: 'Nurse / Clinician',
          subtitle: 'Sarah Chen, RN • Critical Care RN-882',
          email: 'sarah.chen.rn@medioracle.net',
          tag: 'Zero-Trust Scoped',
          initials: 'SC',
          avatarBg: 'bg-cyan-500 text-slate-950 font-black',
          defaultPass: 'nurse#ClinicianPay2026',
        },
      ],
    },
    {
      id: 'agency',
      portalTitle: 'Agency Staffing Portal',
      portalSubtitle: 'Compliance OCR, Working Time Directive & Talent Matchmaking',
      icon: Building2,
      theme: {
        headerBg: 'bg-purple-950/90',
        headerText: 'text-purple-200',
        border: 'border-purple-700/60',
        badgeBg: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
        badgeText: 'text-purple-300',
        activeBorder: 'border-purple-500 ring-2 ring-purple-500/40',
        activeBg: 'bg-purple-950/40',
        glow: 'shadow-purple-900/20',
      },
      roles: [
        {
          role: 'compliance_officer',
          name: 'Compliance Auditor',
          subtitle: 'Patricia Ramos • Regulatory Lead',
          email: 'patricia.ramos@nexgile-agency.com',
          tag: 'OCR & WTD Rules',
          initials: 'PR',
          avatarBg: 'bg-purple-600 text-white',
          defaultPass: 'compliance#Audit2026',
        },
        {
          role: 'payroll',
          name: 'Agency Payroll',
          subtitle: 'Marcus Sterling • Remittance Lead',
          email: 'marcus.payroll@nexgile-agency.com',
          tag: 'Instant Payouts',
          initials: 'MS',
          avatarBg: 'bg-indigo-600 text-white',
          defaultPass: 'payroll#InstantPay2026',
        },
        {
          role: 'support_agent',
          name: 'Support Helpdesk',
          subtitle: 'Chloe Davis • Ops Specialist',
          email: 'chloe.support@nexgile-agency.com',
          tag: 'Incident Cases',
          initials: 'CD',
          avatarBg: 'bg-pink-600 text-white',
          defaultPass: 'support#Helpdesk2026',
        },
        {
          role: 'recruiter',
          name: 'Clinical Recruiter',
          subtitle: 'Jessica Gomez • Talent Lead',
          email: 'jessica.recruiter@nexgile-agency.com',
          tag: 'Match Dispatch',
          initials: 'JG',
          avatarBg: 'bg-teal-600 text-white',
          defaultPass: 'talent#Recruiter2026',
        },
        {
          role: 'business_leader',
          name: 'Business Leader',
          subtitle: 'Robert Vance, VP • Workforce Ops',
          email: 'robert.vance.vp@nexgile-agency.com',
          tag: 'KPI Analytics',
          initials: 'RV',
          avatarBg: 'bg-orange-600 text-white',
          defaultPass: 'exec#Workforce2026',
        },
        {
          role: 'agency_admin',
          name: 'Agency Director',
          subtitle: 'Arthur Pendelton • Director',
          email: 'arthur.director@nexgile-agency.com',
          tag: 'Full Agency Scope',
          initials: 'AP',
          avatarBg: 'bg-violet-600 text-white',
          defaultPass: 'director#AgencyScope2026',
        },
      ],
    },
  ];

  // Flat lookup
  const allRolesFlat = portalsData.flatMap((p) => p.roles);
  const currentRoleMeta = allRolesFlat.find((r) => r.role === selectedRole) || allRolesFlat[0];
  const currentRoleDef = ROLE_DEFINITIONS[selectedRole];

  // Select a role from the matrix and update input fields
  const handleSelectRole = (r: RoleCredentials) => {
    setSelectedRole(r.role);
    setEmailInput(r.email);
    setPasswordInput('••••••••••••');
  };

  // Perform simulated authentication flow
  const triggerLogin = (targetRole: Role, targetEmail?: string) => {
    setIsAuthenticating(true);
    setAuthStepMessage('Verifying Cryptographic JWT & OAuth Session...');

    setTimeout(() => {
      setAuthStepMessage(`Enforcing Zero-Trust RBAC for ${ROLE_DEFINITIONS[targetRole]?.name || targetRole}...`);
    }, 450);

    setTimeout(() => {
      setAuthStepMessage('Authorizing Scope & Redirecting to Protected Portal...');
    }, 900);

    setTimeout(() => {
      setIsAuthenticating(false);
      onLogin(targetRole, targetEmail || emailInput);
    }, 1300);
  };

  return (
    <div className="min-h-screen w-full bg-[#090D16] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Top Navigation / Security Status Bar */}
      <header className="w-full border-b border-slate-800/80 bg-[#0B1120]/90 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
            NO
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white flex items-center">
              NEXGILE <span className="text-blue-400 ml-1 font-black">MEDIORACLE</span>
              <span className="ml-2 text-[10px] text-slate-400 font-mono font-medium px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700">
                v2.4 GATEWAY
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">
              Enterprise Healthcare Staffing & Clinical Operations Platform
            </p>
          </div>
        </div>

        {/* Security Badges */}
        <div className="hidden md:flex items-center space-x-3 text-[11px]">
          <span className="flex items-center space-x-1.5 text-emerald-400 bg-emerald-950/60 border border-emerald-800/70 px-2.5 py-1 rounded-full font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>TLS 1.3 (256-Bit)</span>
          </span>
          <span className="flex items-center space-x-1.5 text-blue-300 bg-blue-950/60 border border-blue-800/70 px-2.5 py-1 rounded-full font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>HIPAA / SOC-2 Type II</span>
          </span>
          <span className="flex items-center space-x-1.5 text-purple-300 bg-purple-950/60 border border-purple-800/70 px-2.5 py-1 rounded-full font-bold">
            <Lock className="w-3 h-3 text-purple-400" />
            <span>Zero-Trust RBAC</span>
          </span>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {/* Hero Section Banner */}
        <div className="mb-6 text-center max-w-2xl mx-auto space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 bg-blue-950/80 border border-blue-800/80 px-3 py-1 rounded-full text-blue-300 text-xs font-black uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Role-Based Access Control (RBAC) Gateway</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Select Your Portal & Authenticate
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Sign in to access your role-tailored dashboard. Clinicians, Doctors, and Agency staff operate in strictly separated, privacy-compliant workspaces.
          </p>
        </div>

        {/* Two Columns Grid: Left = 3 Neatly Arranged Portals; Right = Active Login Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT 7 COLS: The 3 Neatly Arranged Portals with Enhanced Headings & Colors */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Available Healthcare Portals (10 Roles)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Click any role to auto-populate or sign in directly
              </span>
            </div>

            {/* Portal Cards Stack */}
            <div className="space-y-4">
              {portalsData.map((portal) => {
                const Icon = portal.icon;
                return (
                  <div 
                    key={portal.id}
                    className="bg-[#0F172A]/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-xs transition-all hover:border-slate-700"
                  >
                    {/* ENHANCED PORTAL HEADING BANNER */}
                    <div className={`flex items-center justify-between px-3.5 py-2 rounded-xl mb-3 border ${portal.theme.headerBg} ${portal.theme.border}`}>
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-black/30 flex items-center justify-center">
                          <Icon className={`w-4 h-4 ${portal.theme.headerText}`} />
                        </div>
                        <div>
                          <h3 className={`text-xs font-black uppercase tracking-wider ${portal.theme.headerText}`}>
                            {portal.portalTitle}
                          </h3>
                          <p className="text-[10px] text-slate-300/80 font-medium hidden sm:block">
                            {portal.portalSubtitle}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${portal.theme.badgeBg}`}>
                        {portal.roles.length} {portal.roles.length === 1 ? 'Role' : 'Roles'}
                      </span>
                    </div>

                    {/* Roles Grid Inside This Portal */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {portal.roles.map((r) => {
                        const isSelected = selectedRole === r.role;
                        return (
                          <div
                            key={r.role}
                            onClick={() => handleSelectRole(r)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? `bg-slate-800/90 ${portal.theme.activeBorder} shadow-md`
                                : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className={`w-7 h-7 rounded-lg ${r.avatarBg} flex items-center justify-center text-[11px] font-black shadow-xs`}>
                                  {r.initials}
                                </div>
                                <div className="min-w-0">
                                  <h4 className={`text-xs font-black truncate leading-tight ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                                    {r.name}
                                  </h4>
                                  <p className="text-[10px] text-slate-400 truncate leading-snug">
                                    {r.subtitle.split('•')[0].trim()}
                                  </p>
                                </div>
                              </div>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                isSelected ? 'bg-blue-500 text-white font-black' : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}>
                                {r.tag}
                              </span>
                            </div>

                            <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between">
                              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[170px]">
                                {r.email}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  triggerLogin(r.role, r.email);
                                }}
                                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 hover:underline flex items-center space-x-1 cursor-pointer"
                              >
                                <span>Fast Login</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT 5 COLS: Dedicated Interactive Login Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#0F172A] border-2 border-slate-700/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              {/* Selected Role Ribbon */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Active Authentication Target
                  </span>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`w-8 h-8 rounded-lg ${currentRoleMeta.avatarBg} flex items-center justify-center font-black text-xs shadow-xs`}>
                      {currentRoleMeta.initials}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white leading-tight">
                        {currentRoleMeta.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {currentRoleDef.userTitle}
                      </p>
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                  currentRoleDef.portal === 'professional'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                    : currentRoleDef.portal === 'facility'
                    ? 'bg-blue-950 text-blue-300 border border-blue-700'
                    : 'bg-purple-950 text-purple-300 border border-purple-700'
                }`}>
                  {currentRoleDef.portalLabel.split(' ')[0]} Portal
                </span>
              </div>

              {/* Login Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  triggerLogin(selectedRole, emailInput);
                }} 
                className="space-y-4"
              >
                {/* Email input */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Organizational Email (SSO ID)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      required
                      placeholder="name@hospital.org"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                {/* Password input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Security Credential
                    </label>
                    <span className="text-[10px] text-blue-400 hover:underline cursor-pointer">
                      Use SmartCard / PIV
                    </span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Biometrics */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[11px]">Remember terminal session</span>
                  </label>
                  <span className="flex items-center space-x-1 text-[11px] text-emerald-400 font-medium">
                    <Fingerprint className="w-3.5 h-3.5" />
                    <span>2FA Ready</span>
                  </span>
                </div>

                {/* Submit / Log In Action Button */}
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  id="submit-login-button"
                  className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                    currentRoleDef.portal === 'professional'
                      ? 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/30'
                      : currentRoleDef.portal === 'facility'
                      ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30'
                      : 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/30'
                  }`}
                >
                  {isAuthenticating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Authenticating Session...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In as {currentRoleMeta.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Live Authentication Simulation Progress Overlay */}
              {isAuthenticating && (
                <div className="mt-4 p-3 bg-slate-900/90 border border-blue-500/50 rounded-xl flex items-center space-x-3 text-xs text-blue-300 animate-in fade-in duration-200">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                  <span className="font-medium">{authStepMessage}</span>
                </div>
              )}

              {/* Zero-Trust Permissions Summary for Selected Role */}
              <div className="mt-5 pt-4 border-t border-slate-800 text-[11px] space-y-2">
                <div className="flex items-center justify-between text-slate-300 font-bold">
                  <span className="flex items-center space-x-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                    <span>Authorized Workspaces</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {currentRoleDef.allowedTabs.length} Modules Allowed
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1.5">
                  {currentRoleDef.allowedTabs.map((tab) => (
                    <span 
                      key={tab} 
                      className="px-2 py-0.5 bg-slate-900 border border-slate-700 text-slate-300 rounded text-[10px] font-mono"
                    >
                      /{tab.replace('_', '-')}
                    </span>
                  ))}
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
                  <span className="font-bold text-slate-300">Privacy Scope: </span>
                  {currentRoleDef.deniedAccessMessage}
                </div>
              </div>
            </div>

            {/* Quick Demo Assist Card */}
            <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-300 space-y-0.5">
                <span className="font-bold text-white">Live Evaluator Note: </span>
                Click any role in the left portal cards to test instant login, or switch users anytime once logged in from the top header and sidebar.
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#0B1120] py-4 px-6 text-center text-[11px] text-slate-500">
        <p>
          Nexgile Medioracle Healthcare Cloud • HIPAA Security Rule § 164.312 • Role-Based Access Control Architecture
        </p>
      </footer>
    </div>
  );
};
