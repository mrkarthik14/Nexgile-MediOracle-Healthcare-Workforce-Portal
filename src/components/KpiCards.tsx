import React from 'react';

interface KpiCardsProps {
  fillRate?: number;
  openShiftsCount?: number;
  criticalCount?: number;
  budgetSpentFormatted?: string;
  budgetTotalFormatted?: string;
  complianceScore?: number;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  fillRate = 94.2,
  openShiftsCount = 18,
  criticalCount = 4,
  budgetSpentFormatted = '$42.1k',
  budgetTotalFormatted = '$60k',
  complianceScore = 100,
}) => {
  return (
    <section id="kpi-strip" className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {/* 1. Fill Rate */}
      <div id="kpi-fill-rate" className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm transition-all hover:border-slate-300">
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
          Fill Rate (Weekly)
        </p>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold tracking-tight text-slate-900">
            {fillRate}%
          </span>
          <span className="text-xs text-green-600 font-bold">
            ↑ 2.1%
          </span>
        </div>
      </div>

      {/* 2. Open Shifts */}
      <div id="kpi-open-shifts" className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm transition-all hover:border-slate-300">
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
          Open Shifts
        </p>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold tracking-tight text-slate-900">
            {openShiftsCount}
          </span>
          <span className="text-xs text-red-500 font-bold">
            {criticalCount} Critical
          </span>
        </div>
      </div>

      {/* 3. Budget Utilized */}
      <div id="kpi-budget-utilized" className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm transition-all hover:border-slate-300">
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
          Budget Utilized
        </p>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold tracking-tight text-slate-900">
            {budgetSpentFormatted}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            of {budgetTotalFormatted}
          </span>
        </div>
      </div>

      {/* 4. Compliance Health */}
      <div id="kpi-compliance-health" className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm transition-all hover:border-slate-300">
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
          Compliance Health
        </p>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold tracking-tight text-blue-600">
            {complianceScore}%
          </span>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Verified
          </span>
        </div>
      </div>
    </section>
  );
};
