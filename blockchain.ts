/**
 * Blockchain-related type definitions
 * @package @solana-zk-kyc/sdk
 */

import type { PublicKey, TransactionSignature } from '@solana/web3.js';

/**
 * ZK Proof data structure
 */
export interface ZKProofData {
  /** Proof A component */
  pi_a: string[];
  /** Proof B component */
  pi_b: string[][];
  /** Proof C component */
  pi_c: string[];
  /** Public signals */
  publicSignals: string[];
  /** Merkle root */
  merkleRoot: string;
  /** Nullifier */
  nullifier: string;
  /** Compliance level */
  complianceLevel: string;
}

/**
 * Oracle information
 */
export interface OracleInfo {
  /** Oracle public key */
  publicKey: PublicKey;
  /** Oracle name */
  name: string;
  /** Oracle description */
  description?: string;
  /** Oracle reputation score */
  reputationScore: number;
  /** Oracle capabilities */
  capabilities: OracleCapability[];
  /** Oracle status */
  status: OracleStatus;
  /** Last update timestamp */
  lastUpdated: number;
}

/**
 * Oracle capability
 */
export type OracleCapability =
  | 'IDENTITY_VERIFICATION'
  | 'RISK_ASSESSMENT'
  | 'COMPLIANCE_REPORTING'
  | 'AML_SCREENING';

/**
 * Oracle status
 */
export type OracleStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DEPRECATED';

/**
 * Oracle verification result
 */
export interface OracleVerification {
  /** Whether the oracle is verified */
  isVerified: boolean;
  /** Oracle information */
  oracle: OracleInfo;
  /** Verification timestamp */
  verifiedAt: number;
  /** Expiration timestamp */
  expiresAt: number;
}

/**
 * Compliance state account
 */
export interface ComplianceState {
  /** Account public key */
  publicKey: PublicKey;
  /** Authority */
  authority: PublicKey;
  /** Merkle tree root */
  merkleRoot: string;
  /** Number of verified users */
  verifiedCount: number;
  /** Last update timestamp */
  lastUpdate: number;
  /** Oracle public key */
  oracle: PublicKey;
  /** Is initialized */
  isInitialized: boolean;
}

/**
 * User compliance entry
 */
export interface UserComplianceEntry {
  /** User wallet address */
  walletAddress: PublicKey;
  /** Compliance level */
  complianceLevel: string;
  /** Verification status */
  status: string;
  /** Merkle leaf index */
  leafIndex: number;
  /** Nullifier */
  nullifier: string;
  /** Verification timestamp */
  verifiedAt: number;
  /** Expiration timestamp */
  expiresAt: number;
  /** Risk score */
  riskScore?: number;
}

/**
 * Trust template configuration
 */
export interface TrustTemplateConfig {
  /** Template ID */
  templateId: string;
  /** Template name */
  name: string;
  /** Required compliance level */
  requiredLevel: string;
  /** Required rules */
  requiredRules: string[];
  /** Trusted oracles */
  trustedOracles: PublicKey[];
  /** Geographic restrictions */
  geographicRestrictions?: {
    type: 'ALLOW' | 'DENY';
    countries: string[];
  };
  /** Age restrictions */
  ageRestriction?: {
    minimumAge: number;
  };
}

/**
 * Transaction result
 */
export interface TransactionResult {
  /** Transaction signature */
  signature: TransactionSignature;
  /** Block number */
  blockNumber: number;
  /** Confirmation status */
  status: 'CONFIRMED' | 'FINALIZED' | 'FAILED';
  /** Timestamp */
  timestamp: number;
  /** Error message if failed */
  error?: string;
}

/**
 * Program instruction types
 */
export interface ProgramInstruction {
  /** Instruction name */
  name: string;
  /** Instruction data */
  data: Uint8Array;
  /** Program ID */
  programId: PublicKey;
  /** Accounts */
  accounts: AccountMeta[];
}

/**
 * Account metadata for instructions
 */
export interface AccountMeta {
  /** Public key */
  pubkey: PublicKey;
  /** Is writable */
  isWritable: boolean;
  /** Is signer */
  isSigner: boolean;
}

/**
 * Anchor program interface
 */
export interface AnchorProgramInterface {
  /** Program ID */
  programId: PublicKey;
  /** Provider */
  provider: AnchorProvider;
  /** Methods */
  methods: AnchorMethods;
}

/**
 * Anchor provider
 */
export interface AnchorProvider {
  /** Connection */
  connection: import('@solana/web3.js').Connection;
  /** Wallet */
  wallet: AnchorWallet;
}

/**
 * Anchor wallet interface
 */
export interface AnchorWallet {
  /** Public key */
  publicKey: PublicKey;
  /** Sign transaction */
  signTransaction: (
    transaction: import('@solana/web3.js').Transaction
  ) => Promise<import('@solana/web3.js').Transaction>;
  /** Sign all transactions */
  signAllTransactions: (
    transactions: import('@solana/web3.js').Transaction[]
  ) => Promise<import('@solana/web3.js').Transaction[]>;
}

/**
 * Anchor methods
 */
export interface AnchorMethods {
  /** Verify proof method */
  verifyProof: (proof: ZKProofData) => Promise<TransactionResult>;
  /** Register compliance method */
  registerCompliance: (params: RegisterComplianceParams) => Promise<TransactionResult>;
  /** Check status method */
  checkStatus: (wallet: PublicKey) => Promise<UserComplianceEntry | null>;
  /** Update merkle root method */
  updateMerkleRoot: (root: string) => Promise<TransactionResult>;
}

/**
 * Register compliance parameters
 */
export interface RegisterComplianceParams {
  /** Wallet address */
  wallet: PublicKey;
  /** ZK Proof data */
  proof: ZKProofData;
  /** Compliance level */
  complianceLevel: string;
}

/**
 * Wallet connection events
 */
export interface WalletConnectionEvent {
  /** Event type */
  type: 'connect' | 'disconnect' | 'accountChange';
  /** Wallet public key */
  publicKey: PublicKey;
}

/**
 * Network configuration
 */
export interface NetworkConfig {
  /** Network type */
  network: 'mainnet' | 'devnet' | 'testnet';
  /** RPC endpoint */
  rpcEndpoint: string;
  /** WebSocket endpoint */
  wsEndpoint?: string;
}
