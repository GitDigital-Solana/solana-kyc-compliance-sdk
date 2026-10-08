```
/* Author: RickCreator87 | Copyright: GitDigital Solana 2026 */
/ sdk/compliance-client.ts
```

```typescript
import { PublicKey, Connection } from '@solana/web3.js';
import { Program } from '@coral-xyz/anchor';

export class ComplianceClient {
  constructor(
    private program: Program,
    private connection: Connection
  ) {}

  async updateReciprocityRules(
    jurisdictionFrom: string,
    jurisdictionTo: string,
    allowed: boolean
  ): Promise<string> {
    const jurisdictionEnum = this.jurisdictionToEnum(jurisdictionFrom);
    const targetEnum = this.jurisdictionToEnum(jurisdictionTo);
    
    const tx = await this.program.methods
      .updateReciprocityRules(jurisdictionEnum, targetEnum, allowed)
      .accounts({
        registry: this.getRegistryPDA(),
        authority: this.program.provider.publicKey,
      })
      .transaction();
    
    return await this.program.provider.sendAndConfirm(tx);
  }

  async getReciprocityRules(
    jurisdictionFrom: string,
    jurisdictionTo: string
  ): Promise<boolean> {
    const registry = await this.getRegistry();
    const fromBit = this.jurisdictionToEnum(jurisdictionFrom) as number;
    const toBit = this.jurisdictionToEnum(jurisdictionTo) as number;
    
    const bitPosition = fromBit * 8 + toBit;
    const byteIndex = Math.floor(bitPosition / 8);
    const bitIndex = bitPosition % 8;
    
    return (registry.reciprocityBitmask[byteIndex] & (1 << bitIndex)) !== 0;
  }

  async getRegistry(): Promise<any> {
    const registryPDA = this.getRegistryPDA();
    return await this.program.account.complianceRegistry.fetch(registryPDA);
  }

  async getIdentityBadge(user: PublicKey): Promise<any> {
    const badgePDA = this.getIdentityBadgePDA(user);
    return await this.program.account.identityBadge.fetch(badgePDA);
  }

  async isUserCompliant(user: PublicKey): Promise<boolean> {
    try {
      const badge = await this.getIdentityBadge(user);
      const currentTime = Math.floor(Date.now() / 1000);
      
      return !badge.isRevoked && 
             badge.expiresAt > currentTime &&
             badge.issuedAt <= currentTime;
    } catch (error) {
      return false;
    }
  }

  async getComplianceReport(user: PublicKey): Promise<ComplianceReport> {
    const badge = await this.getIdentityBadge(user);
    const registry = await this.getRegistry();
    
    return {
      user: user.toString(),
      isCompliant: await this.isUserCompliant(user),
      jurisdiction: this.enumToJurisdiction(badge.jurisdiction),
      issuedAt: new Date(badge.issuedAt * 1000),
      expiresAt: new Date(badge.expiresAt * 1000),
      isRevoked: badge.isRevoked,
      registryActive: registry.isActive,
      totalVerifiedUsers: registry.totalVerifiedUsers,
    };
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

  private jurisdictionToEnum(jurisdiction: string): any {
    const mapping: Record<string, any> = {
      'colorado': { colorado: {} },
      'california': { california: {} },
      'newyork': { newYork: {} },
      'eu': { eu: {} },
      'uk': { uk: {} },
      'singapore': { singapore: {} },
    };
    return mapping[jurisdiction.toLowerCase()] || mapping['colorado'];
  }

  private enumToJurisdiction(jurisdictionEnum: any): string {
    if (jurisdictionEnum.colorado) return 'Colorado';
    if (jurisdictionEnum.california) return 'California';
    if (jurisdictionEnum.newYork) return 'NewYork';
    if (jurisdictionEnum.eu) return 'EU';
    if (jurisdictionEnum.uk) return 'UK';
    if (jurisdictionEnum.singapore) return 'Singapore';
    return 'Unknown';
  }
}

interface ComplianceReport {
  user: string;
  isCompliant: boolean;
  jurisdiction: string;
  issuedAt: Date;
  expiresAt: Date;
  isRevoked: boolean;
  registryActive: boolean;
  totalVerifiedUsers: number;
}
```
