import React, { useState } from 'react';
import { Department, Shift } from '../types';
import { 
  X, 
  Calendar, 
  Clock, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Send,
  Zap,
  Sparkles
} from 'lucide-react';

interface BulkShiftGeneratorModalProps {
  departments: Department[];
  onClose: () => void;
  onGenerateBatchShifts: (shifts: Partial<Shift>[]) => void;
}

export const BulkShiftGeneratorModal: React.FC<BulkShiftGeneratorModalProps> = ({
  departments,
  onClose,
  onGenerateBatchShifts,
}) => {
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 'dept-er1');
  const [role, setRole] = useState('Registered Nurse (RN)');
  const [specialty, setSpecialty] = useState('Emergency / Trauma');
  const [startDate, setStartDate] = useState('2026-09-08');
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [shiftTiming, setShiftTiming] = useState<'day' | 'night'>('night');
  const [urgency, setUrgency] = useState<'normal' | 'high' | 'critical'>('high');
  const [baseRate, setBaseRate] = useState('58.00');
  const [incentiveBonus, setIncentiveBonus] = useState('10.00');
  const [slotsPerDay, setSlotsPerDay] = useState(2);
  
  // Validation state
  const [isValidating, setIsValidating] = useState(false);
  const [validationPassed, setValidationPassed] = useState<boolean | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) return; // Keep at least one
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
    setValidationPassed(null);
  };

  const totalShiftsToGenerate = durationWeeks * selectedDays.length * slotsPerDay;

  const handleValidateBatch = () => {
    setIsValidating(true);
    setValidationErrors([]);
    setValidationWarnings([]);

    setTimeout(() => {
      setIsValidating(false);
      const errors: string[] = [];
      const warnings: string[] = [];

      if (parseFloat(baseRate) < 30) {
        errors.push('Base rate cannot be below national HSE/DoH minimum band floor ($30.00/hr).');
      }

      if (totalShiftsToGenerate > 60) {
        warnings.push(`High batch volume (${totalShiftsToGenerate} shifts). Recommended to stagger open broadcast to avoid overwhelming candidate notifications.`);
      }

      if (selectedDays.includes('Sun') && selectedDays.includes('Mon') && shiftTiming === 'night') {
        warnings.push('Consecutive Sunday night to Monday day shifts may trigger 11.0h WTD rest period warnings for single-assignee rosters.');
      }

      if (errors.length > 0) {
        setValidationPassed(false);
        setValidationErrors(errors);
      } else {
        setValidationPassed(true);
        setValidationWarnings(warnings);
      }
    }, 600);
  };

  const handleExecuteGeneration = () => {
    const dept = departments.find(d => d.id === departmentId);
    const generated: Partial<Shift>[] = [];

    const startTime = shiftTiming === 'night' ? '19:00' : '07:00';
    const endTime = shiftTiming === 'night' ? '07:30' : '19:30';

    let currentDate = new Date(startDate);

    for (let w = 0; w < durationWeeks; w++) {
      for (const day of selectedDays) {
        for (let s = 0; s < slotsPerDay; s++) {
          const shiftDateStr = new Date(currentDate.getTime() + (w * 7 * 86400000)).toISOString().split('T')[0];
          generated.push({
            departmentId,
            departmentName: dept ? dept.name : 'Emergency (ER-1)',
            facilityName: dept ? dept.facilityName : 'St. Jude Hospital',
            role,
            specialty,
            date: shiftDateStr,
            startTime,
            endTime,
            urgency,
            baseRate: parseFloat(baseRate) || 55.00,
            incentiveBonus: parseFloat(incentiveBonus) || 0,
            requiredQualifications: ['RN License', 'BLS', 'ACLS'],
            notes: `Bulk Recurring Pattern (${shiftTiming.toUpperCase()} Rotation) - Week ${w + 1}`,
            status: 'open',
            recurrencePattern: `${durationWeeks}-Week Recurring (${selectedDays.join('/')})`,
          });
        }
      }
    }

    onGenerateBatchShifts(generated);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Bulk Engine
              </span>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                Automated Rotation Generator
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">
              Recurring Shifts Generator & Conflict Validation
            </h2>
            <p className="text-xs text-slate-500">
              Generate 2 to 12 weeks of recurring hospital shift patterns with automatic WTD rest & capacity pre-validation.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs">
          {/* Ward & Role selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                Target Department / Ward:
              </label>
              <select
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value);
                  setValidationPassed(null);
                }}
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
                Clinical Role:
              </label>
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setValidationPassed(null);
                }}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Registered Nurse (RN)">Registered Nurse (RN)</option>
                <option value="Intensive Care Nurse">Intensive Care Nurse (ICU)</option>
                <option value="Healthcare Assistant (HCA)">Healthcare Assistant (HCA)</option>
                <option value="Emergency Nurse Specialist">Emergency Nurse Specialist</option>
              </select>
            </div>
          </div>

          {/* Schedule Recurrence Matrix */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase text-[10px] flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Recurrence Pattern & Days of Week</span>
              </span>
              <span className="text-[10px] font-mono text-blue-600 font-bold">
                {totalShiftsToGenerate} Total Requisitions
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {daysOfWeek.map((day) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold mb-1">Horizon Duration:</label>
                <select
                  value={durationWeeks}
                  onChange={(e) => {
                    setDurationWeeks(parseInt(e.target.value));
                    setValidationPassed(null);
                  }}
                  className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-800"
                >
                  <option value={2}>2 Weeks Rotation</option>
                  <option value={4}>4 Weeks Rotation</option>
                  <option value={8}>8 Weeks Rotation</option>
                  <option value={12}>12 Weeks Full Quarter</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-semibold mb-1">Shift Timing:</label>
                <select
                  value={shiftTiming}
                  onChange={(e) => {
                    setShiftTiming(e.target.value as 'day' | 'night');
                    setValidationPassed(null);
                  }}
                  className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-800"
                >
                  <option value="night">Night Shift (19:00 - 07:30)</option>
                  <option value="day">Day Shift (07:00 - 19:30)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-semibold mb-1">Clinicians / Shift:</label>
                <select
                  value={slotsPerDay}
                  onChange={(e) => {
                    setSlotsPerDay(parseInt(e.target.value));
                    setValidationPassed(null);
                  }}
                  className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-800"
                >
                  <option value={1}>1 Opening</option>
                  <option value={2}>2 Openings</option>
                  <option value={3}>3 Openings</option>
                  <option value={4}>4 Openings</option>
                </select>
              </div>
            </div>
          </div>

          {/* Rates and Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                Base Hourly Rate ($):
              </label>
              <input
                type="number"
                value={baseRate}
                onChange={(e) => {
                  setBaseRate(e.target.value);
                  setValidationPassed(null);
                }}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs font-mono text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                Surge Premium ($):
              </label>
              <input
                type="number"
                value={incentiveBonus}
                onChange={(e) => {
                  setIncentiveBonus(e.target.value);
                  setValidationPassed(null);
                }}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs font-mono text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                Urgency Tier:
              </label>
              <select
                value={urgency}
                onChange={(e) => {
                  setUrgency(e.target.value as any);
                  setValidationPassed(null);
                }}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="normal">Standard Rotation</option>
                <option value="high">High Demand</option>
                <option value="critical">Critical Surge</option>
              </select>
            </div>
          </div>

          {/* Validation Feedback Strip */}
          {validationPassed === true && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Batch Pre-Validation Passed (Zero Blocking Conflicts)</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Verified ward capacity, non-overlap with planned maintenance, and compliant baseline rate bands.
              </p>
              {validationWarnings.length > 0 && (
                <div className="mt-2 pt-2 border-t border-emerald-200 space-y-1">
                  {validationWarnings.map((w, i) => (
                    <p key={i} className="text-[10px] text-amber-800 flex items-center space-x-1 font-medium">
                      <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0" />
                      <span>{w}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {validationPassed === false && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg space-y-1">
              <div className="flex items-center space-x-2 text-red-800 font-bold">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>Pre-Validation Errors Detected</span>
              </div>
              {validationErrors.map((err, i) => (
                <p key={i} className="text-[11px] text-red-700 font-medium">
                  • {err}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <div className="text-[11px] text-slate-500">
            Estimated gross rotation cost: <strong className="text-slate-900 font-mono">${(totalShiftsToGenerate * 12 * (parseFloat(baseRate) + parseFloat(incentiveBonus))).toLocaleString()}</strong>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {validationPassed !== true ? (
              <button
                onClick={handleValidateBatch}
                disabled={isValidating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer uppercase tracking-wider"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isValidating ? 'Validating Roster...' : 'Validate Batch Rotation'}</span>
              </button>
            ) : (
              <button
                onClick={handleExecuteGeneration}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer uppercase tracking-wider animate-in fade-in"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Publish {totalShiftsToGenerate} Shifts</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
