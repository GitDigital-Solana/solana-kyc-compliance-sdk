```
/* Author: RickCreator87 | Copyright: GitDigital Solana 2026 */
/ programs/solana-kyc-sdk/src/errors.rs
```

```rust
use anchor_lang::prelude::*;

#[error_code]
pub enum KYCError {
    #[msg("Registry is not active")]
    RegistryInactive,
    
    #[msg("Unauthorized access")]
    Unauthorized,
    
    #[msg("Sender does not have valid KYC badge")]
    SenderNotCompliant,
    
    #[msg("Receiver does not have valid KYC badge")]
    ReceiverNotCompliant,
    
    #[msg("KYC badge has expired")]
    BadgeExpired,
    
    #[msg("Cross-jurisdiction transfer not allowed")]
    CrossJurisdictionNotAllowed,
    
    #[msg("Identity badge already revoked")]
    AlreadyRevoked,
    
    #[msg("Invalid badge for specified user")]
    InvalidBadge,
    
    #[msg("Insufficient signatures for asset recovery (2-of-3 required)")]
    InsufficientSignatures,
    
    #[msg("Legal oracle must sign asset recovery transaction")]
    LegalOracleNotSigned,
    
    #[msg("Compute units exceeded maximum allowed")]
    ComputeUnitsExceeded,
    
    #[msg("Invalid ZK proof commitment")]
    InvalidZKProof,
    
    #[msg("Invalid token program for transfer hook")]
    InvalidTokenProgram,
    
    #[msg("Invalid extra accounts PDA")]
    InvalidExtraAccountsPDA,
    
    #[msg("Reciprocity rule already exists")]
    ReciprocityRuleExists,
    
    #[msg("Reciprocity rule not found")]
    ReciprocityRuleNotFound,
}
```
