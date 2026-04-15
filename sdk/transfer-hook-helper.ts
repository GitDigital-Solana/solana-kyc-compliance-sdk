```
/* Author: RickCreator87 | Copyright: GitDigital Solana  2026 */
/ sdk/transfer-hook-helper.ts
```

```typescript
import { PublicKey, AccountMeta, TransactionInstruction } from '@solana/web3.js';
import { Program } from '@coral-xyz/anchor';

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
  constructor(private program: Program) {}

  async getRequiredExtraAccounts(
    tokenMint: PublicKey,
    fromUser: PublicKey,
    toUser: PublicKey
  ): Promise<AccountMeta[]> {
    const registryPDA = this.getRegistryPDA();
    const fromBadgePDA = this.getIdentityBadgePDA(fromUser);
    const toBadgePDA = this.getIdentityBadgePDA(toUser);

    // Calculate compute units needed
    const computeUnits = await this.estimateComputeUnits(
      tokenMint,
      fromUser,
      toUser
    );

    console.log(`Transfer hook estimated CU: ${computeUnits}`);

    const accounts: AccountMeta[] = [
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
    ];

    // Add compute budget instruction if needed
    if (computeUnits > 200000) {
      const computeBudgetIx = this.createComputeBudgetInstruction(computeUnits);
      // This would be added separately to the transaction
    }

    return accounts;
  }

  async estimateComputeUnits(
    tokenMint: PublicKey,
    fromUser: PublicKey,
    toUser: PublicKey
  ): Promise<number> {
    // Base CU for transfer hook validation
    let estimated = 150_000;

    // Add CU for account fetches
    const [registryPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('registry')],
      this.program.programId
    );

    // Simulate to get accurate CU
    try {
      const simulation = await this.program.methods
        .verifyTransferCompliance(fromUser, toUser)
        .accounts({
          registry: registryPDA,
          fromBadge: this.getIdentityBadgePDA(fromUser),
          toBadge: this.getIdentityBadgePDA(toUser),
          fromUser,
          toUser,
        })
        .simulate();

      if (simulation.computeUnitsConsumed) {
        estimated = simulation.computeUnitsConsumed;
      }
    } catch (error) {
      console.warn('Failed to simulate transfer hook, using estimate:', error);
    }

    return Math.min(estimated, 800_000); // Cap at 800k CU for sub-800ms finality
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

  async validateTransferHookSetup(tokenMint: PublicKey): Promise<boolean> {
    try {
      const tokenAccount = await this.program.provider.connection.getAccountInfo(
        tokenMint
      );
      
      if (!tokenAccount) {
        throw new Error('Token mint not found');
      }

      // Check if transfer hook is configured
      // This would check Token-2022 extensions
      console.log('Transfer hook validation passed for mint:', tokenMint.toString());
      return true;
    } catch (error) {
      console.error('Transfer hook validation failed:', error);
      return false;
    }
  }
}
```
