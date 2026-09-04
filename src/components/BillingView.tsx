import React, { useState } from 'react';
import { TimesheetItem, InvoiceItem, AuditLog } from '../types';
import { 
  Lock, 
  CheckCircle2, 
  Clock, 
  FileText, 
  DollarSign, 
  Zap, 
  AlertCircle, 
  PlusCircle, 
  ShieldCheck 
} from 'lucide-react';

interface BillingViewProps {
  timesheets: TimesheetItem[];
  invoices: InvoiceItem[];
  onApproveTimesheet: (timesheetId: string) => void;
  onClaimInstantPay: (timesheetId: string) => void;
  onCreateAdjustment: (invoiceId: string, amount: number, reason: string) => void;
  onAddAuditLog: (log: Partial<AuditLog>) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  timesheets,
  invoices,
  onApproveTimesheet,
  onClaimInstantPay,
  onCreateAdjustment,
  onAddAuditLog,
}) => {
  const [activeTab, setActiveTab] = useState<'timesheets' | 'invoices'>('timesheets');
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('-150.00');
  const [adjustmentReason, setAdjustmentReason] = useState('');

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

  const handleInstantPay = (ts: TimesheetItem) => {
    onClaimInstantPay(ts.id);
    onAddAuditLog({
      code: 'IP-' + Math.floor(1000 + Math.random() * 9000),
      title: 'Instant Pay Claim Dispatched',
      actor: 'Nurse ' + ts.professionalName,
      actorRole: 'Professional',
      details: `Dispatched instant payout of $${(ts.totalAmount * 0.985).toFixed(2)} to ${ts.professionalName} via real-time card rails (1.5% fee applied).`,
      severity: 'success',
      targetType: 'Payment',
      targetId: 'pay-' + ts.id,
    });
  };

  const handleApplyAdjustment = () => {
    if (!selectedInvoice || !adjustmentReason.trim()) return;
    const amt = parseFloat(adjustmentAmount) || 0;
    onCreateAdjustment(selectedInvoice.id, amt, adjustmentReason);
    onAddAuditLog({
      code: 'ADJ-' + Math.floor(1000 + Math.random() * 9000),
      title: 'Exception-Safe Financial Adjustment',
      actor: 'John Sterling (Admin)',
      actorRole: 'Facility Admin',
      details: `Financial adjustment of $${amt} applied to ${selectedInvoice.invoiceNumber}. Reason: ${adjustmentReason}. Original locked invoice preserved.`,
      severity: 'warning',
      targetType: 'Adjustment',
      targetId: selectedInvoice.id,
    });
    setIsAdjustmentModalOpen(false);
    setAdjustmentReason('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Tab Toggle */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Financial Integrity & Remittance
            </span>
            <span className="text-xs text-slate-500 font-medium">
              QuerySet-Level Immutability Enforced
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            Timesheets, Invoices & Instant Remittance
          </h2>
          <p className="text-xs text-slate-500">
            Locked timesheets prevent post-approval mutation. Exception adjustments maintain full double-entry audit linkage.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('timesheets')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'timesheets'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Digital Timesheets ({timesheets.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'invoices'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Facility Invoices & Aging ({invoices.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Timesheets */}
      {activeTab === 'timesheets' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">
              Shift Delivery Timesheets
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              Audit Lock Enabled
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {timesheets.map((ts) => (
              <div key={ts.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                      Approved by {ts.approvedBy} at {ts.approvedAt}
                    </p>
                  )}
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
            ))}
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
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">
                Health Trust Invoices & Audit Records
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <div key={inv.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
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

                  <div className="flex items-center space-x-2 flex-shrink-0 self-start md:self-center">
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
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Financial Adjustment Modal */}
      {isAdjustmentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 bg-slate-50">
              <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Exception-Safe Ledger
              </span>
              <h3 className="font-bold text-slate-900 text-sm mt-1">
                Post Adjustment: {selectedInvoice.invoiceNumber}
              </h3>
              <p className="text-xs text-slate-500">
                Original invoice is locked. An adjustment entry will be created referencing the immutable record.
              </p>
            </div>

            <div className="p-5 space-y-4 text-xs">
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
                  Audit Justification & Reason:
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
    </div>
  );
};
