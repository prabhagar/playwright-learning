const { test, expect } = require('@playwright/test');

test.describe('Exercise 1: Page Load Time Measurement', () => {
  test('should measure page load time', async ({ page }) => {
    // Start measuring from navigation
    const navigationStartTime = Date.now();
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // Using modern Navigation Timing Level 2 API
    const loadTime = await page.evaluate(() => {
      const navTiming = performance.getEntriesByType('navigation')[0];
      
      if (!navTiming) {
        // Fallback for older browsers
        const timing = performance.timing;
        return {
          navigationStart: timing.navigationStart,
          domInteractive: timing.domInteractive,
          domContentLoaded: timing.domContentLoaded,
          loadEventEnd: timing.loadEventEnd,
          totalTime: timing.loadEventEnd - timing.navigationStart,
          dnsTime: timing.dnsLookupEnd - timing.dnsLookupStart,
          tcpTime: timing.connectEnd - timing.connectStart,
          requestTime: timing.responseStart - timing.requestStart,
          renderTime: timing.domInteractive - timing.responseEnd,
          domCompleteTime: timing.domComplete - timing.domLoading,
        };
      }

      return {
        navigationStart: navTiming.fetchStart,
        domInteractive: navTiming.domInteractive,
        domContentLoaded: navTiming.domContentLoadedEventEnd,
        loadEventEnd: navTiming.loadEventEnd,
        totalTime: navTiming.loadEventEnd - navTiming.fetchStart,
        dnsTime: navTiming.domainLookupEnd - navTiming.domainLookupStart,
        tcpTime: navTiming.connectEnd - navTiming.connectStart,
        requestTime: navTiming.responseStart - navTiming.requestStart,
        renderTime: navTiming.domInteractive - navTiming.responseEnd,
        domCompleteTime: navTiming.domComplete - navTiming.domLoading,
      };
    });

    console.log('📊 Page Load Metrics:');
    console.log(`   Total Load Time: ${loadTime.totalTime}ms`);
    console.log(`   DNS Lookup: ${loadTime.dnsTime}ms`);
    console.log(`   TCP Connection: ${loadTime.tcpTime}ms`);
    console.log(`   Request: ${loadTime.requestTime}ms`);
    console.log(`   Render: ${loadTime.renderTime}ms`);
    console.log(`   DOM Complete: ${loadTime.domCompleteTime}ms`);

    // Assert that page loads within 3 seconds
    expect(loadTime.totalTime).toBeLessThan(3000);
    
    // Assert DOM is interactive within 2 seconds
    expect(loadTime.domInteractive - loadTime.navigationStart).toBeLessThan(2000);
  });

  test('should measure resources loading efficiency', async ({ page }) => {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    const resourceTimings = await page.evaluate(() => {
      return performance.getEntriesByType('navigation').map(entry => ({
        name: entry.name,
        duration: entry.duration,
        dnsLookup: entry.domainLookupEnd - entry.domainLookupStart,
        tcpConnection: entry.connectEnd - entry.connectStart,
        requestTime: entry.responseStart - entry.requestStart,
        responseTime: entry.responseEnd - entry.responseStart,
        renderTime: entry.domInteractive - entry.responseEnd,
      }));
    });

    console.log('🔗 Navigation Timing:');
    resourceTimings.forEach(resource => {
      console.log(`   ${resource.name || 'Page'}: ${resource.duration.toFixed(2)}ms`);
    });

    // Main document should load quickly
    expect(resourceTimings[0].duration).toBeLessThan(3000);
  });

  test('should track critical rendering path', async ({ page }) => {
    const metrics = await page.evaluate(() => {
      const navTiming = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      // Use modern Navigation Timing Level 2 API
      const domLoadedMs = navTiming ? navTiming.domContentLoadedEventEnd - navTiming.fetchStart : 0;
      const pageLoadMs = navTiming ? navTiming.loadEventEnd - navTiming.fetchStart : 0;
      
      return {
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
        domLoadedMs: domLoadedMs,
        pageLoadMs: pageLoadMs,
      };
    });

    console.log('🎨 Critical Rendering Path:');
    console.log(`   First Paint: ${metrics.firstPaint?.toFixed(2)}ms`);
    console.log(`   First Contentful Paint: ${metrics.firstContentfulPaint?.toFixed(2)}ms`);
    console.log(`   DOM Loaded: ${metrics.domLoadedMs}ms`);
    console.log(`   Page Load: ${metrics.pageLoadMs}ms`);

    // FCP should happen quickly
    if (metrics.firstContentfulPaint) {
      expect(metrics.firstContentfulPaint).toBeLessThan(2000);
    }
  });
});
