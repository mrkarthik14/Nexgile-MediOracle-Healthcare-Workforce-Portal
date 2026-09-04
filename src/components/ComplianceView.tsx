import React, { useState } from 'react';
import { ComplianceRule, CredentialItem, AuditLog } from '../types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Scan, 
  AlertTriangle, 
  Clock, 
  Building2,
  RefreshCw
} from 'lucide-react';

interface ComplianceViewProps {
  rules: ComplianceRule[];
  onUpdateRule: (id: string, newNumericValue: number) => void;
  onVerifyCredential: (credId: string, decision: 'verified' | 'rejected') => void;
  onAddAuditLog: (log: Partial<AuditLog>) => void;
}

export const ComplianceView: React.FC<ComplianceViewProps> = ({
  rules,
  onUpdateRule,
  onVerifyCredential,
  onAddAuditLog,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'queue' | 'ocr'>('rules');
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [tempRuleValue, setTempRuleValue] = useState<number>(11);

  // Mock pending credentials in the verification queue
  const [pendingCredentials, setPendingCredentials] = useState<any[]>([
    {
      id: 'cred-101',
      candidateName: 'Elena Rostova',
      role: 'Registered Nurse',
      documentType: 'State Nursing Practicing License',
      licenseNumber: 'RN-2026-99120',
      issuer: 'State Board of Nursing / NMC',
      expiryDate: '2027-12-31',
      submittedDate: 'Today, 08:30 AM',
      status: 'pending',
      ocrMatchConfidence: 97.4,
    },
    {
      id: 'cred-102',
      candidateName: 'Marcus Vance',
      role: 'Healthcare Assistant (HCA)',
      documentType: 'Pediatric Advanced Life Support (PALS)',
      licenseNumber: 'PALS-2026-88',
      issuer: 'American Heart Association',
      expiryDate: '2026-10-15',
      submittedDate: 'Yesterday, 16:45 PM',
      status: 'pending',
      ocrMatchConfidence: 94.8,
    }
  ]);

  // OCR Simulator State
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);

  const handleSimulateScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        detected_type: 'State Board Registered Nurse Practicing License',
        issuer: 'State Board of Nursing / NMC Registry',
        license_number: 'RN-2024-88491',
        extracted_expiry: '2027-12-31',
        candidate_name: 'Sarah Chen',
        confidence_score: 0.982,
        primary_source_check: 'PASS - Active & In Good Standing',
        sanctions_found: 'NONE',
      });
      onAddAuditLog({
        code: 'OCR-5510',
        title: 'OCR Extraction & Registry Verified',
        actor: 'Compliance OCR Engine',
        actorRole: 'System',
        details: 'Automated OCR extraction verified RN-2024-88491 against primary state licensing database with 98.2% confidence.',
        severity: 'info',
        targetType: 'Credential',
        targetId: 'cred-ocr-1',
      });
    }, 1200);
  };

  const handleDecision = (credId: string, decision: 'verified' | 'rejected') => {
    const cred = pendingCredentials.find(c => c.id === credId);
    if (!cred) return;

    setPendingCredentials(pendingCredentials.filter(c => c.id !== credId));
    onVerifyCredential(credId, decision);

    onAddAuditLog({
      code: decision === 'verified' ? 'CV-8821' : 'CR-8822',
      title: decision === 'verified' ? 'Credential Verified' : 'Credential Rejected',
      actor: 'Patricia Ramos (Auditor)',
      actorRole: 'Compliance Officer',
      details: `${decision.toUpperCase()} credential "${cred.documentType}" (${cred.licenseNumber}) for ${cred.candidateName}. Primary source registry matched.`,
      severity: decision === 'verified' ? 'success' : 'warning',
      targetType: 'Credential',
      targetId: credId,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Navigation */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Regulatory Safeguards & Governance
            </span>
            <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded font-bold">
              100% Verified Rate
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            Clinical Compliance & Regulatory Governance
          </h2>
          <p className="text-xs text-slate-500">
            Enforcing jurisdictional rest periods (11h gap), weekly caps (48h), and primary source credential registry checks.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'rules' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Policy Rules
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer relative ${
              activeTab === 'queue' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Verification Queue
            {pendingCredentials.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 text-[9px] bg-red-500 text-white rounded-full">
                {pendingCredentials.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('ocr')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'ocr' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            OCR Document Scanner
          </button>
        </div>
      </div>

      {/* Tab 1: Configurable Compliance Rules */}
      {activeTab === 'rules' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">
              Jurisdictional & Facility Rules Engine (No Hardcoded Constants)
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              Live Governance Matrix
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {rules.map((rule) => {
              const isEditing = editingRuleId === rule.id;

              return (
                <div key={rule.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-bold text-slate-900">{rule.name}</h4>
                      <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">
                        {rule.scope}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                      {rule.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 self-start md:self-center flex-shrink-0">
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          step="0.5"
                          value={tempRuleValue}
                          onChange={(e) => setTempRuleValue(parseFloat(e.target.value) || 0)}
                          className="w-20 text-xs p-1.5 border border-blue-500 rounded bg-white text-slate-900 font-bold font-mono"
                        />
                        <button
                          onClick={() => {
                            onUpdateRule(rule.id, tempRuleValue);
                            setEditingRuleId(null);
                            onAddAuditLog({
                              code: 'CR-POL99',
                              title: 'Compliance Rule Parameter Updated',
                              actor: 'John Sterling (Admin)',
                              actorRole: 'Facility Admin',
                              details: `Updated "${rule.name}" limit value to ${tempRuleValue}. Dynamic recalculation triggered across candidate matching.`,
                              severity: 'warning',
                              targetType: 'ComplianceRule',
                              targetId: rule.id,
                            });
                          }}
                          className="px-2.5 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingRuleId(null)}
                          className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <span className="text-lg font-black text-blue-600 font-mono">
                            {rule.numericValue} {rule.ruleType.includes('hours') ? 'hrs' : 'days'}
                          </span>
                          <span className="block text-[9px] uppercase font-bold text-slate-400">
                            Threshold
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setEditingRuleId(rule.id);
                            setTempRuleValue(rule.numericValue);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md cursor-pointer transition-colors"
                        >
                          Configure
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Verification Queue */}
      {activeTab === 'queue' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">
              Clinical Credential Verification Review Queue
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">
              Primary Source Checking Enabled
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingCredentials.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="font-bold text-slate-800 text-sm">Verification Queue is Clear</p>
                <p className="text-slate-400 text-xs mt-0.5">All uploaded certifications have been validated against official registries.</p>
              </div>
            ) : (
              pendingCredentials.map((cred) => (
                <div key={cred.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{cred.candidateName}</span>
                      <span className="text-[10px] text-slate-500">({cred.role})</span>
                      <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold border border-blue-200">
                        OCR Confidence: {cred.ocrMatchConfidence}%
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-800">{cred.documentType}</p>
                    <p className="text-xs text-slate-500">
                      License #: <span className="font-mono font-bold text-slate-700">{cred.licenseNumber}</span> • Issuer: {cred.issuer} • Valid until: <span className="font-semibold text-slate-800">{cred.expiryDate}</span>
                    </p>
                    <p className="text-[10px] text-slate-400">Submitted: {cred.submittedDate}</p>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0 self-start md:self-center">
                    <button
                      onClick={() => handleDecision(cred.id, 'verified')}
                      className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-md shadow-xs transition-colors flex items-center space-x-1 cursor-pointer uppercase tracking-wider"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verify Credential</span>
                    </button>
                    <button
                      onClick={() => handleDecision(cred.id, 'rejected')}
                      className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-md transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Pluggable OCR Interface Simulator */}
      {activeTab === 'ocr' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Pluggable OCR & Fraud Detection Engine</h3>
              <p className="text-xs text-slate-500">Extracts license numbers, expiration dates, and compares with primary state registries.</p>
            </div>
            <button
              onClick={handleSimulateScan}
              disabled={isScanning}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer uppercase tracking-wider disabled:opacity-50"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>{isScanning ? 'Extracting...' : 'Scan Sample Nursing License'}</span>
            </button>
          </div>

          {isScanning && (
            <div className="p-8 border border-dashed border-blue-300 rounded-lg text-center bg-blue-50/40 space-y-2">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-blue-900">Neural OCR Scanning Document Buffer...</p>
              <p className="text-[11px] text-blue-700">Validating anti-tamper watermark and querying State Board API</p>
            </div>
          )}

          {scanResult && !isScanning && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-800">Extracted Payload & Primary Source Result</span>
                <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded">
                  Match Confidence: {(scanResult.confidence_score * 100).toFixed(1)}%
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Detected Type</span>
                  <span className="font-semibold text-slate-800">{scanResult.detected_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Extracted License #</span>
                  <span className="font-mono font-bold text-blue-600">{scanResult.license_number}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Valid Expiration</span>
                  <span className="font-bold text-slate-800">{scanResult.extracted_expiry}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Registry Check</span>
                  <span className="font-bold text-green-700">{scanResult.primary_source_check}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
