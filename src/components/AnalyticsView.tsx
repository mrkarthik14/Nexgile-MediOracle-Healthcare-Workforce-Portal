import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
import { 
  Sparkles, 
  Brain, 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Sliders, 
  FileText,
  UserCheck,
  TrendingUp,
  Activity,
  CalendarPlus,
  ArrowRight
} from 'lucide-react';
import { AuditLog, Shift } from '../types';
import { INITIAL_AI_OUTCOMES } from '../data/mockData';

interface AnalyticsViewProps {
  onAddAuditLog?: (log: Partial<AuditLog>) => void;
  onGenerateBatchShifts?: (shifts: Partial<Shift>[]) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ 
  onAddAuditLog,
  onGenerateBatchShifts,
}) => {
  const [activeTab, setActiveTab] = useState<'utilization' | 'forecast_overrides' | 'fairness_outcomes'>('utilization');
  
  // Forecast override state
  const [forecastTarget, setForecastTarget] = useState<number>(3);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideFte, setOverrideFte] = useState<number>(5);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [overrideNotice, setOverrideNotice] = useState<string | null>(null);
  const [activeOverride, setActiveOverride] = useState<{ fte: number; reason: string; timestamp: string } | null>(null);

  // What-If Scenario Simulator State
  const [simCensus, setSimCensus] = useState<number>(36);
  const [simAcuityMix, setSimAcuityMix] = useState<'standard' | 'high' | 'critical'>('high');
  const [simSeasonFactor, setSimSeasonFactor] = useState<'baseline' | 'winter_flu' | 'holiday_surge'>('winter_flu');
  const [simTargetRatio, setSimTargetRatio] = useState<number>(4); // 1 nurse per N patients
  const [simBillRate, setSimBillRate] = useState<number>(58);
  const [proactivePostNotice, setProactivePostNotice] = useState<string | null>(null);

  const trendData = [
    { day: 'Mon', fillRate: 91.2, budget: 6200, actual: 5900 },
    { day: 'Tue', fillRate: 93.5, budget: 6200, actual: 6100 },
    { day: 'Wed', fillRate: 94.0, budget: 6200, actual: 6050 },
    { day: 'Thu', fillRate: 92.8, budget: 6200, actual: 6400 },
    { day: 'Fri', fillRate: 95.1, budget: 6500, actual: 6300 },
    { day: 'Sat', fillRate: 96.4, budget: 7000, actual: 6900 },
    { day: 'Sun', fillRate: 94.2, budget: 6800, actual: 6650 },
  ];

  const wardAcuityData = [
    { ward: 'Emergency ER-1', filled: 8, vacancies: 4, fillRate: 66 },
    { ward: 'ICU', filled: 8, vacancies: 0, fillRate: 100 },
    { ward: 'Pediatrics', filled: 5, vacancies: 1, fillRate: 83 },
    { ward: 'Gen Med', filled: 14, vacancies: 0, fillRate: 100 },
    { ward: 'Surgical Post-Op', filled: 6, vacancies: 1, fillRate: 85 },
  ];

  const fairnessExperienceData = [
    { tier: 'Band 5 (Junior/Core)', assignedPct: 38, candidatePoolPct: 40, parityScore: 0.95 },
    { tier: 'Band 6 (Senior Staff)', assignedPct: 44, candidatePoolPct: 42, parityScore: 1.05 },
    { tier: 'Band 7 (Clinical Lead)', assignedPct: 18, candidatePoolPct: 18, parityScore: 1.00 },
  ];

  const handleApplyForecastOverride = () => {
    if (!overrideReason.trim() || overrideReason.length < 10) return;

    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setActiveOverride({
      fte: overrideFte,
      reason: overrideReason,
      timestamp,
    });
    setForecastTarget(overrideFte);

    if (onAddAuditLog) {
      onAddAuditLog({
        code: 'FC-OVERRIDE',
        title: 'Manager Override: Predictive Demand Forecast',
        actor: 'Clinical Operations Director',
        actorRole: 'Facility Admin',
        details: `Overrode AI winter surge forecast for Emergency ER-1 from 3 to ${overrideFte} FTEs. Clinical Rationale: "${overrideReason}". Model telemetry updated.`,
        severity: 'warning',
        targetType: 'ShiftDemandForecast',
        targetId: 'fc-er1-2026-w37',
      });
    }

    setOverrideNotice(`Forecast successfully overridden to ${overrideFte} FTEs with compulsory justification logged.`);
    setIsOverrideModalOpen(false);
    setOverrideReason('');
    setTimeout(() => setOverrideNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              AI Analytics & Governance Hub
            </span>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
              Confidence Calibrated • Fairness Monitored
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            Workforce Intelligence, Forecasting & Fairness Monitoring
          </h2>
          <p className="text-xs text-slate-500">
            Transparent algorithmic models with decisive factor confidence, manager override capability, and continuous fairness telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab('utilization')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'utilization'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Utilization & Fill Telemetry
          </button>
          <button
            onClick={() => setActiveTab('forecast_overrides')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
              activeTab === 'forecast_overrides'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Surge Forecasts & Overrides</span>
          </button>
          <button
            onClick={() => setActiveTab('fairness_outcomes')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
              activeTab === 'fairness_outcomes'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Fairness & Outcome Benchmarks</span>
          </button>
        </div>
      </div>

      {overrideNotice && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{overrideNotice}</span>
        </div>
      )}

      {/* Tab 1: Utilization & Fill Rate Telemetry */}
      {activeTab === 'utilization' && (
        <div className="space-y-6">
          {/* KPI Stat Blocks */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
              <p className="text-[10px] uppercase font-bold text-slate-400">Mean Time to Fill</p>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-2xl font-black text-slate-900">42</span>
                <span className="text-xs text-slate-500 font-semibold">mins</span>
              </div>
              <span className="text-[10px] text-green-600 font-bold">↓ 14 mins vs last month</span>
            </div>

            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
              <p className="text-[10px] uppercase font-bold text-slate-400">First-Accept-Wins Hit Rate</p>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-2xl font-black text-blue-600">88.4%</span>
              </div>
              <span className="text-[10px] text-slate-500">within 15 minutes of dispatch</span>
            </div>

            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
              <p className="text-[10px] uppercase font-bold text-slate-400">Clinician Reliability Score</p>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-2xl font-black text-slate-900">98.9%</span>
              </div>
              <span className="text-[10px] text-green-600 font-bold">&lt; 1.1% late cancellation rate</span>
            </div>

            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
              <p className="text-[10px] uppercase font-bold text-slate-400">Surge Spend Ratio</p>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-2xl font-black text-slate-900">7.2%</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">of total gross billings</span>
            </div>
          </div>

          {/* Recharts Data Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
                Weekly Fill Rate Telemetry (%)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#cbd5e1' }} />
                    <Area type="monotone" dataKey="fillRate" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFill)" name="Fill Rate %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
                Ward Staffing Acuity & Fill Capacity
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wardAcuityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="ward" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#cbd5e1' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="filled" stackId="a" fill="#3b82f6" name="Filled Shifts" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="vacancies" stackId="a" fill="#f97316" name="Open Vacancies" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Predictive Demand Forecasting & Manager Overrides */}
      {activeTab === 'forecast_overrides' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                    Winter Surge Demand Model v4.2
                  </span>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                    Confidence: 94.8% [±1.1 FTE]
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  Predictive Roster Deficit & Surge Mitigation Engine
                </h3>
              </div>

              <button
                onClick={() => setIsOverrideModalOpen(true)}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center space-x-1.5 uppercase tracking-wider"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Override Staffing Forecast</span>
              </button>
            </div>

            {/* Decisive Drivers Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-slate-500">Driver 1: Seasonal Flu/RSV Surge</span>
                <p className="text-base font-black text-slate-900 mt-0.5">+32% Admissions Impact</p>
                <p className="text-[10px] text-slate-500">Based on regional epidemiological CDC/HSE data</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-slate-500">Driver 2: ICU Acuity Bed Load</span>
                <p className="text-base font-black text-slate-900 mt-0.5">88% Bed Occupancy</p>
                <p className="text-[10px] text-slate-500">Requires strict 1:1 specialist clinician ratio</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-slate-500">Driver 3: Weekend Attrition Index</span>
                <p className="text-base font-black text-slate-900 mt-0.5">+14% Shift Callout Risk</p>
                <p className="text-[10px] text-slate-500">Standby buffer automated recommendation</p>
              </div>
            </div>

            {/* Primary Forecast Notification */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-amber-950 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Ward Deficit Warning: Emergency Room (ER-1) - Horizon: 5 Days</span>
                </div>
                <span className="text-xs font-mono font-bold bg-white text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                  Target: {forecastTarget} Registered Nurses
                </span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                The algorithm predicts a 3-nurse gap on Friday night rotation based on flu surge indices. If unfulfilled by Thursday 12:00, automated early broadcast will open with a +$10/hr incentive bonus.
              </p>

              {activeOverride && (
                <div className="mt-2 pt-2 border-t border-amber-200 text-xs text-amber-950 font-medium">
                  <span className="font-bold text-orange-900">Active Lead Override:</span> Set to {activeOverride.fte} FTEs at {activeOverride.timestamp}. Reason: "{activeOverride.reason}"
                </div>
              )}
            </div>

            {/* Other Wards Status */}
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">ICU & Critical Care Floor</span>
                  <p className="text-[10px] text-slate-400">Target Ratio 1:1 • Confidence: 98.2%</p>
                </div>
                <span className="text-emerald-700 font-bold font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Zero Predicted Deficit (100% Covered)
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Pediatric High Dependency</span>
                  <p className="text-[10px] text-slate-400">Target Ratio 1:4 • Confidence: 91.5%</p>
                </div>
                <span className="text-blue-700 font-bold font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  1 Standby RN Pre-Allocated
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Predictive Census & Budget "What-If" Scenario Simulator */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded uppercase">
                    Interactive "What-If" Simulation Model
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    Dynamic Census, Acuity & Budget Deficit Calculator
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  Demand Forecasting & Proactive Posting Recommendations
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const acuityMultiplier = simAcuityMix === 'critical' ? 1.5 : simAcuityMix === 'high' ? 1.25 : 1.0;
                    const seasonMultiplier = simSeasonFactor === 'winter_flu' ? 1.35 : simSeasonFactor === 'holiday_surge' ? 1.20 : 1.0;
                    const effectiveBedLoad = Math.round(simCensus * seasonMultiplier);
                    const requiredNurses = Math.ceil((effectiveBedLoad / simTargetRatio) * (simAcuityMix === 'critical' ? 1.3 : 1.0));
                    const currentWardStaffing = 8;
                    const projectedDeficit = Math.max(1, requiredNurses - currentWardStaffing);

                    const newShifts: Partial<Shift>[] = Array.from({ length: projectedDeficit }, (_, i) => ({
                      departmentId: 'dept-er1',
                      departmentName: 'Emergency (ER-1)',
                      role: 'Registered Nurse (RN)',
                      specialty: simAcuityMix === 'critical' ? 'Critical Care Resuscitation' : 'Trauma & Acute Emergency',
                      date: '2026-09-09',
                      startTime: '19:00',
                      endTime: '07:30',
                      urgency: simSeasonFactor === 'winter_flu' ? 'critical' : 'high',
                      baseRate: simBillRate,
                      incentiveBonus: simSeasonFactor === 'winter_flu' ? 15.0 : 10.0,
                      requiredQualifications: ['RN License', 'BLS', 'TNCC'],
                      notes: `Proactively generated by AI Demand Forecast Simulator. Census: ${simCensus} beds, Factor: ${simSeasonFactor}, Acuity: ${simAcuityMix}.`,
                    }));

                    if (onGenerateBatchShifts) {
                      onGenerateBatchShifts(newShifts);
                    }

                    if (onAddAuditLog) {
                      onAddAuditLog({
                        code: 'PROACT-POST',
                        title: 'Proactive Roster Shifts Generated',
                        actor: 'Clinical Workforce Lead',
                        actorRole: 'Facility Admin',
                        details: `Proactively posted ${projectedDeficit} recommended shifts for Emergency ER-1 based on simulated census of ${simCensus} beds and ${simSeasonFactor} factor.`,
                        severity: 'success',
                        targetType: 'ShiftBatch',
                        targetId: 'sim-' + Date.now(),
                      });
                    }

                    setProactivePostNotice(`Proactively posted ${projectedDeficit} recommended shift slots directly to the live roster.`);
                    setTimeout(() => setProactivePostNotice(null), 5000);
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer uppercase tracking-wider"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Proactively Post Recommended Shifts</span>
                </button>
              </div>
            </div>

            {proactivePostNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{proactivePostNotice}</span>
              </div>
            )}

            {/* Parameter Sliders & Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1.5">
                  <span>Ward Bed Census:</span>
                  <span className="font-mono text-blue-700">{simCensus} Beds</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="60"
                  value={simCensus}
                  onChange={e => setSimCensus(Number(e.target.value))}
                  className="w-full cursor-pointer accent-blue-600"
                />
                <span className="text-[10px] text-slate-400">Range: 15 to 60 occupied beds</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Acuity Mix:</label>
                <select
                  value={simAcuityMix}
                  onChange={e => setSimAcuityMix(e.target.value as any)}
                  className="w-full border border-slate-200 rounded-lg p-1.5 bg-white text-slate-800 font-semibold"
                >
                  <option value="standard">Standard Med-Surg (1.0x)</option>
                  <option value="high">High Acuity Trauma (+25%)</option>
                  <option value="critical">Critical Care / Resus (+50%)</option>
                </select>
                <span className="text-[10px] text-slate-400">Severity weighting factor</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Seasonality Impact:</label>
                <select
                  value={simSeasonFactor}
                  onChange={e => setSimSeasonFactor(e.target.value as any)}
                  className="w-full border border-slate-200 rounded-lg p-1.5 bg-white text-slate-800 font-semibold"
                >
                  <option value="baseline">Baseline Normal (1.0x)</option>
                  <option value="winter_flu">Winter Flu Surge (+35%)</option>
                  <option value="holiday_surge">Holiday Weekend Callout (+20%)</option>
                </select>
                <span className="text-[10px] text-slate-400">Epidemiological surge model</span>
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1.5">
                  <span>Hourly Bill Rate:</span>
                  <span className="font-mono text-emerald-700">${simBillRate}/hr</span>
                </div>
                <input
                  type="range"
                  min="45"
                  max="90"
                  value={simBillRate}
                  onChange={e => setSimBillRate(Number(e.target.value))}
                  className="w-full cursor-pointer accent-emerald-600"
                />
                <span className="text-[10px] text-slate-400">Agency & Bank blended rate</span>
              </div>
            </div>

            {/* Live Calculated What-If Output Cards */}
            {(() => {
              const seasonMultiplier = simSeasonFactor === 'winter_flu' ? 1.35 : simSeasonFactor === 'holiday_surge' ? 1.20 : 1.0;
              const effectiveBedLoad = Math.round(simCensus * seasonMultiplier);
              const requiredNurses = Math.ceil((effectiveBedLoad / simTargetRatio) * (simAcuityMix === 'critical' ? 1.3 : 1.0));
              const currentWardStaffing = 8;
              const projectedDeficit = Math.max(0, requiredNurses - currentWardStaffing);
              const projectedTotalShiftSpend = requiredNurses * 12 * simBillRate;
              const baselineShiftBudget = 5500;
              const budgetVariance = projectedTotalShiftSpend - baselineShiftBudget;

              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Effective Bed Acuity Load</span>
                    <span className="text-xl font-black text-slate-900 mt-1 block">{effectiveBedLoad} Equiv Beds</span>
                    <span className="text-[10px] text-slate-500">Includes {simSeasonFactor.replace('_', ' ')} factor</span>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Required Core Nurses</span>
                    <span className="text-xl font-black text-blue-600 mt-1 block">{requiredNurses} FTEs</span>
                    <span className="text-[10px] text-slate-500">1:{simTargetRatio} nurse-to-patient ratio</span>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-amber-600 block">Projected Deficit Slots</span>
                    <span className="text-xl font-black text-amber-600 mt-1 block">{projectedDeficit} Shifts Needed</span>
                    <span className="text-[10px] text-slate-500">Current active roster: {currentWardStaffing} RNs</span>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Simulated Budget Variance</span>
                    <span className={`text-xl font-black mt-1 block ${budgetVariance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {budgetVariance > 0 ? `+$${budgetVariance.toLocaleString()}` : `-$${Math.abs(budgetVariance).toLocaleString()}`}
                    </span>
                    <span className="text-[10px] text-slate-500">Total Shift Cost: ${projectedTotalShiftSpend.toLocaleString()}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Tab 3: Algorithmic Fairness & Shift Outcome Telemetry */}
      {activeTab === 'fairness_outcomes' && (
        <div className="space-y-6">
          {/* Shift Outcome Comparison: AI vs Override */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Shift Execution Outcome Benchmarks: AI vs Facility Override
                </h3>
                <p className="text-xs text-slate-500">
                  Continuous performance tracking comparing algorithmically recommended shifts vs manual manager overrides.
                </p>
              </div>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                Sample: 840 Completed Shifts
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* AI Recommended Matches */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 uppercase text-[11px] flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>AI Algorithmic Matches (768 Shifts)</span>
                  </span>
                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                    BENCHMARK LEAD
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Punctual Arrival Rate:</span>
                    <strong className="font-mono text-slate-900">98.4%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Ward Lead 5-Star Rating:</span>
                    <strong className="font-mono text-slate-900">4.96 / 5.0</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Incident-Free Handover:</span>
                    <strong className="font-mono text-emerald-700">99.2%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Late Cancellation Rate:</span>
                    <strong className="font-mono text-slate-900">0.8%</strong>
                  </div>
                </div>
              </div>

              {/* Manager Overridden Shifts */}
              <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-orange-950 uppercase text-[11px] flex items-center space-x-1.5">
                    <Sliders className="w-3.5 h-3.5 text-orange-600" />
                    <span>Manual Manager Overrides (72 Shifts)</span>
                  </span>
                  <span className="text-[9px] font-bold bg-orange-100 text-orange-800 px-1.5 py-0.2 rounded">
                    JUSTIFIED EXCEPTION
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Punctual Arrival Rate:</span>
                    <strong className="font-mono text-slate-900">96.2%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Ward Lead 5-Star Rating:</span>
                    <strong className="font-mono text-slate-900">4.88 / 5.0</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Incident-Free Handover:</span>
                    <strong className="font-mono text-emerald-700">98.1%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Late Cancellation Rate:</span>
                    <strong className="font-mono text-slate-900">1.9%</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fairness & Demographic Parity Monitoring */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Algorithmic Fairness & Equitable Distribution Audit
                </h3>
                <p className="text-xs text-slate-500">
                  Measuring demographic parity, experience band distribution, and calibration error to prevent systemic bias.
                </p>
              </div>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                Fairness Index: 0.98 (Parity Passed)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-slate-400">Mean Absolute Error (MAE)</span>
                <p className="text-xl font-black text-slate-900 font-mono mt-0.5">0.042</p>
                <p className="text-[10px] text-emerald-600 font-semibold">High predictive accuracy</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-slate-400">Calibration Brier Score</span>
                <p className="text-xl font-black text-slate-900 font-mono mt-0.5">0.038</p>
                <p className="text-[10px] text-emerald-600 font-semibold">Probability calibration optimal</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-slate-400">Demographic Disparity Ratio</span>
                <p className="text-xl font-black text-slate-900 font-mono mt-0.5">0.98 / 1.00</p>
                <p className="text-[10px] text-emerald-600 font-semibold">Zero adverse impact detected</p>
              </div>
            </div>

            {/* Experience Band Distribution Table */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
                Experience Tier Distribution Parity
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">Experience Tier</th>
                      <th className="p-2.5">Assigned Shift %</th>
                      <th className="p-2.5">Registry Pool %</th>
                      <th className="p-2.5">Equity Parity Ratio</th>
                      <th className="p-2.5">Audit Compliance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fairnessExperienceData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-bold text-slate-900">{row.tier}</td>
                        <td className="p-2.5 font-mono">{row.assignedPct}%</td>
                        <td className="p-2.5 font-mono text-slate-500">{row.candidatePoolPct}%</td>
                        <td className="p-2.5 font-mono font-bold text-emerald-700">{row.parityScore}</td>
                        <td className="p-2.5">
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                            PASSED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forecast Override Modal */}
      {isOverrideModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 bg-amber-50">
              <span className="text-[9px] font-bold uppercase tracking-widest text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                Governance Intervention
              </span>
              <h3 className="font-bold text-slate-900 text-sm mt-1">
                Override Predictive Staffing Target (ER-1)
              </h3>
              <p className="text-xs text-slate-600">
                Altering algorithmic recommendations requires compulsory clinical rationale to preserve the auditable feedback loop.
              </p>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                  Adjusted Nurse Headcount Target (FTE):
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={overrideFte}
                  onChange={(e) => setOverrideFte(parseInt(e.target.value) || 1)}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-xs font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                  Compulsory Clinical Rationale (Min 10 chars):
                </label>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Trauma redirection expected from sister facility due to regional bypass; patient acuity escalation anticipated..."
                  className="w-full bg-white border border-slate-300 rounded p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                onClick={() => setIsOverrideModalOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyForecastOverride}
                disabled={overrideReason.length < 10}
                className={`px-4 py-1.5 text-xs font-bold text-white rounded-md shadow-xs uppercase tracking-wider ${
                  overrideReason.length >= 10
                    ? 'bg-amber-600 hover:bg-amber-700 cursor-pointer'
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                Commit Override & Retrain
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
