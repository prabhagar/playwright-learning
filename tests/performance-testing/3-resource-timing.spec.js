const { test, expect } = require('@playwright/test');

test.describe('Exercise 3: Resource Timing Analysis', () => {
  test('should analyze all resources and their load times', async ({ page }) => {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map(resource => ({
        name: resource.name.split('/').pop() || resource.name,
        url: resource.name,
        type: resource.initiatorType,
        duration: resource.duration,
        size: resource.transferSize || 0,
        decodedSize: resource.decodedBodySize || 0,
        dns: resource.domainLookupEnd - resource.domainLookupStart,
        tcp: resource.connectEnd - resource.connectStart,
        request: resource.responseStart - resource.requestStart,
        response: resource.responseEnd - resource.responseStart,
      }));
    });

    console.log('📦 Resource Timing Analysis:');
    console.log('════════════════════════════════════════════════════════');
    
    resources.forEach(r => {
      console.log(`\n📄 ${r.name} [${r.type}]`);
      console.log(`   Duration: ${r.duration.toFixed(2)}ms`);
      console.log(`   Size: ${(r.size / 1024).toFixed(2)}KB (transfer) / ${(r.decodedSize / 1024).toFixed(2)}KB (decoded)`);
      console.log(`   DNS: ${r.dns.toFixed(2)}ms | TCP: ${r.tcp.toFixed(2)}ms | Request: ${r.request.toFixed(2)}ms | Response: ${r.response.toFixed(2)}ms`);
    });

    // Find slowest resource
    const slowestResource = resources.reduce((slowest, current) => 
      current.duration > slowest.duration ? current : slowest
    );

    console.log(`\n⏱️  Slowest Resource: ${slowestResource.name} (${slowestResource.duration.toFixed(2)}ms)`);

    // Assert slowest resource loads within 1 second
    expect(slowestResource.duration).toBeLessThan(1000);
  });

  test('should categorize resources by type', async ({ page }) => {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    const resourcesByType = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const grouped = {};

      resources.forEach(r => {
        const type = r.initiatorType || 'other';
        if (!grouped[type]) {
          grouped[type] = { count: 0, totalSize: 0, totalDuration: 0, resources: [] };
        }
        grouped[type].count++;
        grouped[type].totalSize += r.transferSize || 0;
        grouped[type].totalDuration += r.duration;
        grouped[type].resources.push({
          name: r.name.split('/').pop(),
          duration: r.duration,
          size: r.transferSize || 0,
        });
      });

      return grouped;
    });

    console.log('\n📊 Resources by Type:');
    console.log('════════════════════════════════════════════════════════');

    Object.entries(resourcesByType).forEach(([type, data]) => {
      console.log(`\n${type.toUpperCase()}:`);
      console.log(`   Count: ${data.count}`);
      console.log(`   Total Size: ${(data.totalSize / 1024).toFixed(2)}KB`);
      console.log(`   Total Duration: ${data.totalDuration.toFixed(2)}ms`);
      console.log(`   Avg Duration: ${(data.totalDuration / data.count).toFixed(2)}ms`);
    });

    // Validate that we have reasonable number of resources
    expect(Object.values(resourcesByType).reduce((sum, type) => sum + type.count, 0)).toBeGreaterThan(0);
  });

  test('should identify performance bottlenecks', async ({ page }) => {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    const bottlenecks = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      
      // Find resources slower than 500ms
      const slowResources = resources.filter(r => r.duration > 500);
      
      // Find resources larger than 100KB
      const largeResources = resources.filter(r => (r.transferSize || 0) > 100 * 1024);

      return {
        slowResources: slowResources.map(r => ({
          name: r.name.split('/').pop(),
          duration: r.duration,
          size: r.transferSize || 0,
        })),
        largeResources: largeResources.map(r => ({
          name: r.name.split('/').pop(),
          size: (r.transferSize || 0) / 1024,
          duration: r.duration,
        })),
      };
    });

    console.log('\n⚠️  Performance Bottlenecks:');
    console.log('════════════════════════════════════════════════════════');

    if (bottlenecks.slowResources.length > 0) {
      console.log('\n🐌 Slow Resources (> 500ms):');
      bottlenecks.slowResources.forEach(r => {
        console.log(`   ${r.name}: ${r.duration.toFixed(2)}ms (${(r.size / 1024).toFixed(2)}KB)`);
      });
    } else {
      console.log('\n✅ No slowness issues found!');
    }

    if (bottlenecks.largeResources.length > 0) {
      console.log('\n📦 Large Resources (> 100KB):');
      bottlenecks.largeResources.forEach(r => {
        console.log(`   ${r.name}: ${r.size.toFixed(2)}KB (loaded in ${r.duration.toFixed(2)}ms)`);
      });
    } else {
      console.log('\n✅ All resources are reasonably sized!');
    }
  });

  test('should generate performance report', async ({ page }) => {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    const report = await page.evaluate(() => {
      const navTiming = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource');
      const paint = performance.getEntriesByType('paint');

      const totalSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
      const totalTime = resources.reduce((sum, r) => sum + r.duration, 0);

      return {
        pageLoadTime: navTiming ? navTiming.loadEventEnd - navTiming.fetchStart : 0,
        domInteractiveTime: navTiming ? navTiming.domInteractive - navTiming.fetchStart : 0,
        resourceCount: resources.length,
        totalResourceSize: totalSize,
        totalResourceTime: totalTime,
        paintTiming: paint.reduce((acc, p) => {
          acc[p.name] = p.startTime;
          return acc;
        }, {}),
        slowestResource: resources.reduce((slowest, r) => 
          r.duration > slowest.duration ? r : slowest,
          resources[0]
        ),
      };
    });

    console.log('\n📈 Performance Report:');
    console.log('════════════════════════════════════════════════════════');
    console.log(`Page Load Time: ${report.pageLoadTime.toFixed(2)}ms`);
    console.log(`DOM Interactive: ${report.domInteractiveTime.toFixed(2)}ms`);
    console.log(`Total Resources: ${report.resourceCount}`);
    console.log(`Total Resource Size: ${(report.totalResourceSize / 1024).toFixed(2)}KB`);
    console.log(`Total Resource Time: ${report.totalResourceTime.toFixed(2)}ms`);
    console.log(`\nPaint Timing:`);
    Object.entries(report.paintTiming).forEach(([name, time]) => {
      console.log(`   ${name}: ${time.toFixed(2)}ms`);
    });

    expect(report.pageLoadTime).toBeLessThan(5000);
  });

  test('should identify render-blocking resources', async ({ page }) => {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    const renderBlockingInfo = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const navTiming = performance.getEntriesByType('navigation')[0];
      const dcl = navTiming ? navTiming.domContentLoadedEventEnd - navTiming.fetchStart : 0;

      // Resources that finish loading after DCL might be render-blocking
      const afterDCLResources = resources.filter(r => r.responseEnd > dcl);

      return {
        domContentLoadedTime: dcl,
        renderBlockingResources: afterDCLResources.map(r => ({
          name: r.name.split('/').pop(),
          type: r.initiatorType,
          finishTime: r.responseEnd,
          blocking: r.responseEnd - dcl, // how much after DCL
        })),
      };
    });

    console.log('\n🔒 Render-Blocking Resources:');
    console.log('════════════════════════════════════════════════════════');
    console.log(`DOM Content Loaded: ${renderBlockingInfo.domContentLoadedTime.toFixed(2)}ms`);

    if (renderBlockingInfo.renderBlockingResources.length > 0) {
      console.log('\nResources loaded after DCL:');
      renderBlockingInfo.renderBlockingResources.forEach(r => {
        console.log(`   ${r.name} [${r.type}]: Finishes ${r.blocking.toFixed(2)}ms after DCL`);
      });
    }

    expect(renderBlockingInfo.renderBlockingResources.length).toBeLessThan(20);
  });
});
