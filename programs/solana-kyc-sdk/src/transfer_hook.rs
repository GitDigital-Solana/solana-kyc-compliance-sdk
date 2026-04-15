```
/* Author: RickCreator87 | Copyright: GitDigital Solana 2026 */
/ programs/solana-kyc-sdk/src/transfer_hook.rs
```

```rust
use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::KYCError;
use crate::constants;

pub fn validate_transfer_compliance(
    registry_loader: &AccountLoader<ComplianceRegistry>,
    from_badge_loader: &AccountLoader<IdentityBadge>,
    to_badge_loader: &AccountLoader<IdentityBadge>,
    source_owner: Pubkey,
    destination_owner: Pubkey,
) -> Result<()> {
    let registry = registry_loader.load()?;
    let from_badge = from_badge_loader.load()?;
    let to_badge = to_badge_loader.load()?;
    
    // Check registry is active
    require!(registry.is_active(), KYCError::RegistryInactive);
    
    // Verify both parties have valid badges
    let current_time = Clock::get()?.unix_timestamp;
    
    require!(
        from_badge.is_valid(current_time) && from_badge.data.user == source_owner,
        KYCError::SenderNotCompliant
    );
    
    require!(
        to_badge.is_valid(current_time) && to_badge.data.user == destination_owner,
        KYCError::ReceiverNotCompliant
    );
    
    // Check jurisdiction reciprocity using state-driven map
    let from_jurisdiction = from_badge.jurisdiction();
    let to_jurisdiction = to_badge.jurisdiction();
    
    if from_jurisdiction != to_jurisdiction {
        require!(
            registry.check_reciprocity(from_jurisdiction, to_jurisdiction),
            KYCError::CrossJurisdictionNotAllowed
        );
    }
    
    // Log compliance check for audit
    msg!(
        "Transfer compliance verified: {} -> {} (Jurisdiction: {:?} -> {:?})",
        source_owner,
        destination_owner,
        from_jurisdiction,
        to_jurisdiction
    );
    
    constants::log_compute_usage("Post-compliance check");
    
    Ok(())
}

```
