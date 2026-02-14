# Day 5: Performance Testing

This directory contains comprehensive performance testing examples and exercises using Playwright.

## Test Files

### 1. Page Load Metrics (`1-page-load-metrics.spec.js`)
Measures core page load timing metrics including DNS, TCP, request, and render times.

**Tests:**
- Measure page load time with detailed breakdown
- Compare navigation timing metrics
- Track the critical rendering path

**Run:**
```bash
npx playwright test tests/day-5-performance/1-page-load-metrics.spec.js
```

### 2. Core Web Vitals (`2-core-web-vitals.spec.js`)
Captures and validates Google's Core Web Vitals: LCP, FID, and CLS.

**Tests:**
- Capture LCP (Largest Contentful Paint)
- Measure FID (First Input Delay)
- Validate CLS (Cumulative Layout Shift)
- Verify visual stability during content loading
- Test responsiveness to user interactions

**Run:**
```bash
npx playwright test tests/day-5-performance/2-core-web-vitals.spec.js
```

### 3. Resource Timing Analysis (`3-resource-timing.spec.js`)
Analyzes individual resource loads and identifies performance bottlenecks.

**Tests:**
- Analyze all resources and their load times
- Categorize resources by type
- Identify performance bottlenecks
- Generate comprehensive performance report
- Find render-blocking resources

**Run:**
```bash
npx playwright test tests/day-5-performance/3-resource-timing.spec.js
```

### 4. Network Throttling (`4-network-throttling.spec.js`)
Simulates different network conditions (WiFi, 4G, 3G, Slow 3G) and measures page performance.

**Tests:**
- Measure load time on normal network
- Test on Slow 3G
- Test on 4G
- Simulate offline scenarios and recovery
- Compare load times across all network conditions
- Measure resource timing with throttling

**Run:**
```bash
npx playwright test tests/day-5-performance/4-network-throttling.spec.js
```

**Note:** Network throttling tests take longer to run (2-3 minutes) due to slow network simulation.

### 5. Custom Performance Marks (`5-custom-performance-marks.spec.js`)
Creates custom performance marks and measurements to track application-specific metrics.

**Tests:**
- Create custom performance marks
- Measure button click to data display time
- Track search/filter operations
- Measure data fetch and processing time
- Create complete workflow timeline
- Monitor memory usage

**Run:**
```bash
npx playwright test tests/day-5-performance/5-custom-performance-marks.spec.js
```

## Running All Performance Tests

To run all performance tests:

```bash
npm run serve  # In one terminal, start the local server
npm test -- tests/day-5-performance  # In another terminal
```

Or with specific reporter:
```bash
npx playwright test tests/day-5-performance --reporter=list
```

## Key Metrics

### Page Load Metrics
- **Navigation Start** → Event that triggers page load
- **DNS Lookup** → Time to resolve domain name
- **TCP Connection** → Time to establish connection
- **Request Time** → Time to send request to server
- **Response Time** → Time for server to respond
- **Render Time** → Time to render page
- **DOM Complete** → Time DOM is fully loaded
- **Load Event** → When page.onload fires

### Core Web Vitals (Google's UX Metrics)
- **LCP (Largest Contentful Paint)** < 2.5s ✅
- **FID (First Input Delay)** < 100ms ✅
- **CLS (Cumulative Layout Shift)** < 0.1 ✅

### Resource Analysis
- Count of resources loaded
- Total size of all resources
- Individual resource timing (DNS, TCP, request, response)
- Render-blocking resources
- Slowest resources

### Network Conditions
- **WiFi** - Fast (150 Mbps download, 30 Mbps upload)
- **4G** - Good (4 Mbps download, 3 Mbps upload)
- **3G** - Moderate (1.6 Mbps download)
- **Slow 3G** - Slow (50 Kbps download, 2000ms latency)

## Best Practices

1. **Establish Baselines** - Know your normal load times before optimizing
2. **Set Thresholds** - Define acceptable times for your app (e.g., LCP < 2.5s)
3. **Monitor Trends** - Track performance over time in CI/CD
4. **Test Real Conditions** - Throttle network to test on actual user conditions
5. **Avoid False Positives** - Run tests multiple times to reduce flakiness
6. **Focus on Users** - Measure what matters to users (LCP, FID, CLS)
7. **Mask Dynamic Content** - Exclude timestamps and random data from measurements

## Common Issues

### "Performance API not available"
Some older browsers don't support all performance APIs. Tests gracefully handle this.

### Flaky Network Tests
Network throttling tests can be flaky due to system variations. If tests fail:
- Run tests multiple times to establish baseline
- Use machines with consistent networking
- Add retries for network-sensitive tests

### Memory API Not Available
Memory information (heap usage) is not available in all browser contexts. Tests handle this gracefully.

## Debugging

To see detailed logs while running tests:

```bash
npx playwright test tests/day-5-performance --reporter=list --headed
```

For debugging a specific test:
```bash
npx playwright test tests/day-5-performance/1-page-load-metrics.spec.js --debug
```

## Resources

- [Playwright Performance Testing](https://playwright.dev/docs/trace-viewer)
- [Web.dev - Core Web Vitals](https://web.dev/vitals/)
- [MDN - Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [WebPageTest](https://www.webpagetest.org/) - For detailed performance analysis
