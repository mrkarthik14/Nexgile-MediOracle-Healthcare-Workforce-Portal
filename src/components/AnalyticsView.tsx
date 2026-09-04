import React from 'react';
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

export const AnalyticsView: React.FC = () => {
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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Executive Analytics & Telemetry
          </span>
          <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded font-bold">
            Real-time Aggregation
          </span>
        </div>
        <h2 className="text-base font-bold text-slate-900 mt-1">
          Workforce Utilization, Acuity & Spend Efficiency
        </h2>
        <p className="text-xs text-slate-500">
          Tracking fill rate velocity, surge premium ratios, and automated match performance metrics.
        </p>
      </div>

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
        {/* Weekly Fill Rate Trend */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
            Weekly Fill Rate Telemetry (%)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillRateGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                  formatter={(val: any) => [`${val}%`, 'Fill Rate']}
                />
                <Area type="monotone" dataKey="fillRate" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#fillRateGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ward Staffing & Vacancy Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
            Departmental Staffing vs Open Vacancies
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardAcuityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="ward" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="filled" name="Filled Staff" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="vacancies" name="Open Vacancies" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
