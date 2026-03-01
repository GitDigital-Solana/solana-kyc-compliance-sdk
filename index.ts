/**
 * Main type exports for the Solana ZK-KYC SDK
 * @package @solana-zk-kyc/sdk
 */

// Re-export all type modules
export * from './identity';
export * from './compliance';
export * from './blockchain';

// Core SDK Types

/**
 * Supported languages for internationalization
 */
export type SupportedLanguage =
  | 'en'
  | 'es'
  | 'zh-CN'
  | 'ja'
  | 'ko'
  | 'pt'
  | 'fr'
  | 'de';

/**
 * Compliance levels based on verification depth
 */
export type ComplianceLevel = 'BASIC' | 'ENHANCED' | 'ACCREDITED_INVESTOR';

/**
 * Verification status enumeration
 */
export type VerificationStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'VERIFIED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'REVOKED';

/**
 * SDK initialization configuration
 */
export interface SDKConfig {
  /** Solana connection instance */
  connection: import('@solana/web3.js').Connection;
  /** Wallet adapter for transaction signing */
  walletAdapter: import('./blockchain/adapters/interface').WalletAdapter;
  /** Oracle public key for verification */
  oraclePublicKey: import('@solana/web3.js').PublicKey;
  /** List of trusted oracle public keys */
  trustedOracles: import('@solana/web3.js').PublicKey[];
  /** Identity provider configuration */
  identityProvider?: IdentityProviderConfig;
  /** Risk engine configuration */
  riskEngineProvider?: RiskEngineConfig;
  /** Encryption key for sensitive data */
  encryptionKey?: Uint8Array;
  /** Merkle tree depth (default: 20) */
  merkleTreeDepth?: number;
  /** Default language for i18n */
  defaultLanguage?: SupportedLanguage;
  /** Enable ML-based risk assessment */
  enableMLRiskAssessment?: boolean;
  /** Enable automatic compliance reporting */
  enableAutoReporting?: boolean;
  /** Data retention period in days */
  dataRetentionDays?: number;
}

/**
 * Identity provider configuration
 */
export interface IdentityProviderConfig {
  /** Provider type */
  provider: 'persona' | 'sumsub' | 'google' | 'custom';
  /** API key for the provider */
  apiKey: string;
  /** Base URL override */
  baseUrl?: string;
  /** Webhook secret for callbacks */
  webhookSecret?: string;
}

/**
 * Risk engine configuration
 */
export interface RiskEngineConfig {
  /** Risk engine provider */
  provider: 'internal' | 'chainalysis' | 'trmlabs' | 'custom';
  /** API key for risk engine */
  apiKey?: string;
  /** Base URL override */
  baseUrl?: string;
  /** Risk threshold configurations */
  thresholds?: RiskThresholds;
}

/**
 * Risk score thresholds
 */
export interface RiskThresholds {
  /** Low risk maximum score */
  lowMax: number;
  /** Medium risk maximum score */
  mediumMax: number;
}

/**
 * Verification parameters for identity verification
 */
export interface VerificationParams {
  /** KYC provider to use */
  provider: 'persona' | 'sumsub' | 'google';
  /** User's wallet address */
  walletAddress: string;
  /** Required compliance tier */
  tier: ComplianceLevel;
  /** Additional verification requirements */
  requirements?: VerificationRequirements;
  /** User metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Verification requirements
 */
export interface VerificationRequirements {
  /** Require government-issued ID */
  requireIdentityDocs?: boolean;
  /** Require selfie verification */
  requireSelfie?: boolean;
  /** Require proof of address */
  requireAddressProof?: boolean;
  /** Require SSN/TIN (for accredited investors) */
  requireSSN?: boolean;
  /** Require source of funds documentation */
  requireSourceOfFunds?: boolean;
  /** Minimum age requirement */
  minimumAge?: number;
  /** Restricted countries (ISO 3166-1 alpha-2) */
  restrictedCountries?: string[];
  /** Required countries */
  requiredCountries?: string[];
}

/**
 * Verification result
 */
export interface VerificationResult {
  /** Verification status */
  status: VerificationStatus;
  /** Unique verification ID */
  verificationId: string;
  /** Compliance level achieved */
  complianceLevel: ComplianceLevel;
  /** Issued verifiable credential */
  credential?: VerifiableCredential;
  /** ZK proof data */
  proofData?: ZKProofData;
  /** Error message if rejected */
  errorMessage?: string;
  /** Timestamp of verification */
  timestamp: number;
  /** Expiration timestamp */
  expiresAt: number;
}

/**
 * Compliance check result
 */
export interface ComplianceResult {
  /** Whether the wallet is compliant */
  isCompliant: boolean;
  /** Compliance level */
  level: ComplianceLevel;
  /** Verification status */
  verificationStatus: VerificationStatus;
  /** Last verification timestamp */
  lastVerified: number;
  /** Expiration timestamp */
  expiresAt: number;
  /** Risk score if available */
  riskScore?: number;
}

/**
 * Report types for compliance reporting
 */
export type ReportType =
  | 'KYC_SUMMARY'
  | 'AML'
  | 'AUDIT'
  | 'FINCEN'
  | 'OFAC'
  | 'CUSTOM';

/**
 * Report parameters
 */
export interface ReportParams {
  /** Type of report to generate */
  type: ReportType;
  /** User identifier */
  userId?: string;
  /** Wallet address */
  walletAddress?: string;
  /** Report period */
  period?: {
    start: Date;
    end: Date;
  };
  /** Additional options */
  options?: Record<string, unknown>;
}

/**
 * Audit event for tracking verification history
 */
export interface AuditEvent {
  /** Event type */
  eventType: string;
  /** Event timestamp */
  timestamp: number;
  /** User wallet address */
  walletAddress: string;
  /** Event data */
  data: Record<string, unknown>;
  /** Transaction signature */
  txSignature?: string;
}

/**
 * Translation dictionary type
 */
export type TranslationDict = Record<string, string | Record<string, string>>;
