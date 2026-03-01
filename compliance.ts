/**
 * Compliance-related type definitions
 * @package @solana-zk-kyc/sdk
 */

/**
 * Compliance rule definition
 */
export interface ComplianceRule {
  /** Unique rule identifier */
  id: string;
  /** Rule name */
  name: string;
  /** Rule description */
  description: string;
  /** Rule type */
  type: RuleType;
  /** Rule configuration */
  config: RuleConfig;
  /** Whether rule is enabled */
  enabled: boolean;
  /** Priority (lower = higher priority) */
  priority: number;
}

/**
 * Rule type enumeration
 */
export type RuleType =
  | 'AGE_VERIFICATION'
  | 'COUNTRY_RESTRICTION'
  | 'DOCUMENT_VERIFICATION'
  | 'ACCREDITATION_CHECK'
  | 'AML_SCREENING'
  | 'RISK_THRESHOLD'
  | 'WHITELIST'
  | 'BLACKLIST';

/**
 * Rule configuration
 */
export interface RuleConfig {
  /** Minimum age required */
  minimumAge?: number;
  /** Restricted countries */
  restrictedCountries?: string[];
  /** Required countries */
  requiredCountries?: string[];
  /** Required document types */
  requiredDocuments?: string[];
  /** Require accreditation proof */
  requireAccreditation?: boolean;
  /** AML screening required */
  requireAMLScreening?: boolean;
  /** Maximum risk score allowed */
  maxRiskScore?: number;
  /** Whitelisted addresses */
  whitelist?: string[];
  /** Blacklisted addresses */
  blacklist?: string[];
  /** Custom validation function */
  customValidator?: string;
}

/**
 * Compliance template
 */
export interface ComplianceTemplate {
  /** Template identifier */
  id: string;
  /** Template name */
  name: string;
  /** Template description */
  description: string;
  /** Compliance rules */
  rules: ComplianceRule[];
  /** Default compliance level */
  defaultLevel: string;
  /** Template metadata */
  metadata?: Record<string, unknown>;
  /** Created timestamp */
  createdAt: number;
  /** Updated timestamp */
  updatedAt: number;
}

/**
 * Template evaluation result
 */
export interface TemplateEvaluation {
  /** Whether the user passes the template */
  passed: boolean;
  /** List of failed rules */
  failedRules: FailedRule[];
  /** List of passed rules */
  passedRules: string[];
  /** Overall score */
  score: number;
  /** Evaluation timestamp */
  timestamp: number;
}

/**
 * Failed rule information
 */
export interface FailedRule {
  /** Rule ID */
  ruleId: string;
  /** Rule name */
  ruleName: string;
  /** Failure reason */
  reason: string;
  /** Severity */
  severity: 'ERROR' | 'WARNING';
}

/**
 * Risk factor for risk assessment
 */
export interface RiskFactor {
  /** Factor identifier */
  id: string;
  /** Factor name */
  name: string;
  /** Factor category */
  category: RiskFactorCategory;
  /** Risk weight (0-1) */
  weight: number;
  /** Current value */
  value: unknown;
  /** Risk contribution (0-100) */
  riskContribution: number;
}

/**
 * Risk factor category
 */
export type RiskFactorCategory =
  | 'WALLET_HISTORY'
  | 'TRANSACTION_PATTERN'
  | 'GEOGRAPHIC'
  | 'DEVICE'
  | 'BEHAVIORAL'
  | 'EXTERNAL';

/**
 * Risk assessment result
 */
export interface RiskAssessment {
  /** Overall risk score (0-100) */
  riskScore: number;
  /** Risk level */
  riskLevel: RiskLevel;
  /** Contributing factors */
  factors: RiskFactor[];
  /** Recommendations */
  recommendations: string[];
  /** Assessment timestamp */
  timestamp: number;
  /** Expiration timestamp */
  expiresAt: number;
}

/**
 * Risk level enumeration
 */
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * Wallet profile for risk analysis
 */
export interface WalletProfile {
  /** Wallet address */
  address: string;
  /** Wallet age in days */
  walletAge: number;
  /** Total transaction count */
  transactionCount: number;
  /** Total volume (in SOL) */
  totalVolume: number;
  /** Average transaction size */
  averageTransactionSize: number;
  /** Interaction count with high-risk addresses */
  highRiskInteractions: number;
  /** Geographic indicators */
  geographicIndicators?: string[];
  /** Device fingerprints */
  deviceFingerprints?: string[];
  /** Behavioral patterns */
  behavioralPatterns?: string[];
}

/**
 * Compliance report structure
 */
export interface ComplianceReport {
  /** Report ID */
  reportId: string;
  /** Report type */
  type: string;
  /** Generation timestamp */
  generatedAt: number;
  /** Report period */
  period?: {
    start: Date;
    end: Date;
  };
  /** Report data */
  data: ReportData;
  /** Report metadata */
  metadata: ReportMetadata;
}

/**
 * Report data structure
 */
export interface ReportData {
  /** Summary information */
  summary: Record<string, unknown>;
  /** Detailed entries */
  entries: ReportEntry[];
  /** Statistics */
  statistics: Record<string, number>;
}

/**
 * Report entry
 */
export interface ReportEntry {
  /** Entry ID */
  id: string;
  /** Entry timestamp */
  timestamp: number;
  /** Entry type */
  type: string;
  /** Entry data */
  data: Record<string, unknown>;
}

/**
 * Report metadata
 */
export interface ReportMetadata {
  /** Generated by */
  generatedBy: string;
  /** SDK version */
  sdkVersion: string;
  /** Report format version */
  formatVersion: string;
  /** Encryption info */
  encryption?: EncryptionInfo;
}

/**
 * Encryption information
 */
export interface EncryptionInfo {
  /** Encryption algorithm */
  algorithm: string;
  /** Key identifier */
  keyId: string;
  /** Initialization vector */
  iv?: string;
}

/**
 * OFAC screening result
 */
export interface OFACResult {
  /** Whether subject is on OFAC list */
  isMatch: boolean;
  /** Match score (0-100) */
  matchScore: number;
  /** Matched entities */
  matchedEntities: OFACEntity[];
  /** Screening timestamp */
  screenedAt: number;
}

/**
 * OFAC entity
 */
export interface OFACEntity {
  /** Entity ID */
  id: string;
  /** Entity name */
  name: string;
  /** Entity type */
  type: 'INDIVIDUAL' | 'ENTITY' | 'VESSEL' | 'AIRCRAFT';
  /** Program */
  program: string;
  /** List */
  list: string;
  /** Score */
  score: number;
}

/**
 * FinCEN report format
 */
export interface FinCENReport {
  /** Report type */
  reportType: string;
  /** Filing institution */
  filingInstitution: {
    name: string;
    taxId: string;
    contact: string;
  };
  /** Suspicious activity */
  suspiciousActivity: {
    dateRange: {
      start: string;
      end: string;
    };
    suspiciousCount: number;
    totalAmount: number;
    currency: string;
  };
  /** Subject information */
  subject: FinCENSubject;
  /** Activity details */
  activities: FinCENActivity[];
}

/**
 * FinCEN subject
 */
export interface FinCENSubject {
  /** Subject type */
  type: 'INDIVIDUAL' | 'ENTITY';
  /** Name */
  name?: string;
  /** Address */
  address?: string;
  /** TIN */
  tin?: string;
  /** Account numbers */
  accountNumbers?: string[];
}

/**
 * FinCEN activity
 */
export interface FinCENActivity {
  /** Activity date */
  date: string;
  /** Activity type */
  type: string;
  /** Amount */
  amount: number;
  /** Currency */
  currency: string;
  /** Description */
  description: string;
}
