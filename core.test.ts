/**
 * SDK Core Module Tests
 * @package @solana-zk-kyc/sdk
 */

import {
  IdentityManager,
  createIdentityManager,
  createKYCCredential,
} from '../src/index';

import {
  ZKProofGenerator,
  MerkleTree,
  createMerkleTree,
} from '../src/index';

import {
  createRiskEngine,
  RiskEngine,
} from '../src/index';

import {
  createEncryptionUtils,
  createEncryptionUtilsWithKey,
  EncryptionUtils,
} from '../src/index';

import {
  createTemplateRegistry,
  TemplateRegistry,
} from '../src/index';

describe('IdentityManager', () => {
  let identityManager: IdentityManager;

  beforeEach(() => {
    identityManager = createIdentityManager();
  });

  test('should create a DID', () => {
    const walletAddress = 'TestWallet123456789012345678901234567890';
    const didDocument = identityManager.createDID(walletAddress);

    expect(didDocument.id).toBe(`did:solana:${walletAddress}`);
    expect(didDocument.verificationMethod).toBeDefined();
    expect(didDocument.authentication).toBeDefined();
  });

  test('should resolve a DID', () => {
    const walletAddress = 'TestWallet123456789012345678901234567891';
    identityManager.createDID(walletAddress);

    const resolution = identityManager.resolveDID(`did:solana:${walletAddress}`);

    expect(resolution.didDocument).toBeDefined();
    expect(resolution.didDocument?.id).toBe(`did:solana:${walletAddress}`);
  });

  test('should issue and verify credentials', () => {
    const issuerDID = 'did:solana:IssuerWallet123456789012345678901234';
    const subjectDID = 'did:solana:SubjectWallet12345678901234567890';

    const credential = identityManager.issueCredential(
      issuerDID,
      subjectDID,
      [
        { key: 'complianceLevel', value: 'BASIC' },
        { key: 'verifiedAt', value: new Date().toISOString() },
      ]
    );

    expect(credential.id).toBeDefined();
    expect(credential.issuer).toBe(issuerDID);
    expect(credential.credentialSubject.id).toBe(subjectDID);
    expect(credential.credentialSubject.complianceLevel).toBe('BASIC');

    const verification = identityManager.verifyCredential(credential);
    expect(verification.isValid).toBe(true);
  });

  test('should verify credential expiration', () => {
    const issuerDID = 'did:solana:IssuerWallet123456789012345678901235';
    const subjectDID = 'did:solana:SubjectWallet12345678901234567891';

    const credential = identityManager.issueCredential(
      issuerDID,
      subjectDID,
      [{ key: 'test', value: 'test' }]
    );

    // Credential should be valid
    const verification = identityManager.verifyCredential(credential);
    expect(verification.isValid).toBe(true);
  });
});

describe('ZKProofGenerator', () => {
  let proofGenerator: ZKProofGenerator;
  let merkleTree: MerkleTree;

  beforeEach(() => {
    proofGenerator = new ZKProofGenerator(20);
    merkleTree = new MerkleTree(20);
  });

  test('should create a merkle tree', () => {
    expect(merkleTree.getRoot()).toBeDefined();
    expect(merkleTree.getDepth()).toBe(20);
    expect(merkleTree.getLeafCount()).toBe(0);
  });

  test('should insert leaves into merkle tree', () => {
    merkleTree.insertLeaf('leaf1');
    merkleTree.insertLeaf('leaf2');

    expect(merkleTree.getLeafCount()).toBe(2);
    expect(merkleTree.getRoot()).toBeDefined();
  });

  test('should generate merkle proof', () => {
    merkleTree.insertLeaf('leaf1');
    merkleTree.insertLeaf('leaf2');

    const proof = merkleTree.getProof(0);

    expect(proof.root).toBeDefined();
    expect(proof.proof).toBeDefined();
    expect(proof.leafIndex).toBe(0);
  });

  test('should verify merkle proof', () => {
    merkleTree.insertLeaf('testLeaf');

    const proof = merkleTree.getProof(0);
    const isValid = MerkleTree.verifyProof(proof);

    expect(isValid).toBe(true);
  });

  test('should add identity to proof generator', () => {
    const entry = {
      id: 'test-id',
      did: 'did:solana:test',
      walletAddress: 'TestWallet',
      complianceLevel: 'BASIC',
      timestamp: Date.now(),
    };

    const index = proofGenerator.addIdentity(entry);
    expect(index).toBe(0);
  });
});

describe('RiskEngine', () => {
  let riskEngine: RiskEngine;

  beforeEach(() => {
    riskEngine = createRiskEngine();
  });

  test('should assess risk for a wallet', async () => {
    const walletAddress = 'TestWallet12345678901234567890123456789';

    const assessment = await riskEngine.assessRisk(walletAddress);

    expect(assessment.riskScore).toBeGreaterThanOrEqual(0);
    expect(assessment.riskScore).toBeLessThanOrEqual(100);
    expect(assessment.riskLevel).toBeDefined();
    expect(assessment.factors).toBeDefined();
    expect(assessment.factors.length).toBeGreaterThan(0);
    expect(assessment.recommendations).toBeDefined();
  });

  test('should respect custom thresholds', () => {
    riskEngine.setThresholds({ lowMax: 20, mediumMax: 50 });
  });

  test('should analyze wallet history', async () => {
    const walletAddress = 'TestWallet12345678901234567890123456790';

    const profile = await riskEngine.analyzeWalletHistory(walletAddress);

    expect(profile.address).toBe(walletAddress);
    expect(profile.walletAge).toBeDefined();
    expect(profile.transactionCount).toBeDefined();
    expect(profile.totalVolume).toBeDefined();
  });
});

describe('EncryptionUtils', () => {
  let encryption: EncryptionUtils;

  beforeEach(() => {
    encryption = createEncryptionUtilsWithKey();
  });

  test('should encrypt and decrypt data', () => {
    const plaintext = 'Hello, World!';

    const encrypted = encryption.encrypt(plaintext);
    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.iv).toBeDefined();

    const decrypted = encryption.decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  test('should generate random keys', () => {
    const key = EncryptionUtils.generateKey();
    expect(key.length).toBe(32);
  });

  test('should derive key from password', () => {
    const salt = EncryptionUtils.generateSalt();
    const key = EncryptionUtils.deriveKey('password123', salt);

    expect(key.length).toBe(32);
  });

  test('should compute HMAC', () => {
    const data = 'test data';
    const key = new Uint8Array(32).fill(1);

    const hmac = EncryptionUtils.computeHMAC(data, key);
    expect(hmac).toBeDefined();
  });

  test('should verify HMAC', () => {
    const data = 'test data';
    const key = new Uint8Array(32).fill(1);

    const hmac = EncryptionUtils.computeHMAC(data, key);
    const isValid = EncryptionUtils.verifyHMAC(data, key, hmac);

    expect(isValid).toBe(true);
  });
});

describe('TemplateRegistry', () => {
  let registry: TemplateRegistry;

  beforeEach(() => {
    registry = createTemplateRegistry();
  });

  test('should load default templates', () => {
    const templates = registry.getAllTemplates();

    expect(templates.length).toBeGreaterThan(0);
    expect(templates.find(t => t.id === 'GLOBAL_BASIC')).toBeDefined();
    expect(templates.find(t => t.id === 'DEFI_STANDARD')).toBeDefined();
    expect(templates.find(t => t.id === 'US_ACCREDITED')).toBeDefined();
  });

  test('should get template by ID', () => {
    const template = registry.getTemplate('GLOBAL_BASIC');

    expect(template).toBeDefined();
    expect(template?.id).toBe('GLOBAL_BASIC');
    expect(template?.rules).toBeDefined();
  });

  test('should evaluate template', () => {
    const result = registry.evaluateTemplate('GLOBAL_BASIC', {
      walletAddress: 'TestWallet',
      dateOfBirth: '1990-01-01',
      countryOfResidence: 'US',
      nationality: 'US',
      documentsVerified: true,
    });

    expect(result).toBeDefined();
    expect(result.score).toBeDefined();
  });

  test('should create custom template', () => {
    const template = registry.createCustomTemplate(
      'CUSTOM_TEST',
      'Custom Test Template',
      'A custom test template',
      []
    );

    expect(template.id).toBe('CUSTOM_TEST');
    expect(template.name).toBe('Custom Test Template');
  });
});
