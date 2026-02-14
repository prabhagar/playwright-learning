# Class 5 — Performance Testing & Metrics

## Goal
Learn to measure and validate application performance using Playwright's performance APIs, Core Web Vitals, resource timing, and custom metrics.

## 🔄 Modern vs Deprecated APIs

**Note:** We use modern **Navigation Timing Level 2 API** (`performance.getEntriesByType('navigation')`) instead of deprecated `performance.timing`.

| Aspect | Deprecated (Legacy) | Modern (Recommended) |
|--------|-------------------|-------------------|
| API | `performance.timing` | `performance.getEntriesByType('navigation')` |
| Status | ❌ Deprecated in WHATWG | ✅ Current standard |
| Usage | `timing.navigationStart` | `navTiming.fetchStart` |
| Browser Support | Older browsers | All modern browsers |
| Benefits | Legacy compatibility | Future-proof, better structure |

**Why the change:**
- `performance.timing` was deprecated because it returns a mutable object that freezes at page load
- Modern API returns `PerformanceNavigationTiming` which is more reliable
- Property names are clearer (e.g., `domainLookupStart` vs `dnsLookupStart`)

## Topics

### 1. Page Load Metrics
- Measure page load time using `performance.getEntriesByType('navigation')` (modern API)
- Access Navigation Timing Level 2: `fetchStart`, `domInteractive`, `loadEventEnd`
- **Note:** `performance.timing` is deprecated; use the modern API instead
- Validate that pages load within acceptable time thresholds

### 2. Core Web Vitals
- **LCP (Largest Contentful Paint)** — when largest content element becomes visible
- **FID (First Input Delay)** — responsiveness to user interactions
- **CLS (Cumulative Layout Shift)** — visual stability
- Use PerformanceObserver to capture these metrics

### 3. Resource Timing
- Access `performance.getEntriesByType('resource')` to analyze individual assets
- Measure HTTP request/response times for images, scripts, stylesheets
- Identify slow resources and bottlenecks

### 4. Network Performance
- Use `page.route()` or CDPSession to throttle network connections
- Simulate slow 3G, 4G, or custom network conditions
- Measure impact on load times and user experience

### 5. Custom Performance Marks
- Create custom performance marks: `performance.mark()` and `performance.measure()`
- Track application-specific milestones (e.g., "data loaded", "render complete")
- Query measurements and assert on custom timings

### 6. Lighthouse Integration (Bonus)
- Use Playwright with Chrome DevTools Protocol (CDP) to run Lighthouse audits
- Analyze performance score and recommendations
- Integrate lighthouse results into test reports

## Hands-on Exercises

### Exercise 1: Measure Page Load Time
- Navigate to a page and measure time from start to `loadEventEnd`
- Assert that the page loads within 3 seconds
- Log the breakdown: DNS, TCP, Request, Render, DOM Complete

### Exercise 2: Capture Core Web Vitals
- Use a PerformanceObserver to capture LCP, FID, and CLS metrics
- Create a helper function that extracts all vitals from a page
- Assert LCP < 2.5s and CLS < 0.1

### Exercise 3: Analyze Resource Timing
- Fetch all resources (images, JS, CSS) and their load times
- Find the slowest resource and validate it's under 1 second
- Create a performance report that lists all resources and their sizes

### Exercise 4: Network Throttling
- Simulate slow 3G network and measure impact on load time
- Compare baseline vs. throttled load times
- Assert that on slow networks, pages still load within a reasonable threshold (e.g., 5 seconds)

### Exercise 5: Custom Performance Measurements
- Mark when a button click completes a data fetch
- Measure time from click to data display
- Create an assertion that validates interaction response time < 500ms

## Common Patterns

### Capturing Page Load Time (Modern API)
```javascript
const loadTime = await page.evaluate(() => {
  const navTiming = performance.getEntriesByType('navigation')[0];
  if (!navTiming) return null; // Fallback for older browsers
  
  return {
    totalTime: navTiming.loadEventEnd - navTiming.fetchStart,
    dnsTime: navTiming.domainLookupEnd - navTiming.domainLookupStart,
    tcpTime: navTiming.connectEnd - navTiming.connectStart,
    ttfb: navTiming.responseStart - navTiming.requestStart,
  };
});
expect(loadTime.totalTime).toBeLessThan(3000); // < 3 seconds
```

### Capturing Page Load Time (Legacy/Fallback)
```javascript
// Only use if you need to support very old browsers
const loadTime = await page.evaluate(() => {
  const timing = performance.timing;
  return timing.loadEventEnd - timing.navigationStart;
});
expect(loadTime).toBeLessThan(3000); // < 3 seconds
```

### Measuring Layout Shift
```javascript
const cls = await page.evaluate(() => {
  return new Promise(resolve => {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
    });
    observer.observe({ type: 'layout-shift', buffered: true });
    setTimeout(() => {
      observer.disconnect();
      resolve(clsValue);
    }, 3000);
  });
});
expect(cls).toBeLessThan(0.1);
```

### Getting Resource Timings
```javascript
const resources = await page.evaluate(() => {
  return performance.getEntriesByType('resource').map(r => ({
    name: r.name,
    duration: r.duration,
    size: r.transferSize,
  }));
});
```

### Network Throttling
```javascript
const client = await page.context().newCDPSession(page);
await client.send('Network.emulateNetworkConditions', {
  offline: false,
  downloadThroughput: 500 * 1024 / 8, // 500kb/s
  uploadThroughput: 500 * 1024 / 8,
  latency: 400 // 400ms
});
```

## Running Tests

Start the local server and run Day-5 tests:

```bash
npm run serve
npm test -- tests/day-5-performance
```

## Best Practices

1. **Baseline Metrics** — Establish baseline metrics in a staging/production environment
2. **Threshold Alerts** — Fail tests if metrics exceed thresholds
3. **Real vs Synthetic** — Synthetic tests (Playwright) complement real-user monitoring (RUM)
4. **Avoid Flakiness** — Network timing tests can be flaky; use retries and stability checks
5. **Mask Dynamic Content** — Exclude timestamps or random data from metrics
6. **Focus on User Experience** — Measure what matters to users (LCP, FID, CLS)
7. **CI Consistency** — Run on consistent hardware/network; use throttling for reproducibility

## Notes

- Performance tests should run on a consistent machine (CI, staging server)
- Use `page.waitForLoadState('networkidle')` for stability, but measure real timings separately
- Core Web Vitals evolve; check Google Web Vitals docs for latest definitions
- Consider using third-party tools (SpeedCurve, WebPageTest) for comprehensive analysis
