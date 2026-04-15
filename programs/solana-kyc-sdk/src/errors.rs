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
    
    #[msg("Unauthorized asset recovery attempt")]
    UnauthorizedRecovery,
    
    #[msg("Compute units exceeded maximum allowed")]
    ComputeUnitsExceeded,
    
    #[msg("Invalid ZK proof")]
    InvalidZKProof,
    
    #[msg("Metadata exceeds maximum size")]
    MetadataTooLarge,
}
```
