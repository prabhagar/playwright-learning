const fs = require('fs');
const path = require('path');

class LearningSummaryReporter {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.skipped = 0;
    this.startTime = null;
    this.failures = [];
    this.tests = [];
    this.byProject = {};
    this.byFile = {};
    this.outputPath = path.resolve(process.cwd(), 'test-results', 'learning-summary.json');
  }

  onBegin(config, suite) {
    this.startTime = Date.now();
    const total = suite.allTests().length;
    console.log(`\n📊 Learning Reporter: starting run with ${total} test(s)`);
  }

  onTestEnd(test, result) {
    if (result.status === 'passed') this.passed += 1;
    else if (result.status === 'failed' || result.status === 'timedOut') this.failed += 1;
    else if (result.status === 'skipped') this.skipped += 1;

    const project = test.parent?.project()?.name || 'unknown';
    const file = test.location?.file || 'unknown-file';
    const key = result.status === 'timedOut' ? 'failed' : result.status;

    if (!this.byProject[project]) {
      this.byProject[project] = { passed: 0, failed: 0, skipped: 0 };
    }
    if (!this.byFile[file]) {
      this.byFile[file] = { passed: 0, failed: 0, skipped: 0, durationMs: 0 };
    }

    if (key === 'passed' || key === 'failed' || key === 'skipped') {
      this.byProject[project][key] += 1;
      this.byFile[file][key] += 1;
    }

    this.byFile[file].durationMs += result.duration || 0;

    if (key === 'failed') {
      this.failures.push({
        title: test.title,
        file,
        project,
        durationMs: result.duration || 0,
        error: result.error?.message || 'Unknown error',
      });
    }

    this.tests.push({
      title: test.title,
      fullTitle: typeof test.titlePath === 'function' ? test.titlePath().join(' > ') : test.title,
      file,
      project,
      status: key,
      durationMs: result.duration || 0,
      retry: result.retry || 0,
    });
  }

  onEnd() {
    const total = this.passed + this.failed + this.skipped;
    const durationMs = this.startTime ? Date.now() - this.startTime : 0;

    console.log('\n📘 ===== Custom Learning Summary =====');
    console.log(`Total  : ${total}`);
    console.log(`Passed : ${this.passed}`);
    console.log(`Failed : ${this.failed}`);
    console.log(`Skipped: ${this.skipped}`);
    console.log('====================================\n');

    const summaryPayload = {
      generatedAt: new Date().toISOString(),
      totals: {
        total,
        passed: this.passed,
        failed: this.failed,
        skipped: this.skipped,
      },
      durationMs,
      byProject: this.byProject,
      byFile: this.byFile,
      failures: this.failures,
      tests: this.tests,
    };

    fs.mkdirSync(path.dirname(this.outputPath), { recursive: true });
    fs.writeFileSync(this.outputPath, JSON.stringify(summaryPayload, null, 2));
    console.log(`📝 Saved extended summary JSON to ${this.outputPath}`);
  }
}

module.exports = LearningSummaryReporter;
