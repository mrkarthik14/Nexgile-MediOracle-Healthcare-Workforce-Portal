import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Users, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Eye, 
  KeyRound, 
  Server,
  Smartphone,
  Hospital
} from 'lucide-react';
import { Role } from '../types';
import { ROLE_DEFINITIONS } from '../data/rbacConfig';

interface RbacVisualGuideProps {
  currentRole: Role;
  onSelectRole: (role: Role) => void;
  onNavigateToTab: (tab: string) => void;
}

export const RbacVisualGuide: React.FC<RbacVisualGuideProps> = ({
  currentRole,
  onSelectRole,
  onNavigateToTab,
}) => {
  const [selectedRolePreview, setSelectedRolePreview] = useState<Role>(currentRole);
  const [activeScenario, setActiveScenario] = useState<number>(0);

  const activeDef = ROLE_DEFINITIONS[selectedRolePreview];

  const simulationScenarios = [
    {
      id: 0,
      title: 'Scenario: Nurse Sarah Chen calls /api/facilities/budget (Hospital Ledgers)',
      actor: 'Nurse Sarah Chen (RN-882)',
      actorRole: 'professional' as Role,
      targetEndpoint: '/api/facilities/budget & Master P&L',
      expectedStatus: '403 Forbidden',
      isAllowed: false,
      explanation: 'A registered nurse can only access their personal timesheets and shift roster. Hospital master financial ledgers and doctor internal notes are blocked at Layer 3 (Role) and Layer 4 (Tenant Scoping).',
    },
    {
      id: 1,
      title: 'Scenario: Ward Lead (Dr. Sterling) accesses Emergency ER-1 Acuity & Shifts',
      actor: 'Dr. Sterling, MD (Ward Lead)',
      actorRole: 'ward_lead' as Role,
      targetEndpoint: '/api/facilities/floor-dashboard & /api/shifts/*',
      expectedStatus: '200 OK',
      isAllowed: true,
      explanation: 'Authorized: Ward Leads possess clinical jurisdiction over floor acuity, nurse staffing ratios, and manager override authorizations in their assigned wards.',
    },
    {
      id: 2,
      title: 'Scenario: Hospital Finance attempts to view clinical resuscitation notes',
      actor: 'Amanda Brooks (Hospital Finance)',
      actorRole: 'finance' as Role,
      targetEndpoint: '/api/shifts/clinical-notes & patient charts',
      expectedStatus: '403 Forbidden',
      isAllowed: false,
      explanation: 'Blocked: Segregation of Duties. Financial auditors and accountants have access strictly to billing ledgers, tax invoices, and aging buckets. Clinical medical notes are protected by patient privacy laws.',
    },
    {
      id: 3,
      title: 'Scenario: Compliance Officer checks Primary Source Board Registry',
      actor: 'Patricia Ramos (Auditor)',
      actorRole: 'compliance_officer' as Role,
      targetEndpoint: '/api/compliance/verify-license & OCR buffer',
      expectedStatus: '200 OK',
      isAllowed: true,
      explanation: 'Authorized: Compliance Officers are cleared to query State Board registries, execute OCR anti-tamper scans, and enforce Working Time Directive rest gap rules.',
    },
  ];

  const currentScenario = simulationScenarios[activeScenario];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Zero-Trust Architecture
            </span>
            <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded font-bold">
              Multi-Tenant Data Isolation
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Role-Based Access Control (RBAC) Visual Guide
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Every user receives a customized, simplified dashboard. Private data is locked at 5 layers so nurses cannot access doctor notes, and finance cannot access medical records.
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-1">
          <span className="text-xs text-slate-700 font-bold uppercase tracking-wider">Test Role:</span>
          <select
            value={currentRole}
            onChange={(e) => onSelectRole(e.target.value as Role)}
            className="text-xs bg-slate-900 text-white rounded-lg px-3 py-2 font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm border border-slate-700"
          >
            <optgroup label="🏥 HOSPITAL FACILITY PORTAL">
              <option value="facility_admin">Facility Admin (John Sterling)</option>
              <option value="ward_lead">Ward Lead (Dr. Sterling, MD)</option>
              <option value="finance">Hospital Finance (Amanda Brooks, CPA)</option>
            </optgroup>
            <optgroup label="🩺 CLINICIAN / NURSE PORTAL">
              <option value="professional">Nurse / Clinician (Sarah Chen, RN)</option>
            </optgroup>
            <optgroup label="🏢 AGENCY STAFFING PORTAL">
              <option value="compliance_officer">Compliance Auditor (Patricia Ramos)</option>
              <option value="payroll">Agency Payroll (Marcus Sterling)</option>
              <option value="support_agent">Support Helpdesk (Chloe Davis)</option>
              <option value="recruiter">Clinical Recruiter (Jessica Gomez)</option>
              <option value="business_leader">Business Leader (Robert Vance, VP)</option>
              <option value="agency_admin">Agency Director (Arthur Pendelton)</option>
            </optgroup>
          </select>
        </div>
      </div>

      {/* 3 Core Dedicated Portals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Facility Portal */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Hospital className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hospital Facility Portal</h3>
              <span className="text-[10px] font-mono text-slate-400">Routes: /facility/*</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Built for <strong>Hospital Admins</strong>, <strong>Ward Lead Physicians</strong>, and <strong>Financial Controllers</strong>.
          </p>
          <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
            <p className="font-semibold text-slate-800">What they do:</p>
            <p className="text-slate-600 text-[11px]">• Floor Management & Acuity Levels</p>
            <p className="text-slate-600 text-[11px]">• Post Shifts & Run Match Engine</p>
            <p className="text-slate-600 text-[11px]">• Approve Timesheets & Review Invoices</p>
          </div>
          <button
            onClick={() => {
              onSelectRole('facility_admin');
              onNavigateToTab('floor');
            }}
            className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Switch to Facility Portal →
          </button>
        </div>

        {/* 2. Professional Portal */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 ring-2 ring-blue-600/30">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Clinician / Nurse Portal</h3>
              <span className="text-[10px] font-mono text-slate-400">Routes: /pro/*</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Dedicated mobile-first portal for <strong>Nurses</strong>, <strong>HCAs</strong>, and <strong>Allied Staff</strong>.
          </p>
          <div className="bg-cyan-50/60 p-3 rounded-lg text-xs space-y-1">
            <p className="font-semibold text-cyan-900">Personal & Scoped:</p>
            <p className="text-slate-700 text-[11px]">• View Only Own Shifts & Earnings</p>
            <p className="text-slate-700 text-[11px]">• GPS Clock-in/out (&lt; 100m geofence)</p>
            <p className="text-slate-700 text-[11px]">• Claim Instant Pay ($738.75 in seconds)</p>
          </div>
          <button
            onClick={() => {
              onSelectRole('professional');
              onNavigateToTab('clinician_mobile');
            }}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            Switch to Clinician App (Sarah Chen) →
          </button>
        </div>

        {/* 3. Agency Portal */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Agency & Ops Portal</h3>
              <span className="text-[10px] font-mono text-slate-400">Routes: /agency/*</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Built for <strong>Compliance Auditors</strong>, <strong>Recruiters</strong>, and <strong>Payroll Remittance</strong>.
          </p>
          <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
            <p className="font-semibold text-slate-800">Operational tasks:</p>
            <p className="text-slate-600 text-[11px]">• Primary Source License Verification</p>
            <p className="text-slate-600 text-[11px]">• Pluggable OCR Scanner & Fraud Detection</p>
            <p className="text-slate-600 text-[11px]">• Locked Timesheet Remittance Rails</p>
          </div>
          <button
            onClick={() => {
              onSelectRole('compliance_officer');
              onNavigateToTab('compliance');
            }}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Switch to Agency Portal →
          </button>
        </div>
      </div>

      {/* Interactive RBAC Simulation Bench */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-blue-600" />
              <span>Interactive Permission Simulator: "Who Can Access What?"</span>
            </h3>
            <p className="text-xs text-slate-500">
              Select a scenario to verify how frontend route guards and backend permission checks enforce data privacy.
            </p>
          </div>
        </div>

        {/* Scenario Selector Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {simulationScenarios.map((sc, i) => (
            <button
              key={i}
              onClick={() => setActiveScenario(i)}
              className={`p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                activeScenario === i
                  ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Scenario {i + 1}</span>
                <span className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                  sc.isAllowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
                }`}>
                  {sc.expectedStatus}
                </span>
              </div>
              <p className="font-bold text-slate-800 text-[11px] line-clamp-2">{sc.title}</p>
            </button>
          ))}
        </div>

        {/* Current Scenario Result Display */}
        <div className={`p-5 rounded-xl border transition-all ${
          currentScenario.isAllowed
            ? 'bg-emerald-50/40 border-emerald-300'
            : 'bg-red-50/40 border-red-300'
        }`}>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                {currentScenario.isAllowed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="text-sm font-bold text-slate-900">{currentScenario.title}</span>
              </div>
              <p className="text-xs text-slate-600">
                Actor: <strong className="text-slate-800">{currentScenario.actor}</strong> • Target: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700 font-mono text-[10px]">{currentScenario.targetEndpoint}</code>
              </p>
            </div>

            <span className={`px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider ${
              currentScenario.isAllowed ? 'bg-emerald-600 text-white shadow-xs' : 'bg-red-600 text-white shadow-xs'
            }`}>
              {currentScenario.expectedStatus}
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/70 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold uppercase text-[10px] text-slate-500 block mb-1">
              Security Rationale:
            </span>
            {currentScenario.explanation}
          </div>
        </div>
      </div>

      {/* Role Matrix Explorer */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Role Permission Matrix ({Object.keys(ROLE_DEFINITIONS).length} Roles)
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">
            Click any role to inspect permissions
          </span>
        </div>

        {/* Roles Row */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(ROLE_DEFINITIONS).map(([rKey, rDef]) => {
            const isSelected = selectedRolePreview === rKey;
            return (
              <button
                key={rKey}
                onClick={() => setSelectedRolePreview(rKey as Role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {rDef.name.split(',')[0]}
              </button>
            );
          })}
        </div>

        {/* Active Selected Role Details */}
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-base font-bold text-slate-900">{activeDef.name}</h4>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                  {activeDef.portalLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500">{activeDef.userTitle}</p>
            </div>

            <button
              onClick={() => {
                onSelectRole(selectedRolePreview);
                onNavigateToTab(activeDef.landingTab);
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer uppercase tracking-wider"
            >
              Simulate As {activeDef.name.split(' ')[0]} →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-emerald-800 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Authorized Data Access:</span>
              </span>
              <ul className="space-y-1.5 text-slate-700">
                {activeDef.canSeeData.map((d, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-red-800 flex items-center space-x-1.5">
                <XCircle className="w-3.5 h-3.5 text-red-600" />
                <span>Protected & Strictly Prohibited:</span>
              </span>
              <ul className="space-y-1.5 text-slate-600">
                {activeDef.blockedData.map((d, i) => (
                  <li key={i} className="text-[11px]">
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
