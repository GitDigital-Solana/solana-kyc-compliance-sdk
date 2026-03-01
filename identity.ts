/**
 * Identity-related type definitions
 * @package @solana-zk-kyc/sdk
 */

import type { PublicKey } from '@solana/web3.js';

/**
 * W3C DID Document
 */
export interface DIDDocument {
  '@context': string | string[];
  id: string;
  verificationMethod?: VerificationMethod[];
  authentication?: string[];
  assertionMethod?: string[];
  capabilityInvocation?: string[];
  capabilityDelegation?: string[];
  service?: ServiceEndpoint[];
}

/**
 * Verification method in DID Document
 */
export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyMultibase?: string;
  publicKeyJwk?: JsonWebKey;
}

/**
 * Service endpoint in DID Document
 */
export interface ServiceEndpoint {
  id: string;
  type: string;
  serviceEndpoint: string | Record<string, string>;
}

/**
 * Verifiable Credential structure
 */
export interface VerifiableCredential {
  '@context': string | string[];
  id: string;
  type: string | string[];
  issuer: string;
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: CredentialSubject;
  proof?: CredentialProof;
}

/**
 * Credential subject containing claims
 */
export interface CredentialSubject {
  id: string;
  [key: string]: unknown;
}

/**
 * Credential proof
 */
export interface CredentialProof {
  type: string;
  created: string;
  proofPurpose: string;
  verificationMethod: string;
  jws?: string;
  proofValue?: string;
}

/**
 * Claim structure for credential issuance
 */
export interface Claim {
  /** Claim key */
  key: string;
  /** Claim value */
  value: unknown;
  /** Claim type */
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
}

/**
 * DID Resolution result
 */
export interface DIDResolutionResult {
  didDocument: DIDDocument | null;
  metadata: DIDResolutionMetadata;
}

/**
 * DID resolution metadata
 */
export interface DIDResolutionMetadata {
  contentType?: string;
  created?: string;
  updated?: string;
  deactivated?: boolean;
  alsoKnownAs?: string[];
  linkedResource?: LinkedResource[];
}

/**
 * Linked resource
 */
export interface LinkedResource {
  id: string;
  type: string;
  description?: string;
  servedAt?: string;
}

/**
 * Credential verification result
 */
export interface CredentialVerificationResult {
  /** Whether the credential is valid */
  isValid: boolean;
  /** Errors if invalid */
  errors?: string[];
  /** Verification metadata */
  metadata?: {
    issuer: string;
    subject: string;
    issuanceDate: string;
    expirationDate?: string;
  };
}

/**
 * Identity entry for Merkle tree
 */
export interface IdentityEntry {
  /** Unique identifier */
  id: string;
  /** DID of the identity */
  did: string;
  /** Wallet address */
  walletAddress: string;
  /** Compliance level */
  complianceLevel: string;
  /** Merkle leaf index */
  leafIndex?: number;
  /** Timestamp of entry */
  timestamp: number;
}

/**
 * User data for identity submission
 */
export interface UserData {
  /** Full legal name */
  fullName: string;
  /** Date of birth (ISO 8601) */
  dateOfBirth: string;
  /** Nationality (ISO 3166-1 alpha-2) */
  nationality: string;
  /** Country of residence */
  countryOfResidence: string;
  /** Email address */
  email?: string;
  /** Phone number (E.164 format) */
  phone?: string;
  /** Address */
  address?: Address;
  /** Government ID number */
  governmentId?: GovernmentId;
  /** Selfie image data (base64) */
  selfieImage?: string;
  /** Document images */
  documentImages?: string[];
}

/**
 * Address structure
 */
export interface Address {
  /** Street address */
  street: string;
  /** City */
  city: string;
  /** State/Province */
  state?: string;
  /** Postal code */
  postalCode: string;
  /** Country (ISO 3166-1 alpha-2) */
  country: string;
}

/**
 * Government ID information
 */
export interface GovernmentId {
  /** ID type */
  type: 'PASSPORT' | 'DRIVERS_LICENSE' | 'NATIONAL_ID' | 'RESIDENCE_PERMIT';
  /** Issuing country */
  issuingCountry: string;
  /** ID number */
  number: string;
  /** Expiration date */
  expirationDate?: string;
}

/**
 * Identity provider response
 */
export interface IdentityProviderResponse {
  /** Session ID */
  sessionId: string;
  /** Status */
  status: 'pending' | 'completed' | 'failed';
  /** Result data */
  data?: Record<string, unknown>;
  /** Error message if failed */
  error?: string;
}

/**
 * KYC session information
 */
export interface KYCSession {
  /** Session ID */
  sessionId: string;
  /** User ID */
  userId: string;
  /** Wallet address */
  walletAddress: string;
  /** Provider */
  provider: string;
  /** Status */
  status: 'pending' | 'in_progress' | 'approved' | 'declined' | 'expired';
  /** Created timestamp */
  createdAt: number;
  /** Updated timestamp */
  updatedAt: number;
  /** Completed timestamp */
  completedAt?: number;
  /** Review notes */
  reviewNotes?: string;
}
