# 🎯 Custom Performance Marks & Measurements

## Overview
**Custom Performance Marks** let you measure **YOUR APPLICATION'S SPECIFIC METRICS** — not just browser metrics! You're essentially creating a stopwatch for different parts of your app's workflow.

Think of it like a running race:
- 🏁 **Mark the start** when the runner begins
- 🏁 **Mark the midpoint** when they reach halfway
- 🏁 **Mark the finish** when they complete
- ⏱️ **Measure** the time between any two marks

---

## 1️⃣ The API

### Creating a Mark
```javascript
performance.mark('my-event-name');
```
- Creates a timestamp at this exact moment
- Can add metadata with options:
```javascript
performance.mark('my-event', { detail: { userId: 123 } });
```

### Creating a Measure
```javascript
performance.measure(
  'measure-name',           // Name of this measurement
  'start-mark-name',        // Start mark
  'end-mark-name'           // End mark
);
```
- Calculates the duration BETWEEN two marks
- Returns the time difference in milliseconds

### Retrieving Data
```javascript
// Get all marks
performance.getEntriesByType('mark')

// Get all measures
performance.getEntriesByType('measure')

// Get specific measure by name
performance.getEntriesByName('my-measure')
```

---

## 2️⃣ Test Case 1: Basic Custom Marks

### 📝 Code Example
```javascript
test('should create and measure custom performance marks', async ({ page }) => {
  const measurements = await page.evaluate(() => {
    // 🏁 Mark the start
    performance.mark('user-navigation-start');
    
    // ⏳ Simulate navigation delay (100ms)
    const start = Date.now();
    while (Date.now() - start < 100) {}
    
    // 🏁 Mark the end
    performance.mark('user-navigation-end');

    // ⏱️ Measure the time between them
    performance.measure(
      'user-navigation-time',           // Name
      'user-navigation-start',          // From
      'user-navigation-end'             // To
    );

    // 📊 Retrieve the measurement
    const measure = performance.getEntriesByName('user-navigation-time')[0];
    
    return {
      duration: measure.duration,       // ~100ms
      marks: performance.getEntriesByType('mark'),
      measurements: performance.getEntriesByType('measure'),
    };
  });

  console.log(`Navigation time: ${measurements.duration.toFixed(2)}ms`);
  expect(measurements.duration).toBeGreaterThan(100);
});
```

### 🔍 What's Happening?
| Step | Time | Event |
|------|------|-------|
| 1 | 0ms | `user-navigation-start` mark |
| 2 | 100ms | Simulate delay (busy loop) |
| 3 | 100ms | `user-navigation-end` mark |
| 4 | 100ms | Measure created = 100ms |

### ✅ Real-World Use Case
- Measure how long navigation takes
- Track performance of your app's routing
- Ensure page transitions stay under threshold

---

## 3️⃣ Test Case 2: Interaction Timing

### 📝 Code Example
```javascript
test('should track button click to data display time', async ({ page }) => {
  // Inject performance tracking code
  await page.evaluate(() => {
    const button = document.querySelectorAll('button')[0];
    
    button.addEventListener('click', () => {
      // 🏁 Mark when user clicks
      performance.mark('interaction-start');
      
      // Simulate async operation (API call, processing, etc)
      setTimeout(() => {
        // 🏁 Mark when data appears
        performance.mark('interaction-end');
        
        // ⏱️ Measure the time between click and display
        performance.measure('interaction-time', 'interaction-start', 'interaction-end');
      }, 200);
    });
  });

  // 👆 User clicks button
  await page.click('button');
  await page.waitForTimeout(500);

  // 📊 Get the measurement
  const measurement = await page.evaluate(() => {
    const measures = performance.getEntriesByName('interaction-time');
    return measures[0].duration;
  });

  console.log(`Click to display: ${measurement.toFixed(2)}ms`);
  expect(measurement).toBeLessThan(1000);  // Must respond within 1 second
});
```

### 🔍 What's Being Measured?
```
User clicks button
    ↓
[interaction-start mark]
    ↓
Async operation happens (API call, state update, etc)
    ↓
[interaction-end mark]
    ↓
⏱️ Measure = Time for user to see result
```

### ✅ Real-World Use Case
- **User Responsiveness**: Measure from click → result visible
- **Perceived Performance**: How fast does the UI feel?
- **Performance Budgeting**: "No interaction should take > 1 second"

---

## 4️⃣ Test Case 3: Search/Filter Operations

### 📝 Code Example
```javascript
test('should measure search/filter operations', async ({ page }) => {
  const searchMetrics = await page.evaluate(() => {
    return new Promise(resolve => {
      // 🏁 Start measuring search
      performance.mark('search-operation-start');

      // ⏳ Simulate different phases
      setTimeout(() => performance.mark('user-input-complete'), 100);
      setTimeout(() => performance.mark('filter-complete'), 200);
      setTimeout(() => {
        performance.mark('results-displayed');
        performance.measure('search-interaction-time', 'search-operation-start', 'results-displayed');
      }, 300);

      // Wait and collect results
      setTimeout(() => {
        const measures = performance.getEntriesByName('search-interaction-time');
        const marks = performance.getEntriesByType('mark')
          .filter(m => m.name.includes('search') || m.name.includes('filter'));
        
        resolve({ totalTime: measures[0].duration, marks });
      }, 400);
    });
  });

  console.log(`Total search time: ${searchMetrics.totalTime.toFixed(2)}ms`);
});
```

### 📊 What You Get
```
Timeline:
0ms    100ms    200ms    300ms    400ms
|------|------|------|------|
search- user-  filter- results-
start   input  complete display
       complete

Measure = 300ms (from start to results display)
```

### ✅ Real-World Use Case
- Search result latency
- Filter performance
- "From typing to seeing results" time

---

## 5️⃣ Test Case 4: Data Fetching & Processing

### 📝 Code Example
```javascript
test('should measure data fetching and processing time', async ({ page }) => {
  const fetchMetrics = await page.evaluate(() => {
    return new Promise(resolve => {
      performance.mark('fetch-start');

      // Simulate API call (150ms)
      setTimeout(() => {
        performance.mark('fetch-complete');
        performance.mark('data-processing-start');

        // Simulate processing (heavy computation)
        let result = 0;
        for (let i = 0; i < 1000000; i++) {
          result += Math.sqrt(i);
        }

        performance.mark('data-processing-complete');

        // Measure each phase
        performance.measure('fetch-duration', 'fetch-start', 'fetch-complete');
        performance.measure('processing-duration', 'data-processing-start', 'data-processing-complete');
        performance.measure('total-duration', 'fetch-start', 'data-processing-complete');

        resolve({
          fetchTime: /* 150ms */,
          processingTime: /* variable */,
          totalTime: /* sum */,
        });
      }, 150);
    });
  });

  console.log(`Fetch: ${fetchMetrics.fetchTime}ms + Processing: ${fetchMetrics.processingTime}ms`);
});
```

### 📊 Breakdown
```
┌─── Fetch Phase (150ms) ────┬─── Processing Phase ────┐
fetch-start                fetch-end              proc-end
[Waiting for API]          [Computing results]
```

### ✅ Real-World Use Case
- Identify bottlenecks (is it network or CPU?)
- Optimize different phases separately
- "API takes 150ms, processing takes 50ms"

---

## 6️⃣ Test Case 5: Complete Workflow Timeline

### 📝 Code Example
```javascript
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

// Create mark for each event
workflow.forEach(event => {
  setTimeout(() => {
    performance.mark(event.name);
  }, event.delay);
});

// Create measures between key milestones
performance.measure('time-to-interactive', 'page-load-start', 'page-ready');
performance.measure('api-response-time', 'api-call-start', 'api-response');
performance.measure('total-workflow', 'page-load-start', 'viewport-settled');
```

### 📊 Visual Timeline
```
0ms      100ms      200ms      300ms      400ms      500ms      1000ms   1200ms
|---------|---------|---------|---------|---------|---------|---------|
start    ready   interact   api→     response  update             animate  settled
  |←────────────┘  time-to-interactive
            |←──────────────────────────┘ api-response-time
|←────────────────────────────────────────────────────────────────────┘
                      total-workflow = 1200ms
```

### ✅ Real-World Use Case
- Full page load waterfall
- Identify slow stages in complex workflows
- Performance budgeting across stages

---

## 7️⃣ Test Case 6: Memory Usage

### 📝 Code Example
```javascript
const memoryInfo = await page.evaluate(() => {
  const perf = performance.memory;  // Chrome only
  
  if (perf) {
    return {
      usedJSHeapSize: (perf.usedJSHeapSize / 1048576).toFixed(2),      // MB
      totalJSHeapSize: (perf.totalJSHeapSize / 1048576).toFixed(2),    // MB
      jsHeapSizeLimit: (perf.jsHeapSizeLimit / 1048576).toFixed(2),    // MB
      heapUtilization: ((perf.usedJSHeapSize / perf.jsHeapSizeLimit) * 100).toFixed(2), // %
    };
  }
});
```

### 📊 What Each Metric Means
| Metric | Meaning |
|--------|---------|
| `usedJSHeapSize` | Memory currently in use (includes garbage) |
| `totalJSHeapSize` | Total allocated heap (includes empty space) |
| `jsHeapSizeLimit` | Maximum heap available (device dependent) |
| `heapUtilization` | Percentage of max heap being used |

### 🚨 Example Output
```
Used Heap: 45.50 MB
Total Heap: 60.00 MB
Heap Limit: 2048.00 MB
Utilization: 2.22%
```

### ✅ Real-World Use Case
- Detect memory leaks (continuously growing)
- Monitor app memory footprint over time
- Alert when memory exceeds threshold

---

## 🎯 Key Learning Points

### When to Use Marks
✅ Measure **application-specific** events
- "User starts search" → "Results appear"
- "API call starts" → "Response received"
- "Animation begins" → "Animation ends"

### Pattern: Mark → Wait → Mark → Measure
```javascript
performance.mark('task-start');
// ... do something ...
performance.mark('task-end');
performance.measure('task-duration', 'task-start', 'task-end');
```

### Getting Data Back from Evaluate
```javascript
// Inside page.evaluate(), you have access to performance API
// to get measurement data that you return to test context

const data = await page.evaluate(() => {
  // This is inside the browser
  performance.mark('my-mark');
  
  // Get data and return it
  return performance.getEntriesByType('mark');
});

// Now 'data' is in test context, can use console.log, expect(), etc
console.log(data);
```

### Performance Budget
Set thresholds and enforce them:
```javascript
expect(navigationTime).toBeLessThan(1000);      // < 1 second
expect(searchTime).toBeLessThan(2000);          // < 2 seconds
expect(heapUtilization).toBeLessThan(90);       // < 90% memory
```

---

## 💡 Practical Example

### Before (No Custom Marks)
```javascript
test('search should work', async ({ page }) => {
  await page.fill('input', 'playwright');
  await page.click('button[type="submit"]');
  await expect(page.locator('results')).toBeVisible();
  // ❓ But how long did it actually take?
});
```

### After (With Custom Marks)
```javascript
test('search should be fast', async ({ page }) => {
  const searchTime = await page.evaluate(() => {
    performance.mark('search-start');
    
    // Return promise to wait for actual search
    return new Promise(resolve => {
      // Listen for results
      const observer = new MutationObserver(() => {
        performance.mark('search-end');
        performance.measure('search-speed', 'search-start', 'search-end');
        
        const measure = performance.getEntriesByName('search-speed')[0];
        resolve(measure.duration);
        observer.disconnect();
      });
      
      observer.observe(document.querySelector('results'), { childList: true });
    });
  });

  console.log(`Search completed in ${searchTime.toFixed(2)}ms`);
  expect(searchTime).toBeLessThan(2000);  // Performance budget
});
```

---

## 🔧 Running the Tests

```bash
# Run custom marks tests
npx playwright test 5-custom-performance-marks.spec.js

# Run with detailed output
npx playwright test 5-custom-performance-marks.spec.js -v

# Watch for changes
npx playwright test 5-custom-performance-marks.spec.js --watch
```

---

## 📚 Related Concepts

- **Performance Observers**: Listen for performance entries in real-time
- **Resource Timing**: Measure individual resource loads (CSS, JS, images)
- **Navigation Timing**: Browser's native page load metrics
- **User Timing**: Custom marks and measures (what we're using here!)

---

## ✨ Remember

Custom Performance Marks are about **INTENT**:
- They measure what **YOU** care about
- They're **application-specific**
- They integrate with your **testing assertions**
- They create a **performance budget** for your app

Not all metrics come from the browser — some are created by YOUR CODE! 📊
