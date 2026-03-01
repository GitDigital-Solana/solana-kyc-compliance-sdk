/**
 * SDK Compliance Module Tests
 * @package @solana-zk-kyc/sdk
 */

import { PublicKey } from '@solana/web3.js';
import { createSDK } from '../src/index';
import type { SDKConfig } from '../src/types/index';

describe('SolanaZKYCSDK', () => {
  let sdk: ReturnType<typeof createSDK>;
  let config: SDKConfig;

  beforeEach(async () => {
    config = {
      connection: {
        getGenesisHash: async () => 'genesis',
        getLatestBlockhash: async () => ({
          blockhash: 'blockhash',
          lastValidBlockHeight: 100,
        }),
        getSlot: async () => 1,
        getTransaction: async () => null,
        getSignaturesForAddress: async () => [],
        onLogs: () => {},
      } as any,
      walletAdapter: {
        publicKey: new PublicKey('TestWallet111111111111111111111111111'),
        connected: true,
        name: 'Test',
        connect: async () => {},
        disconnect: async () => {},
        signTransaction: async (tx) => tx,
        signAllTransactions: async (txs) => txs,
        signMessage: async (msg) => new Uint8Array(64),
        on: () => {},
        off: () => {},
      } as any,
      oraclePublicKey: new PublicKey('7xMXt7G2m4duV8dH6E4t5T8yZ9v1R3w4Q5P6S7T8U9V'),
      trustedOracles: [new PublicKey('7xMXt7G2m4duV8dH6E4t5T8yZ9v1R3w4Q5P6S7T8U9V')],
      enableMLRiskAssessment: true,
      enableAutoReporting: true,
      merkleTreeDepth: 20,
      defaultLanguage: 'en',
    };

    sdk = createSDK(config);
    await sdk.initialize();
  });

  test('should initialize SDK', () => {
    expect(sdk.isInitialized()).toBe(true);
  });

  test('should get SDK version', () => {
    const version = sdk.getVersion();
    expect(version).toBe('1.0.0');
  });

  test('should verify identity', async () => {
    const walletAddress = 'TestWallet12345678901234567890123456789';

    const result = await sdk.verifyIdentity({
      provider: 'persona',
      walletAddress,
      tier: 'BASIC',
    });

    expect(result.status).toBe('VERIFIED');
    expect(result.verificationId).toBeDefined();
    expect(result.complianceLevel).toBe('BASIC');
    expect(result.credential).toBeDefined();
    expect(result.timestamp).toBeDefined();
    expect(result.expiresAt).toBeDefined();
  });

  test('should get verification status', async () => {
    const walletAddress = 'TestWallet12345678901234567890123456790';
    const publicKey = new PublicKey(walletAddress);

    // First verify the user
    await sdk.verifyIdentity({
      provider: 'persona',
      walletAddress,
      tier: 'BASIC',
    });

    // Then check status
    const status = await sdk.getVerificationStatus(publicKey);

    expect(status).toBeDefined();
    expect(status.verificationStatus).toBeDefined();
  });

  test('should assess risk', async () => {
    const walletAddress = 'TestWallet12345678901234567890123456791';

    const assessment = await sdk.assessRisk(walletAddress);

    expect(assessment.riskScore).toBeDefined();
    expect(assessment.riskLevel).toBeDefined();
    expect(assessment.factors).toBeDefined();
    expect(assessment.recommendations).toBeDefined();
  });

  test('should check compliance', async () => {
    const walletAddress = 'TestWallet12345678901234567890123456792';
    const publicKey = new PublicKey(walletAddress);

    // Verify user first
    await sdk.verifyIdentity({
      provider: 'persona',
      walletAddress,
      tier: 'ENHANCED',
    });

    // Check compliance
    const compliance = await sdk.checkCompliance(publicKey);

    expect(compliance.isCompliant).toBeDefined();
    expect(compliance.level).toBeDefined();
    expect(compliance.verificationStatus).toBeDefined();
  });

  test('should generate report', async () => {
    const walletAddress = 'TestWallet12345678901234567890123456793';

    await sdk.verifyIdentity({
      provider: 'persona',
      walletAddress,
      tier: 'BASIC',
    });

    const report = await sdk.generateReport({
      type: 'KYC_SUMMARY',
      walletAddress,
      period: {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31'),
      },
    });

    expect(report.reportId).toBeDefined();
    expect(report.type).toBe('KYC_SUMMARY');
    expect(report.generatedAt).toBeDefined();
    expect(report.data).toBeDefined();
  });

  test('should evaluate template', () => {
    const result = sdk.evaluateTemplate('GLOBAL_BASIC', {
      walletAddress: 'TestWallet',
      dateOfBirth: '1990-01-01',
      countryOfResidence: 'US',
      nationality: 'US',
      documentsVerified: true,
    });

    expect(result.passed).toBeDefined();
    expect(result.score).toBeDefined();
    expect(result.timestamp).toBeDefined();
  });

  test('should set and get language', () => {
    sdk.setLanguage('es');

    const supportedLanguages = sdk.getSupportedLanguages();
    expect(supportedLanguages).toContain('es');
  });

  test('should translate keys', () => {
    sdk.setLanguage('en');

    const translation = sdk.t('verification.start');
    expect(translation).toBe('Start Verification');
  });

  test('should get template registry', () => {
    const registry = sdk.getTemplateRegistry();

    expect(registry).toBeDefined();
    expect(registry.getAllTemplates()).toBeDefined();
  });

  test('should get identity manager', () => {
    const manager = sdk.getIdentityManager();

    expect(manager).toBeDefined();
  });

  test('should get risk engine', () => {
    const engine = sdk.getRiskEngine();

    expect(engine).toBeDefined();
  });
});

describe('SDK Internationalization', () => {
  let sdk: ReturnType<typeof createSDK>;

  beforeEach(async () => {
    sdk = createSDK({
      connection: {
        getGenesisHash: async () => 'genesis',
      } as any,
      walletAdapter: {
        publicKey: new PublicKey('TestWallet111111111111111111111111111'),
        connected: true,
        name: 'Test',
        connect: async () => {},
        disconnect: async () => {},
        signTransaction: async (tx) => tx,
        signAllTransactions: async (txs) => txs,
        signMessage: async (msg) => new Uint8Array(64),
        on: () => {},
        off: () => {},
      } as any,
      oraclePublicKey: new PublicKey('7xMXt7G2m4duV8dH6E4t5T8yZ9v1R3w4Q5P6S7T8U9V'),
      trustedOracles: [new PublicKey('7xMXt7G2m4duV8dH6E4t5T8yZ9v1R3w4Q5P6S7T8U9V')],
      defaultLanguage: 'en',
    });
    await sdk.initialize();
  });

  test('should support multiple languages', () => {
    const languages = ['en', 'es', 'zh-CN', 'ja', 'ko', 'pt', 'fr', 'de'];

    for (const lang of languages) {
      sdk.setLanguage(lang);
      expect(sdk.getSupportedLanguages()).toContain(lang);
    }
  });

  test('should translate to Spanish', () => {
    sdk.setLanguage('es');
    expect(sdk.t('verification.start')).toBe('Iniciar Verificacion');
  });

  test('should translate to Chinese', () => {
    sdk.setLanguage('zh-CN');
    expect(sdk.t('verification.start')).toBe('开始验证');
  });

  test('should translate to Japanese', () => {
    sdk.setLanguage('ja');
    expect(sdk.t('verification.start')).toBe('確認開始');
  });
});
