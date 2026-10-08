 governance/sponsor-benefits.md

```markdown
# Sponsor Benefits Matrix

| Tier | Monthly Price | Recognition | PR Priority | Governance | Consultation | Badge Authority |
|------|---------------|-------------|-------------|------------|--------------|-----------------|
| Supporter | $10 | SPONSORS.md | ❌ | ❌ | ❌ | Supporter |
| Contributor | $50 | SPONSORS.md + Badge | ✅ 24h | ❌ | ❌ | Contributor |
| Guardian | $250 | Header recognition | ✅ 24h | 1 Vote | ❌ | Guardian |
| Architect | $1,000 | On-chain badge | ✅ 12h | 1 Vote | 2h/month | Architect |
| Foundation Partner | $5,000+ | Co-branded | ✅ 4h | Veto | 5h/month | Foundation |
| Benefactor | $500 one-time | SPONSORS.md | ❌ | ❌ | ❌ | Benefactor |
| Patron | $2,500 one-time | Genesis metadata | ❌ | ❌ | ❌ | Patron |
| Visionary | $10,000+ one-time | Lifetime recognition | ❌ | ❌ | ❌ | Visionary |

## How to Claim Benefits
1. **Recognition**: Automatically updated in `SPONSORS.md` and `/registry/sponsors.json`.
2. **PR Priority**: Use the `@gitdigital-bot priority` command in your PR.
3. **Governance Access**: Invitations are sent to the GitHub email associated with your sponsorship.
4. **Consultation**: Contact `rickcreator87@gitdigital.io` to schedule.
5. **Badge Authority**: Badges are minted automatically via the sponsorship workflow.
```

FILE: governance/badge-authority-mapping.md

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
