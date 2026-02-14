# 📖 Custom Performance Marks - Line by Line Explanation

## File Overview
This file contains **6 test cases** that demonstrate different ways to measure custom performance metrics in your app using the Performance API.

---

# 🧪 Test Case 1: Basic Custom Marks

## Lines 1-3: Setup
```javascript
const { test, expect } = require('@playwright/test');

test.describe('Exercise 5: Custom Performance Marks & Measurements', () => {
```

| Line | Code | Explanation |
|------|------|-------------|
| 1 | `const { test, expect } = require('@playwright/test');` | Import Playwright's testing framework |
| 3 | `test.describe('...')` | Create a test suite (group related tests together) |

---

## Lines 4-7: Test Start & Navigation
```javascript
  test('should create and measure custom performance marks', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const measurements = await page.evaluate(() => {
```

| Line | Code | Explanation |
|------|------|-------------|
| 4 | `test('should create...')` | Define individual test case |
| 4 | `async ({ page })` | Get page object from test context |
| 5 | `await page.goto('http://localhost:3000');` | Navigate to website before testing |
| 7 | `const measurements = await page.evaluate(() => {` | **START**: Run JavaScript code INSIDE the browser (not in Node.js) |

🔑 **Key Point**: Everything inside `page.evaluate()` runs IN THE BROWSER, not in your test file!

---

## Lines 8-24: Creating Marks & Measures

```javascript
      // Create custom marks
      performance.mark('user-navigation-start');           // Line 8
      
      // Simulate navigation delay
      const start = Date.now();                            // Line 11
      while (Date.now() - start < 100) {}                 // Line 12
      
      performance.mark('user-navigation-end');            // Line 15

      // Create a measurement between marks
      performance.measure(                                 // Line 18
        'user-navigation-time',                           // Line 19
        'user-navigation-start',                          // Line 20
        'user-navigation-end'                             // Line 21
      );

      // Get the measurement
      const measure = performance.getEntriesByName('user-navigation-time')[0];
```

#### 🏁 Marking Timeline

| Line | Code | What Happens | Timeline |
|------|------|------|----------|
| 8 | `performance.mark('user-navigation-start');` | 🏁 **Create START mark** | `0ms` |
| 11-12 | `const start = Date.now();` `while (Date.now() - start < 100) {}` | ⏳ **Busy loop** (simulates work) | `0ms → 100ms` |
| 15 | `performance.mark('user-navigation-end');` | 🏁 **Create END mark** | `100ms` |
| 18-21 | `performance.measure('user-navigation-time', 'start', 'end')` | ⏱️ **Calculate difference** | `100ms - 0ms = 100ms` |
| 24 | `performance.getEntriesByName(...)[0]` | 📊 **Get the measurement** | Get the duration |

#### 🔍 Visual Timeline
```
TIME:        0ms                              100ms
             |                                |
ACTION:      ⏁ Create start mark            ⏁ Create end mark
             
MEASURE:     |←─────── 100ms ─────→|
             user-navigation-time = 100ms
```

---

## Lines 25-37: Return Data from Browser

```javascript
      return {                                              // Line 25
        duration: measure.duration,                        // Line 26
        marks: performance.getEntriesByType('mark').map(m => ({  // Line 27
          name: m.name,                                   // Line 28
          time: m.startTime,                              // Line 29
        })),
        measurements: performance.getEntriesByType('measure').map(m => ({  // Line 31
          name: m.name,                                   // Line 32
          duration: m.duration,                           // Line 33
        })),
      };
```

| Line | Code | Explanation |
|------|------|-------------|
| 25 | `return {` | Return an object with data FROM BROWSER TO TEST |
| 26 | `duration: measure.duration` | Extract the duration (100ms) |
| 27-30 | `marks: performance.getEntriesByType('mark').map(...)` | Get ALL marks created, transform to simple objects |
| 31-34 | `measurements: performance.getEntriesByType('measure').map(...)` | Get ALL measures created, transform to simple objects |

🔑 **Key Point**: `page.evaluate()` runs IN BROWSER, but `return` sends data back to TEST CONTEXT

---

## Lines 38-50: Display & Assert Results

```javascript
    });                                                     // Line 38: End page.evaluate()

    console.log('⏱️  Custom Performance Marks:');           // Line 39
    console.log(`Navigation time: ${measurements.duration.toFixed(2)}ms`);  // Line 40
    
    measurements.marks.forEach(mark => {                   // Line 42
      console.log(`Mark: ${mark.name} @ ${mark.time.toFixed(2)}ms`);  // Line 43
    });

    measurements.measurements.forEach(measure => {         // Line 46
      console.log(`Measure: ${measure.name} = ${measure.duration.toFixed(2)}ms`);  // Line 47
    });

    expect(measurements.duration).toBeGreaterThan(100);     // Line 50
  });
```

| Line | Code | Explanation |
|------|------|-------------|
| 38 | `});` | **END** of `page.evaluate()` - now in test context |
| 39-40 | `console.log(...)` | Print results to terminal |
| 42-43 | `forEach` loop | Loop through all marks and print each one |
| 46-47 | `forEach` loop | Loop through all measures and print each one |
| 50 | `expect(measurements.duration).toBeGreaterThan(100);` | **ASSERTION**: Duration must be > 100ms |

#### 🖨️ Example Output
```
⏱️  Custom Performance Marks:
Navigation time: 100.45ms
Mark: user-navigation-start @ 0.00ms
Mark: user-navigation-end @ 100.45ms
Measure: user-navigation-time = 100.45ms
```

---

---

# 🧪 Test Case 2: Interaction Timing

## Lines 52-54: Setup & Navigation
```javascript
  test('should track button click to data display time', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Inject code to track interaction timing
```

Same as before — navigate to website.

---

## Lines 55-74: Inject Event Listener

```javascript
    await page.evaluate(() => {                            // Line 55
      window.performanceMarks = {};

      // Find a button and track its interaction
      const buttons = document.querySelectorAll('button');  // Line 59
      if (buttons.length > 0) {                            // Line 60
        const button = buttons[0];                         // Line 61
        button.addEventListener('click', () => {          // Line 62
          performance.mark('interaction-start', { detail: { button: button.textContent } });  // Line 63
```

| Line | Code | Explanation |
|------|------|-------------|
| 55 | `await page.evaluate(() => {` | Run code IN BROWSER to set up listener |
| 59 | `const buttons = document.querySelectorAll('button');` | Find ALL buttons on page |
| 60 | `if (buttons.length > 0) {` | Check if there's at least 1 button |
| 61 | `const button = buttons[0];` | Get the FIRST button |
| 62 | `button.addEventListener('click', () => {` | When user clicks, run this function |
| 63 | `performance.mark('interaction-start', ...)` | 🏁 Mark when clicked (add metadata about button) |

#### 🔑 Key: `addEventListener()`
This sets up a **listener that stays active** in the browser until the test ends. When the button is clicked, it automatically records marks!

---

## Lines 64-68: Async Operation

```javascript
          // Simulate async operation
          setTimeout(() => {                               // Line 65
            performance.mark('interaction-end');          // Line 66
            performance.measure('interaction-time', 'interaction-start', 'interaction-end');  // Line 67
          }, 200);
```

| Line | Code | Explanation |
|------|------|-------------|
| 65 | `setTimeout(() => {` | Wait 200ms (simulates API call or processing) |
| 66 | `performance.mark('interaction-end');` | 🏁 Mark when result appears |
| 67 | `performance.measure(...)` | ⏱️ Calculate time from click to result (200ms) |

#### 📺 What's Happening
```
User clicks button
    ↓
[interaction-start mark created]
    ↓
⏳ Wait 200ms (simulating API call)
    ↓
[interaction-end mark created]
    ↓
⏱️ Measure = 200ms
```

---

## Lines 75-90: Click Button & Get Measurement

```javascript
    });                                                     // Line 75: End setup

    // Click the button
    await page.click('button');                            // Line 78

    // Wait for async operation
    await page.waitForTimeout(500);                        // Line 81

    // Get the measurement
    const measurement = await page.evaluate(() => {        // Line 84
      const measures = performance.getEntriesByName('interaction-time');  // Line 85
      if (measures.length > 0) {                           // Line 86
        return measures[0].duration;                       // Line 87
      }
      return null;                                         // Line 89
    });
```

| Line | Code | Explanation |
|------|------|-------------|
| 78 | `await page.click('button');` | 👆 Trigger the click event |
| 81 | `await page.waitForTimeout(500);` | ⏳ Wait 500ms for async operation to complete |
| 84 | `const measurement = await page.evaluate(() => {` | Get measurement data from browser |
| 85 | `performance.getEntriesByName('interaction-time')` | Find all measures named 'interaction-time' |
| 86-87 | `if (measures.length > 0) { return measures[0].duration; }` | If found, return the duration |
| 89 | `return null;` | If not found, return null (no measurement) |

#### ⏱️ Timeline of Events
```
T=0ms:    [Test clicks button]
T=0ms:    [interaction-start mark created]
T=200ms:  [interaction-end mark created]
T=200ms:  [Measure created = 200ms]
T=500ms:  [Test retrieves measurement = 200ms]
T=500ms:  [Test ends]
```

---

## Lines 91-96: Assert Results

```javascript
    if (measurement) {                                      // Line 91
      console.log(`⚡ Button click to data display: ${measurement.toFixed(2)}ms`);  // Line 92
      expect(measurement).toBeLessThan(1000);              // Line 93
    }
  });
```

| Line | Code | Explanation |
|------|------|-------------|
| 91 | `if (measurement)` | Only assert if measurement exists |
| 92 | `console.log(...)` | Print the time taken |
| 93 | `expect(measurement).toBeLessThan(1000);` | Assert: User interaction completed within 1 second |

---

---

# 🧪 Test Case 3: Search/Filter Operations

## Lines 95-99: Setup

```javascript
  test('should measure search/filter operations', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const searchMetrics = await page.evaluate(() => {
      const metrics = {
```

Standard setup — navigate to page and start evaluation.

---

## Lines 103-124: Create Marks for Each Phase

```javascript
      // Create marks for different phases
      performance.mark('search-operation-start');         // Line 105

      // Simulate user typing
      setTimeout(() => performance.mark('user-input-complete'), 100);  // Line 108

      // Simulate filtering
      setTimeout(() => performance.mark('filter-complete'), 200);     // Line 111

      // Simulate display of results
      setTimeout(() => {                                   // Line 114
        performance.mark('results-displayed');            // Line 115
        performance.measure(                              // Line 116
          'search-interaction-time',
          'search-operation-start',
          'results-displayed'
        );
      }, 300);
```

#### 📊 Timeline of Marks

| Line | Time | Mark Name | Event |
|------|------|-----------|-------|
| 105 | 0ms | `search-operation-start` | User starts searching |
| 108 | 100ms | `user-input-complete` | Typing finished |
| 111 | 200ms | `filter-complete` | Filtering done |
| 115 | 300ms | `results-displayed` | Results visible |
| 116-119 | 300ms | **MEASURE** | Total time = 300ms |

#### 📈 Visual Timeline
```
0ms      100ms      200ms      300ms
|---------|---------|---------|
search    input     filter    results
start     complete  complete  displayed
|←──────────────── 300ms ─────────→|
     search-interaction-time
```

---

## Lines 125-142: Return & Collect Data

```javascript
      return new Promise(resolve => {                      // Line 125
        setTimeout(() => {                                 // Line 126
          const measures = performance.getEntriesByName('search-interaction-time');  // Line 127
          resolve({                                        // Line 128
            totalTime: measures.length > 0 ? measures[0].duration : 0,  // Line 129
            marks: performance.getEntriesByType('mark')    // Line 130
              .filter(m => m.name.includes('search') || m.name.includes('input') || m.name.includes('filter') || m.name.includes('result'))  // Line 131
              .map(m => ({ name: m.name, time: m.startTime })),  // Line 132
          });
        }, 400);
      });
```

| Line | Code | Explanation |
|------|------|-------------|
| 125 | `return new Promise(resolve => {` | Wrap in Promise (need to wait for all marks) |
| 126 | `setTimeout(() => {` | Wait 400ms to ensure all marks are created |
| 127 | `performance.getEntriesByName('search-interaction-time')` | Get the main measure |
| 129 | `totalTime: measures[0].duration` | Extract duration, or 0 if not found |
| 130-132 | `.filter(...).map(...)` | Get search-related marks and transform them |

🔑 **Why `new Promise()`?** Because we need to wait for the `setTimeout(..., 300)` to finish before retrieving data!

---

## Lines 143-150: Display & Assert

```javascript
    console.log('🔍 Search/Filter Operation Metrics:');     // Line 143
    console.log(`Total time: ${searchMetrics.totalTime.toFixed(2)}ms`);  // Line 144
    searchMetrics.marks.forEach(mark => {                   // Line 145
      console.log(`   ${mark.name} @ ${mark.time.toFixed(2)}ms`);  // Line 146
    });

    // Search should complete within 2 seconds
    expect(searchMetrics.totalTime).toBeLessThan(2000);     // Line 150
  });
```

| Line | Code | Explanation |
|------|------|-------------|
| 143-144 | `console.log(...)` | Print total time |
| 145-146 | `forEach` loop | Print each mark with timestamp |
| 150 | `expect(...).toBeLessThan(2000)` | Assert: Search must complete within 2 seconds |

---

---

# 🧪 Test Case 4: Data Fetching & Processing

## Lines 152-156: Setup

```javascript
  test('should measure data fetching and processing time', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const fetchMetrics = await page.evaluate(() => {
      return new Promise(resolve => {
```

Same setup. Note: Uses `new Promise()` because we need to wait for async operations.

---

## Lines 157-179: Fetch Phase

```javascript
        performance.mark('fetch-start');                   // Line 157

        // Simulate API call
        const mockApiCall = new Promise(res => {           // Line 160
          setTimeout(() => {                               // Line 161
            performance.mark('fetch-complete');           // Line 162
            res({ data: [1, 2, 3] });                      // Line 163
          }, 150);
        });

        mockApiCall.then(data => {                         // Line 166
          performance.mark('data-processing-start');      // Line 167

          // Simulate data processing
          let result = 0;                                   // Line 170
          for (let i = 0; i < 1000000; i++) {              // Line 171
            result += Math.sqrt(i);                        // Line 172
          }

          performance.mark('data-processing-complete');    // Line 175
```

#### 📊 Two-Phase Timeline

| Line | Event | Time | Mark |
|------|-------|------|------|
| 157 | API request starts | 0ms | `fetch-start` |
| 161-163 | API responds | 150ms | `fetch-complete` |
| 167 | Data processing starts | 150ms | `data-processing-start` |
| 170-172 | Heavy computation (1M iterations) | 150-200ms | (processing) |
| 175 | Processing ends | ~200ms | `data-processing-complete` |

#### 🔍 Visual
```
0ms          150ms         200ms
|-------------|-------------|
fetch         processing
API call      Done
|←──150ms───→|←────50ms────→|
```

---

## Lines 177-194: Create Measures & Return

```javascript
          // Create measures for each phase
          performance.measure('fetch-duration', 'fetch-start', 'fetch-complete');  // Line 178
          performance.measure('processing-duration', 'data-processing-start', 'data-processing-complete');  // Line 179
          performance.measure('total-duration', 'fetch-start', 'data-processing-complete');  // Line 180

          const measures = {                                // Line 182
            fetch: performance.getEntriesByName('fetch-duration')[0],  // Line 183
            processing: performance.getEntriesByName('processing-duration')[0],  // Line 184
            total: performance.getEntriesByName('total-duration')[0],  // Line 185
          };

          resolve({                                         // Line 187
            fetchTime: measures.fetch.duration,            // Line 188
            processingTime: measures.processing.duration,  // Line 189
            totalTime: measures.total.duration,            // Line 190
          });
        });
```

| Line | Code | Explanation |
|------|------|-------------|
| 178 | `performance.measure('fetch-duration', ...)` | Measure: fetch-start to fetch-complete = 150ms |
| 179 | `performance.measure('processing-duration', ...)` | Measure: processing-start to processing-complete = ~50ms |
| 180 | `performance.measure('total-duration', ...)` | Measure: total from start to finish = 200ms |
| 182-185 | `const measures = { fetch: ..., processing: ..., total: ... }` | Store all measures in object |
| 187-190 | `resolve({ fetchTime: ..., processingTime: ..., totalTime: ... })` | Return extracted durations |

---

## Lines 195-202: Display & Assert

```javascript
    });

    console.log('📥 Data Fetch & Processing Metrics:');     // Line 198
    console.log(`   Fetch time: ${fetchMetrics.fetchTime.toFixed(2)}ms`);  // Line 199
    console.log(`   Processing time: ${fetchMetrics.processingTime.toFixed(2)}ms`);  // Line 200
    console.log(`   Total time: ${fetchMetrics.totalTime.toFixed(2)}ms`);  // Line 201

    // Total operation should be quick
    expect(fetchMetrics.totalTime).toBeLessThan(5000);     // Line 204
  });
```

| Line | Code | Explanation |
|------|------|-------------|
| 198 | `console.log('...')` | Print header |
| 199-201 | `console.log(...)` | Print each phase's duration |
| 204 | `expect(...).toBeLessThan(5000)` | Assert: Total operation < 5 seconds |

---

---

# 🧪 Test Case 5: Complete Workflow Timeline

## Lines 206-245: Build Full Workflow

```javascript
  test('should create performance timeline for complex workflow', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const timeline = await page.evaluate(() => {
      // Record entire workflow with multiple marks
      const workflow = [                                    // Line 212
        { name: 'page-load-start', delay: 0 },            // Line 213
        { name: 'page-ready', delay: 100 },               // Line 214
        { name: 'interaction-start', delay: 200 },        // Line 215
        { name: 'api-call-start', delay: 250 },           // Line 216
        { name: 'api-response', delay: 400 },             // Line 217
        { name: 'dom-update', delay: 500 },               // Line 218
        { name: 'animation-complete', delay: 1000 },      // Line 219
        { name: 'viewport-settled', delay: 1200 },        // Line 220
      ];

      // Create marks on a timeline
      workflow.forEach(event => {                          // Line 223
        setTimeout(() => {                                 // Line 224
          performance.mark(event.name);                   // Line 225
        }, event.delay);
      });
```

#### 📊 Workflow Array Explanation

| Element | Name | Delay | Purpose |
|---------|------|-------|---------|
| 0 | `page-load-start` | 0ms | Browser starts loading |
| 1 | `page-ready` | 100ms | DOM is ready |
| 2 | `interaction-start` | 200ms | User starts interacting |
| 3 | `api-call-start` | 250ms | API request sent |
| 4 | `api-response` | 400ms | API response received |
| 5 | `dom-update` | 500ms | DOM updated with data |
| 6 | `animation-complete` | 1000ms | Animations finished |
| 7 | `viewport-settled` | 1200ms | Everything stable |

| Line | Code | Explanation |
|------|------|-------------|
| 223-226 | `workflow.forEach(event => { setTimeout(..., event.delay) { performance.mark(...) } })` | For each event in workflow, create mark after its delay |

#### 📈 Timeline Visualization
```
0ms      100ms    200ms    250ms    400ms    500ms    1000ms   1200ms
|---------|---------|---------|---------|---------|---------|---------|
load-start ready   interact  api-call  response  update        animate  settled
```

---

## Lines 228-250: Retrieve & Measure

```javascript
      return new Promise(resolve => {                      // Line 228
        setTimeout(() => {                                 // Line 229
          const marks = performance.getEntriesByType('mark').map(m => ({  // Line 230
            name: m.name,                                  // Line 231
            time: m.startTime,                             // Line 232
          }));

          // Create measures between key milestones
          try {                                             // Line 236
            performance.measure('time-to-interactive', 'page-load-start', 'page-ready');  // Line 237
            performance.measure('api-response-time', 'api-call-start', 'api-response');    // Line 238
            performance.measure('total-workflow', 'page-load-start', 'viewport-settled');  // Line 239
          } catch (e) {                                     // Line 240
            // Measures might not exist yet
          }

          const measures = performance.getEntriesByType('measure')  // Line 244
            .filter(m => m.name.includes('time'))          // Line 245
            .map(m => ({                                    // Line 246
              name: m.name,
              duration: m.duration,
            }));

          resolve({ marks, measures });                    // Line 250
        }, 1300);
      });
```

| Line | Code | Explanation |
|------|------|-------------|
| 229 | `setTimeout(() => {`, 1300ms | Wait 1.3 seconds for all marks to be created |
| 230-232 | `performance.getEntriesByType('mark').map(...)` | Get all marks and extract name + time |
| 236-240 | `try { ... } catch (e) { ... }` | Try to create measures (may fail if marks not ready) |
| 237 | `'time-to-interactive'` = load-start to page-ready | Measure: 100ms - 0ms = 100ms |
| 238 | `'api-response-time'` = api-call-start to api-response | Measure: 400ms - 250ms = 150ms |
| 239 | `'total-workflow'` = load-start to viewport-settled | Measure: 1200ms - 0ms = 1200ms |
| 244-248 | Filter for measures with 'time' in name, extract data | Get only the workflow measures |
| 250 | `resolve({ marks, measures })` | Return all data |

---

## Lines 251-265: Display Results

```javascript
    });

    console.log('\n📈 Complete Workflow Timeline:');        // Line 254
    timeline.marks.forEach(mark => {                       // Line 255
      console.log(`   ${mark.name.padEnd(25)} @ ${mark.time.toFixed(2)}ms`);  // Line 256
    });

    console.log('\n⏱️  Key Milestones:');                   // Line 259
    timeline.measures.forEach(measure => {                 // Line 260
      console.log(`   ${measure.name.padEnd(25)}: ${measure.duration.toFixed(2)}ms`);  // Line 261
    });

    // Validate key milestones
    const totalWorkflow = timeline.measures.find(m => m.name === 'total-workflow');  // Line 265
    if (totalWorkflow) {
      expect(totalWorkflow.duration).toBeLessThan(5000);
    }
```

| Line | Code | Explanation |
|------|------|-------------|
| 255-256 | `timeline.marks.forEach(...)` | Print all marks with time |
| 260-261 | `timeline.measures.forEach(...)` | Print all measures with duration |
| 265 | `find(m => m.name === 'total-workflow')` | Find the total-workflow measure |
| 266-268 | `if (totalWorkflow) { expect(...).toBeLessThan(5000) }` | Assert: Complete workflow < 5 seconds |

#### 🖨️ Example Output
```
📈 Complete Workflow Timeline:
   page-load-start          @ 0.00ms
   page-ready               @ 100.00ms
   interaction-start        @ 200.00ms
   api-call-start           @ 250.00ms
   api-response             @ 400.00ms
   dom-update               @ 500.00ms
   animation-complete       @ 1000.00ms
   viewport-settled         @ 1200.00ms

⏱️  Key Milestones:
   time-to-interactive      : 100.00ms
   api-response-time        : 150.00ms
   total-workflow           : 1200.00ms
```

---

---

# 🧪 Test Case 6: Memory Usage

## Lines 269-273: Setup

```javascript
  test('should measure memory usage with performance entries', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const memoryInfo = await page.evaluate(() => {
      const perf = performance.memory || performance.mozMemory || null;
```

| Line | Code | Explanation |
|------|------|-------------|
| 272 | `const perf = performance.memory || performance.mozMemory || null;` | Get memory object (Chrome or Firefox) |

🔑 **Note**: `performance.memory` is Chrome-specific. Firefox uses `performance.mozMemory`.

---

## Lines 274-288: Extract Memory Data

```javascript
      
      if (perf) {                                           // Line 274
        return {                                            // Line 275
          usedJSHeapSize: (perf.usedJSHeapSize / 1048576).toFixed(2),    // Line 276
          totalJSHeapSize: (perf.totalJSHeapSize / 1048576).toFixed(2),  // Line 277
          jsHeapSizeLimit: (perf.jsHeapSizeLimit / 1048576).toFixed(2),  // Line 278
          heapUtilization: ((perf.usedJSHeapSize / perf.jsHeapSizeLimit) * 100).toFixed(2),  // Line 279
        };
      }
      
      return null;                                          // Line 283
```

#### 📊 Memory Metrics Explained

| Line | Metric | Calculation | Meaning |
|------|--------|-------------|---------|
| 276 | `usedJSHeapSize` | bytes / 1048576 | Memory currently in use (MB) |
| 277 | `totalJSHeapSize` | bytes / 1048576 | Total allocated heap (MB) |
| 278 | `jsHeapSizeLimit` | bytes / 1048576 | Maximum possible heap (MB) |
| 279 | `heapUtilization` | (used / limit) * 100 | Percentage of max being used |

🔑 **Why divide by 1048576?** 
- 1,048,576 = 1024 × 1024 (converts bytes to MB)

#### 🔍 Example
```
Used: 52,428,800 bytes ÷ 1,048,576 = 50 MB
Total: 104,857,600 bytes ÷ 1,048,576 = 100 MB
Limit: 2,147,483,648 bytes ÷ 1,048,576 = 2048 MB
Utilization: (50 / 2048) × 100 = 2.44%
```

---

## Lines 289-304: Display & Assert

```javascript
    });

    if (memoryInfo) {                                       // Line 289
      console.log('\n💾 Memory Information:');              // Line 290
      console.log(`   Used Heap: ${memoryInfo.usedJSHeapSize}MB`);  // Line 291
      console.log(`   Total Heap: ${memoryInfo.totalJSHeapSize}MB`);  // Line 292
      console.log(`   Heap Limit: ${memoryInfo.jsHeapSizeLimit}MB`);  // Line 293
      console.log(`   Utilization: ${memoryInfo.heapUtilization}%`);  // Line 294

      // Page should not consume excessive memory
      expect(parseFloat(memoryInfo.heapUtilization)).toBeLessThan(90);  // Line 297
    } else {
      console.log('⚠️  Memory API not available in this browser');  // Line 299
    }
  });
});
```

| Line | Code | Explanation |
|------|------|-------------|
| 289 | `if (memoryInfo)` | Check if memory API is available |
| 290-294 | `console.log(...)` | Print each memory metric |
| 297 | `expect(...).toBeLessThan(90)` | Assert: Heap usage < 90% (not too bloated) |
| 299 | `console.log('⚠️  Memory API...')` | If not available, show warning |

#### 🖨️ Example Output
```
💾 Memory Information:
   Used Heap: 45.50MB
   Total Heap: 60.00MB
   Heap Limit: 2048.00MB
   Utilization: 2.22%
```

---

---

# 📊 Summary of All 6 Tests

| Test # | Purpose | Marks | Measures | Key Assertion |
|--------|---------|-------|----------|---------------|
| 1 | Basic marks | start, end | duration | duration > 100ms |
| 2 | Click → Display | interaction-start, interaction-end | interaction-time | < 1000ms |
| 3 | Search/Filter | search-start, input-done, filter-done, results-done | search-time | < 2000ms |
| 4 | Fetch + Process | fetch-start, fetch-done, processing-start, processing-done | fetch, processing, total | total < 5000ms |
| 5 | Full Workflow | 8 marks across page lifecycle | time-to-interactive, api-response-time, total-workflow | total < 5000ms |
| 6 | Memory | N/A | N/A | heap utilization < 90% |

---

# 🎯 Key Concepts Throughout

### `page.evaluate()`
```javascript
const result = await page.evaluate(() => {
  // 👆 This code runs INSIDE the browser
  // You have access to DOM, performance API, etc.
  // But NOT to test variables
  
  return someData;  // Data comes back to test context
});
// 👆 Now result is available in test context
```

### `performance.mark()`
```javascript
performance.mark('event-name');  // Create a snapshot in time
```

### `performance.measure()`
```javascript
performance.measure('duration-name', 'mark-start', 'mark-end');
// Calculates: mark-end.time - mark-start.time
```

### `performance.getEntriesByType()`
```javascript
performance.getEntriesByType('mark');      // Get all marks
performance.getEntriesByType('measure');   // Get all measures
```

### Returning Data from Browser
```javascript
const data = await page.evaluate(() => {
  performance.mark('test');
  const measure = performance.getEntriesByName('test')[0];
  
  return {
    name: measure.name,
    duration: measure.duration  // Return from browser
  };
  // 👇 Now data is in test context
});
console.log(data.duration);  // Works!
```

---

That's the complete line-by-line breakdown! 🎉 Each test builds on the same principles: **Mark → Wait → Measure → Assert** ✅
