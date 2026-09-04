import React, { useState } from 'react';
import { Department, Shift } from '../types';
import { AlertCircle, CheckCircle2, ArrowRight, UserPlus, Radio, ShieldAlert } from 'lucide-react';

interface FloorDashboardProps {
  departments: Department[];
  shifts: Shift[];
  onSelectDepartmentForShifts: (deptId: string) => void;
  onOpenMatchModal: (shift: Shift) => void;
  onOpenPostShift: (defaultDeptId?: string) => void;
}

export const FloorDashboard: React.FC<FloorDashboardProps> = ({
  departments,
  shifts,
  onSelectDepartmentForShifts,
  onOpenMatchModal,
  onOpenPostShift,
}) => {
  const [viewMode, setViewMode] = useState<'wards' | 'specialties'>('wards');

  const openEmergencyShifts = shifts.filter(
    s => s.departmentId === 'dept-er1' && (s.status === 'open' || s.status === 'matching')
  );

  return (
    <div className="space-y-6">
      {/* Main Floor Management Dashboard Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
        {/* Card Header matching Geometric Balance Design HTML */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="font-bold text-slate-800 text-base">Floor Management Dashboard</h2>
            <p className="text-[11px] text-slate-400">Live acuity levels, patient ratios, and vacancy risk telemetry</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('wards')}
              className={`px-3 py-1 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                viewMode === 'wards'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Wards
            </button>
            <button
              onClick={() => setViewMode('specialties')}
              className={`px-3 py-1 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                viewMode === 'specialties'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              Specialties
            </button>
          </div>
        </div>

        {/* Wards Grid matching Geometric Balance Spec */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map((dept) => {
            const fillPercentage = Math.min(100, Math.round((dept.currentStaffing / dept.targetStaffing) * 100));
            
            // Risk Styling
            let containerStyle = 'p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-all';
            let badgeStyle = 'px-2 py-1 bg-green-500 text-white text-[9px] font-black rounded uppercase';
            let barColor = 'bg-green-500';
            let statusText = 'Stabilized';

            if (dept.riskLevel === 'critical') {
              containerStyle = 'p-4 border border-red-100 bg-red-50/30 rounded-lg hover:border-red-200 transition-all';
              badgeStyle = 'px-2 py-1 bg-red-500 text-white text-[9px] font-black rounded uppercase';
              barColor = 'bg-red-500';
              statusText = 'Critical Risk';
            } else if (dept.riskLevel === 'moderate') {
              containerStyle = 'p-4 border border-orange-100 bg-orange-50/30 rounded-lg hover:border-orange-200 transition-all';
              badgeStyle = 'px-2 py-1 bg-orange-500 text-white text-[9px] font-black rounded uppercase';
              barColor = 'bg-orange-500';
              statusText = 'Moderate Risk';
            }

            return (
              <div key={dept.id} className={containerStyle}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                      <span>{dept.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono font-normal">({dept.code})</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">Acuity Level: {dept.acuityLevel}</p>
                  </div>
                  <span className={badgeStyle}>{statusText}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">Target Staffing</span>
                    <span className="font-bold text-slate-900">
                      {dept.currentStaffing} / {dept.targetStaffing}
                    </span>
                  </div>
                  
                  {/* Staffing Progress Bar */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`${barColor} h-full transition-all duration-500`}
                      style={{ width: `${fillPercentage}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className={`text-[10px] font-medium truncate ${
                      dept.riskLevel === 'critical' ? 'text-red-600' :
                      dept.riskLevel === 'moderate' ? 'text-orange-600' : 'text-slate-500'
                    }`}>
                      {dept.vacanciesNote}
                    </p>

                    <button
                      onClick={() => onSelectDepartmentForShifts(dept.id)}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-0.5 ml-2 cursor-pointer flex-shrink-0"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Emergency Vacancy Action Strip */}
      {openEmergencyShifts.length > 0 && (
        <div className="bg-white border border-red-200 rounded-xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Critical Emergency Room Vacancies Pending Action
                </h4>
                <p className="text-xs text-slate-500">
                  {openEmergencyShifts.length} urgent Trauma & Resuscitation shifts for tonight (19:00 - 07:30) need candidates.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={() => onOpenMatchModal(openEmergencyShifts[0])}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 shadow-sm uppercase tracking-wider"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Run Intelligent Match</span>
              </button>
              <button
                onClick={() => onOpenPostShift('dept-er1')}
                className="px-3 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md text-xs font-bold transition-colors cursor-pointer"
              >
                Add Surge Shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
