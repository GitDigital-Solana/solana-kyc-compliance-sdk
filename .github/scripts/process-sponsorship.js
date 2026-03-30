.github/scripts/process-sponsorship.js

(Helper script referenced above)

```javascript
const fs = require('fs');
const path = require('path');

const registryPath = path.join(process.env.GITHUB_WORKSPACE, 'registry', 'sponsors.json');
const sponsorsMdPath = path.join(process.env.GITHUB_WORKSPACE, 'SPONSORS.md');

const action = process.env.SPONSORSHIP_ACTION;
const login = process.env.SPONSOR_LOGIN;
const tier = process.env.SPONSOR_TIER;
const tierId = process.env.SPONSOR_TIER_ID;
const createdAt = process.env.SPONSOR_CREATED_AT;

// Tier mapping to badge and section
const tierMapping = {
  'Supporter': { badge: 'supporter', section: '🌱 Supporters' },
  'Contributor': { badge: 'contributor', section: '👩‍💻 Contributors' },
  'Guardian': { badge: 'guardian', section: '🛡️ Guardians' },
  'Architect': { badge: 'architect', section: '🏗️ Architects' },
  'Foundation Partner': { badge: 'foundation', section: '🏛️ Foundation Partners' },
  'Benefactor': { badge: 'benefactor', section: '🌟 One-Time Benefactors' },
  'Patron': { badge: 'patron', section: '✨ One-Time Patrons' },
const sponsorIndex = registry.sponsors.findIndex(s => s.username === login);

if (action === 'created') {
  if (sponsorIndex === -1) {
    registry.sponsors.push({
      id: tierId,
      username: login,
      tier: tier,
      date_started: createdAt,
      badges: [tierMapping[tier]?.badge || 'supporter'],
      notes: ''
    });
  }
} else if (action === 'cancelled') {
  if (sponsorIndex !== -1) {
    registry.sponsors[sponsorIndex].tier = 'Cancelled';
    registry.sponsors[sponsorIndex].notes = `Cancelled on ${new Date().toISOString()}`;  }
} else if (action === 'tier_changed') {
  if (sponsorIndex !== -1) {
    registry.sponsors[sponsorIndex].tier = tier;
    registry.sponsors[sponsorIndex].badges = [tierMapping[tier]?.badge || 'supporter'];
  }
}

fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

// Update SPONSORS.md placeholders
let sponsorsMd = fs.readFileSync(sponsorsMdPath, 'utf8');
Object.entries(tierMapping).forEach(([tierName, { section }]) => {  const sponsorsInTier = registry.sponsors.filter(s => s.tier === tierName).map(s => `- [@${s.username}](https://github.com/${s.username}) – *${new Date(s.date_started).toLocaleDateString()}*`);
  const sectionRegex = new RegExp(`(${section}[\\s\\S]*?)(?=\\n##|\\n---|$)`, 'm');
  const newContent = `${section}\n${sponsorsInTier.length ? sponsorsInTier.join('\n') : '- *[Your Name Here]* – *[Date]*'}`;
  sponsorsMd = sponsorsMd.replace(sectionRegex, newContent);
});
fs.writeFileSync(sponsorsMdPath, sponsorsMd);
```
