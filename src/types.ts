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
  | 'cancelled';

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
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
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
