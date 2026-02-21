class LearningSummaryReporter {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.skipped = 0;
  }

  onBegin(config, suite) {
    const total = suite.allTests().length;
    console.log(`\n📊 Learning Reporter: starting run with ${total} test(s)`);
  }

  onTestEnd(test, result) {
    if (result.status === 'passed') this.passed += 1;
    else if (result.status === 'failed' || result.status === 'timedOut') this.failed += 1;
    else if (result.status === 'skipped') this.skipped += 1;
  }

  onEnd() {
    const total = this.passed + this.failed + this.skipped;
    console.log('\n📘 ===== Custom Learning Summary =====');
    console.log(`Total  : ${total}`);
    console.log(`Passed : ${this.passed}`);
    console.log(`Failed : ${this.failed}`);
    console.log(`Skipped: ${this.skipped}`);
    console.log('====================================\n');
  }
}

module.exports = LearningSummaryReporter;
