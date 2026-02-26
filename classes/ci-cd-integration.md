# 🚀 CI/CD Integration Guide for Playwright Tests

This guide explains how to integrate your Playwright tests with various CI/CD platforms.

## Table of Contents

1. [Overview](#overview)
2. [GitHub Actions](#github-actions)
3. [GitLab CI](#gitlab-ci)
4. [Jenkins](#jenkins)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Overview

Your Playwright configuration already supports CI/CD environments through the `CI` environment variable. The configuration automatically adjusts for CI:

```javascript
forbidOnly: !!process.env.CI,        // Fails build if test.only exists
retries: process.env.CI ? 2 : 0,     // Enables retries in CI
workers: process.env.CI ? 1 : undefined, // Runs serially in CI
reuseExistingServer: !process.env.CI, // Uses fresh server in CI
```

---

## GitHub Actions

### Setup

1. **Trigger:** Push to `main`/`develop` or pull requests
2. **Schedule:** Daily tests at 2 AM UTC (customizable)
3. **Matrix:** Tests run across multiple Node versions and browsers

### File Location
`.github/workflows/playwright-tests.yml`

### Key Features

✅ **Multi-browser testing** - Chromium, Firefox, WebKit
✅ **Multi-version testing** - Node 18 & 20
✅ **Artifact collection** - HTML reports, videos, screenshots
✅ **Report merging** - Combines reports from parallel jobs
✅ **Test result publishing** - Integration with GitHub UI

### Usage

The workflow automatically runs on:
- Push to main/develop branches
- Pull requests targeting main/develop
- Daily schedule

No additional setup needed beyond pushing to your repository!

### Customization

**Change schedule:**
```yaml
schedule:
  - cron: '0 2 * * *'  # Change this cron expression
```

**Add environment variables:**
```yaml
env:
  SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
```

**Change Node versions:**
```yaml
matrix:
  node-version: [18.x, 20.x, 22.x]
```

---

## GitLab CI

### Setup

1. **File:** `.gitlab-ci.yml` (already created)
2. **Runner:** Uses Docker image `node:20`
3. **Stages:** Install → Test → Report

### File Location
`.gitlab-ci.yml`

### Key Features

✅ **Parallel test execution** - 4 browsers run simultaneously
✅ **Automatic caching** - npm dependencies cached
✅ **Failure retry** - Auto-retries on runner system failures
✅ **Artifact management** - Reports retained for 30-90 days

### Enable in GitLab

1. Push code to GitLab repository
2. Go to **CI/CD → Pipelines**
3. Pipelines automatically trigger on push

### Customize

**Change retention period:**
```yaml
artifacts:
  expire_in: 60 days  # Change this value
```

**Add environment variables:**
```yaml
variables:
  SLACK_WEBHOOK: $SLACK_WEBHOOK
```

**Use specific runner:**
```yaml
tags:
  - docker
  - specific-runner-tag
```

---

## Jenkins

### Setup

1. **File:** `Jenkinsfile` (already created)
2. **Agent:** Runs on any available agent
3. **Timeout:** 60 minutes per build

### File Location
`Jenkinsfile`

### Configuration Steps

1. **Create Pipeline Job:**
   - Go to Jenkins → New Item
   - Select "Pipeline"
   - Name: "Playwright-Tests"

2. **Configure Pipeline:**
   - Pipeline → Definition: "Pipeline script from SCM"
   - SCM: Git
   - Repository URL: Your Git URL
   - Script Path: `Jenkinsfile`

3. **Add Credentials:**
   - Manage Jenkins → Manage Credentials
   - Add SSH or HTTPS credentials for Git access

### Key Features

✅ **Parallel execution** - Tests run concurrently across projects
✅ **Post-build actions** - Email notifications on failure
✅ **Report publishing** - JUnit and HTML report integration
✅ **SCM polling** - Trigger builds on code changes

### Enable Build Triggers

**Poll SCM:**
```
H/15 * * * *  # Check every 15 minutes
```

**GitHub Push Trigger:**
- Install GitHub plugin
- Configure webhook in GitHub: `https://your-jenkins.com/github-webhook/`

### Customize

**Add slack notifications:**
```groovy
slackSend(
    color: 'good',
    message: "Tests passed in ${env.JOB_NAME} #${env.BUILD_NUMBER}"
)
```

**Change artifact retention:**
```groovy
cleanWs(deleteDirs: true, patterns: [[pattern: 'obsolete-dir', type: 'INCLUDE']])
```

---

## Best Practices

### 1. **Environment Variables**

Store sensitive data as secrets:

**GitHub Actions:**
```yaml
env:
  API_KEY: ${{ secrets.API_KEY }}
```

**GitLab CI:**
```yaml
variables:
  API_KEY: $CI_JOB_TOKEN
```

**Jenkins:**
- Manage Jenkins → Manage Credentials
- Use `credentials()` binding in pipeline

### 2. **Parallel Execution**

**Pros:** Faster feedback, reduced CI time
**Cons:** Higher resource usage, potential flakiness

Current setup:
- GitHub Actions: Matrix strategy (tests in parallel)
- GitLab CI: Parallel stages
- Jenkins: Parallel blocks

### 3. **Artifact Management**

Always collect:
- ✅ HTML reports (debugging)
- ✅ Videos (failed tests only)
- ✅ Screenshots (failures)
- ❌ Full test-results (too large)

### 4. **Test Reporting**

Configure test reporters in `playwright.config.js`:
```javascript
reporter: [
  ['html'],
  ['json', { outputFile: 'test-results/results.json' }],
  ['junit', { outputFile: 'test-results/results.xml' }],
]
```

### 5. **Performance Optimization**

- Use Docker containers in CI
- Cache dependencies (`node_modules/`)
- Parallel execution across browsers
- Use `fullyParallel: true` for test files
- Limit retry attempts (2 is standard)

### 6. **Branch Strategy**

Recommended:
```
main/master
├─ Run all tests
├─ Generate reports
└─ Deploy on success

develop
├─ Run tests
├─ Allow failures
└─ Quick feedback

feature/xxx
├─ Run tests only
└─ Comment results
```

---

## Troubleshooting

### Issue: "Playwright browsers not found"

**Solution:** Ensure browsers are installed before tests:
```bash
npx playwright install --with-deps
```

In CI, add this step in your workflow.

### Issue: "Tests timeout in CI"

**Causes:**
- Slow CI machines
- Network latency
- Heavy screenshot/video collection

**Solutions:**
```javascript
// In playwright.config.js
timeout: process.env.CI ? 60000 : 30000,
navigationTimeout: process.env.CI ? 30000 : 10000,
```

### Issue: "Flaky tests in CI but not locally"

**Common reasons:**
- Timing issues (use proper waits)
- Environment differences
- Resource contention

**Debug:**
```bash
# Headed mode to see what's happening
playwright test --headed --debug

# Increase retry attempts
playwright test --retries 3
```

### Issue: "Report not generated"

**Check:**
1. Verify `reporter: 'html'` in config
2. Ensure tests aren't failing before report generation
3. Check artifact paths in CI configuration

```bash
# Local test to verify report generation
npm test
npx playwright show-report
```

### Issue: "Out of memory in CI"

**Solution:** Run tests serially instead of parallel:
```javascript
workers: 1,  // Set this in CI
```

---

## Monitoring & Alerts

### GitHub Actions
- Check workflow status in **Actions** tab
- Receive notifications on failures
- View artifacts directly in job logs

### GitLab CI
- Monitor **CI/CD → Pipelines**
- Set up **CI/CD → Notifications**
- Use **Slack/Email** integrations

### Jenkins
- Monitor **Build History** dashboard
- Configure **Email Notification Plugin**
- Use **Slack Plugin** for instant updates

---

## Advanced: Custom Reporters

Integrate with your dashboards:

```javascript
// Custom reporter in playwright.config.js
reporter: [
  ['json', { outputFile: 'test-results/results.json' }],
  ['html'],
  [require('./reporters/learning-summary-reporter.js')],
]
```

Your workspace includes a custom reporter:
`reporters/learning-summary-reporter.js`

---

## Quick Reference

| Platform | File | Trigger | Report Location |
|----------|------|---------|-----------------|
| GitHub | `.github/workflows/playwright-tests.yml` | Push/PR | Artifacts tab |
| GitLab | `.gitlab-ci.yml` | Push | Pipelines page |
| Jenkins | `Jenkinsfile` | SCM/Trigger | Job artifacts |

---

## Next Steps

1. **Choose platform** based on your project needs
2. **Push configuration** files to your repository
3. **Monitor first run** and adjust as needed
4. **Set up notifications** for your team
5. **Review reports** and optimize based on results

Happy testing! 🎭
