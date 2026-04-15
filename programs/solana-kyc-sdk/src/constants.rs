```
/* Author: RickCreator87 | Copyright: GitDigital Solana 2026 */
/ programs/solana-kyc-sdk/src/constants.rs
```

```rust
use solana_program::compute_units;

pub const MINIMUM_COMPUTE_UNITS: u32 = 150_000;
pub const STANDARD_COMPUTE_UNITS: u32 = 300_000;
pub const COMPLEX_COMPUTE_UNITS: u32 = 500_000;

pub const TRANSFER_HOOK_COMPUTE_UNITS: u32 = 250_000;

pub const IDENTITY_BADGE_SEED: &[u8] = b"identity_badge";
pub const REGISTRY_SEED: &[u8] = b"registry";

pub const MAX_METADATA_SIZE: usize = 512;
pub const MAX_IDENTITY_PROOFS: usize = 10;

pub const CU_LOGGING_INTERVAL: u64 = 10_000;

pub fn log_compute_usage(prefix: &str) {
    let remaining = compute_units::solana_program::compute_units::get_remaining_compute_units();
    msg!("{}: Remaining compute units: {}", prefix, remaining);
}
```
