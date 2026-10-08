```
/* Author: RickCreator87 | Copyright: GitDigital Solana 2026 */
/ programs/solana-kyc-sdk/src/state.rs
```

```rust
use anchor_lang::prelude::*;
use bytemuck::{Pod, Zeroable};
use spl_pod::bytemuck::{pod_from_bytes, pod_from_bytes_mut};

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum Jurisdiction {
    Colorado = 0,
    California = 1,
    NewYork = 2,
    EU = 3,
    UK = 4,
    Singapore = 5,
}

#[repr(C)]
#[derive(Clone, Copy, Pod, Zeroable)]
pub struct ComplianceRegistryData {
    pub authority: Pubkey,
    pub multisig_recovery: Pubkey,
    pub legal_oracle: Pubkey,
    pub physical_auditor: Pubkey,
    pub is_active: u8,
    pub total_verified_users: u64,
    pub paused_until: i64,
    pub version: u8,
    pub recovery_nonce: u64,
    pub reciprocity_bitmask: [u8; 8], // 8x8 bitmask for jurisdiction reciprocity (64 bits total)
    pub reserved: [u8; 256], // Future expansion
}

#[account(zero_copy)]
#[repr(C)]
pub struct ComplianceRegistry {
    pub data: ComplianceRegistryData,
}

impl ComplianceRegistry {
    pub const LEN: usize = 8 + // discriminator
        std::mem::size_of::<ComplianceRegistryData>();
    
    pub fn is_active(&self) -> bool {
        self.data.is_active == 1
    }
    
    pub fn set_active(&mut self, active: bool) {
        self.data.is_active = if active { 1 } else { 0 };
    }
    
    pub fn check_reciprocity(&self, from: Jurisdiction, to: Jurisdiction) -> bool {
        let from_bit = from as u8;
        let to_bit = to as u8;
        let bit_position = (from_bit * 8 + to_bit) as usize;
        let byte_index = bit_position / 8;
        let bit_index = bit_position % 8;
        (self.data.reciprocity_bitmask[byte_index] & (1 << bit_index)) != 0
    }
}

#[repr(C)]
#[derive(Clone, Copy, Pod, Zeroable)]
pub struct IdentityBadgeData {
    pub user: Pubkey,
    pub issuer: Pubkey,
    pub issued_at: i64,
    pub expires_at: i64,
    pub revoked_at: i64,
    pub jurisdiction: u8,
    pub metadata_commitment_hash: [u8; 64], // Fixed-size for heap-to-stack
    pub zk_proof_commitment: [u8; 32],      // Fixed-size for heap-to-stack
    pub is_revoked: u8,
    pub version: u8,
    pub reserved: [u8; 128], // Future expansion
}

#[account(zero_copy)]
#[repr(C)]
pub struct IdentityBadge {
    pub data: IdentityBadgeData,
}

impl IdentityBadge {
    pub const LEN: usize = 8 + // discriminator
        std::mem::size_of::<IdentityBadgeData>();
    
    pub fn is_valid(&self, current_time: i64) -> bool {
        self.data.is_revoked == 0 && 
        self.data.expires_at > current_time &&
        self.data.issued_at <= current_time
    }
    
    pub fn jurisdiction(&self) -> Jurisdiction {
        match self.data.jurisdiction {
            0 => Jurisdiction::Colorado,
            1 => Jurisdiction::California,
            2 => Jurisdiction::NewYork,
            3 => Jurisdiction::EU,
            4 => Jurisdiction::UK,
            5 => Jurisdiction::Singapore,
            _ => Jurisdiction::Colorado, // Default fallback
        }
    }
    
    pub fn set_jurisdiction(&mut self, jurisdiction: Jurisdiction) {
        self.data.jurisdiction = jurisdiction as u8;
    }
    
    pub fn is_revoked(&self) -> bool {
        self.data.is_revoked == 1
    }
    
    pub fn revoke(&mut self, timestamp: i64) {
        self.data.is_revoked = 1;
        self.data.revoked_at = timestamp;
    }
}

unsafe impl Zeroable for ComplianceRegistryData {}
unsafe impl Pod for ComplianceRegistryData {}
unsafe impl Zeroable for IdentityBadgeData {}
unsafe impl Pod for IdentityBadgeData {}
``````
/* Author: RickCreator87 | Copyright: GitDigital Solana 2026 */
/programs/solana-kyc-sdk/src/state.rs
```

```rust
use anchor_lang::prelude::*;
use bytemuck::{Pod, Zeroable};
use spl_pod::bytemuck::{pod_from_bytes, pod_from_bytes_mut};

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum Jurisdiction {
    Colorado = 0,
    California = 1,
    NewYork = 2,
    EU = 3,
    UK = 4,
    Singapore = 5,
}

#[repr(C)]
#[derive(Clone, Copy, Pod, Zeroable)]
pub struct ComplianceRegistryData {
    pub authority: Pubkey,
    pub multisig_recovery: Pubkey,
    pub legal_oracle: Pubkey,
    pub physical_auditor: Pubkey,
    pub is_active: u8,
    pub total_verified_users: u64,
    pub paused_until: i64,
    pub version: u8,
    pub recovery_nonce: u64,
    pub reciprocity_bitmask: [u8; 8], // 8x8 bitmask for jurisdiction reciprocity (64 bits total)
    pub reserved: [u8; 256], // Future expansion
}

#[account(zero_copy)]
#[repr(C)]
pub struct ComplianceRegistry {
    pub data: ComplianceRegistryData,
}

impl ComplianceRegistry {
    pub const LEN: usize = 8 + // discriminator
        std::mem::size_of::<ComplianceRegistryData>();
    
    pub fn is_active(&self) -> bool {
        self.data.is_active == 1
    }
    
    pub fn set_active(&mut self, active: bool) {
        self.data.is_active = if active { 1 } else { 0 };
    }
    
    pub fn check_reciprocity(&self, from: Jurisdiction, to: Jurisdiction) -> bool {
        let from_bit = from as u8;
        let to_bit = to as u8;
        let bit_position = (from_bit * 8 + to_bit) as usize;
        let byte_index = bit_position / 8;
        let bit_index = bit_position % 8;
        (self.data.reciprocity_bitmask[byte_index] & (1 << bit_index)) != 0
    }
}

#[repr(C)]
#[derive(Clone, Copy, Pod, Zeroable)]
pub struct IdentityBadgeData {
    pub user: Pubkey,
    pub issuer: Pubkey,
    pub issued_at: i64,
    pub expires_at: i64,
    pub revoked_at: i64,
    pub jurisdiction: u8,
    pub metadata_commitment_hash: [u8; 64], // Fixed-size for heap-to-stack
    pub zk_proof_commitment: [u8; 32],      // Fixed-size for heap-to-stack
    pub is_revoked: u8,
    pub version: u8,
    pub reserved: [u8; 128], // Future expansion
}

#[account(zero_copy)]
#[repr(C)]
pub struct IdentityBadge {
    pub data: IdentityBadgeData,
}

impl IdentityBadge {
    pub const LEN: usize = 8 + // discriminator
        std::mem::size_of::<IdentityBadgeData>();
    
    pub fn is_valid(&self, current_time: i64) -> bool {
        self.data.is_revoked == 0 && 
        self.data.expires_at > current_time &&
        self.data.issued_at <= current_time
    }
    
    pub fn jurisdiction(&self) -> Jurisdiction {
        match self.data.jurisdiction {
            0 => Jurisdiction::Colorado,
            1 => Jurisdiction::California,
            2 => Jurisdiction::NewYork,
            3 => Jurisdiction::EU,
            4 => Jurisdiction::UK,
            5 => Jurisdiction::Singapore,
            _ => Jurisdiction::Colorado, // Default fallback
        }
    }
    
    pub fn set_jurisdiction(&mut self, jurisdiction: Jurisdiction) {
        self.data.jurisdiction = jurisdiction as u8;
    }
    
    pub fn is_revoked(&self) -> bool {
        self.data.is_revoked == 1
    }
    
    pub fn revoke(&mut self, timestamp: i64) {
        self.data.is_revoked = 1;
        self.data.revoked_at = timestamp;
    }
}

unsafe impl Zeroable for ComplianceRegistryData {}
unsafe impl Pod for ComplianceRegistryData {}
unsafe impl Zeroable for IdentityBadgeData {}
unsafe impl Pod for IdentityBadgeData {}
```
