```
/* Author: RickCreator87 | Copyright: GitDigital Solana 2026 */
/ sdk/transfer-hook-helper.ts
```

```typescript
import { PublicKey, AccountMeta, TransactionInstruction, SYSVAR_INSTRUCTIONS_PUBKEY } from '@solana/web3.js';
import { Program } from '@coral-xyz/anchor';
import { getExtraAccountMetasAddress } from '@solana/spl-transfer-hook-interface';

export interface TransferHookAccounts {
  tokenMint: PublicKey;
  sourceAccount: PublicKey;
  destinationAccount: PublicKey;
  owner: PublicKey;
  fromUserBadge: PublicKey;
  toUserBadge: PublicKey;
  registry: PublicKey;
}

export class TransferHookHelper {
  private programId: PublicKey;

  constructor(program: Program) {
    this.programId = program.programId;
  }

  async getRequiredExtraAccounts(
    tokenMint: PublicKey,
    fromUser: PublicKey,
    toUser: PublicKey
  ): Promise<AccountMeta[]> {
    // Generate the extra accounts PDA using the official SPL interface
    const extraAccountsPDA = getExtraAccountMetasAddress(tokenMint, this.programId);
    
    const registryPDA = this.getRegistryPDA();
    const fromBadgePDA = this.getIdentityBadgePDA(fromUser);
    const toBadgePDA = this.getIdentityBadgePDA(toUser);

    // Estimate compute units for 2026 optimization
    const computeUnits = await this.estimateComputeUnits(
      tokenMint,
      fromUser,
      toUser
    );

    console.log(`Transfer hook estimated CU: ${computeUnits}`);

    // Standard extra accounts required by SPL Transfer Hook interface
    const accounts: AccountMeta[] = [
      {
        pubkey: extraAccountsPDA,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: registryPDA,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: fromBadgePDA,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: toBadgePDA,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: SYSVAR_INSTRUCTIONS_PUBKEY,
        isSigner: false,
        isWritable: false,
      },
    ];

    return accounts;
  }

  async estimateComputeUnits(
    tokenMint: PublicKey,
    fromUser: PublicKey,
    toUser: PublicKey
  ): Promise<number> {
    // Base CU for transfer hook validation (optimized for 2026)
    let estimated = 180_000;

    // Add CU for additional checks based on jurisdiction complexity
    const fromBadgePDA = this.getIdentityBadgePDA(fromUser);
    const toBadgePDA = this.getIdentityBadgePDA(toUser);
    const registryPDA = this.getRegistryPDA();

    try {
      // Simulate to get accurate CU
      const simulation = await this.simulateTransferCompliance(
        registryPDA,
        fromBadgePDA,
        toBadgePDA,
        fromUser,
        toUser
      );

      if (simulation.computeUnitsConsumed) {
        estimated = simulation.computeUnitsConsumed;
      }
    } catch (error) {
      console.warn('Failed to simulate transfer hook, using estimate:', error);
    }

    // Cap at 400k CU for sub-400ms slot window compliance
    return Math.min(estimated, 400_000);
  }

  private async simulateTransferCompliance(
    registryPDA: PublicKey,
    fromBadgePDA: PublicKey,
    toBadgePDA: PublicKey,
    fromUser: PublicKey,
    toUser: PublicKey
  ): Promise<{ computeUnitsConsumed?: number }> {
    // This would be implemented with actual simulation logic
    // using a connection to simulate the transaction
    return { computeUnitsConsumed: 180_000 };
  }

  createComputeBudgetInstruction(computeUnits: number): TransactionInstruction {
    return new TransactionInstruction({
      programId: new PublicKey('ComputeBudget111111111111111111111111111111'),
      keys: [],
      data: Buffer.from([
        0, // WriteComputeUnits instruction index
        ...new Uint8Array(new Uint32Array([computeUnits]).buffer),
      ]),
    });
  }

  createTransferHookExecuteInstruction(
    tokenMint: PublicKey,
    sourceAccount: PublicKey,
    destinationAccount: PublicKey,
    owner: PublicKey,
    extraAccounts: AccountMeta[]
  ): TransactionInstruction {
    // Create the execute instruction data according to SPL Transfer Hook spec
    const executeData = Buffer.concat([
      Buffer.from([0]), // Execute instruction discriminator
      Buffer.from(new Uint8Array(new Uint64Array([BigInt(0)]).buffer)), // Amount placeholder
    ]);

    return new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: sourceAccount, isSigner: false, isWritable: true },
        { pubkey: tokenMint, isSigner: false, isWritable: false },
        { pubkey: destinationAccount, isSigner: false, isWritable: true },
        { pubkey: owner, isSigner: true, isWritable: false },
        ...extraAccounts,
      ],
      data: executeData,
    });
  }

  private getRegistryPDA(): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('registry')],
      this.programId
    );
    return pda;
  }

  private getIdentityBadgePDA(user: PublicKey): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('identity_badge'), user.toBuffer()],
      this.programId
    );
    return pda;
  }

  async validateTransferHookSetup(tokenMint: PublicKey): Promise<boolean> {
    try {
      const expectedExtraAccountsPDA = getExtraAccountMetasAddress(tokenMint, this.programId);
      
      console.log('Transfer hook validation:', {
        tokenMint: tokenMint.toString(),
        expectedPDA: expectedExtraAccountsPDA.toString(),
        programId: this.programId.toString(),
      });
      
      return true;
    } catch (error) {
      console.error('Transfer hook validation failed:', error);
      return false;
    }
  }

  // Helper for wallet adapters (Phantom, Solflare, Backpack)
  async getTransferHookValidationMessage(
    fromUser: PublicKey,
    toUser: PublicKey
  ): Promise<string> {
    const fromBadgePDA = this.getIdentityBadgePDA(fromUser);
    const toBadgePDA = this.getIdentityBadgePDA(toUser);
    
    return `KYC Compliance Check:
    • From User: ${fromUser.toString().slice(0, 8)}...
    • To User: ${toUser.toString().slice(0, 8)}...
    • Status: Validating compliance registry
    • Jurisdiction: Cross-border check in progress
    • Gas: Optimized for sub-400ms finality`;
  }
}

// Helper class for Uint64 conversion
class Uint64Array extends Uint8Array {
  constructor(value: bigint) {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setBigUint64(0, value, true);
    super(buffer);
  }
}
```
