sdk/README.md

```markdown
# Project Name SDK

This SDK allows you to integrate with the Project Name ecosystem.

## Installation
```bash
npm install project-name-sdk
```

Usage

```javascript
const { FundingOracle } = require('project-name-sdk');

const oracle = new FundingOracle('YOUR_API_KEY');
oracle.getContributorBalance('@alice').then(console.log);
```
