/**
 * Environment Utility
 * 
 * Utility for managing environment variables and program IDs across
 * different clusters (Localnet, Devnet, Mainnet).
 */

import { PublicKey } from '@solana/web3.js';

/**
 * Supported Solana clusters
 */
export type Cluster = 'localnet' | 'devnet' | 'mainnet' | 'testnet';

/**
 * Environment configuration
 */
export interface EnvConfig {
  /** RPC URL */
  rpcUrl: string;
  /** WebSocket URL */
  wsUrl: string;
  /** Program ID */
  programId: string;
  /** Cluster name */
  cluster: Cluster;
}

/**
 * Program IDs for each cluster
 */
const PROGRAM_IDS: Record<Cluster, string> = {
  localnet: 'KYCCo7vM2uLkGzqH6XqKJp1TJK5JjK9jW8vY9xQz1P2',
  devnet: 'KYCCo7vM2uLkGzqH6XqKJp1TJK5JjK9jW8vY9xQz1P2',
  mainnet: 'KYCCo7vM2uLkGzqH6XqKJp1TJK5JjK9jW8vY9xQz1P2',
  testnet: 'KYCCo7vM2uLkGzqH6XqKJp1TJK5JjK9jW8vY9xQz1P2',
};

/**
 * RPC URLs for each cluster
 */
const RPC_URLS: Record<Cluster, string> = {
  localnet: 'http://127.0.0.1:8899',
  devnet: 'https://api.devnet.solana.com',
  mainnet: 'https://api.mainnet-beta.solana.com',
  testnet: 'https://api.testnet.solana.com',
};

/**
 * WebSocket URLs for each cluster
 */
const WS_URLS: Record<Cluster, string> = {
  localnet: 'ws://127.0.0.1:8900',
  devnet: 'wss://api.devnet.solana.com',
  mainnet: 'wss://api.mainnet-beta.solana.com',
  testnet: 'wss://api.testnet.solana.com',
};

/**
 * Get the current cluster from environment
 */
export function getCluster(): Cluster {
  const cluster = process.env.SOLANA_CLUSTER;
  
  if (!cluster) {
    return 'devnet'; // Default to devnet
  }
  
  if (!isValidCluster(cluster)) {
    throw new Error(`Invalid cluster: ${cluster}. Must be one of: localnet, devnet, mainnet, testnet`);
  }
  
  return cluster;
}

/**
 * Validate cluster name
 */
function isValidCluster(cluster: string): cluster is Cluster {
  return ['localnet', 'devnet', 'mainnet', 'testnet'].includes(cluster);
}

/**
 * Get RPC URL for the current cluster
 */
export function getRpcUrl(): string {
  // Check for custom RPC URL
  if (process.env.RPC_URL) {
    return process.env.RPC_URL;
  }
  
  return RPC_URLS[getCluster()];
}

/**
 * Get WebSocket URL for the current cluster
 */
export function getWsUrl(): string {
  // Check for custom WS URL
  if (process.env.WS_URL) {
    return process.env.WS_URL;
  }
  
  return WS_URLS[getCluster()];
}

/**
 * Get program ID for the current cluster
 */
export function getProgramId(): PublicKey {
  // Check for custom program ID
  if (process.env.PROGRAM_ID) {
    try {
      return new PublicKey(process.env.PROGRAM_ID);
    } catch {
      throw new Error(`Invalid PROGRAM_ID: ${process.env.PROGRAM_ID}`);
    }
  }
  
  return new PublicKey(PROGRAM_IDS[getCluster()]);
}

/**
 * Get complete environment configuration
 */
export function getEnvConfig(): EnvConfig {
  const cluster = getCluster();
  
  return {
    rpcUrl: getRpcUrl(),
    wsUrl: getWsUrl(),
    programId: PROGRAM_IDS[cluster],
    cluster,
  };
}

/**
 * Validate required environment variables
 */
export function validateEnv(requiredVars: string[]): void {
  const missing: string[] = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please set these variables in your .env file.`
    );
  }
}

/**
 * Get admin keypair (for testing)
 */
export function getAdminKey(): string | undefined {
  return process.env.ADMIN_KEY;
}

/**
 * Get API keys for external services
 */
export function getApiKeys(): {
  /** Chainalysis API key */
  chainalysis?: string;
  /** TRM Labs API key */
  trmLabs?: string;
  /** Circle API key */
  circle?: string;
  /** Alchemy API key */
  alchemy?: string;
  /** QuickNode API key */
  quicknode?: string;
} {
  return {
    chainalysis: process.env.CHAINALYSIS_API_KEY,
    trmLabs: process.env.TRM_LABS_API_KEY,
    circle: process.env.CIRCLE_API_KEY,
    alchemy: process.env.ALCHEMY_API_KEY,
    quicknode: process.env.QUICKNODE_API_KEY,
  };
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getCluster() === 'mainnet';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return !isProduction();
}

/**
 * Check if running locally
 */
export function isLocal(): boolean {
  return getCluster() === 'localnet';
}

/**
 * Load environment from .env file
 */
export function loadEnvFile(): void {
  try {
    // Try to load dotenv
    const dotenv = require('dotenv');
    dotenv.config();
  } catch {
    // dotenv not available, continue without it
    console.warn('dotenv not available, using process.env directly');
  }
}

/**
 * Get commitment level from environment
 */
export function getCommitment(): 'processed' | 'confirmed' | 'finalized' {
  const commitment = process.env.COMMITMENT;
  
  if (commitment === 'processed' || commitment === 'confirmed' || commitment === 'finalized') {
    return commitment;
  }
  
  // Default to confirmed for better finality guarantees
  return 'confirmed';
}

/**
 * Get timeout settings
 */
export function getTimeoutSettings(): {
  /** Connection timeout in ms */
  connectionTimeout: number;
  /** Transaction timeout in ms */
  transactionTimeout: number;
} {
  return {
    connectionTimeout: parseInt(process.env.CONNECTION_TIMEOUT || '30000', 10),
    transactionTimeout: parseInt(process.env.TRANSACTION_TIMEOUT || '60000', 10),
  };
}

/**
 * Export all environment utilities
 */
export default {
  getCluster,
  getRpcUrl,
  getWsUrl,
  getProgramId,
  getEnvConfig,
  validateEnv,
  getAdminKey,
  getApiKeys,
  isProduction,
  isDevelopment,
  isLocal,
  loadEnvFile,
  getCommitment,
  getTimeoutSettings,
  Cluster,
  EnvConfig,
};
