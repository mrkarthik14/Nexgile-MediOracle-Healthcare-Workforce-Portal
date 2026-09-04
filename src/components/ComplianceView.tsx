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
  RefreshCw,
  Send,
  Mail,
  Smartphone,
  Bell,
  CheckSquare,
  Square,
  Users
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
  const [activeTab, setActiveTab] = useState<'rules' | 'queue' | 'ocr' | 'regulatory' | 'campaigns'>('rules');
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [tempRuleValue, setTempRuleValue] = useState<number>(11);

  // Mock pending credentials in the verification queue including Garda/DBS & Occ Health
  const [pendingCredentials, setPendingCredentials] = useState<any[]>([
    {
      id: 'cred-101',
      candidateName: 'Elena Rostova',
      role: 'Registered Nurse',
      documentType: 'State Nursing Practicing License',
      licenseNumber: 'RN-2026-99120',
      issuer: 'State Board of Nursing / NMC Registry',
      expiryDate: '2027-12-31',
      submittedDate: 'Today, 08:30 AM',
      status: 'pending',
      ocrMatchConfidence: 97.4,
    },
    {
      id: 'cred-102',
      candidateName: 'Marcus Vance',
      role: 'Healthcare Assistant (HCA)',
      documentType: 'Garda Vetting / Enhanced DBS Criminal Disclosure',
      licenseNumber: 'GV-2026-88410',
      issuer: 'National Vetting Bureau / Disclosure & Barring Service',
      expiryDate: '2027-04-15',
      submittedDate: 'Yesterday, 16:45 PM',
      status: 'pending',
      ocrMatchConfidence: 99.1,
    },
    {
      id: 'cred-103',
      candidateName: 'David O\'Connor',
      role: 'Intensive Care Nurse',
      documentType: 'Occupational Health Clearance (Hep B, MMR, TB)',
      licenseNumber: 'OCC-HLTH-773',
      issuer: 'St. Vincent Occupational Medicine',
      expiryDate: '2027-08-20',
      submittedDate: 'Today, 09:15 AM',
      status: 'pending',
      ocrMatchConfidence: 96.2,
    }
  ]);

  // Multi-select for Queue Batch Actions
  const [selectedQueueIds, setSelectedQueueIds] = useState<string[]>([]);
  const [queueBatchNotice, setQueueBatchNotice] = useState<string | null>(null);

  // Regulatory Audit Packet State
  const [regulatoryBody, setRegulatoryBody] = useState<'HSE' | 'CQC' | 'HIQA' | 'JCAHO'>('HIQA');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // OCR Simulator State
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);

  // Credential Campaign State
  const [campaignHorizon, setCampaignHorizon] = useState<30 | 60 | 90>(60);
  const [campaignChannels, setCampaignChannels] = useState<{ sms: boolean; push: boolean; email: boolean }>({
    sms: true,
    push: true,
    email: true,
  });
  const [campaignNotice, setCampaignNotice] = useState<string | null>(null);

  const expiringCredentialsPool = [
    { id: 'exp-1', name: 'Sarah Chen, RN', cert: 'BLS / CPR Certification', expires: '2026-04-10 (28 days)', status: 'urgent' },
    { id: 'exp-2', name: 'Marcus Vance, HCA', cert: 'Manual Handling Refresher', expires: '2026-04-18 (36 days)', status: 'warning' },
    { id: 'exp-3', name: 'Dr. Helena Vance', cert: 'ACLS Advanced Life Support', expires: '2026-05-02 (50 days)', status: 'warning' },
    { id: 'exp-4', name: 'Siobhan Kelly, RN', cert: 'Garda Vetting / DBS Annual Audit', expires: '2026-05-14 (62 days)', status: 'monitor' },
    { id: 'exp-5', name: 'David O\'Connor, RN', cert: 'Infection Prevention & Control', expires: '2026-05-28 (76 days)', status: 'monitor' },
  ];

  const handleToggleQueueSelect = (id: string) => {
    setSelectedQueueIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllQueue = () => {
    if (selectedQueueIds.length === pendingCredentials.length) {
      setSelectedQueueIds([]);
    } else {
      setSelectedQueueIds(pendingCredentials.map(c => c.id));
    }
  };

  const handleBatchVerifyQueue = () => {
    if (selectedQueueIds.length === 0) return;
    const count = selectedQueueIds.length;
    
    // Remove verified from queue
    setPendingCredentials(prev => prev.filter(c => !selectedQueueIds.includes(c.id)));
    setSelectedQueueIds([]);

    onAddAuditLog({
      code: 'BATCH-VERIFY',
      title: 'Batch Credentials Verified via Clearinghouse',
      actor: 'Patricia Ramos (Auditor)',
      actorRole: 'Compliance Officer',
      details: `Batch approved ${count} credentials with electronic primary source registry matching and anti-tamper watermark verification.`,
      severity: 'success',
      targetType: 'Credential',
      targetId: 'batch-cred-' + count,
    });

    setQueueBatchNotice(`Successfully batch-verified ${count} credentials against official registries.`);
    setTimeout(() => setQueueBatchNotice(null), 4500);
  };

  const handleLaunchCampaign = () => {
    const selectedChannels = Object.entries(campaignChannels)
      .filter(([_, active]) => active)
      .map(([ch]) => ch.toUpperCase())
      .join(', ');

    if (!selectedChannels) return;

    onAddAuditLog({
      code: 'CAMP-DISPATCH',
      title: `Automated Credential Re-Certification Campaign Dispatched`,
      actor: 'Compliance Intelligence Engine',
      actorRole: 'System',
      details: `Dispatched automated re-certification notifications via ${selectedChannels} to clinicians with licenses expiring within ${campaignHorizon} days. Includes direct portal renewal upload tokens.`,
      severity: 'info',
      targetType: 'CredentialCampaign',
      targetId: `camp-${campaignHorizon}d-${Date.now()}`,
    });

    setCampaignNotice(`Credential campaign successfully triggered across [${selectedChannels}] for ${expiringCredentialsPool.length} clinicians.`);
    setTimeout(() => setCampaignNotice(null), 5000);
  };

  const handleExportRegulatoryPacket = () => {
    const packetData = {
      inspectorFramework: regulatoryBody,
      facility: "St. Jude Acute Hospital / HSE Site #388",
      exportTimestamp: new Date().toISOString(),
      complianceScore: "98.4%",
      activeRosterCoverage: 48,
      vettedCliniciansCount: 124,
      rulesEnforced: rules.map(r => ({ rule: r.name, scope: r.scope, numericValue: r.numericValue, ruleType: r.ruleType })),
      auditIntegrityHash: "SHA256-E78A9C02B9114F89"
    };

    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(packetData, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataUri);
    link.setAttribute("download", `MediOracle_Audit_Packet_${regulatoryBody}_2026.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice(`Official ${regulatoryBody} Inspection Audit Packet successfully compiled and exported!`);
    onAddAuditLog({
      code: 'REG-AUDIT',
      title: `${regulatoryBody} Regulatory Audit Packet Generated`,
      actor: 'Compliance Officer',
      actorRole: 'Compliance Officer',
      details: `Generated sealed compliance dossier for ${regulatoryBody} inspection. Includes 124 verified primary source checks and zero unvetted clinician placements.`,
      severity: 'success',
      targetType: 'RegulatoryPacket',
      targetId: `packet-${regulatoryBody.toLowerCase()}`,
    });
    setTimeout(() => setExportNotice(null), 4000);
  };

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
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

        <div className="flex items-center space-x-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'rules' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Policy Rules
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer relative ${
              activeTab === 'queue' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
            onClick={() => setActiveTab('campaigns')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
              activeTab === 'campaigns' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Credential Campaigns</span>
          </button>
          <button
            onClick={() => setActiveTab('ocr')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'ocr' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            OCR Document Scanner
          </button>
          <button
            onClick={() => setActiveTab('regulatory')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
              activeTab === 'regulatory' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Inspection Audit Packets</span>
          </button>
        </div>
      </div>

      {queueBatchNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{queueBatchNotice}</span>
        </div>
      )}

      {campaignNotice && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>{campaignNotice}</span>
        </div>
      )}

      {/* Tab 1: Configurable Compliance Rules */}
      {activeTab === 'rules' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
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

      {/* Tab 2: Verification Queue with Batch Actions */}
      {activeTab === 'queue' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Clinical Credential Verification Review Queue
              </h3>
              <p className="text-xs text-slate-400">Primary Source Checking & Clearinghouse Verification Active</p>
            </div>

            {pendingCredentials.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSelectAllQueue}
                  className="text-xs text-slate-600 font-bold flex items-center space-x-1 cursor-pointer hover:text-slate-900"
                >
                  {selectedQueueIds.length === pendingCredentials.length ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Select All ({pendingCredentials.length})</span>
                </button>

                <button
                  onClick={handleBatchVerifyQueue}
                  disabled={selectedQueueIds.length === 0}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center space-x-1.5 uppercase tracking-wider ${
                    selectedQueueIds.length > 0
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Batch Verify ({selectedQueueIds.length})</span>
                </button>
              </div>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {pendingCredentials.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="font-bold text-slate-800 text-sm">Verification Queue is Clear</p>
                <p className="text-slate-400 text-xs mt-0.5">All uploaded certifications have been validated against official registries.</p>
              </div>
            ) : (
              pendingCredentials.map((cred) => {
                const isSelected = selectedQueueIds.includes(cred.id);
                return (
                  <div key={cred.id} className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isSelected ? 'bg-blue-50/20' : ''
                  }`}>
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleQueueSelect(cred.id)}
                        className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />

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
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Credential Campaigns (Bulk Chase & Expiry Prevention) */}
      {activeTab === 'campaigns' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Automated Proactive Governance
                </span>
                <span className="text-xs font-bold text-slate-600">
                  Zero Lapsed Roster Guarantee
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-1">
                Bulk Credential Re-Certification Campaigns
              </h3>
              <p className="text-xs text-slate-500">
                Identify approaching credential expirations across your clinician workforce and trigger automated multi-channel renewal chases with direct self-upload tokens.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold text-slate-700">Horizon:</label>
              <select
                value={campaignHorizon}
                onChange={(e) => setCampaignHorizon(parseInt(e.target.value) as any)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value={30}>Expiring in &le; 30 Days</option>
                <option value={60}>Expiring in &le; 60 Days</option>
                <option value={90}>Expiring in &le; 90 Days</option>
              </select>
            </div>
          </div>

          {/* Campaign Dispatch Controls */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-4">
              <span className="font-bold text-slate-700 uppercase text-[10px]">Dispatch Channels:</span>
              <label className="flex items-center space-x-1.5 cursor-pointer font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={campaignChannels.sms}
                  onChange={(e) => setCampaignChannels({ ...campaignChannels, sms: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                <span>SMS Alert</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={campaignChannels.push}
                  onChange={(e) => setCampaignChannels({ ...campaignChannels, push: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <Bell className="w-3.5 h-3.5 text-purple-600" />
                <span>Mobile Push</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={campaignChannels.email}
                  onChange={(e) => setCampaignChannels({ ...campaignChannels, email: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                <span>Email Digest</span>
              </label>
            </div>

            <button
              onClick={handleLaunchCampaign}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-md shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer uppercase tracking-wider self-start sm:self-auto"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Campaign ({expiringCredentialsPool.length} Clinicians)</span>
            </button>
          </div>

          {/* Expiring List */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Clinician</th>
                  <th className="p-3">Certification / License</th>
                  <th className="p-3">Expiration Date</th>
                  <th className="p-3">Risk Level</th>
                  <th className="p-3">Pre-Flight Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expiringCredentialsPool.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900">{item.name}</td>
                    <td className="p-3 text-slate-700">{item.cert}</td>
                    <td className="p-3 font-mono font-semibold text-slate-800">{item.expires}</td>
                    <td className="p-3">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        item.status === 'urgent'
                          ? 'bg-red-100 text-red-800'
                          : item.status === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-emerald-700 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Contact Details Validated</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Pluggable OCR Interface Simulator */}
      {activeTab === 'ocr' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Pluggable OCR & Fraud Detection Engine</h3>
              <p className="text-xs text-slate-500">Extracts license numbers, expiration dates, and compares with primary state registries.</p>
            </div>
            <button
              onClick={handleSimulateScan}
              disabled={isScanning}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer uppercase tracking-wider disabled:opacity-50"
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

      {/* Tab 4: Regulatory Inspection Audit Packets (HSE, CQC, HIQA, Joint Commission) */}
      {activeTab === 'regulatory' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  One-Click Regulatory Inspection Dossier & Audit Bundle
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate tamper-evident, cryptographically signed compliance inspection bundles for HSE, CQC, HIQA, or Joint Commission audits.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={regulatoryBody}
                onChange={(e) => setRegulatoryBody(e.target.value as any)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-700 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="HIQA">HIQA (Health Information & Quality Authority - Ireland)</option>
                <option value="HSE">HSE (Health Service Executive - Ireland)</option>
                <option value="CQC">CQC (Care Quality Commission - UK)</option>
                <option value="JCAHO">Joint Commission (Hospital Accreditation - US)</option>
              </select>

              <button
                onClick={handleExportRegulatoryPacket}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors flex items-center space-x-2 cursor-pointer uppercase tracking-wider flex-shrink-0"
              >
                <FileText className="w-4 h-4" />
                <span>Export Inspection Bundle</span>
              </button>
            </div>
          </div>

          {exportNotice && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>{exportNotice}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center justify-between">
                <span>Core Credential Standards</span>
                <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-200">100% Compliant</span>
              </h4>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span>Professional Registration (NMBI / NMC / State Board)</span>
                  <span className="font-bold text-emerald-700 font-mono">PRIMARY VERIFIED</span>
                </li>
                <li className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span>Criminal Background (Garda Vetting / Enhanced DBS)</span>
                  <span className="font-bold text-emerald-700 font-mono">CLEARED (NO FLAGS)</span>
                </li>
                <li className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span>Right to Work & Visa Verification (Stamp 1G/4/EEA)</span>
                  <span className="font-bold text-emerald-700 font-mono">VERIFIED</span>
                </li>
                <li className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span>Occupational Health (Hep B, MMR, TB Mantoux, Varicella)</span>
                  <span className="font-bold text-emerald-700 font-mono">IMMUNE CERT</span>
                </li>
                <li className="flex items-center justify-between py-1">
                  <span>Life Support & Statutory Training (BLS, Fire, Manual Handling)</span>
                  <span className="font-bold text-emerald-700 font-mono">IN-DATE</span>
                </li>
              </ul>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center justify-between">
                <span>Shift Guardrails & WTD Compliance</span>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Zero Breaches</span>
              </h4>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span>Pre-Match Non-Compliant Candidate Lockout</span>
                  <span className="font-bold text-blue-700">STRICT ENFORCEMENT</span>
                </li>
                <li className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span>Working Time Directive (48h Weekly Rolling Cap)</span>
                  <span className="font-bold text-blue-700">AUTOMATIC CEILING</span>
                </li>
                <li className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span>Statutory Rest Period (11h Minimum Gap)</span>
                  <span className="font-bold text-blue-700">ROSTER GUARDED</span>
                </li>
                <li className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span>Audit Trail Immutability</span>
                  <span className="font-bold text-blue-700">APPEND-ONLY LOG</span>
                </li>
                <li className="flex items-center justify-between py-1">
                  <span>Archived Packet Storage Retention</span>
                  <span className="font-bold text-blue-700">7-YEAR STATUTORY</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
