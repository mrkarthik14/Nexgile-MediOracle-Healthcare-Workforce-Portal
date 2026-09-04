import React from 'react';
import { ShieldAlert, Lock, ArrowRight, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Role } from '../types';
import { ROLE_DEFINITIONS } from '../data/rbacConfig';

interface AccessDeniedViewProps {
  currentRole: Role;
  attemptedTab: string;
  onNavigateToAllowed: (tab: string) => void;
  onSwitchRole: (role: Role) => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  currentRole,
  attemptedTab,
  onNavigateToAllowed,
  onSwitchRole,
}) => {
  const roleDef = ROLE_DEFINITIONS[currentRole];

  return (
    <div className="bg-white border border-red-200 rounded-xl p-8 shadow-sm space-y-6 max-w-3xl mx-auto my-6 animate-in fade-in duration-150">
      {/* 403 Forbidden Header */}
      <div className="flex items-start space-x-4 border-b border-red-100 pb-6">
        <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              HTTP 403 Forbidden • Access Denied
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Attempted: /{roleDef.portal}/{attemptedTab}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Unauthorized Scope: Role Restriction Enforced
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {roleDef.deniedAccessMessage}
          </p>
        </div>
      </div>

      {/* Why This Matters: Plain English Educational Explanation */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
          <Lock className="w-3.5 h-3.5 text-blue-600" />
          <span>Why is this data restricted? (Zero-Trust Security Principle)</span>
        </h4>
        <p className="text-xs text-slate-700 leading-relaxed">
          {currentRole === 'professional' ? (
            <>
              <strong>Can a Nurse see Doctor private charts or Hospital master budgets?</strong>
              <br />
              <span className="text-red-700 font-semibold">❌ NO!</span> Under healthcare privacy compliance (HIPAA, NHS Data Security, GDPR), clinical staff are strictly isolated from executive hospital financial ledgers, doctor internal administrative reviews, and other staff members' private compensation records. Each clinician has their own dedicated portal.
            </>
          ) : currentRole === 'ward_lead' ? (
            <>
              <strong>Can a Ward Lead view corporate agency margin contracts?</strong>
              <br />
              <span className="text-red-700 font-semibold">❌ NO!</span> Ward Leads are authorized strictly for clinical floor acuity, staffing rosters, and patient-to-nurse ratios in their ward. Master corporate billing and recruiter contracts are isolated to Hospital Finance and Agency Directors.
            </>
          ) : (
            <>
              Access to this endpoint requires explicit role permission and organization tenant clearance. The backend permission layer (<code className="bg-white px-1 py-0.5 rounded text-red-600 font-mono text-[11px]">HasRole('{attemptedTab}')</code>) rejected this request.
            </>
          )}
        </p>
      </div>

      {/* Allowed vs Blocked Matrix for Current Role */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-2">
          <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Allowed for {roleDef.name}:</span>
          </div>
          <ul className="space-y-1 text-slate-700">
            {roleDef.canSeeData.map((item, i) => (
              <li key={i} className="flex items-start space-x-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-red-50/60 border border-red-200 rounded-lg space-y-2">
          <div className="flex items-center space-x-1.5 text-red-800 font-bold">
            <XCircle className="w-4 h-4 text-red-600" />
            <span>Strictly Prohibited & Blocked:</span>
          </div>
          <ul className="space-y-1 text-slate-700">
            {roleDef.blockedData.map((item, i) => (
              <li key={i} className="text-slate-600 text-[11px]">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recovery Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
        <button
          onClick={() => onNavigateToAllowed(roleDef.landingTab)}
          className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-2 uppercase tracking-wider"
        >
          <span>Return to My Allowed Dashboard ({roleDef.landingTab})</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500">Need this page? Switch role:</span>
          <button
            onClick={() => onSwitchRole('facility_admin')}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold transition-colors cursor-pointer"
          >
            Facility Admin
          </button>
          <button
            onClick={() => onSwitchRole('compliance_officer')}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold transition-colors cursor-pointer"
          >
            Compliance
          </button>
        </div>
      </div>
    </div>
  );
};
