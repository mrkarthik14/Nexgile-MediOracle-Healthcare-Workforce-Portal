import React, { useState } from 'react';
import { Department, Shift } from '../types';
import { X, Plus, Calendar, Clock, DollarSign, ShieldAlert } from 'lucide-react';

interface PostShiftModalProps {
  departments: Department[];
  defaultDeptId?: string;
  onClose: () => void;
  onCreateShift: (newShift: Partial<Shift>) => void;
}

export const PostShiftModal: React.FC<PostShiftModalProps> = ({
  departments,
  defaultDeptId,
  onClose,
  onCreateShift,
}) => {
  const [departmentId, setDepartmentId] = useState(defaultDeptId || departments[0]?.id || 'dept-er1');
  const [role, setRole] = useState('Registered Nurse (RN)');
  const [specialty, setSpecialty] = useState('Emergency / Trauma');
  const [date, setDate] = useState('2026-09-05');
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('07:30');
  const [urgency, setUrgency] = useState<'normal' | 'high' | 'critical'>('critical');
  const [baseRate, setBaseRate] = useState('58.00');
  const [incentiveBonus, setIncentiveBonus] = useState('15.00');
  const [notes, setNotes] = useState('');
  const [selectedQuals, setSelectedQuals] = useState<string[]>(['RN License', 'BLS', 'ACLS']);

  // Extended Advanced Fields matching Functional Requirements
  const [acuityLevel, setAcuityLevel] = useState('Level 1 - Resuscitation / Immediate');
  const [patientRatio, setPatientRatio] = useState('1:2 (High Dependency)');
  const [unpaidBreakMinutes, setUnpaidBreakMinutes] = useState<number>(30);
  const [recurrencePattern, setRecurrencePattern] = useState('Single Shift');
  const [openOpenings, setOpenOpenings] = useState<number>(1);

  const qualificationOptions = ['RN License', 'BLS', 'ACLS', 'TNCC', 'PALS', 'CCRN', 'HCA Care Cert', 'Telemetry Cert'];

  const templates = [
    {
      id: 'er_trauma',
      name: 'ER Trauma Night RN',
      role: 'Registered Nurse (RN)',
      specialty: 'Emergency / Trauma',
      urgency: 'critical' as const,
      baseRate: '58.00',
      incentiveBonus: '15.00',
      quals: ['RN License', 'BLS', 'ACLS', 'TNCC'],
      acuity: 'Level 1 - Resuscitation / Immediate',
      ratio: '1:2 (High Dependency)',
      breaks: 30,
    },
    {
      id: 'icu_acute',
      name: 'ICU 1:1 Resuscitation RN',
      role: 'Intensive Care Nurse',
      specialty: 'Intensive Care (ICU)',
      urgency: 'critical' as const,
      baseRate: '65.00',
      incentiveBonus: '20.00',
      quals: ['RN License', 'BLS', 'ACLS', 'CCRN'],
      acuity: 'Level 1 - Resuscitation / Immediate',
      ratio: '1:1 (Critical Care)',
      breaks: 45,
    },
    {
      id: 'surg_stepdown',
      name: 'Surgical Step-Down RN',
      role: 'Registered Nurse (RN)',
      specialty: 'Post-Op Surgical',
      urgency: 'high' as const,
      baseRate: '52.00',
      incentiveBonus: '8.00',
      quals: ['RN License', 'BLS', 'Telemetry Cert'],
      acuity: 'Level 3 - Urgent / Step-Down',
      ratio: '1:4 (Acute Ward)',
      breaks: 30,
    },
    {
      id: 'hca_roster',
      name: 'Healthcare Assistant (HCA)',
      role: 'Healthcare Assistant (HCA)',
      specialty: 'Geriatric & Palliative',
      urgency: 'normal' as const,
      baseRate: '32.00',
      incentiveBonus: '5.00',
      quals: ['HCA Care Cert', 'BLS'],
      acuity: 'Level 4 - Standard Nursing',
      ratio: '1:6 (General Ward)',
      breaks: 60,
    },
  ];

  const handleApplyTemplate = (templateId: string) => {
    const t = templates.find(item => item.id === templateId);
    if (!t) return;
    setRole(t.role);
    setSpecialty(t.specialty);
    setUrgency(t.urgency);
    setBaseRate(t.baseRate);
    setIncentiveBonus(t.incentiveBonus);
    setSelectedQuals(t.quals);
    setAcuityLevel(t.acuity);
    setPatientRatio(t.ratio);
    setUnpaidBreakMinutes(t.breaks);
  };

  const toggleQual = (qual: string) => {
    if (selectedQuals.includes(qual)) {
      setSelectedQuals(selectedQuals.filter(q => q !== qual));
    } else {
      setSelectedQuals([...selectedQuals, qual]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dept = departments.find(d => d.id === departmentId);
    onCreateShift({
      departmentId,
      departmentName: dept ? dept.name : 'Emergency (ER-1)',
      facilityName: dept ? dept.facilityName : 'St. Jude Hospital',
      role,
      specialty,
      date,
      startTime,
      endTime,
      urgency,
      baseRate: parseFloat(baseRate) || 55.00,
      incentiveBonus: parseFloat(incentiveBonus) || 0,
      requiredQualifications: selectedQuals,
      notes,
      status: 'open',
      acuityLevel,
      patientRatio,
      unpaidBreakMinutes,
      recurrencePattern,
      openOpenings,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Shift Requisition
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">Post New Hospital Shift</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          {/* Quick Shift Templates */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 flex items-center space-x-1">
                <span>⚡ Load Certified Shift Template:</span>
              </span>
              <span className="text-[9px] text-blue-600 font-bold">Auto-fills rates, qualifications & ratios</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {templates.map((tpl) => (
                <button
                  type="button"
                  key={tpl.id}
                  onClick={() => handleApplyTemplate(tpl.id)}
                  className="px-2 py-1.5 rounded bg-white border border-blue-300 text-blue-900 font-bold hover:bg-blue-600 hover:text-white transition-all text-[10px] truncate text-left shadow-2xs cursor-pointer"
                >
                  {tpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Department and Urgency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                Target Department / Ward:
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.acuityLevel} Acuity)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                Acuity / Urgency Level:
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-semibold"
              >
                <option value="critical">Critical Risk (Resuscitation / ICU)</option>
                <option value="high">High Urgency</option>
                <option value="normal">Standard Planned Rotation</option>
              </select>
            </div>
          </div>

          {/* Acuity & Target Nurse-to-Patient Ratio */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                Clinical Acuity Scale:
              </label>
              <select
                value={acuityLevel}
                onChange={(e) => setAcuityLevel(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Level 1 - Resuscitation / Immediate">Level 1 - Resuscitation / Immediate Life Threat</option>
                <option value="Level 2 - Emergent / Critical">Level 2 - Emergent / Critical Care</option>
                <option value="Level 3 - Urgent / Step-Down">Level 3 - Urgent / Step-Down</option>
                <option value="Level 4 - Standard Nursing">Level 4 - Standard Floor Nursing</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                Nurse-to-Patient Target Ratio:
              </label>
              <select
                value={patientRatio}
                onChange={(e) => setPatientRatio(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-semibold"
              >
                <option value="1:1 (Critical Care)">1:1 (Dedicated Critical Care / Resus)</option>
                <option value="1:2 (High Dependency)">1:2 (High Dependency / Trauma)</option>
                <option value="1:4 (Acute Ward)">1:4 (Acute Medical / Surgical)</option>
                <option value="1:5 (Standard Step-Down)">1:5 (Standard Step-Down)</option>
                <option value="1:6 (General Ward)">1:6 (General Ward / Care Home)</option>
              </select>
            </div>
          </div>

          {/* Role and Specialty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                Clinical Role:
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Registered Nurse (RN)">Registered Nurse (RN)</option>
                <option value="Intensive Care Nurse">Intensive Care Nurse (CCRN)</option>
                <option value="Cardiac Nurse">Cardiac Nurse</option>
                <option value="Healthcare Assistant (HCA)">Healthcare Assistant (HCA)</option>
                <option value="Senior Staff Nurse">Senior Staff Nurse</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                Clinical Specialty:
              </label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="e.g. Emergency / Trauma"
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Date, Time and Breaks */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                Shift Date:
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                Start Time:
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="19:00"
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                End Time:
              </label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="07:30"
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                Unpaid Break:
              </label>
              <select
                value={unpaidBreakMinutes}
                onChange={(e) => setUnpaidBreakMinutes(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value={30}>30 min meal</option>
                <option value={45}>45 min meal</option>
                <option value={60}>60 min meal</option>
              </select>
            </div>
          </div>

          {/* Recurrence Pattern and Bulk Openings */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                Recurrence Schedule:
              </label>
              <select
                value={recurrencePattern}
                onChange={(e) => setRecurrencePattern(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Single Shift">Single Shift (Ad-hoc cover)</option>
                <option value="3-Day Weekend Block">3-Day Weekend Block (Fri/Sat/Sun)</option>
                <option value="Weekly 4-Week Block">Weekly Recurrence (4 Weeks)</option>
                <option value="Daily 5-Shift Rotation">Daily 5-Shift Rotation</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                Bulk Openings Needed:
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={openOpenings}
                  onChange={(e) => setOpenOpenings(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-800 font-bold text-center focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-[11px] text-slate-500">
                  {openOpenings > 1 ? `Bulk generates ${openOpenings} individual match tickets` : 'Single clinician requisition'}
                </span>
              </div>
            </div>
          </div>

          {/* Financials / Rates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                Base Hourly Rate ($/hr):
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  step="0.5"
                  value={baseRate}
                  onChange={(e) => setBaseRate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md p-2 pl-7 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                Surge Incentive Bonus ($/hr):
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-slate-400 font-bold">+$</span>
                <input
                  type="number"
                  step="0.5"
                  value={incentiveBonus}
                  onChange={(e) => setIncentiveBonus(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md p-2 pl-8 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono text-emerald-600 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Mandatory Qualifications Checkboxes */}
          <div>
            <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1.5">
              Required Clinical Qualifications:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {qualificationOptions.map((qual) => {
                const isChecked = selectedQuals.includes(qual);
                return (
                  <button
                    type="button"
                    key={qual}
                    onClick={() => toggleQual(qual)}
                    className={`py-1.5 px-2 rounded border text-[10px] font-semibold text-center transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {isChecked ? '✓ ' : ''}{qual}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
              Handover / Clinical Notes:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Critical resuscitation bay coverage, trauma telemetry experience preferred..."
              className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none h-16"
            />
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors cursor-pointer uppercase tracking-wider"
            >
              Publish & Auto-Match Shift
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
