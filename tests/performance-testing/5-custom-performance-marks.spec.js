const { test, expect } = require('@playwright/test');

test.describe('Exercise 5: Custom Performance Marks & Measurements', () => {
  test('should create and measure custom performance marks', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const measurements = await page.evaluate(() => {
      // Create custom marks
      performance.mark('user-navigation-start');
      
      // Simulate navigation delay
      const start = Date.now();
      while (Date.now() - start < 100) {}
      
      performance.mark('user-navigation-end');

      // Create a measurement between marks
      performance.measure(
        'user-navigation-time',
        'user-navigation-start',
        'user-navigation-end'
      );

      // Get the measurement
      const measure = performance.getEntriesByName('user-navigation-time')[0];
      
      return {
        duration: measure.duration,
        marks: performance.getEntriesByType('mark').map(m => ({
          name: m.name,
          time: m.startTime,
        })),
        measurements: performance.getEntriesByType('measure').map(m => ({
          name: m.name,
          duration: m.duration,
        })),
      };
    });

    console.log('⏱️  Custom Performance Marks:');
    console.log(`Navigation time: ${measurements.duration.toFixed(2)}ms`);
    
    measurements.marks.forEach(mark => {
      console.log(`Mark: ${mark.name} @ ${mark.time.toFixed(2)}ms`);
    });

    measurements.measurements.forEach(measure => {
      console.log(`Measure: ${measure.name} = ${measure.duration.toFixed(2)}ms`);
    });

    expect(measurements.duration).toBeGreaterThan(100);
  });

  test('should track button click to data display time', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Inject code to track interaction timing
    await page.evaluate(() => {
      window.performanceMarks = {};

      // Find a button and track its interaction
      const buttons = document.querySelectorAll('button');
      if (buttons.length > 0) {
        const button = buttons[0];
        button.addEventListener('click', () => {
          performance.mark('interaction-start', { detail: { button: button.textContent } });
          
          // Simulate async operation
          setTimeout(() => {
            performance.mark('interaction-end');
            performance.measure('interaction-time', 'interaction-start', 'interaction-end');
          }, 200);
        });
      }
    });

    // Click the button
    await page.click('button');
    
    // Wait for async operation
    await page.waitForTimeout(500);

    // Get the measurement
    const measurement = await page.evaluate(() => {
      const measures = performance.getEntriesByName('interaction-time');
      if (measures.length > 0) {
        return measures[0].duration;
      }
      return null;
    });

    if (measurement) {
      console.log(`⚡ Button click to data display: ${measurement.toFixed(2)}ms`);
      expect(measurement).toBeLessThan(1000);
    }
  });

  test('should measure search/filter operations', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const searchMetrics = await page.evaluate(() => {
      const metrics = {
        searchStart: null,
        inputStart: null,
        filterStart: null,
        displayStart: null,
      };

      // Create marks for different phases
      performance.mark('search-operation-start');

      // Simulate user typing
      setTimeout(() => performance.mark('user-input-complete'), 100);
      
      // Simulate filtering
      setTimeout(() => performance.mark('filter-complete'), 200);
      
      // Simulate display of results
      setTimeout(() => {
        performance.mark('results-displayed');
        performance.measure(
          'search-interaction-time',
          'search-operation-start',
          'results-displayed'
        );
      }, 300);

      return new Promise(resolve => {
        setTimeout(() => {
          const measures = performance.getEntriesByName('search-interaction-time');
          resolve({
            totalTime: measures.length > 0 ? measures[0].duration : 0,
            marks: performance.getEntriesByType('mark')
              .filter(m => m.name.includes('search') || m.name.includes('input') || m.name.includes('filter') || m.name.includes('result'))
              .map(m => ({ name: m.name, time: m.startTime })),
          });
        }, 400);
      });
    });

    console.log('🔍 Search/Filter Operation Metrics:');
    console.log(`Total time: ${searchMetrics.totalTime.toFixed(2)}ms`);
    searchMetrics.marks.forEach(mark => {
      console.log(`   ${mark.name} @ ${mark.time.toFixed(2)}ms`);
    });

    // Search should complete within 2 seconds
    expect(searchMetrics.totalTime).toBeLessThan(2000);
  });

  test('should measure data fetching and processing time', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const fetchMetrics = await page.evaluate(() => {
      return new Promise(resolve => {
        performance.mark('fetch-start');

        // Simulate API call
        const mockApiCall = new Promise(res => {
          setTimeout(() => {
            performance.mark('fetch-complete');
            res({ data: [1, 2, 3] });
          }, 150);
        });

        mockApiCall.then(data => {
          performance.mark('data-processing-start');

          // Simulate data processing
          let result = 0;
          for (let i = 0; i < 1000000; i++) {
            result += Math.sqrt(i);
          }

          performance.mark('data-processing-complete');

          // Create measures for each phase
          performance.measure('fetch-duration', 'fetch-start', 'fetch-complete');
          performance.measure('processing-duration', 'data-processing-start', 'data-processing-complete');
          performance.measure('total-duration', 'fetch-start', 'data-processing-complete');

          const measures = {
            fetch: performance.getEntriesByName('fetch-duration')[0],
            processing: performance.getEntriesByName('processing-duration')[0],
            total: performance.getEntriesByName('total-duration')[0],
          };

          resolve({
            fetchTime: measures.fetch.duration,
            processingTime: measures.processing.duration,
            totalTime: measures.total.duration,
          });
        });
      });
    });

    console.log('📥 Data Fetch & Processing Metrics:');
    console.log(`   Fetch time: ${fetchMetrics.fetchTime.toFixed(2)}ms`);
    console.log(`   Processing time: ${fetchMetrics.processingTime.toFixed(2)}ms`);
    console.log(`   Total time: ${fetchMetrics.totalTime.toFixed(2)}ms`);

    // Total operation should be quick
    expect(fetchMetrics.totalTime).toBeLessThan(5000);
  });

  test('should create performance timeline for complex workflow', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const timeline = await page.evaluate(() => {
      // Record entire workflow with multiple marks
      const workflow = [
        { name: 'page-load-start', delay: 0 },
        { name: 'page-ready', delay: 100 },
        { name: 'interaction-start', delay: 200 },
        { name: 'api-call-start', delay: 250 },
        { name: 'api-response', delay: 400 },
        { name: 'dom-update', delay: 500 },
        { name: 'animation-complete', delay: 1000 },
        { name: 'viewport-settled', delay: 1200 },
      ];

      // Create marks on a timeline
      workflow.forEach(event => {
        setTimeout(() => {
          performance.mark(event.name);
        }, event.delay);
      });

      return new Promise(resolve => {
        setTimeout(() => {
          const marks = performance.getEntriesByType('mark').map(m => ({
            name: m.name,
            time: m.startTime,
          }));

          // Create measures between key milestones
          try {
            performance.measure('time-to-interactive', 'page-load-start', 'page-ready');
            performance.measure('api-response-time', 'api-call-start', 'api-response');
            performance.measure('total-workflow', 'page-load-start', 'viewport-settled');
          } catch (e) {
            // Measures might not exist yet
          }

          const measures = performance.getEntriesByType('measure')
            .filter(m => m.name.includes('time'))
            .map(m => ({
              name: m.name,
              duration: m.duration,
            }));

          resolve({ marks, measures });
        }, 1300);
      });
    });

    console.log('\n📈 Complete Workflow Timeline:');
    timeline.marks.forEach(mark => {
      console.log(`   ${mark.name.padEnd(25)} @ ${mark.time.toFixed(2)}ms`);
    });

    console.log('\n⏱️  Key Milestones:');
    timeline.measures.forEach(measure => {
      console.log(`   ${measure.name.padEnd(25)}: ${measure.duration.toFixed(2)}ms`);
    });

    // Validate key milestones
    const totalWorkflow = timeline.measures.find(m => m.name === 'total-workflow');
    if (totalWorkflow) {
      expect(totalWorkflow.duration).toBeLessThan(5000);
    }
  });

  test('should measure memory usage with performance entries', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const memoryInfo = await page.evaluate(() => {
      const perf = performance.memory || performance.mozMemory || null;
      
      if (perf) {
        return {
          usedJSHeapSize: (perf.usedJSHeapSize / 1048576).toFixed(2),
          totalJSHeapSize: (perf.totalJSHeapSize / 1048576).toFixed(2),
          jsHeapSizeLimit: (perf.jsHeapSizeLimit / 1048576).toFixed(2),
          heapUtilization: ((perf.usedJSHeapSize / perf.jsHeapSizeLimit) * 100).toFixed(2),
        };
      }
      
      return null;
    });

    if (memoryInfo) {
      console.log('\n💾 Memory Information:');
      console.log(`   Used Heap: ${memoryInfo.usedJSHeapSize}MB`);
      console.log(`   Total Heap: ${memoryInfo.totalJSHeapSize}MB`);
      console.log(`   Heap Limit: ${memoryInfo.jsHeapSizeLimit}MB`);
      console.log(`   Utilization: ${memoryInfo.heapUtilization}%`);

      // Page should not consume excessive memory
      expect(parseFloat(memoryInfo.heapUtilization)).toBeLessThan(90);
    } else {
      console.log('⚠️  Memory API not available in this browser');
    }
  });
});
