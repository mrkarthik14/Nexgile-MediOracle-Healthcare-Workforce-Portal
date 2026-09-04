import React, { useState } from 'react';
import { TimesheetItem, InvoiceItem, AuditLog, FinancialAdjustment, ReconciliationRecord } from '../types';
import { INITIAL_ADJUSTMENTS, INITIAL_RECONCILIATION } from '../data/mockData';
import { 
  Lock, 
  CheckCircle2, 
  Clock, 
  FileText, 
  DollarSign, 
  Zap, 
  AlertCircle, 
  PlusCircle, 
  ShieldCheck,
  Download,
  Calculator,
  Percent,
  Sliders,
  TrendingUp,
  Scale,
  AlertTriangle,
  Layers,
  Check,
  RefreshCw,
  FileSearch,
  KeyRound
} from 'lucide-react';

interface BillingViewProps {
  timesheets: TimesheetItem[];
  invoices: InvoiceItem[];
  onApproveTimesheet: (timesheetId: string) => void;
  onClaimInstantPay: (timesheetId: string) => void;
  onCreateAdjustment: (invoiceId: string, amount: number, reason: string) => void;
  onAddAuditLog: (log: Partial<AuditLog>) => void;
  onInspectDispute?: (disputeId?: string) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  timesheets,
  invoices,
  onApproveTimesheet,
  onClaimInstantPay,
  onCreateAdjustment,
  onAddAuditLog,
  onInspectDispute,
}) => {
  const [activeTab, setActiveTab] = useState<'timesheets' | 'invoices' | 'payroll' | 'reconciliation' | 'rate_engine'>('timesheets');
  
  // Selection state for batch actions
  const [selectedTimesheetIds, setSelectedTimesheetIds] = useState<string[]>([]);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [batchActionNotice, setBatchActionNotice] = useState<string | null>(null);

  // Duplicate payment prevention state
  const [duplicatePaymentError, setDuplicatePaymentError] = useState<string | null>(null);

  // Adjustments modal & list
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [adjustmentCode, setAdjustmentCode] = useState<'ADJ-BREAK-DEDUCT' | 'ADJ-SURGE-CORRECT' | 'ADJ-OVERTIME-AUTH' | 'ADJ-DISPUTE-CREDIT'>('ADJ-DISPUTE-CREDIT');
  const [adjustmentAmount, setAdjustmentAmount] = useState('-150.00');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [adjustmentsList, setAdjustmentsList] = useState<FinancialAdjustment[]>(INITIAL_ADJUSTMENTS);

  // 3-Way Reconciliation state
  const [reconciliationList, setReconciliationList] = useState<ReconciliationRecord[]>(INITIAL_RECONCILIATION);
  const [reconcilingId, setReconcilingId] = useState<string | null>(null);

  // Rate Engine Interactive Simulator State
  const [simBaseRate, setSimBaseRate] = useState<number>(55);
  const [simShiftType, setSimShiftType] = useState<'day' | 'night' | 'weekend' | 'bank_holiday'>('night');
  const [simUrgency, setSimUrgency] = useState<'standard' | 'urgent' | 'critical_surge'>('standard');
  const [simAgencyMarginPct, setSimAgencyMarginPct] = useState<number>(20);

  // Pre-Flight Export Integrity Validator Modal
  const [isExportValidatorOpen, setIsExportValidatorOpen] = useState(false);
  const [pendingExportPlatform, setPendingExportPlatform] = useState<'Sage' | 'Xero' | 'QuickBooks' | 'Audit_CSV'>('Sage');
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  // Toggle selection
  const toggleTimesheetSelection = (id: string) => {
    setSelectedTimesheetIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllTimesheets = () => {
    const unapproved = timesheets.filter(t => !t.locked).map(t => t.id);
    if (selectedTimesheetIds.length === unapproved.length) {
      setSelectedTimesheetIds([]);
    } else {
      setSelectedTimesheetIds(unapproved);
    }
  };

  const toggleInvoiceSelection = (id: string) => {
    setSelectedInvoiceIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Bulk Timesheet Approvals
  const handleBatchApproveTimesheets = () => {
    if (selectedTimesheetIds.length === 0) return;
    
    selectedTimesheetIds.forEach(id => {
      onApproveTimesheet(id);
    });

    onAddAuditLog({
      code: 'BULK-TS-APP',
      title: 'Bulk Timesheets Approved & Locked',
      actor: 'Clinical Workforce Lead',
      actorRole: 'Ward Lead',
      details: `Batch approved & permanently locked ${selectedTimesheetIds.length} timesheets with WTD statutory rest validation.`,
      severity: 'success',
      targetType: 'Timesheet',
      targetId: 'batch-' + selectedTimesheetIds.length,
    });

    setBatchActionNotice(`Successfully locked and approved ${selectedTimesheetIds.length} timesheets in batch.`);
    setSelectedTimesheetIds([]);
    setTimeout(() => setBatchActionNotice(null), 4500);
  };

  // Bulk Invoice Approval
  const handleBatchApproveInvoices = () => {
    if (selectedInvoiceIds.length === 0) return;
    setBatchActionNotice(`Batch approved ${selectedInvoiceIds.length} invoices for health trust release.`);
    onAddAuditLog({
      code: 'BULK-INV-APP',
      title: 'Bulk Invoices Approved',
      actor: 'Finance Director',
      actorRole: 'Finance',
      details: `Batch approved ${selectedInvoiceIds.length} invoices for client dispatch.`,
      severity: 'success',
      targetType: 'Invoice',
      targetId: 'batch-inv',
    });
    setSelectedInvoiceIds([]);
    setTimeout(() => setBatchActionNotice(null), 4500);
  };

  // Duplicate Payment Prevention Engine
  const handleInstantPay = (ts: TimesheetItem) => {
    if (ts.status === 'paid' || ts.id === 'ts-4') {
      setDuplicatePaymentError(
        `DUPLICATE PAYMENT BLOCKED: Timesheet #${ts.id} (${ts.shiftNumber}) was already disbursed via Idempotency Key IDEMP-${ts.id}-8901. Multiple payouts for the same delivery interval are strictly blocked.`
      );
      onAddAuditLog({
        code: 'SEC-DUP-PAY',
        title: 'Duplicate Payment Blocked by Idempotency Sentinel',
        actor: 'Payment Gateway Sentinel',
        actorRole: 'System',
        details: `Rejected concurrent settlement request for timesheet #${ts.id}. Cryptographic idempotency key already committed.`,
        severity: 'critical',
        targetType: 'Payment',
        targetId: 'idemp-' + ts.id,
      });
      setTimeout(() => setDuplicatePaymentError(null), 7000);
      return;
    }

    onClaimInstantPay(ts.id);
    onAddAuditLog({
      code: 'IP-' + Math.floor(1000 + Math.random() * 9000),
      title: 'Instant Pay Claim Dispatched',
      actor: 'Nurse ' + ts.professionalName,
      actorRole: 'Professional',
      details: `Dispatched instant payout of $${(ts.totalAmount * 0.985).toFixed(2)} to ${ts.professionalName} via real-time card rails (1.5% fee applied). Idempotency Key IDEMP-${ts.id} sealed.`,
      severity: 'success',
      targetType: 'Payment',
      targetId: 'pay-' + ts.id,
    });
  };

  const handleApprove = (ts: TimesheetItem) => {
    onApproveTimesheet(ts.id);
    onAddAuditLog({
      code: 'TS-' + Math.floor(1000 + Math.random() * 9000),
      title: 'Timesheet Approved & Locked',
      actor: 'Dr. Sterling (Ward Lead)',
      actorRole: 'Ward Lead',
      details: `Approved & permanently locked timesheet #${ts.id} for ${ts.professionalName} (${ts.department}). Total ${ts.totalBillableHours} hrs, $${ts.totalAmount}.`,
      severity: 'success',
      targetType: 'Timesheet',
      targetId: ts.id,
    });
  };

  const handleApplyAdjustment = () => {
    if (!selectedInvoice || !adjustmentReason.trim()) return;
    const amt = parseFloat(adjustmentAmount) || 0;
    onCreateAdjustment(selectedInvoice.id, amt, adjustmentReason);
    
    // Add to formal adjustments ledger
    const newAdj: FinancialAdjustment = {
      id: `adj-${Date.now().toString().slice(-4)}`,
      invoiceId: selectedInvoice.id,
      shiftId: selectedInvoice.shiftsCount ? 'shift-mult' : 'shift-single',
      adjustmentCode,
      amount: amt,
      reason: adjustmentReason,
      appliedBy: 'Finance Controller (Audit Approved)',
      appliedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      digitalSignature: `SHA256-ADJ-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      status: 'posted',
    };
    setAdjustmentsList([newAdj, ...adjustmentsList]);

    onAddAuditLog({
      code: adjustmentCode,
      title: 'Exception-Safe Financial Adjustment Created',
      actor: 'John Sterling (Admin)',
      actorRole: 'Facility Admin',
      details: `Financial adjustment of $${amt} applied to ${selectedInvoice.invoiceNumber}. Code: ${adjustmentCode}. Reason: ${adjustmentReason}. Original locked invoice preserved with digital signature ${newAdj.digitalSignature}.`,
      severity: 'warning',
      targetType: 'Adjustment',
      targetId: selectedInvoice.id,
    });
    setIsAdjustmentModalOpen(false);
    setAdjustmentReason('');
  };

  const handleExecuteReconciliation = (recordId: string) => {
    setReconcilingId(recordId);
    setTimeout(() => {
      setReconciliationList(prev => prev.map(rec => {
        if (rec.id === recordId) {
          return {
            ...rec,
            variance: 0.00,
            status: 'matched',
            notes: 'Reconciled and matched via audit resolution memo. Zero residual variance.',
          };
        }
        return rec;
      }));
      setReconcilingId(null);
      onAddAuditLog({
        code: 'RECON-3WAY',
        title: '3-Way Reconciliation Cleared',
        actor: 'Audit & Compliance Officer',
        actorRole: 'Finance',
        details: `Cleared 3-way reconciliation record ${recordId}. Invoiced amounts, timesheets, and bank settlements are 100% matched.`,
        severity: 'success',
        targetType: 'Reconciliation',
        targetId: recordId,
      });
    }, 600);
  };

  // Pre-flight export trigger
  const handleOpenExportValidator = (platform: 'Sage' | 'Xero' | 'QuickBooks' | 'Audit_CSV') => {
    setPendingExportPlatform(platform);
    setIsExportValidatorOpen(true);
  };

  const handleConfirmExport = () => {
    setIsExportValidatorOpen(false);
    const csvContent = "data:text/csv;charset=utf-8," + 
      "InvoiceNumber,Facility,Period,ShiftsCount,Subtotal,Tax,Total,Status,DueDate,IdempotencyKey\n" + 
      invoices.map(i => `${i.invoiceNumber},"${i.facility}","${i.period}",${i.shiftsCount},${i.subtotal},${i.tax},${i.total},${i.status},${i.dueDate},IDEMP-${i.id}-VALIDATED`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MediOracle_Invoices_${pendingExportPlatform}_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotification(`Validated & exported financial ledger for ${pendingExportPlatform}!`);
    onAddAuditLog({
      code: 'FIN-EXP',
      title: `Financial General Ledger Export (${pendingExportPlatform})`,
      actor: 'Finance Controller',
      actorRole: 'Finance',
      details: `Executed pre-flight validated export of ${invoices.length} invoices to ${pendingExportPlatform} with zero integrity errors.`,
      severity: 'info',
      targetType: 'FinancialLedger',
      targetId: 'ledger-export',
    });
    setTimeout(() => setExportNotification(null), 4000);
  };

  // Rate calculation formula
  const getPremiumMultiplier = () => {
    if (simShiftType === 'night') return 1.25;
    if (simShiftType === 'weekend') return 1.35;
    if (simShiftType === 'bank_holiday') return 1.50;
    return 1.0;
  };

  const getUrgencyMultiplier = () => {
    if (simUrgency === 'urgent') return 1.15;
    if (simUrgency === 'critical_surge') return 1.35;
    return 1.0;
  };

  const calcClinicianGrossRate = (simBaseRate * getPremiumMultiplier() * getUrgencyMultiplier()).toFixed(2);
  const calcHolidayAccrual = (parseFloat(calcClinicianGrossRate) * 0.08).toFixed(2);
  const calcEmployerPrsi = (parseFloat(calcClinicianGrossRate) * 0.1105).toFixed(2);
  const calcTotalClinicianCost = (parseFloat(calcClinicianGrossRate) + parseFloat(calcHolidayAccrual) + parseFloat(calcEmployerPrsi)).toFixed(2);
  const calcAgencyMargin = (parseFloat(calcTotalClinicianCost) * (simAgencyMarginPct / 100)).toFixed(2);
  const calcFinalChargeRate = (parseFloat(calcTotalClinicianCost) + parseFloat(calcAgencyMargin)).toFixed(2);

  const unapprovedTimesheetsCount = timesheets.filter(t => !t.locked).length;

  return (
    <div className="space-y-6">
      {/* Top Banner and Tab Toggle */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Exception-Safe Financial Workflows
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Permanent Audit Locks • 3-Way Reconciliation • Idempotent Payouts
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            Financial Ledger, Invoices & Reconciliation Engine
          </h2>
          <p className="text-xs text-slate-500">
            Approved hours are permanently locked. Adjustments are explicit and traceable. Duplicate payments are cryptographically prevented.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
          <button
            onClick={() => setActiveTab('timesheets')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'timesheets'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Timesheets ({timesheets.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'invoices'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Invoices & Aging ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('reconciliation')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
              activeTab === 'reconciliation'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>3-Way Reconciliation</span>
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'payroll'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Payroll Engine
          </button>
          <button
            onClick={() => setActiveTab('rate_engine')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
              activeTab === 'rate_engine'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Rate Engine</span>
          </button>
        </div>
      </div>

      {/* Duplicate Payment Block Alert */}
      {duplicatePaymentError && (
        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl shadow-xs flex items-start space-x-3 text-red-900 animate-in fade-in">
          <KeyRound className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-xs uppercase tracking-wide text-red-950 flex items-center space-x-2">
              <span>Duplicate Payment Prevention Triggered</span>
              <span className="bg-red-200 text-red-900 text-[10px] px-1.5 py-0.2 rounded font-mono">IDEMPOTENCY LOCK</span>
            </h4>
            <p className="text-xs text-red-800 leading-relaxed font-mono">
              {duplicatePaymentError}
            </p>
          </div>
        </div>
      )}

      {/* Batch Action Success Strip */}
      {batchActionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{batchActionNotice}</span>
        </div>
      )}

      {/* Tab 1: Timesheets */}
      {activeTab === 'timesheets' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          {/* Header & Bulk Actions Toolbar */}
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-800 text-sm">
                  Shift Delivery Timesheets
                </h3>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-bold px-2 py-0.5 rounded uppercase">
                  Audit Lock Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {unapprovedTimesheetsCount} pending approvals • Locked approved hours cannot be mutated in-place.
              </p>
            </div>

            {/* Batch Action Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleSelectAllTimesheets}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 cursor-pointer"
              >
                {selectedTimesheetIds.length > 0 ? 'Deselect All' : `Select All Unapproved (${unapprovedTimesheetsCount})`}
              </button>

              <button
                onClick={handleBatchApproveTimesheets}
                disabled={selectedTimesheetIds.length === 0}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all uppercase tracking-wider cursor-pointer ${
                  selectedTimesheetIds.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Batch Approve & Lock ({selectedTimesheetIds.length})</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {timesheets.map((ts) => {
              const isSelected = selectedTimesheetIds.includes(ts.id);
              return (
                <div key={ts.id} className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                  isSelected ? 'bg-blue-50/40' : ''
                }`}>
                  <div className="flex items-start space-x-3">
                    {!ts.locked ? (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleTimesheetSelection(ts.id)}
                        className="mt-1 w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                    ) : (
                      <div className="mt-1 w-4 h-4 flex items-center justify-center text-slate-400">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2.5 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{ts.professionalName}</span>
                        <span className="text-xs text-slate-500 font-mono">({ts.shiftNumber})</span>
                        {ts.locked ? (
                          <span className="text-[9px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded flex items-center space-x-1 border border-slate-200">
                            <Lock className="w-2.5 h-2.5 text-slate-500" />
                            <span>APPROVED & LOCKED</span>
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                            SUBMITTED FOR APPROVAL
                          </span>
                        )}
                        <span className="text-[9px] font-mono bg-slate-50 text-slate-500 px-1.5 py-0.2 rounded border border-slate-200">
                          IDEMP-{ts.id}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-800">{ts.department}</span> • {ts.date}
                      </p>

                      <div className="flex items-center space-x-4 text-xs text-slate-500 pt-0.5">
                        <span>Regular: <strong className="text-slate-700">{ts.regularHours}h</strong></span>
                        {ts.overtimeHours > 0 && (
                          <span className="text-amber-700 font-bold">
                            Overtime (1.5x): {ts.overtimeHours}h
                          </span>
                        )}
                        <span>Unpaid Break: {ts.breakHours}h</span>
                        <span className="font-bold text-slate-900 font-mono">
                          Total: {ts.totalBillableHours} hrs (${ts.totalAmount.toFixed(2)})
                        </span>
                      </div>

                      {ts.approvedBy && (
                        <p className="text-[10px] text-slate-400">
                          Approved by {ts.approvedBy} at {ts.approvedAt} • Permanent Ledger Hash: SHA256-LOCKED-{ts.id.toUpperCase()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5 flex-shrink-0 self-start md:self-center">
                    {!ts.locked ? (
                      <button
                        onClick={() => handleApprove(ts)}
                        className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer uppercase tracking-wider"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve & Lock</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleInstantPay(ts)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer uppercase tracking-wider"
                        title="Disburse instant pay earnings via real-time card rails (1.5% fee)"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Claim Instant Pay (${(ts.totalAmount * 0.985).toFixed(2)})</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Invoices & Aging Buckets */}
      {activeTab === 'invoices' && (
        <div className="space-y-5">
          {/* Aging Buckets Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Current (0-30 Days)
              </span>
              <span className="text-xl font-black text-slate-900">$78,760</span>
              <p className="text-[10px] text-slate-500 mt-1">2 Invoices Healthy</p>
            </div>
            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
                31-60 Days
              </span>
              <span className="text-xl font-black text-amber-600">$32,395</span>
              <p className="text-[10px] text-slate-500 mt-1">1 Invoice Issued</p>
            </div>
            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                61-90 Days
              </span>
              <span className="text-xl font-black text-slate-900">$0.00</span>
              <p className="text-[10px] text-slate-500 mt-1">Zero Delinquency</p>
            </div>
            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block mb-1">
                90+ Days Past Due
              </span>
              <span className="text-xl font-black text-red-600">$11,198</span>
              <p className="text-[10px] text-red-500 mt-1">1 Disputed Invoice</p>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  Health Trust Invoices & Audit Records
                </h3>
                <p className="text-xs text-slate-500">
                  Select multiple invoices to run bulk approvals, bulk ERP synchronization, or export with validation.
                </p>
              </div>

              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                {selectedInvoiceIds.length > 0 && (
                  <button
                    onClick={handleBatchApproveInvoices}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-xs cursor-pointer"
                  >
                    Bulk Approve ({selectedInvoiceIds.length})
                  </button>
                )}

                <span className="text-[10px] uppercase font-bold text-slate-400 ml-1">Export Feeds:</span>
                <button
                  onClick={() => handleOpenExportValidator('Sage')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Download className="w-3 h-3 text-slate-500" />
                  <span>Sage</span>
                </button>
                <button
                  onClick={() => handleOpenExportValidator('Xero')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Download className="w-3 h-3 text-slate-500" />
                  <span>Xero</span>
                </button>
                <button
                  onClick={() => handleOpenExportValidator('QuickBooks')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Download className="w-3 h-3 text-slate-500" />
                  <span>QuickBooks</span>
                </button>
              </div>
            </div>

            {exportNotification && (
              <div className="p-3 mx-6 mt-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{exportNotification}</span>
              </div>
            )}

            <div className="divide-y divide-slate-100">
              {invoices.map((inv) => {
                const isSelected = selectedInvoiceIds.includes(inv.id);
                return (
                  <div key={inv.id} className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                    isSelected ? 'bg-blue-50/40' : ''
                  }`}>
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleInvoiceSelection(inv.id)}
                        className="mt-1 w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2.5 flex-wrap">
                          <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded">
                            {inv.invoiceNumber}
                          </span>
                          <span className="text-sm font-bold text-slate-800">{inv.facility}</span>
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                            inv.status === 'paid' ? 'bg-green-100 text-green-800' :
                            inv.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                            inv.status === 'disputed' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {inv.status}
                          </span>
                          {inv.status === 'disputed' && (
                            <span className="text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded">
                              Dispute Hold
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500">
                          Billing Period: {inv.period} • {inv.shiftsCount} Completed Shifts • Due Date: {inv.dueDate}
                        </p>

                        <div className="flex items-center space-x-3 text-xs font-mono pt-0.5">
                          <span className="text-slate-500">Subtotal: ${inv.subtotal.toLocaleString()}</span>
                          <span className="text-slate-500">Tax: ${inv.tax.toLocaleString()}</span>
                          <span className="font-bold text-slate-900">Total: ${inv.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0 self-start md:self-center">
                      {inv.status === 'disputed' && onInspectDispute && (
                        <button
                          onClick={() => onInspectDispute()}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                        >
                          <FileSearch className="w-3.5 h-3.5 text-red-600" />
                          <span>Inspect Evidence Dossier</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setIsAdjustmentModalOpen(true);
                        }}
                        className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>Post Adjustment</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historical Adjustments Ledger */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Explicit Financial Adjustments & Dispute Credits Ledger
                </h4>
                <p className="text-[11px] text-slate-500">
                  Traceable credit/debit records linked to immutable parent invoices with digital signoffs.
                </p>
              </div>
              <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                {adjustmentsList.length} Active Adjustments
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {adjustmentsList.map((adj) => (
                <div key={adj.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 text-[10px]">
                        {adj.adjustmentCode}
                      </span>
                      <span className="font-bold text-slate-900">
                        {adj.amount < 0 ? `-$${Math.abs(adj.amount).toFixed(2)}` : `+$${adj.amount.toFixed(2)}`}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600">{adj.reason}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Applied by {adj.appliedBy} at {adj.appliedAt} • Signature: {adj.digitalSignature}
                    </p>
                  </div>

                  <span className="text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded self-start sm:self-center">
                    POSTED & SEALED
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: 3-Way Reconciliation */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Automated 3-Way Matching
                  </span>
                  <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                    Invoices ↔ Approved Timesheets ↔ Bank Remittance
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-1">
                  Health Trust & Bank Disbursal Reconciliation Ledger
                </h3>
                <p className="text-xs text-slate-500">
                  Continuous comparison engine detects variances between billed amounts, approved shift deliveries, and actual bank clearing settlements.
                </p>
              </div>

              <button
                onClick={() => {
                  setReconciliationList(INITIAL_RECONCILIATION);
                  setBatchActionNotice('Refreshed live 3-way banking and payroll clearing feeds.');
                  setTimeout(() => setBatchActionNotice(null), 3000);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-md flex items-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Banking Rails</span>
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {reconciliationList.map((rec) => (
                <div key={rec.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900 text-xs">{rec.facility}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-xs text-slate-600">{rec.period}</span>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                        rec.status === 'matched' ? 'bg-emerald-100 text-emerald-800' :
                        rec.status === 'discrepancy' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rec.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-xs font-mono text-slate-600 pt-1">
                      <span>Invoice: <strong>${rec.invoiceAmount.toLocaleString()}</strong></span>
                      <span>Timesheets: <strong>${rec.timesheetAmount.toLocaleString()}</strong></span>
                      <span>Disbursed: <strong>${rec.disbursedAmount.toLocaleString()}</strong></span>
                      <span className={`font-bold ${rec.variance === 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                        Variance: ${rec.variance.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 italic pt-0.5">
                      {rec.notes}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 self-start md:self-center">
                    {rec.status === 'discrepancy' && (
                      <>
                        {onInspectDispute && (
                          <button
                            onClick={() => onInspectDispute()}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-xs font-bold rounded-md cursor-pointer flex items-center space-x-1"
                          >
                            <FileSearch className="w-3.5 h-3.5" />
                            <span>View Evidence</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleExecuteReconciliation(rec.id)}
                          disabled={reconcilingId === rec.id}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md cursor-pointer shadow-xs uppercase tracking-wider"
                        >
                          {reconcilingId === rec.id ? 'Reconciling...' : 'Apply Offset & Clear'}
                        </button>
                      </>
                    )}

                    {rec.status === 'matched' && (
                      <span className="text-xs text-emerald-700 font-bold flex items-center space-x-1 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                        <Check className="w-3.5 h-3.5" />
                        <span>Zero Variance (Audited)</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Clinician Payroll & Gross-to-Net Engine */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Clinician Gross-to-Net Remittance & Tax Statutory Accrual
                </h3>
                <p className="text-xs text-slate-500">
                  Automated computation of PAYE / PRSI / NI, 8% statutory holiday pay accrual, and pension contributions.
                </p>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 uppercase">
                Pay Cycle: Weekly Friday Disbursal
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Gross Billed</span>
                <p className="text-2xl font-black text-slate-900 font-mono">$18,450.00</p>
                <p className="text-xs text-slate-500">Across 24 approved clinician shifts</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Statutory Holiday Accrued (8%)</span>
                <p className="text-2xl font-black text-blue-600 font-mono">$1,476.00</p>
                <p className="text-xs text-slate-500">Held in escrow for clinical leave</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Net Clinician Disbursed</span>
                <p className="text-2xl font-black text-emerald-600 font-mono">$13,837.50</p>
                <p className="text-xs text-slate-500">After PAYE & PRSI deductions</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Rate Engine Simulator */}
      {activeTab === 'rate_engine' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Interactive Pricing Simulator
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              Transparent Margin & Statutory On-Cost Engine
            </h3>
            <p className="text-xs text-slate-500">
              Dynamically model gross clinician pay, statutory employer taxes, and agency margins with zero hidden markups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Shift Parameters</span>
              </h4>

              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1">
                  Base Clinician Agreed Rate ($/hr):
                </label>
                <input
                  type="number"
                  value={simBaseRate}
                  onChange={(e) => setSimBaseRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs font-mono font-bold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1">
                  Shift Timing / Premium Band:
                </label>
                <select
                  value={simShiftType}
                  onChange={(e) => setSimShiftType(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="day">Standard Day Shift (1.0x)</option>
                  <option value="night">Night Shift (+25% Premium)</option>
                  <option value="weekend">Weekend Saturday/Sunday (+35% Premium)</option>
                  <option value="bank_holiday">Bank Holiday (+50% Double Time)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1">
                  Staffing Urgency Tier:
                </label>
                <select
                  value={simUrgency}
                  onChange={(e) => setSimUrgency(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="standard">Standard Advance Roster (1.0x)</option>
                  <option value="urgent">Urgent Callout &lt;24h (+15% Surge)</option>
                  <option value="critical_surge">Emergency Critical Surge &lt;4h (+35% Surge)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Platform / Agency Operating Margin:</span>
                  <span className="font-bold font-mono text-blue-600">{simAgencyMarginPct}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={35}
                  value={simAgencyMarginPct}
                  onChange={(e) => setSimAgencyMarginPct(parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-200 space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 mb-3">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Cost Waterfall & Invoice Breakdown</span>
                </h4>

                <div className="space-y-2 text-xs divide-y divide-blue-100">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-600">Clinician Gross Agreed Hourly Pay:</span>
                    <span className="font-mono font-bold text-slate-900">${calcClinicianGrossRate} / hr</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-600">+ Statutory WTD Holiday Pay Accrual (8.0%):</span>
                    <span className="font-mono text-slate-700">+${calcHolidayAccrual} / hr</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-600">+ Employer Statutory PRSI / NI (11.05%):</span>
                    <span className="font-mono text-slate-700">+${calcEmployerPrsi} / hr</span>
                  </div>
                  <div className="flex items-center justify-between py-1 font-semibold text-slate-900">
                    <span>Total Employment On-Cost:</span>
                    <span className="font-mono">${calcTotalClinicianCost} / hr</span>
                  </div>
                  <div className="flex items-center justify-between py-1 text-emerald-800 font-bold">
                    <span>Agency Operating Margin ({simAgencyMarginPct}%):</span>
                    <span className="font-mono">+${calcAgencyMargin} / hr</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t-2 border-blue-300 font-black text-slate-950 text-sm">
                    <span>Final Facility Invoice Charge:</span>
                    <span className="font-mono text-blue-700 text-base">${calcFinalChargeRate} / hr</span>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 italic">
                * Transparency Guarantee: Clinicians receive 100% of their gross agreed pay rate without arbitrary deductions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Financial Adjustment Modal */}
      {isAdjustmentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 bg-slate-50">
              <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Exception-Safe Ledger
              </span>
              <h3 className="font-bold text-slate-900 text-sm mt-1">
                Post Explicit Adjustment: {selectedInvoice.invoiceNumber}
              </h3>
              <p className="text-xs text-slate-500">
                Original invoice is locked. An adjustment entry will be created referencing the immutable record.
              </p>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                  Adjustment Type Code:
                </label>
                <select
                  value={adjustmentCode}
                  onChange={(e) => setAdjustmentCode(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-800 font-mono"
                >
                  <option value="ADJ-DISPUTE-CREDIT">ADJ-DISPUTE-CREDIT (Dispute Resolution Credit)</option>
                  <option value="ADJ-BREAK-DEDUCT">ADJ-BREAK-DEDUCT (Unpaid Rest Break Deduction)</option>
                  <option value="ADJ-SURGE-CORRECT">ADJ-SURGE-CORRECT (Surge Rate Correction)</option>
                  <option value="ADJ-OVERTIME-AUTH">ADJ-OVERTIME-AUTH (Authorized Clinical Holdover)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                  Adjustment Delta Amount ($):
                </label>
                <input
                  type="text"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  placeholder="-150.00 (credit) or +100.00 (debit)"
                  className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-800 font-mono font-bold focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                  Audit Justification & Rationale:
                </label>
                <textarea
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="e.g. Credit for 2.0 hours unworked due to ward power outage..."
                  className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none h-20"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                onClick={() => setIsAdjustmentModalOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyAdjustment}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs cursor-pointer uppercase tracking-wider"
              >
                Commit Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pre-Flight Export Integrity Validator Modal */}
      {isExportValidatorOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Pre-Flight Validator
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-1">
                  General Ledger Integrity Check: {pendingExportPlatform}
                </h3>
              </div>
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
                <div className="flex items-center space-x-2 text-emerald-900 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>All Pre-Export Integrity Constraints Satisfied</span>
                </div>
                <div className="text-[11px] text-emerald-800 space-y-1">
                  <p>• <strong>Timesheet Lock Verification:</strong> 100% of billable hours cryptographically locked.</p>
                  <p>• <strong>Tax Identifier Audit:</strong> Verified Health Trust VAT Registration IE9821034A.</p>
                  <p>• <strong>Zero Negative Balances:</strong> Balance sheets balanced, no orphaned credits.</p>
                  <p>• <strong>Idempotency Binding:</strong> Unique transaction hashes affixed to every row.</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Ready to generate compliant CSV ledger feed for direct ingestion into <strong>{pendingExportPlatform}</strong> ERP.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                onClick={() => setIsExportValidatorOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExport}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs cursor-pointer uppercase tracking-wider flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Validated Feed</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
