/**
 * KYC Flow Integration Tests
 * 
 * Full end-to-end integration tests for the entire KYC lifecycle,
 * covering user registration, verification, and transfers.
 */

import { 
  Connection, 
  Keypair, 
  PublicKey, 
} from '@solana/web3.js';
import { AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { ComplianceSDK, KycLevel, KycStatus } from '../../sdk/src/compliance-sdk';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';

/**
 * Test Configuration
 */
const TEST_CONFIG = {
  rpcUrl: process.env.RPC_URL || 'http://127.0.0.1:8899',
  programId: new PublicKey('KYCCo7vM2uLkGzqH6XqKJp1TJK5JjK9jW8vY9xQz1P2'),
  commitment: 'confirmed' as const,
};

/**
 * Generate a new keypair for testing
 */
function generateKeypair(): Keypair {
  return Keypair.generate();
}

/**
 * Wait for a specified number of milliseconds
 */
function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('KYC Flow Integration Tests', () => {
  let connection: Connection;
  let provider: AnchorProvider;
  let sdk: ComplianceSDK;
  let adminWallet: Keypair;
  let userA: Keypair;
  let userB: Keypair;
  let userC: Keypair;
  
  /**
   * Setup before each test
   */
  beforeEach(async () => {
    // Create connection
    connection = new Connection(TEST_CONFIG.rpcUrl, TEST_CONFIG.commitment);
    
    // Generate test wallets
    adminWallet = generateKeypair();
    userA = generateKeypair();
    userB = generateKeypair();
    userC = generateKeypair();
    
    // Airdrop SOL to admin for transactions
    const airdropSignature = await connection.requestAirdrop(
      adminWallet.publicKey,
      2 * 1e9 // 2 SOL
    );
    await connection.confirmTransaction(airdropSignature);
    
    // Create provider
    const wallet = new Wallet(adminWallet);
    provider = new AnchorProvider(connection, wallet, {
      commitment: TEST_CONFIG.commitment,
    });
    
    // Initialize SDK
    sdk = new ComplianceSDK({
      rpcUrl: TEST_CONFIG.rpcUrl,
      programId: TEST_CONFIG.programId,
      wallet,
      commitment: TEST_CONFIG.commitment,
    });
    
    // Wait for setup
    await wait(1000);
  });
  
  describe('User Registration', () => {
    /**
     * Test successful user registration
     */
    it('should register a new user successfully', async () => {
      // Airdrop SOL to user
      const airdropSignature = await connection.requestAirdrop(
        userA.publicKey,
        1 * 1e9
      );
      await connection.confirmTransaction(airdropSignature);
      
      // Register user
      const expiryTimestamp = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year
      
      const signature = await sdk.registerUser({
        wallet: userA.publicKey,
        kycLevel: KycLevel.Standard,
        countryCode: 'US',
        expiryTimestamp,
      });
      
      expect(signature).to.be.a('string');
      expect(signature.length).to.be.greaterThan(0);
      
      // Verify registration
      const status = await sdk.checkComplianceStatus(userA.publicKey);
      expect(status.registered).to.be.true;
      expect(status.status).to.equal(KycStatus.Verified);
      expect(status.kycLevel).to.equal(KycLevel.Standard);
      expect(status.countryCode).to.equal('US');
    });
    
    /**
     * Test registration with invalid country
     */
    it('should reject registration from sanctioned country', async () => {
      const expiryTimestamp = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
      
      try {
        await sdk.registerUser({
          wallet: userA.publicKey,
          kycLevel: KycLevel.Standard,
          countryCode: 'KP', // North Korea (sanctioned)
          expiryTimestamp,
        });
        
        // Should not reach here
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).to.include('sanctioned');
      }
    });
    
    /**
     * Test duplicate registration
     */
    it('should handle duplicate registration gracefully', async () => {
      const expiryTimestamp = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
      
      // First registration
      await sdk.registerUser({
        wallet: userA.publicKey,
        kycLevel: KycLevel.Standard,
        countryCode: 'US',
        expiryTimestamp,
      });
      
      // Second registration should succeed (idempotent)
      const signature = await sdk.registerUser({
        wallet: userA.publicKey,
        kycLevel: KycLevel.Enhanced,
        countryCode: 'US',
        expiryTimestamp,
      });
      
      expect(signature).to.be.a('string');
    });
  });
  
  describe('Compliance Status Check', () => {
    /**
     * Test checking status for registered user
     */
    it('should return correct status for registered user', async () => {
      const expiryTimestamp = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
      
      // Register user
      await sdk.registerUser({
        wallet: userA.publicKey,
        kycLevel: KycLevel.Standard,
        countryCode: 'US',
        expiryTimestamp,
      });
      
      // Check status
      const status = await sdk.checkComplianceStatus(userA.publicKey);
      
      expect(status.registered).to.be.true;
      expect(status.status).to.equal(KycStatus.Verified);
      expect(status.wallet).to.equal(userA.publicKey.toString());
    });
    
    /**
     * Test checking status for unregistered user
     */
    it('should return unverified for unregistered user', async () => {
      const status = await sdk.checkComplianceStatus(userA.publicKey);
      
      expect(status.registered).to.be.false;
      expect(status.status).to.equal(KycStatus.Unverified);
    });
  });
  
  describe('Transfer Approval', () => {
    /**
     * Test transfer between two verified users
     */
    it('should approve transfer between verified users', async () => {
      const expiryTimestamp = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
      
      // Register both users
      await sdk.registerUser({
        wallet: userA.publicKey,
        kycLevel: KycLevel.Standard,
        countryCode: 'US',
        expiryTimestamp,
      });
      
      await sdk.registerUser({
        wallet: userB.publicKey,
        kycLevel: KycLevel.Standard,
        countryCode: 'GB',
        expiryTimestamp,
      });
      
      // Approve transfer
      const result = await sdk.approveTransfer(
        userA.publicKey,
        userB.publicKey,
        new (await import('@solana/web3.js')).BN(1000000)
      );
      
      expect(result.approved).to.be.true;
      expect(result.sourceStatus?.status).to.equal(KycStatus.Verified);
      expect(result.destinationStatus?.status).to.equal(KycStatus.Verified);
    });
    
    /**
     * Test rejection of transfer to unverified user
     */
    it('should reject transfer to unverified user', async () => {
      const expiryTimestamp = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
      
      // Register only source
      await sdk.registerUser({
        wallet: userA.publicKey,
        kycLevel: KycLevel.Standard,
        countryCode: 'US',
        expiryTimestamp,
      });
      
      // Approve transfer to unverified
      const result = await sdk.approveTransfer(
        userA.publicKey,
        userC.publicKey,
        new (await import('@solana/web3.js')).BN(1000000)
      );
      
      expect(result.approved).to.be.false;
      expect(result.reason).to.include('Destination wallet not verified');
    });
    
    /**
     * Test rejection of transfer from frozen user
     */
    it('should reject transfer from frozen user', async () => {
      const expiryTimestamp = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
      
      // Register both users
      await sdk.registerUser({
        wallet: userA.publicKey,
        kycLevel: KycLevel.Standard,
        countryCode: 'US',
        expiryTimestamp,
      });
      
      await sdk.registerUser({
        wallet: userB.publicKey,
        kycLevel: KycLevel.Standard,
        countryCode: 'GB',
        expiryTimestamp,
      });
      
      // Freeze source wallet
      await sdk.freezeWallet(userA.publicKey);
      
      // Attempt transfer
      const result = await sdk.approveTransfer(
        userA.publicKey,
        userB.publicKey,
        new (await import('@solana/web3.js')).BN(1000000)
      );
      
      expect(result.approved).to.be.false;
      expect(result.reason).to.include('frozen');
    });
  });
  
  describe('Wallet Freezing', () => {
    /**
     * Test freezing a wallet
     */
    it('should freeze a wallet', async () => {
      const expiryTimestamp = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
      
      // Register user
      await sdk.registerUser({
        wallet: userA.publicKey,
        kycLevel: KycLevel.Standard,
        countryCode: 'US',
        expiryTimestamp,
      });
      
      // Freeze wallet
      const signature = await sdk.freezeWallet(userA.publicKey);
      expect(signature).to.be.a('string');
      
      // Verify frozen status
      const status = await sdk.checkComplianceStatus(userA.publicKey);
      expect(status.status).to.equal(KycStatus.Frozen);
    });
    
    /**
     * Test unfreezing a wallet
     */
    it('should unfreeze a wallet', async () => {
      const expiryTimestamp = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
      
      // Register and freeze
      await sdk.registerUser({
        wallet: userA.publicKey,
        kycLevel: KycLevel.Standard,
        countryCode: 'US',
        expiryTimestamp,
      });
      
      await sdk.freezeWallet(userA.publicKey);
      
      // Unfreeze
      const signature = await sdk.unfreezeWallet(userA.publicKey);
      expect(signature).to.be.a('string');
      
      // Verify status restored
      const status = await sdk.checkComplianceStatus(userA.publicKey);
      expect(status.status).to.equal(KycStatus.Verified);
    });
  });
  
  describe('Circuit Breaker', () => {
    /**
     * Test activating circuit breaker
     */
    it('should activate circuit breaker', async () => {
      const signature = await sdk.activateCircuitBreaker();
      expect(signature).to.be.a('string');
      
      // Verify registry info
      const info = await sdk.getRegistryInfo();
      expect(info.circuitBreakerActive).to.be.true;
    });
    
    /**
     * Test deactivating circuit breaker
     */
    it('should deactivate circuit breaker', async () => {
      // Activate first
      await sdk.activateCircuitBreaker();
      
      // Deactivate
      const signature = await sdk.deactivateCircuitBreaker();
      expect(signature).to.be.a('string');
      
      // Verify
      const info = await sdk.getRegistryInfo();
      expect(info.circuitBreakerActive).to.be.false;
    });
  });
});
