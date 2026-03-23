SUPPORTERBADGEMINTING_SYSTEM.md
A text‑based badge minting system for generating supporter badges on demand.

`markdown

Supporter Badge Minting System

A simple, deterministic badge generator for supporters.

---

Input
- Supporter name  
- Tier  
- Date  

Output (Markdown Badge)
`
🏅 [Tier Name] Badge  
Issued to [Supporter Name]  
Date: [Date]  
`

---

Output (ASCII Badge)
`
==============================
   [TIER NAME] SUPPORTER
   Issued to: [Supporter Name]
   Date: [Date]
==============================
`

---

Output (JSON Badge)
`json
{
  "name": "[Supporter Name]",
  "tier": "[Tier Name]",
  "issued_at": "[Date]"
}
`
`