```
/* Author: RickCreator87 | Copyright: GitDigital Solana 2026 */
/programs/solana-kyc-sdk/src/state.rs
```

```rust
use anchor_lang::prelude::*;
use bytemuck::{Pod, Zeroable};

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum Jurisdiction {
    Colorado = 0,
    California = 1,
    NewYork = 2,
    EU = 3,
    UK = 4,
    Singapore = 5,
}

#[account]
pub struct ComplianceRegistry {
    pub authority: Pubkey,
    pub recovery_authority: Pubkey,
    pub is_active: bool,
    pub total_verified_users: u64,
    pub paused_until: i64,
    pub version: u8,
}

impl ComplianceRegistry {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        32 + // recovery_authority
        1 + // is_active
        8 + // total_verified_users
        8 + // paused_until
        1; // version
}

#[account]
pub struct IdentityBadge {
    pub user: Pubkey,
    pub issuer: Pubkey,
    pub issued_at: i64,
    pub expires_at: i64,
    pub revoked_at: i64,
    pub jurisdiction: Jurisdiction,
    pub encrypted_metadata: Vec<u8>,
    pub zk_proof_hash: [u8; 32],
    pub is_revoked: bool,
    pub version: u8,
}

impl IdentityBadge {
    pub const LEN: usize = 8 + // discriminator
        32 + // user
        32 + // issuer
        8 + // issued_at
        8 + // expires_at
        8 + // revoked_at
        1 + // jurisdiction
        4 + 512 + // encrypted_metadata (max 512 bytes)
        32 + // zk_proof_hash
        1 + // is_revoked
        1; // version

    pub fn is_valid(&self, current_time: i64) -> bool {
        !self.is_revoked && 
        self.expires_at > current_time &&
        self.issued_at <= current_time
    }
}

#[repr(C)]
#[derive(Clone, Copy, Pod, Zeroable)]
pub struct TransferHookMetadata {
    pub required_extra_accounts: u8,
    pub compliance_check_required: bool,
    pub compute_units_estimate: u32,
}

unsafe impl Zeroable for TransferHookMetadata {}
unsafe impl Pod for TransferHookMetadata {}
```
