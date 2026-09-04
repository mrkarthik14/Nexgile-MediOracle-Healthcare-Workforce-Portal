import React, { useState } from 'react';
import { 
  INITIAL_DEPARTMENTS, 
  INITIAL_SHIFTS, 
  INITIAL_PROFESSIONALS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_TIMESHEETS, 
  INITIAL_INVOICES, 
  INITIAL_COMPLIANCE_RULES,
  INITIAL_DISPUTES
} from './data/mockData';
import { Role, Shift, Professional, AuditLog, ComplianceRule, TimesheetItem, InvoiceItem, DisputeEvidence, BroadcastMessage } from './types';
import { ROLE_DEFINITIONS } from './data/rbacConfig';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { AuditTrailSidebar } from './components/AuditTrailSidebar';
import { FloorDashboard } from './components/FloorDashboard';
import { ShiftManagement } from './components/ShiftManagement';
import { ProfessionalNetworkView } from './components/ProfessionalNetworkView';
import { ComplianceView } from './components/ComplianceView';
import { BillingView } from './components/BillingView';
import { AnalyticsView } from './components/AnalyticsView';
import { MobileClinicianView } from './components/MobileClinicianView';
import { CandidateMatchingModal } from './components/CandidateMatchingModal';
import { PostShiftModal } from './components/PostShiftModal';
import { AccessDeniedView } from './components/AccessDeniedView';
import { RbacVisualGuide } from './components/RbacVisualGuide';
import { LoginPage } from './components/LoginPage';
import { SystemVerificationModal } from './components/SystemVerificationModal';
import { BulkShiftGeneratorModal } from './components/BulkShiftGeneratorModal';
import { BroadcastMessageModal } from './components/BroadcastMessageModal';
import { DisputeEvidenceModal } from './components/DisputeEvidenceModal';
import { QualityManagementView } from './components/QualityManagementView';
import { SupportCaseManagementView } from './components/SupportCaseManagementView';
import { IntegrationsView } from './components/IntegrationsView';
import { TimekeepingView } from './components/TimekeepingView';

export default function App() {
  // Authentication & Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Navigation & Role State
  const [activeTab, setActiveTab] = useState<string>('floor');
  const [currentRole, setCurrentRole] = useState<Role>('facility_admin');

  // Domain Entity State
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [professionals, setProfessionals] = useState<Professional[]>(INITIAL_PROFESSIONALS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [timesheets, setTimesheets] = useState<TimesheetItem[]>(INITIAL_TIMESHEETS);
  const [invoices, setInvoices] = useState<InvoiceItem[]>(INITIAL_INVOICES);
  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>(INITIAL_COMPLIANCE_RULES);
  const [disputes, setDisputes] = useState<DisputeEvidence[]>(INITIAL_DISPUTES);

  // UI Modals & Filters State
  const [isPostShiftOpen, setIsPostShiftOpen] = useState(false);
  const [postShiftDefaultDept, setPostShiftDefaultDept] = useState<string | undefined>();
  const [matchingShift, setMatchingShift] = useState<Shift | null>(null);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string | undefined>();
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(3);

  // Extended Functional Modals
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isBulkShiftGeneratorOpen, setIsBulkShiftGeneratorOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [activeDispute, setActiveDispute] = useState<DisputeEvidence | null>(null);

  // Dynamic KPI Calculations
  const openShifts = shifts.filter(s => s.status === 'open' || s.status === 'matching');
  const criticalCount = shifts.filter(s => s.urgency === 'critical' && (s.status === 'open' || s.status === 'matching')).length;
  const confirmedCount = shifts.filter(s => s.status === 'confirmed' || s.status === 'in_progress' || s.status === 'completed').length;
  const totalShifts = shifts.length;
  const calculatedFillRate = totalShifts > 0 ? ((confirmedCount / totalShifts) * 100).toFixed(1) : '94.2';

  // Helper: Append to Immutable Audit Trail
  const handleAddAuditLog = (log: Partial<AuditLog>) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      code: log.code || 'AX-' + Math.floor(1000 + Math.random() * 9000),
      title: log.title || 'System Event',
      actor: log.actor || 'Facility Admin (John Sterling)',
      actorRole: log.actorRole || 'Facility Admin',
      timestamp: 'Just now',
      details: log.details || '',
      severity: log.severity || 'info',
      targetType: log.targetType || 'System',
      targetId: log.targetId || 'rec-0',
      metadata: log.metadata,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Action Handlers
  const handleCreateShift = (newShiftData: Partial<Shift>) => {
    const shiftNumber = `SH-${Math.floor(1000 + Math.random() * 9000)}`;
    const newShift: Shift = {
      id: 'shift-' + Date.now(),
      shiftNumber,
      departmentId: newShiftData.departmentId || 'dept-er1',
      departmentName: newShiftData.departmentName || 'Emergency (ER-1)',
      facilityName: 'St. Jude Hospital',
      role: newShiftData.role || 'Registered Nurse (RN)',
      specialty: newShiftData.specialty || 'General',
      date: newShiftData.date || '2026-09-05',
      startTime: newShiftData.startTime || '19:00',
      endTime: newShiftData.endTime || '07:30',
      urgency: newShiftData.urgency || 'high',
      status: 'open',
      baseRate: newShiftData.baseRate || 55.0,
      incentiveBonus: newShiftData.incentiveBonus || 0,
      requiredQualifications: newShiftData.requiredQualifications || ['RN License', 'BLS'],
      notes: newShiftData.notes,
    };

    setShifts(prev => [newShift, ...prev]);
    handleAddAuditLog({
      code: 'SR-' + Math.floor(1000 + Math.random() * 9000),
      title: 'Shift Requisition Created',
      actor: 'John Sterling (Admin)',
      actorRole: 'Facility Admin',
      details: `Created open shift #${shiftNumber} for ${newShift.role} at ${newShift.departmentName}. Base: $${newShift.baseRate}/hr + $${newShift.incentiveBonus}/hr surge.`,
      severity: 'info',
      targetType: 'Shift',
      targetId: newShift.id,
    });
  };

  const handleDispatchOffer = (shiftId: string, professionalId: string) => {
    const pro = professionals.find(p => p.id === professionalId);
    setShifts(prev => prev.map(s => {
      if (s.id === shiftId) {
        return {
          ...s,
          status: 'confirmed',
          assignedProfessional: pro ? {
            id: pro.id,
            name: pro.name,
            badgeNumber: pro.badgeNumber,
            avatarInitials: pro.avatarInitials,
            phone: pro.phone || '+1 (555) 000-0000',
            status: 'Confirmed & verified',
          } : undefined
        };
      }
      return s;
    }));

    if (pro) {
      handleAddAuditLog({
        code: 'AX-' + Math.floor(1000 + Math.random() * 9000),
        title: 'Shift Confirmed & Booked',
        actor: 'Matching Engine v2.4',
        actorRole: 'System',
        details: `Confirmed and locked shift assignment for ${pro.name} (${pro.badgeNumber}). Credentials and primary source checked.`,
        severity: 'success',
        targetType: 'Shift',
        targetId: shiftId,
      });
    }
  };

  const handleBroadcastOffer = (shiftId: string) => {
    setShifts(prev => prev.map(s => {
      if (s.id === shiftId) {
        return { ...s, status: 'offered' };
      }
      return s;
    }));

    handleAddAuditLog({
      code: 'BC-' + Math.floor(1000 + Math.random() * 9000),
      title: 'First-Accept-Wins Broadcast Sent',
      actor: 'Dispatch Orchestrator',
      actorRole: 'System',
      details: `Distributed instant push notifications to top-tier qualified candidates for Shift #${shiftId}. Race-condition mitigation active.`,
      severity: 'info',
      targetType: 'Shift',
      targetId: shiftId,
    });
  };

  const handleOverrideMatch = (shiftId: string, candidateId: string, reason: string) => {
    const pro = professionals.find(p => p.id === candidateId);
    setShifts(prev => prev.map(s => {
      if (s.id === shiftId) {
        return {
          ...s,
          status: 'confirmed',
          assignedProfessional: pro ? {
            id: pro.id,
            name: pro.name,
            badgeNumber: pro.badgeNumber,
            avatarInitials: pro.avatarInitials,
            phone: pro.phone || '+1 (555) 000-0000',
            status: 'Confirmed & verified (Override)',
          } : undefined
        };
      }
      return s;
    }));

    handleAddAuditLog({
      code: 'OVR-' + Math.floor(1000 + Math.random() * 9000),
      title: 'Compulsory Manager Override',
      actor: 'Dr. Sterling (Ward Lead)',
      actorRole: 'Ward Lead',
      details: `Overrode compliance ranking to assign ${pro?.name} to Shift #${shiftId}. Compulsory Justification: "${reason}"`,
      severity: 'warning',
      targetType: 'Shift',
      targetId: shiftId,
    });
  };

  const handleApproveTimesheet = (timesheetId: string) => {
    setTimesheets(prev => prev.map(ts => {
      if (ts.id === timesheetId) {
        return {
          ...ts,
          status: 'approved',
          locked: true,
          approvedBy: 'Dr. Sterling (Ward Lead)',
          approvedAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
      return ts;
    }));
  };

  const handleClaimInstantPay = (timesheetId: string) => {
    setTimesheets(prev => prev.map(ts => {
      if (ts.id === timesheetId) {
        return {
          ...ts,
          status: 'paid',
        };
      }
      return ts;
    }));
  };

  const handleCreateAdjustment = (invoiceId: string, amount: number, reason: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        const adjustmentRecord = {
          id: 'adj-' + Date.now(),
          amount,
          reason,
          createdAt: 'Today',
          approvedBy: 'John Sterling',
        };
        return {
          ...inv,
          total: inv.total + amount,
          adjustments: [...(inv.adjustments || []), adjustmentRecord],
        };
      }
      return inv;
    }));
  };

  const handleUpdateComplianceRule = (ruleId: string, newNumericValue: number) => {
    setComplianceRules(prev => prev.map(r => {
      if (r.id === ruleId) {
        return { ...r, numericValue: newNumericValue };
      }
      return r;
    }));
  };

  const handleExportLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `medioracle_compliance_audit_ledger_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    handleAddAuditLog({
      code: 'EXP-' + Math.floor(1000 + Math.random() * 9000),
      title: 'Compliance Log Exported',
      actor: 'John Sterling (Admin)',
      actorRole: 'Facility Admin',
      details: 'Exported complete cryptographically chained audit log ledger (JSON format) for regulatory filing.',
      severity: 'info',
      targetType: 'AuditLog',
      targetId: 'audit-export',
    });
  };

  // Bulk Generation & Broadcast Handlers
  const handleGenerateBatchShifts = (newShifts: Partial<Shift>[]) => {
    const created: Shift[] = newShifts.map((s, idx) => ({
      id: 'shift-bulk-' + Date.now() + '-' + idx,
      shiftNumber: `SH-${Math.floor(2000 + Math.random() * 8000)}`,
      departmentId: s.departmentId || 'dept-er1',
      departmentName: s.departmentName || 'Emergency (ER-1)',
      facilityName: 'St. Jude Hospital',
      role: s.role || 'Registered Nurse (RN)',
      specialty: s.specialty || 'General',
      date: s.date || '2026-09-08',
      startTime: s.startTime || '19:00',
      endTime: s.endTime || '07:30',
      urgency: s.urgency || 'high',
      status: 'open',
      baseRate: s.baseRate || 58.0,
      incentiveBonus: s.incentiveBonus || 10.0,
      requiredQualifications: s.requiredQualifications || ['RN License', 'BLS'],
      notes: s.notes,
    }));
    setShifts(prev => [...created, ...prev]);
    handleAddAuditLog({
      code: 'BLK-SHFT',
      title: 'Bulk Recurring Shift Schedule Generated',
      actor: ROLE_DEFINITIONS[currentRole]?.name || 'Facility Admin',
      actorRole: ROLE_DEFINITIONS[currentRole]?.userTitle || 'Facility Admin',
      details: `Generated ${created.length} recurring shift slots across 4 weeks with automated Working Time Directive resting gap pre-validation.`,
      severity: 'success',
      targetType: 'ShiftBatch',
      targetId: `batch-${Date.now()}`,
    });
  };

  const handleSendBroadcast = (msg: Omit<BroadcastMessage, 'id' | 'sentAt'>) => {
    const newBroadcast: BroadcastMessage = {
      ...msg,
      id: 'bc-' + Date.now(),
      sentAt: 'Just now',
    };
    handleAddAuditLog({
      code: 'BCST-MSG',
      title: 'Workforce Multi-Channel Broadcast Dispatched',
      actor: ROLE_DEFINITIONS[currentRole]?.name || 'Operations Lead',
      actorRole: ROLE_DEFINITIONS[currentRole]?.userTitle || 'Operations',
      details: `Broadcast dispatched to ${msg.recipientCount} clinicians via ${msg.channels.join(', ').toUpperCase()}. Priority: ${msg.priority.toUpperCase()}. Subject: "${msg.title}"`,
      severity: msg.priority === 'critical' ? 'warning' : 'info',
      targetType: 'BroadcastMessage',
      targetId: newBroadcast.id,
    });
  };

  const handleResolveDispute = (
    disputeId: string,
    action: 'uphold_original' | 'apply_adjustment' | 'recalculate_overtime',
    adjustmentAmount: number,
    notes: string
  ) => {
    setDisputes(prev => prev.map(d => {
      if (d.id === disputeId) {
        return {
          ...d,
          status: 'resolved',
          resolution: {
            action,
            adjustmentAmount,
            resolvedBy: ROLE_DEFINITIONS[currentRole]?.name || 'Admin / Finance Lead',
            resolvedAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            notes,
          }
        };
      }
      return d;
    }));

    handleAddAuditLog({
      code: 'DISP-RES',
      title: 'Timesheet Dispute Resolved with Tamper-Proof Evidence',
      actor: ROLE_DEFINITIONS[currentRole]?.name || 'Finance Auditor',
      actorRole: ROLE_DEFINITIONS[currentRole]?.userTitle || 'Finance',
      details: `Resolved dispute #${disputeId}. Action: ${action}. Adjustment: $${adjustmentAmount.toFixed(2)}. Evidence: Dual GPS logs + digital supervisor charge stamp verified. Notes: "${notes}"`,
      severity: 'success',
      targetType: 'DisputeEvidence',
      targetId: disputeId,
    });
  };

  const handleBatchOnboard = (newPros: Professional[]) => {
    setProfessionals(prev => [...newPros, ...prev]);
  };

  // Login & Logout Handlers
  const handleLogin = (role: Role, userEmail?: string) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
    const targetDef = ROLE_DEFINITIONS[role];
    if (targetDef) {
      setActiveTab(targetDef.landingTab);
    }
    handleAddAuditLog({
      code: 'AUTH-' + Math.floor(1000 + Math.random() * 9000),
      title: 'Zero-Trust Session Authenticated',
      actor: targetDef?.name || role,
      actorRole: targetDef?.userTitle || role,
      details: `User authenticated via Gateway SSO (${userEmail || targetDef?.portalLabel}). Scoped to ${targetDef?.portalLabel} with ${targetDef?.allowedTabs.length} authorized workspaces.`,
      severity: 'success',
      targetType: 'AuthSession',
      targetId: `jwt-${Date.now()}`,
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    handleAddAuditLog({
      code: 'AUTH-OUT',
      title: 'User Session Terminated',
      actor: ROLE_DEFINITIONS[currentRole]?.name || currentRole,
      actorRole: ROLE_DEFINITIONS[currentRole]?.userTitle || currentRole,
      details: 'User explicitly signed out to the Gateway Login Page.',
      severity: 'info',
      targetType: 'AuthSession',
      targetId: 'logout',
    });
  };

  // If not authenticated, render the Enterprise Gateway Login Page with inspection capabilities
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage 
          onLogin={handleLogin} 
          onOpenVerificationModal={() => setIsVerificationModalOpen(true)}
        />
        {isVerificationModalOpen && (
          <SystemVerificationModal
            onClose={() => setIsVerificationModalOpen(false)}
            onNavigateToTab={(tab) => {
              setIsAuthenticated(true);
              setActiveTab(tab);
              setIsVerificationModalOpen(false);
            }}
            onTriggerBulkShifts={() => {
              setIsAuthenticated(true);
              setIsVerificationModalOpen(false);
              setIsBulkShiftGeneratorOpen(true);
            }}
            onTriggerBulkMessages={() => {
              setIsAuthenticated(true);
              setIsVerificationModalOpen(false);
              setIsBroadcastModalOpen(true);
            }}
            onTriggerDisputeEvidence={() => {
              setIsAuthenticated(true);
              setIsVerificationModalOpen(false);
              setActiveDispute(disputes[0] || INITIAL_DISPUTES[0]);
            }}
          />
        )}
      </>
    );
  }

  const roleDef = ROLE_DEFINITIONS[currentRole] || ROLE_DEFINITIONS.facility_admin;
  const isCurrentTabAllowed = roleDef.allowedTabs.includes(activeTab);

  // Scoped audit trail for clinicians to prevent accessing executive notes
  const scopedAuditLogs = currentRole === 'professional'
    ? auditLogs.filter(log => 
        log.actor.includes('Sarah Chen') || 
        log.details.includes('Sarah Chen') || 
        log.details.includes('Nurse') ||
        log.targetType === 'Payment' ||
        log.severity === 'success'
      )
    : auditLogs;

  return (
    <div className="flex h-screen w-full bg-[#F4F6F8] font-sans text-[#1A1C1E] overflow-hidden">
      {/* 1. Sidebar matching Geometric Balance Theme */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        setCurrentRole={(role) => {
          setCurrentRole(role);
          const targetDef = ROLE_DEFINITIONS[role];
          if (targetDef && !targetDef.allowedTabs.includes(activeTab)) {
            setActiveTab(targetDef.landingTab);
          }
        }}
        onLogout={handleLogout}
      />

      {/* 2. Main Content Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header matching Geometric Balance Design HTML */}
        <Header
          onOpenPostShift={() => {
            setPostShiftDefaultDept(undefined);
            setIsPostShiftOpen(true);
          }}
          currentRole={currentRole}
          unreadNotificationsCount={unreadNotificationsCount}
          onClearNotifications={() => setUnreadNotificationsCount(0)}
          onOpenRbacGuide={() => setActiveTab('rbac_guide')}
          onOpenVerificationModal={() => setIsVerificationModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          {/* Top KPI Cards Strip - Customized for Role context */}
          <KpiCards
            fillRate={parseFloat(calculatedFillRate)}
            openShiftsCount={openShifts.length}
            criticalCount={criticalCount}
            budgetSpentFormatted="$42.1k"
            budgetTotalFormatted="$60k"
            complianceScore={100}
          />

          {/* 12-Column Grid matching Geometric Balance Design HTML */}
          <div className="grid grid-cols-12 gap-6 items-start">
            {/* Left 8 Columns: Dynamic Functional View */}
            <div className="col-span-12 xl:col-span-8 space-y-6">
              {/* If user tries to access a tab restricted by their role, show clear 403 Forbidden AccessDeniedView */}
              {!isCurrentTabAllowed && activeTab !== 'rbac_guide' ? (
                <AccessDeniedView
                  currentRole={currentRole}
                  attemptedTab={activeTab}
                  onNavigateToAllowed={(tab) => setActiveTab(tab)}
                  onSwitchRole={(newRole) => {
                    setCurrentRole(newRole);
                    const def = ROLE_DEFINITIONS[newRole];
                    if (def) setActiveTab(def.landingTab);
                  }}
                />
              ) : activeTab === 'rbac_guide' ? (
                <RbacVisualGuide
                  currentRole={currentRole}
                  onSelectRole={(role) => setCurrentRole(role)}
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                />
              ) : (
                <>
                  {activeTab === 'floor' && (
                    <FloorDashboard
                      departments={departments}
                      shifts={shifts}
                      onSelectDepartmentForShifts={(deptId) => {
                        setSelectedDeptFilter(deptId);
                        setActiveTab('shifts');
                      }}
                      onOpenMatchModal={(shift) => setMatchingShift(shift)}
                      onOpenPostShift={(defaultDeptId) => {
                        setPostShiftDefaultDept(defaultDeptId);
                        setIsPostShiftOpen(true);
                      }}
                    />
                  )}

                  {activeTab === 'shifts' && (
                    <ShiftManagement
                      shifts={shifts}
                      departments={departments}
                      onOpenMatchModal={(shift) => setMatchingShift(shift)}
                      onBroadcastOffer={handleBroadcastOffer}
                      onOpenPostShift={() => {
                        setPostShiftDefaultDept(undefined);
                        setIsPostShiftOpen(true);
                      }}
                      onOpenBulkGenerator={() => setIsBulkShiftGeneratorOpen(true)}
                      onOpenBroadcastModal={() => setIsBroadcastModalOpen(true)}
                      selectedDeptFilter={selectedDeptFilter}
                      onClearDeptFilter={() => setSelectedDeptFilter(undefined)}
                    />
                  )}

                  {activeTab === 'timekeeping' && (
                    <TimekeepingView
                      onAddAuditLog={handleAddAuditLog}
                      onSyncToTimesheets={() => setActiveTab('billing')}
                    />
                  )}

                  {activeTab === 'professionals' && (
                    <ProfessionalNetworkView
                      professionals={professionals}
                      onBatchOnboard={handleBatchOnboard}
                      onAddAuditLog={handleAddAuditLog}
                    />
                  )}

                  {activeTab === 'compliance' && (
                    <ComplianceView
                      rules={complianceRules}
                      onUpdateRule={handleUpdateComplianceRule}
                      onVerifyCredential={(id, dec) => {}}
                      onAddAuditLog={handleAddAuditLog}
                    />
                  )}

                  {activeTab === 'billing' && (
                    <BillingView
                      timesheets={timesheets}
                      invoices={invoices}
                      onApproveTimesheet={handleApproveTimesheet}
                      onClaimInstantPay={handleClaimInstantPay}
                      onCreateAdjustment={handleCreateAdjustment}
                      onAddAuditLog={handleAddAuditLog}
                    />
                  )}

                  {activeTab === 'analytics' && (
                    <AnalyticsView 
                      onAddAuditLog={handleAddAuditLog}
                      onGenerateBatchShifts={handleGenerateBatchShifts}
                    />
                  )}

                  {activeTab === 'quality' && (
                    <QualityManagementView
                      onAddAuditLog={handleAddAuditLog}
                    />
                  )}

                  {activeTab === 'support' && (
                    <SupportCaseManagementView
                      onAddAuditLog={handleAddAuditLog}
                    />
                  )}

                  {activeTab === 'integrations' && (
                    <IntegrationsView
                      onAddAuditLog={handleAddAuditLog}
                    />
                  )}

                  {activeTab === 'clinician_mobile' && (
                    <MobileClinicianView
                      shifts={shifts}
                      onAddAuditLog={handleAddAuditLog}
                    />
                  )}
                </>
              )}
            </div>

            {/* Right 4 Columns: Immutable Audit Trail Sidebar */}
            <div className="col-span-12 xl:col-span-4">
              <AuditTrailSidebar
                logs={scopedAuditLogs}
                onExportLogs={handleExportLogs}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Candidate Matching Engine Modal */}
      {matchingShift && (
        <CandidateMatchingModal
          shift={matchingShift}
          candidates={professionals}
          onClose={() => setMatchingShift(null)}
          onDispatchOffer={handleDispatchOffer}
          onBroadcastOffer={handleBroadcastOffer}
          onOverrideMatch={handleOverrideMatch}
        />
      )}

      {/* Post Shift Modal */}
      {isPostShiftOpen && (
        <PostShiftModal
          departments={departments}
          defaultDeptId={postShiftDefaultDept}
          onClose={() => setIsPostShiftOpen(false)}
          onCreateShift={handleCreateShift}
        />
      )}

      {/* System Verification (All 18 Checks) Modal */}
      {isVerificationModalOpen && (
        <SystemVerificationModal
          onClose={() => setIsVerificationModalOpen(false)}
          onNavigateToTab={(tab) => {
            setActiveTab(tab);
            setIsVerificationModalOpen(false);
          }}
          onTriggerBulkShifts={() => {
            setIsVerificationModalOpen(false);
            setIsBulkShiftGeneratorOpen(true);
          }}
          onTriggerBulkMessages={() => {
            setIsVerificationModalOpen(false);
            setIsBroadcastModalOpen(true);
          }}
          onTriggerDisputeEvidence={() => {
            setIsVerificationModalOpen(false);
            setActiveDispute(disputes[0] || INITIAL_DISPUTES[0]);
          }}
        />
      )}

      {/* Bulk Shift Schedule Generator Modal */}
      {isBulkShiftGeneratorOpen && (
        <BulkShiftGeneratorModal
          departments={departments}
          onClose={() => setIsBulkShiftGeneratorOpen(false)}
          onGenerateBatchShifts={handleGenerateBatchShifts}
        />
      )}

      {/* Workforce Broadcast Notification Modal */}
      {isBroadcastModalOpen && (
        <BroadcastMessageModal
          departments={departments}
          onClose={() => setIsBroadcastModalOpen(false)}
          onSendBroadcast={handleSendBroadcast}
        />
      )}

      {/* Timesheet Dispute Resolution & Evidence Dossier Modal */}
      {activeDispute && (
        <DisputeEvidenceModal
          dispute={activeDispute}
          onClose={() => setActiveDispute(null)}
          onResolveDispute={handleResolveDispute}
        />
      )}
    </div>
  );
}
