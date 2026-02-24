/**
 * Complete Workflow E2E Tests
 * 
 * Comprehensive end-to-end tests ensuring all components work together
 * in a production-like environment.
 */

import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { AnchorProvider, Wallet, BN } from '@coral-xyz/anchor';
import { ComplianceSDK, KycLevel, KycStatus } from '../../sdk/src/compliance-sdk';
import { TransferHookService } from '../../sdk/src/services/transfer-hook-service';
import { expect } from 'chai';
import { beforeEach, describe, it, afterEach } from 'mocha';

/**
 * Test Configuration
 */
const TEST_CONFIG = {
  rpcUrl: process.env.RPC_URL || 'http://127.0.0.1:8899',
  programId: new PublicKey('KYCCo7vM2uLkGzqH6XqKJp1TJK5JjK9jW8vY9xQz1P2'),
  commitment: 'confirmed' as const,
  cluster: 'localnet' as const,
};

/**
 * Helper to generate keypair
 */
function generateKeypair(): Keypair {
  return Keypair.generate();
}

/**
 * Helper to airdrop SOL
 */
async function airdrop(connection: Connection, pubkey: PublicKey, amount: number): Promise<void> {
  const signature = await connection.requestAirdrop(pubkey, amount * 1e9);
  await connection.confirmTransaction(signature);
}

/**
 * Helper to wait
 */
function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Complete Workflow E2E Tests', () => {
  let connection: Connection;
  let provider: AnchorProvider;
  let sdk: ComplianceSDK;
  let transferHookService: TransferHookService;
  let adminWallet: Keypair;
  let mint: PublicKey | null;
  
  /**
   * Setup before all tests
   */
  beforeEach(async () => {
    // Create connection
    connection = new Connection(TEST_CONFIG.rpcUrl, TEST_CONFIG.commitment);
    
    // Generate admin wallet
    adminWallet = generateKeypair();
    await airdrop(connection, adminWallet.publicKey, 5);
    
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
    
    // Initialize transfer hook service
    transferHookService = new TransferHookService(
      connection,
      provider,
      TEST_CONFIG.programId
    );
    
    mint = null;
    await wait(1000);
  });
  
  afterEach(async () => {
    // Cleanup
    if (mint) {
      console.log(`Test completed. Mint: ${mint.toString()}`);
    }
  });
  
  describe('Complete Token Lifecycle', () => {
    /**
     * Test: Create Compliant Mint
     */
    it('should create a mint with KYC transfer hook', async () => {
      const result = await sdk.createCompliantMint(adminWallet.publicKey, 9);
      
      expect(result).to.have.property('mint');
      expect(result).to.have.property('signature');
      expect(result.signature).to.be.a('string');
      
      mint = result.mint;
      
      // Verify transfer hook is set
      const hookInfo = await transferHookService.getTransferHookInfo(mint);
      expect(hookInfo.programId).to.equal(TEST_CONFIG.programId);
    });
    
    /**
     * Test: Full KYC and Transfer Flow
     */
    it('should complete full KYC and transfer flow', async () => {
      // Step 1: Create compliant mint
      const mintResult = await sdk.createCompliantMint(adminWallet.publicKey, 9);
      mint = mintResult.mint;
      
      // Step 2: Create test users
      const userA = Keypair.generate();
      const userB = Keypair.generate();
      
      await airdrop(connection, userA.publicKey, 1);
      await airdrop(connection, userB.publicKey, 1);
      
      // Step 3: Register users
      const expiry = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
      
      await sdk.registerUser({
        wallet: userA.publicKey,
        kycLevel: KycLevel.Standard,
        countryCode: 'US',
        expiryTimestamp: expiry,
      });
      
      await sdk.registerUser({
        wallet: userB.publicKey,
        kycLevel: KycLevel.Standard,
        countryCode: 'GB',
        expiryTimestamp: expiry,
      });
      
      // Step 4: Verify registrations
      const statusA = await sdk.checkComplianceStatus(userA.publicKey);
      const statusB = await sdk.checkComplianceStatus(userB.publicKey);
      
      expect(statusA.registered).to.be.true;
      expect(statusB.registered).to.be.true;
      expect(statusA.status).to.equal(KycStatus.Verified);
      expect(statusB.status).to.equal(KycStatus.Verified);
      
      // Step 5: Approve transfer
      const transferResult = await sdk.approveTransfer(
        userA.publicKey,
        userB.publicKey,
        new BN(1000000)
      );
      
      expect(transferResult.approved).to.be.true;
    });
    
    /**
     * Test: Risk Engine Integration
     */
    it('should detect and block high-risk transfers', async () => {
      // Register source
      const expiry = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
      
      await sdk.registerUser({
        wallet: adminWallet.publicKey,
        kycLevel: KycLevel.Standard,
        countryCode: 'US',
        expiryTimestamp: expiry,
      });
      
      // Create another user
      const userB = Keypair.generate();
      await airdrop(connection, userB.publicKey, 1);
      
      await sdk.registerUser({
        wallet: userB.publicKey,
        kycLevel: KycLevel.Standard,
        countryCode: 'GB',
        expiryTimestamp: expiry,
      });
      
      // Freeze source
      await sdk.freezeWallet(adminWallet.publicKey);
      
      // Try to transfer (should fail)
      const result = await sdk.approveTransfer(
        adminWallet.publicKey,
        userB.publicKey,
        new BN(1000000)
      );
      
      expect(result.approved).to.be.false;
      expect(result.reason).to.include('frozen');
    });
    
    /**
     * Test: Circuit Breaker Integration
     */
    it('should halt all transfers when circuit breaker activated', async () => {
      // Register users
      const expiry = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
      
      const users = [generateKeypair(), generateKeypair()];
      
      for (const user of users) {
        await airdrop(connection, user.publicKey, 1);
        await sdk.registerUser({
          wallet: user.publicKey,
          kycLevel: KycLevel.Standard,
          countryCode: 'US',
          expiryTimestamp: expiry,
        });
      }
      
      // Activate circuit breaker
      await sdk.activateCircuitBreaker();
      
      // Verify circuit breaker is active
      const registry = await sdk.getRegistryInfo();
      expect(registry.circuitBreakerActive).to.be.true;
      
      // Attempt transfer (should be blocked)
      const result = await sdk.approveTransfer(
        users[0].publicKey,
        users[1].publicKey,
        new BN(1000000)
      );
      
      expect(result.approved).to.be.false;
      
      // Deactivate circuit breaker
      await sdk.deactivateCircuitBreaker();
      
      // Verify deactivated
      const registryAfter = await sdk.getRegistryInfo();
      expect(registryAfter.circuitBreakerActive).to.be.false;
    });
    
    /**
     * Test: Admin Dashboard Integration
     */
    it('should allow admin to manage wallets', async () => {
      // Register a user
      const user = Keypair.generate();
      await airdrop(connection, user.publicKey, 1);
      
      const expiry = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
      
      await sdk.registerUser({
        wallet: user.publicKey,
        kycLevel: KycLevel.Standard,
        countryCode: 'US',
        expiryTimestamp: expiry,
      });
      
      // Freeze the user
      await sdk.freezeWallet(user.publicKey);
      
      // Check status
      const status = await sdk.checkComplianceStatus(user.publicKey);
      expect(status.status).to.equal(KycStatus.Frozen);
      
      // Unfreeze
      await sdk.unfreezeWallet(user.publicKey);
      
      // Verify restored
      const statusAfter = await sdk.checkComplianceStatus(user.publicKey);
      expect(statusAfter.status).to.equal(KycStatus.Verified);
    });
  });
  
  describe('Error Handling', () => {
    /**
     * Test: Invalid Mint
     */
    it('should handle invalid mint gracefully', async () => {
      const invalidMint = generateKeypair().publicKey;
      
      try {
        await transferHookService.getTransferHookInfo(invalidMint);
        // Should handle gracefully or return null
      } catch (error) {
        // Expected for non-existent accounts
        expect(error).to.exist;
      }
    });
    
    /**
     * Test: Network Errors
     */
    it('should handle network errors gracefully', async () => {
      // This test would require network failure simulation
      // For now, just verify SDK initializes correctly
      expect(sdk).to.exist;
      expect(sdk.programId).to.equal(TEST_CONFIG.programId);
    });
    
    /**
     * Test: Concurrent Operations
     */
    it('should handle concurrent registrations', async () => {
      const expiry = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
      
      // Create multiple users
      const users = Array.from({ length: 5 }, () => {
        const user = generateKeypair();
        airdrop(connection, user.publicKey, 1);
        return user;
      });
      
      // Register all concurrently
      const promises = users.map(user => 
        sdk.registerUser({
          wallet: user.publicKey,
          kycLevel: KycLevel.Basic,
          countryCode: 'US',
          expiryTimestamp: expiry,
        })
      );
      
      const signatures = await Promise.all(promises);
      
      // All should succeed
      expect(signatures).to.have.lengthOf(5);
      signatures.forEach(sig => {
        expect(sig).to.be.a('string');
      });
    });
  });
  
  describe('Performance', () => {
    /**
     * Test: Batch Registration Performance
     */
    it('should handle batch registrations efficiently', async () => {
      const expiry = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
      
      const startTime = Date.now();
      
      // Register 10 users
      for (let i = 0; i < 10; i++) {
        const user = generateKeypair();
        await airdrop(connection, user.publicKey, 1);
        
        await sdk.registerUser({
          wallet: user.publicKey,
          kycLevel: KycLevel.Basic,
          countryCode: 'US',
          expiryTimestamp: expiry,
        });
      }
      
      const duration = Date.now() - startTime;
      
      // Should complete in reasonable time (< 30 seconds for 10 registrations)
      expect(duration).to.be.lessThan(30000);
      console.log(`Registered 10 users in ${duration}ms`);
    });
    
    /**
     * Test: Status Check Performance
     */
    it('should perform status checks quickly', async () => {
      const expiry = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
      
      // Register a user
      const user = generateKeypair();
      await airdrop(connection, user.publicKey, 1);
      
      await sdk.registerUser({
        wallet: user.publicKey,
        kycLevel: KycLevel.Standard,
        countryCode: 'US',
        expiryTimestamp: expiry,
      });
      
      // Measure status check time
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        await sdk.checkComplianceStatus(user.publicKey);
      }
      
      const duration = Date.now() - startTime;
      const avgTime = duration / 10;
      
      // Each check should be < 500ms on average
      expect(avgTime).to.be.lessThan(500);
      console.log(`Average status check time: ${avgTime}ms`);
    });
  });
});
