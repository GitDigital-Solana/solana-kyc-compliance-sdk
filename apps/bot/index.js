apps/bot/index.js

```javascript
const probot = require('probot');

module.exports = (app) => {
  app.on('issues.opened', async (context) => {
    const issueComment = context.issue({
      body: 'Thanks for opening an issue! A maintainer will look at it shortly.',
    });
    await context.octokit.issues.createComment(issueComment);
  });
};
```
