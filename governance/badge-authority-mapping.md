governance/badge-authority-mapping.md

```markdown
# Badge Authority Mapping

The GitDigital-Solana Badge Authority is a modular system for verifying contributor and sponsor status.

## Sponsor Badges
- **supporter**: Granted to all monthly sponsors at the Supporter tier.
- **contributor**: Granted to monthly sponsors at Contributor tier and above.
- **guardian**: Granted to Guardian tier sponsors.
- **architect**: Granted to Architect tier sponsors.
- **foundation**: Granted to Foundation Partner sponsors.
- **benefactor**: Granted to one-time Benefactor sponsors.
- **patron**: Granted to one-time Patron sponsors.
- **visionary**: Granted to one-time Visionary sponsors.

## On-Chain vs Off-Chain
- **Off-Chain**: Badges stored in `/badge-authority/sponsor-badges.json` for UI/API display.
- **On-Chain (Planned)**: In v2, badges will be minted as Solana NFTs or programmable badges via a custom program.

## Badge Metadata
Each badge includes:
- `type`: The badge type (e.g., "supporter").
- `tier`: The sponsor tier.
- `granted_at`: ISO timestamp.
- `expires_at`: For monthly tiers, expires if sponsorship lapses.
- `metadata_uri`: Link to off-chain metadata (image, description).

## Revocation Process
- If a sponsorship is cancelled, the badge is marked as "inactive" in the registry.
- If a sponsor violates the Code of Conduct, a governance vote (Guardian tier+) can revoke the badge permanently.
```
