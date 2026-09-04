export type PortalType = 'facility' | 'professional' | 'agency';

export type Role = 
  | 'facility_admin' 
  | 'ward_lead' 
  | 'finance'
  | 'professional' 
  | 'agency_admin'
  | 'compliance_officer' 
  | 'payroll'
  | 'support_agent'
  | 'recruiter'
  | 'business_leader';

export interface RoleAccessDefinition {
  id: Role;
  name: string;
  userTitle: string;
  portal: PortalType;
  portalLabel: string;
  landingTab: string;
  allowedTabs: string[];
  deniedAccessMessage: string;
  canSeeData: string[];
  blockedData: string[];
}

export type RiskLevel = 'critical' | 'moderate' | 'stabilized';

export interface Department {
  id: string;
  name: string;
  code: string;
  facilityId: string;
  facilityName: string;
  acuityLevel: 'High' | 'Max' | 'Medium' | 'Low';
  targetStaffing: number;
  currentStaffing: number;
  riskLevel: RiskLevel;
  vacanciesNote: string;
  budgetAllocated: number;
  budgetSpent: number;
}

export type ShiftStatus = 
  | 'draft' 
  | 'open' 
  | 'matching' 
  | 'offered' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled'
  | 'disputed';

export interface Shift {
  id: string;
  shiftNumber: string;
  departmentId: string;
  departmentName: string;
  facilityName: string;
  role: string;
  specialty: string;
  startTime: string;
  endTime: string;
  date: string;
  status: ShiftStatus;
  baseRate: number;
  incentiveBonus?: number;
  urgency: 'critical' | 'high' | 'normal';
  assignedProfessional?: {
    id: string;
    name: string;
    badgeNumber: string;
    avatarInitials: string;
    phone: string;
    status: string;
  };
  requiredQualifications: string[];
  notes?: string;
  isRestPeriodWarning?: boolean;
  acuityLevel?: string;
  patientRatio?: string;
  unpaidBreakMinutes?: number;
  recurrencePattern?: string;
  openOpenings?: number;
  isDisputed?: boolean;
}

export interface CredentialItem {
  id: string;
  name: string;
  issuer: string;
  licenseNumber: string;
  status: 'verified' | 'pending' | 'rejected' | 'expired';
  expiryDate: string;
  verifiedAt?: string;
  verifiedBy?: string;
  primarySource?: string;
}

export interface Professional {
  id: string;
  name: string;
  badgeNumber: string;
  role: string;
  specialty: string;
  avatarInitials: string;
  phone: string;
  email: string;
  rating: number;
  shiftsCompleted: number;
  reliabilityScore: number; // 0 - 100
  distanceMiles: number;
  hourlyRate: number;
  status?: 'active' | 'pending' | 'suspended';
  credentials: CredentialItem[];
  matchScore?: {
    total: number;
    qualificationsScore: number;
    commuteScore: number;
    reliabilityScore: number;
    rateScore: number;
    preferenceScore: number;
    restGapHours: number;
    hasRestWarning: boolean;
    explanation: string;
  };
}

export interface AuditLog {
  id: string;
  code: string;
  title: string;
  actor: string;
  actorRole: string;
  details: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'success' | 'critical';
  targetType: string;
  targetId: string;
  metadata?: Record<string, any>;
}

export interface TimesheetItem {
  id: string;
  shiftId: string;
  shiftNumber: string;
  professionalId: string;
  professionalName: string;
  role: string;
  department: string;
  date: string;
  regularHours: number;
  overtimeHours: number;
  breakHours: number;
  totalBillableHours: number;
  hourlyRate: number;
  totalAmount: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  locked: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  facility: string;
  period: string;
  shiftsCount: number;
  subtotal: number;
  tax: number;
  total: number;
  status: 'issued' | 'approved' | 'paid' | 'disputed';
  agingBucket: '0-30 Days' | '31-60 Days' | '61-90 Days' | '90+ Days Past Due';
  dueDate: string;
}

export interface ComplianceRule {
  id: string;
  name: string;
  ruleType: 'min_rest_period_hours' | 'max_weekly_hours' | 'mandatory_qualification' | 'grace_period_days';
  numericValue: number;
  description: string;
  scope: string;
  isActive: boolean;
}

export interface FinancialAdjustment {
  id: string;
  invoiceId: string;
  shiftId?: string;
  code?: 'ADJ-BREAK-DEDUCT' | 'ADJ-SURGE-CORRECT' | 'ADJ-OVERTIME-AUTH' | 'ADJ-DISPUTE-CREDIT' | string;
  adjustmentCode?: string;
  label?: string;
  amount: number;
  direction?: 'credit' | 'debit';
  reason: string;
  authorizedBy?: string;
  authorizedRole?: string;
  appliedBy?: string;
  appliedAt?: string;
  timestamp?: string;
  signedHash?: string;
  digitalSignature?: string;
  status?: string;
}

export interface DisputeEvidence {
  id: string;
  timesheetId: string;
  shiftNumber: string;
  clinicianName: string;
  facility: string;
  disputedHours: number;
  claimedHours: number;
  varianceAmount: number;
  status: 'in_review' | 'evidence_evaluated' | 'resolved';
  clinicianStatement: string;
  facilityStatement: string;
  gpsClockIn: {
    recordedTime: string;
    latitude: number;
    longitude: number;
    distanceMeters: number;
    withinGeofence: boolean;
  };
  beaconVerification: {
    beaconId: string;
    wardLocation: string;
    verifiedAt: string;
  };
  supervisorSignoff: {
    supervisorName: string;
    supervisorRole: string;
    digitalSignature: string;
    signedAt: string;
  };
  resolution?: {
    action: 'uphold_original' | 'apply_adjustment' | 'recalculate_overtime';
    adjustmentAmount: number;
    resolvedBy: string;
    resolvedAt: string;
    notes: string;
  };
}

export interface ReconciliationRecord {
  id: string;
  period: string;
  facility: string;
  invoiceTotal: number;
  timesheetTotal: number;
  bankDisbursedTotal: number;
  variance: number;
  status: 'matched' | 'discrepancy' | 'pending';
  lastReconciledAt: string;
  reconciledBy: string;
}

export interface BroadcastMessage {
  id: string;
  title: string;
  message: string;
  targetDepartment: string;
  targetRole: string;
  channels: ('sms' | 'push' | 'email')[];
  recipientCount: number;
  priority: 'normal' | 'urgent' | 'critical';
  sentAt: string;
  sender: string;
}

export interface AIOutcomeMetric {
  id: string;
  shiftId: string;
  candidateId: string;
  candidateName: string;
  matchType: 'ai_recommended' | 'human_override';
  confidenceScore: number;
  overrideReason?: string;
  punctualClockIn: boolean;
  clinicalRating: number;
  incidentFree: boolean;
  wardFeedback: string;
  completedAt: string;
}

export interface QualityReview {
  id: string;
  shiftNumber: string;
  direction: 'facility_to_clinician' | 'clinician_to_facility';
  reviewerName: string;
  reviewerRole: string;
  targetName: string;
  rating: number; // 1 to 5
  categories: {
    clinicalCompetence?: number;
    punctuality?: number;
    teamwork?: number;
    communication?: number;
    safetyAdherence?: number;
    safetyClimate?: number;
    breakRelief?: number;
    equipmentAccess?: number;
    chargeSupport?: number;
  };
  feedbackText: string;
  moderationStatus: 'approved' | 'flagged' | 'redacted' | 'pending';
  sentiment: 'positive' | 'neutral' | 'flagged';
  submittedAt: string;
}

export interface ClinicalReference {
  id: string;
  candidateId: string;
  candidateName: string;
  refereeName: string;
  refereeTitle: string;
  refereeHospital: string;
  relationship: 'Clinical Preceptor' | 'Charge Nurse' | 'Ward Sister' | 'Clinical Director';
  status: 'verified' | 'pending_response' | 'flagged';
  contactMethod: 'email' | 'phone' | 'digital_portal';
  verifiedAt?: string;
  clinicalCompetenceRating: number;
  recommendation: 'strongly_recommend' | 'recommend' | 'recommend_with_reservations';
  comments: string;
}

export interface IntegrationService {
  id: string;
  category: 'payroll' | 'banking' | 'telephony' | 'geocoding';
  name: string;
  provider: string;
  status: 'connected' | 'healthy' | 'degraded' | 'syncing';
  lastSync: string;
  successRate: number;
  endpoint: string;
  telemetryMetrics: Record<string, string | number>;
  recentEvents: {
    id: string;
    event: string;
    status: '200 OK' | '202 Accepted' | '400 Bad Request';
    timestamp: string;
    latencyMs: number;
  }[];
}

export interface TimecardPunch {
  id: string;
  shiftId: string;
  shiftNumber: string;
  clinicianId: string;
  clinicianName: string;
  clinicianAvatar: string;
  role: string;
  departmentId: string;
  departmentName: string;
  date: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualClockIn?: string;
  actualClockOut?: string;
  status: 'on_duty' | 'on_break' | 'completed' | 'scheduled' | 'late' | 'flagged';
  elapsedHoursFormatted: string;
  breakMinutesTaken: number;
  breakReliefNurse?: string;
  geofenceVerified: boolean;
  distanceMeters: number;
  beaconVerified: boolean;
  beaconId?: string;
  wifiBssid?: string;
  hourlyRate: number;
  overtimeHours: number;
  restGapHoursSinceLastShift: number;
  hasFatigueWarning: boolean;
  supervisorApprovalStatus: 'pending' | 'approved' | 'adjusted' | 'rejected';
  supervisorApprovedBy?: string;
  supervisorApprovedAt?: string;
  adjustmentReason?: string;
  disputeFlag?: boolean;
}

