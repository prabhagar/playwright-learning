const { test, expect } = require('@playwright/test');

test.describe('Exercise 2: Core Web Vitals Measurement', () => {
  // Helper to capture Core Web Vitals
  async function captureWebVitals(page) {
    const vitals = await page.evaluate(() => {
      return new Promise(resolve => {
        const vitalMetrics = {
          lcp: null,
          fid: null,
          cls: 0,
          lcpTime: null,
          fidTime: null,
        };

        // Capture Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitalMetrics.lcp = lastEntry;
          vitalMetrics.lcpTime = lastEntry.renderTime || lastEntry.loadTime;
        });
        try {
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          console.log('LCP observer not supported');
        }

        // Capture First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            vitalMetrics.fidTime = entry.processingStart - entry.startTime;
          });
        });
        try {
          fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (e) {
          console.log('FID observer not supported');
        }

        // Capture Cumulative Layout Shift (CLS)
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            if (!entry.hadRecentInput) {
              vitalMetrics.cls += entry.value;
            }
          });
        });
        try {
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          console.log('CLS observer not supported');
        }

        // Wait a bit for metrics to populate, then resolve
        setTimeout(() => {
          lcpObserver.disconnect();
          fidObserver.disconnect();
          clsObserver.disconnect();
          resolve(vitalMetrics);
        }, 3000);
      });
    });

    return vitals;
  }

  test('should capture Core Web Vitals on page load', async ({ page }) => {
    await page.goto('http://localhost:3000', { waitUntil: 'load' });

    const vitals = await captureWebVitals(page);

    console.log('⭐ Core Web Vitals:');
    console.log(`   LCP: ${vitals.lcpTime ? vitals.lcpTime.toFixed(2) + 'ms' : 'Not captured'}`);
    console.log(`   FID: ${vitals.fidTime ? vitals.fidTime.toFixed(2) + 'ms' : 'Not captured'}`);
    console.log(`   CLS: ${vitals.cls.toFixed(3)}`);

    // Validate LCP < 2.5 seconds (Good threshold per Google)
    if (vitals.lcpTime) {
      expect(vitals.lcpTime).toBeLessThan(2500);
    }

    // Validate CLS < 0.1 (Good threshold per Google)
    expect(vitals.cls).toBeLessThan(0.1);
  });

  test('should measure metrics after user interaction', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Capture baseline vitals before interaction
    const baselineVitals = await captureWebVitals(page);
    console.log('Baseline CLS:', baselineVitals.cls);

    // Simulate user interactions (e.g., scroll, click)
    await page.evaluate(() => {
      window.scrollBy(0, 100);
    });

    // Wait a moment and capture again
    await page.waitForTimeout(500);
    const interactionVitals = await captureWebVitals(page);

    console.log('After interaction CLS:', interactionVitals.cls);

    // CLS should remain low even after interactions
    expect(interactionVitals.cls).toBeLessThan(0.15);
  });

  test('should validate visual stability during dynamic content loading', async ({ page }) => {
    // This test validates that the page doesn't have excessive layout shifts
    await page.goto('http://localhost:3000');

    let clsValue = 0;

    // Set up a layout shift observer
    const clsData = await page.evaluate(() => {
      return new Promise(resolve => {
        let cls = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              cls += entry.value;
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });

        // Simulate page usage
        setTimeout(() => {
          observer.disconnect();
          resolve(cls);
        }, 5000);
      });
    });

    console.log(`📐 Cumulative Layout Shift: ${clsData.toFixed(4)}`);

    // Assert CLS is excellent (< 0.1)
    expect(clsData).toBeLessThan(0.1);
  });

  test('should validate responsiveness to interactions', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Create marker for interaction timing
    const interactionTime = await page.evaluate(() => {
      return new Promise(resolve => {
        let interactionDelay = null;

        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            interactionDelay = entries[0].processingStart - entries[0].startTime;
          }
        });

        observer.observe({ entryTypes: ['first-input'] });

        // Simulate a click
        document.documentElement.click();

        setTimeout(() => {
          observer.disconnect();
          resolve(interactionDelay);
        }, 1000);
      });
    });

    console.log(`⚡ First Input Delay: ${interactionTime ? interactionTime.toFixed(2) + 'ms' : 'Not captured'}`);

    // FID should be less than 100ms (Good threshold)
    if (interactionTime !== null) {
      expect(interactionTime).toBeLessThan(100);
    }
  });
});
