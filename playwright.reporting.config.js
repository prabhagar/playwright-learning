const baseConfig = require('./playwright.config');

module.exports = {
  ...baseConfig,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['./reporters/learning-summary-reporter.js'],
  ],
};
