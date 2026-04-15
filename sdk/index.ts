```
/* Author: RickCreator87 | Copyright: GitDigital Solana  2026 */
/ sdk/index.ts
```

```typescript
import { Connection, PublicKey, Transaction, Keypair } from '@solana/web3.js';
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import { TransferHookHelper } from './transfer-hook-helper';
import { ComplianceClient } from './compliance-client';

export interface KYCSDKConfig {
  connection: Connection;
  programId: PublicKey;
  wallet: Keypair;
  tokenMint: PublicKey;
}

export class SolanaKYCSDK {
  private program: Program;
  private transferHelper: TransferHookHelper;
  private complianceClient: ComplianceClient;
  private connection: Connection;

  constructor(config: KYCSDKConfig) {
    this.connection = config.connection;
    const provider = new AnchorProvider(
      config.connection,
      {
        publicKey: config.wallet.publicKey,
        signTransaction: async (tx: Transaction) => {
          tx.partialSign(config.wallet);
          return tx;
        },
        signAllTransactions: async (txs: Transaction[]) => {
          txs.forEach(tx => tx.partialSign(config.wallet));
          return txs;
        },
      },
      {}
    );
    
    // Load IDL
    const idl = require('../target/idl/solana_kyc_sdk.json');
    this.program = new Program(idl as Idl, config.programId, provider);
    this.transferHelper = new TransferHookHelper(this.program);
    this.complianceClient = new ComplianceClient(this.program, this.connection);
  }

  async issueIdentityBadge(
    user: PublicKey,
    jurisdiction: 'Colorado' | 'California' | 'NewYork' | 'EU' | 'UK' | 'Singapore',
    encryptedMetadata: Uint8Array,
    zkProofHash: Uint8Array
  ): Promise<string> {
    if (encryptedMetadata.length > 512) {
      throw new Error('Metadata exceeds maximum size of 512 bytes');
    }

    if (zkProofHash.length !== 32) {
      throw new Error('ZK proof hash must be 32 bytes');
    }

    const tx = await this.program.methods
      .issueIdentityBadge(
        user,
        { [jurisdiction.toLowerCase()]: {} },
        Array.from(encryptedMetadata),
        Array.from(zkProofHash)
      )
      .accounts({
        registry: this.getRegistryPDA(),
        authority: this.program.provider.publicKey,
        payer: this.program.provider.publicKey,
        user: user,
      })
      .transaction();

    const signature = await this.program.provider.sendAndConfirm(tx);
    return signature;
  }

  async verifyTransferCompliance(
    fromUser: PublicKey,
    toUser: PublicKey
  ): Promise<boolean> {
    try {
      const registry = this.getRegistryPDA();
      const fromBadge = this.getIdentityBadgePDA(fromUser);
      const toBadge = this.getIdentityBadgePDA(toUser);

      const result = await this.program.methods
        .verifyTransferCompliance(fromUser, toUser)
        .accounts({
          registry,
          fromBadge,
          toBadge,
          fromUser,
          toUser,
        })
        .view();

      return true;
    } catch (error) {
      console.error('Compliance verification failed:', error);
      return false;
    }
  }

  async revokeIdentityBadge(user: PublicKey): Promise<string> {
    const tx = await this.program.methods
      .revokeIdentityBadge()
      .accounts({
        registry: this.getRegistryPDA(),
        identityBadge: this.getIdentityBadgePDA(user),
        authority: this.program.provider.publicKey,
        user: user,
      })
      .transaction();

    return await this.program.provider.sendAndConfirm(tx);
  }

  async assetRecoveryClawback(
    sourceAccount: PublicKey,
    destinationAccount: PublicKey,
    amount: number,
    legalCaseId: Uint8Array
  ): Promise<string> {
    if (legalCaseId.length !== 32) {
      throw new Error('Legal case ID must be 32 bytes');
    }

    const tx = await this.program.methods
      .assetRecoveryClawback(new anchor.BN(amount), Array.from(legalCaseId))
      .accounts({
        registry: this.getRegistryPDA(),
        recoveryAuthority: this.program.provider.publicKey,
        sourceAccount,
        destinationAccount,
        tokenProgram: new PublicKey('TokenzQdWbKqbK8CxNJZr3uKzC8o5K7XJq6V8jXpQ7X'),
      })
      .transaction();

    return await this.program.provider.sendAndConfirm(tx);
  }

  async getIdentityBadge(user: PublicKey): Promise<any> {
    const badgePDA = this.getIdentityBadgePDA(user);
    return await this.program.account.identityBadge.fetch(badgePDA);
  }

  async getRegistry(): Promise<any> {
    const registryPDA = this.getRegistryPDA();
    return await this.program.account.complianceRegistry.fetch(registryPDA);
  }

  private getRegistryPDA(): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('registry')],
      this.program.programId
    );
    return pda;
  }

  private getIdentityBadgePDA(user: PublicKey): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('identity_badge'), user.toBuffer()],
      this.program.programId
    );
    return pda;
  }
}

export * from './transfer-hook-helper';
export * from './compliance-client';
```
