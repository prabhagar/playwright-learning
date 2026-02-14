const { test, expect, chromium } = require('@playwright/test');

test.describe('Exercise 4: Network Throttling & Performance Under Load', () => {
  test('should measure page load on normal network', async ({ page }) => {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    const loadTime = await page.evaluate(() => {
      const navTiming = performance.getEntriesByType('navigation')[0];
      return navTiming ? navTiming.loadEventEnd - navTiming.fetchStart : 0;
    });

    console.log(`📊 Normal Network Load Time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });

  test('should measure page load on slow 3G', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Set up network conditions (Slow 3G)
    const client = await context.newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 50 * 1024 / 8, // 50kbps
      uploadThroughput: 20 * 1024 / 8,   // 20kbps
      latency: 2000, // 2000ms latency
    });

    const start = Date.now();
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 30000 // Longer timeout for slow network
    });
    const loadTime = Date.now() - start;

    console.log(`📊 Slow 3G Load Time: ${loadTime}ms`);

    // Page should load within 30 seconds on slow 3G
    expect(loadTime).toBeLessThan(30000);

    await client.send('Network.disable');
    await context.close();
    await browser.close();
  });

  test('should measure page load on 4G', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Set up network conditions (4G)
    const client = await context.newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 4 * 1024 * 1024 / 8, // 4Mbps
      uploadThroughput: 3 * 1024 * 1024 / 8,  // 3Mbps
      latency: 50, // 50ms latency
    });

    const start = Date.now();
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - start;

    console.log(`📊 4G Load Time: ${loadTime}ms`);

    // Page should load within 5 seconds on 4G
    expect(loadTime).toBeLessThan(5000);

    await client.send('Network.disable');
    await context.close();
    await browser.close();
  });

  test('should simulate offline and network recovery', async ({ page }) => {
    // Go online first
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    const client = await page.context().newCDPSession(page);

    // Go offline
    console.log('⚠️  Going offline...');
    await client.send('Network.emulateNetworkConditions', {
      offline: true,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
    });

    // Try to navigate - should fail
    const offlineError = await page.goto('http://localhost:3000/login.html')
      .catch(e => e.message);
    
    console.log(`Offline navigation error: ${offlineError}`);
    expect(offlineError).toContain('net::ERR_INTERNET_DISCONNECTED');

    // Go back online
    console.log('✅ Coming back online...');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 10 * 1024 * 1024 / 8,
      uploadThroughput: 10 * 1024 * 1024 / 8,
      latency: 0,
    });

    // Should navigate successfully now
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/.*Election Simulator|Testing Demo.*/i);

    console.log('✅ Page loaded successfully after network recovery');

    await client.send('Network.disable');
  });

  test('should compare load times across network conditions', async () => {
    const networkConditions = [
      {
        name: 'WiFi',
        download: 150 * 1024 * 1024 / 8,
        upload: 30 * 1024 * 1024 / 8,
        latency: 2,
      },
      {
        name: '4G',
        download: 4 * 1024 * 1024 / 8,
        upload: 3 * 1024 * 1024 / 8,
        latency: 50,
      },
      {
        name: '3G',
        download: 1.6 * 1024 * 1024 / 8,
        upload: 750 * 1024 / 8,
        latency: 100,
      },
      {
        name: 'Slow 3G',
        download: 50 * 1024 / 8,
        upload: 20 * 1024 / 8,
        latency: 2000,
      },
    ];

    console.log('\n⚡ Network Performance Comparison:');
    console.log('════════════════════════════════════════════════════════');

    const results = [];

    for (const condition of networkConditions) {
      const browser = await chromium.launch();
      const context = await browser.newContext();
      const page = await context.newPage();

      const client = await context.newCDPSession(page);
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: condition.download,
        uploadThroughput: condition.upload,
        latency: condition.latency,
      });

      const start = Date.now();
      await page.goto('http://localhost:3000', { 
        waitUntil: 'networkidle',
        timeout: 60000
      }).catch(() => null);
      const loadTime = Date.now() - start;

      results.push({
        condition: condition.name,
        latency: condition.latency,
        loadTime,
      });

      console.log(`${condition.name.padEnd(15)} (${condition.latency}ms latency): ${loadTime}ms`);

      await client.send('Network.disable');
      await context.close();
      await browser.close();
    }

    // Validate that page is usable on all network conditions
    results.forEach(result => {
      if (result.condition !== 'Slow 3G') {
        expect(result.loadTime).toBeLessThan(10000);
      }
    });
  });

  test('should measure resource load times with throttling', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Enable throttling
    const client = await context.newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 500 * 1024 / 8, // 500kbps
      uploadThroughput: 200 * 1024 / 8,
      latency: 200,
    });

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter(r => r.duration > 0)
        .map(r => ({
          name: r.name.split('/').pop(),
          duration: r.duration,
          size: r.transferSize || 0,
        }))
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5);
    });

    console.log('\n📊 Top 5 Slowest Resources (with throttling):');
    resources.forEach(r => {
      console.log(`   ${r.name.padEnd(30)} ${r.duration.toFixed(2)}ms (${(r.size / 1024).toFixed(2)}KB)`);
    });

    await client.send('Network.disable');
    await context.close();
    await browser.close();
  });
});
