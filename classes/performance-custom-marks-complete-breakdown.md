# 📖 Detailed Line-by-Line Breakdown: Custom Performance Marks

This file demonstrates how to **measure application-specific performance** using JavaScript's Performance API. Let me walk through every section!

---

## 📋 File Structure Overview

```
5-custom-performance-marks.spec.js
├── Line 1: Import statement
├── Line 3-4: Test suite begins
├── Line 5-50: Test 1 - Basic marks
├── Line 52-97: Test 2 - Click to display timing
├── Line 99-150: Test 3 - Search operations
├── Line 152-204: Test 4 - Fetch & processing
├── Line 206-265: Test 5 - Full workflow timeline
└── Line 267-306: Test 6 - Memory usage
```

---

# 🔴 **SECTION 1: IMPORTS & SETUP** (Lines 1-4)

## Line 1
```javascript
const { test, expect } = require('@playwright/test');
```

| Part | Explanation |
|------|-------------|
| `const` | Create a constant variable |
| `{ test, expect }` | Destructure two functions from Playwright |
| `require('@playwright/test')` | Load the Playwright testing library |

**What it does:**
- `test` = Function to define individual test cases
- `expect` = Function to assert/validate expectations

**Real-world analogy:**
```
Like importing a testing toolbox:
- test = the blueprint for creating tests
- expect = the measuring tape to verify results
```

---

## Lines 3-4
```javascript
test.describe('Exercise 5: Custom Performance Marks & Measurements', () => {
```

| Part | Explanation |
|------|-------------|
| `test.describe()` | Create a test suite (group related tests) |
| `'Exercise 5: ...'` | Suite name/description |
| `() => { }` | Function containing all tests in this suite |

**What it does:**
- Groups all 6 test cases together
- Makes output organized and readable
- Like a folder containing all related tests

**Output when run:**
```
Exercise 5: Custom Performance Marks & Measurements
  ✓ should create and measure custom performance marks
  ✓ should track button click to data display time
  ✓ should measure search/filter operations
  ... (more tests)
```

---

---

# 🟢 **TEST 1: Basic Custom Marks** (Lines 5-50)

## Lines 5-7: Test Definition & Navigation
```javascript
  test('should create and measure custom performance marks', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const measurements = await page.evaluate(() => {
```

| Line | Code | Explanation |
|-----|------|-------------|
| 5 | `test('should...')` | Define a test case with description |
| 5 | `async ({ page })` | Get the `page` object (Playwright fixture) |
| 6 | `await page.goto('http://localhost:3000');` | Navigate to website (wait for it to load) |
| 7 | `const measurements = await page.evaluate(() => {` | **START** running code INSIDE the browser |

### 🔑 Key Concept: `page.evaluate()`
```
Node.js (Test Context)          Browser (JavaScript Context)
==================              ============================
      |-----page.evaluate()----->|
      |       Send code          |
      |<----return results--------|
```

Everything between `() => {` and `}` on line 34 runs **INSIDE THE BROWSER**, with access to:
- ✅ DOM elements
- ✅ `window` object
- ✅ Performance API
- ❌ NOT test variables like `expect()`

---

## Lines 8-15: Creating Marks & Simulating Delay

```javascript
      // Create custom marks
      performance.mark('user-navigation-start');           // Line 9
      
      // Simulate navigation delay
      const start = Date.now();                            // Line 12
      while (Date.now() - start < 100) {}                 // Line 13
      
      performance.mark('user-navigation-end');            // Line 15
```

### Line 9: First Mark
```javascript
performance.mark('user-navigation-start');
```

| Part | Meaning |
|------|---------|
| `performance` | Browser's performance tracking object |
| `.mark()` | Create a named timestamp |
| `'user-navigation-start'` | Name of this mark (you choose the name) |

**What happens:**
- Browser records the current time with the name "user-navigation-start"
- Example: might be `0.00ms`

**Visual:**
```
Time:    0ms
Event:   🏁 Mark created: "user-navigation-start"
```

---

### Lines 12-13: Simulate Delay

```javascript
const start = Date.now();              // Get current time (e.g., 0ms)
while (Date.now() - start < 100) {}    // Busy loop until 100ms passes
```

| Line | What Happens |
|------|--------------|
| 12 | Record the current time in milliseconds |
| 13 | Keep looping while: `current_time - start_time < 100` |

**How the loop works:**
```
T=0ms:   start = 0
         Check: (0 - 0) < 100? YES → loop again

T=50ms:  Check: (50 - 0) < 100? YES → loop again

T=100ms: Check: (100 - 0) < 100? NO → exit loop ✓
```

**Purpose:**
- Simulates actual work happening (API call, processing, etc)
- Takes exactly 100ms

---

### Line 15: Second Mark

```javascript
performance.mark('user-navigation-end');
```

**What happens:**
- Browser records the current time with the name "user-navigation-end"
- Time is now approximately `~100ms`

**Visual Timeline So Far:**
```
T:       0ms                           100ms
Event:   🏁 start                      🏁 end
         |←───────── 100ms ────────→|
```

---

## Lines 17-22: Creating a Measure

```javascript
      // Create a measurement between marks
      performance.measure(                                 // Line 18
        'user-navigation-time',                           // Line 19 (measure name)
        'user-navigation-start',                          // Line 20 (from mark)
        'user-navigation-end'                             // Line 21 (to mark)
      );
```

### What `measure()` Does

```javascript
performance.measure(
  'name-of-measure',    // What you call this measurement
  'start-mark-name',    // Calculate FROM this mark
  'end-mark-name'       // Calculate TO this mark
);
```

**Calculation:**
```
duration = end_mark.time - start_mark.time
         = 100ms - 0ms
         = 100ms
```

### Result:
A new "measurement" is created:
- **Name:** `user-navigation-time`
- **Duration:** `100ms`

---

## Lines 24-35: Retrieve Data

```javascript
      // Get the measurement
      const measure = performance.getEntriesByName('user-navigation-time')[0];  // Line 24
      
      return {                                             // Line 26
        duration: measure.duration,                        // Line 27
        marks: performance.getEntriesByType('mark').map(m => ({    // Line 28
          name: m.name,                                   // Line 29
          time: m.startTime,                              // Line 30
        })),
        measurements: performance.getEntriesByType('measure').map(m => ({  // Line 32
          name: m.name,                                   // Line 33
          duration: m.duration,                           // Line 34
        })),
      };
```

### Line 24: Get Specific Measure
```javascript
performance.getEntriesByName('user-navigation-time')[0]
```

| Part | Explanation |
|------|-------------|
| `getEntriesByName('...')` | Get all measures with this name (returns array) |
| `[0]` | Get the first one (index 0) |
| Result: | Object with `.duration`, `.name`, `.startTime` |

**Example Result:**
```javascript
{
  name: 'user-navigation-time',
  duration: 100.45,      // milliseconds
  startTime: 0,
  entryType: 'measure'
}
```

---

### Lines 26-35: Build Return Object

```javascript
return {                                      // Return data to test context
  duration: measure.duration,                 // Extract just the duration (100.45)
  
  marks: performance.getEntriesByType('mark') // Get all marks
    .map(m => ({                              // Transform each mark to simple object
      name: m.name,
      time: m.startTime,
    })),
  
  measurements: performance.getEntriesByType('measure') // Get all measures
    .map(m => ({                              // Transform each measure
      name: m.name,
      duration: m.duration,
    })),
};
```

**What gets returned:**
```javascript
{
  duration: 100.45,
  marks: [
    { name: 'user-navigation-start', time: 0 },
    { name: 'user-navigation-end', time: 100.45 }
  ],
  measurements: [
    { name: 'user-navigation-time', duration: 100.45 }
  ]
}
```

---

## Lines 36-50: Display & Assert

```javascript
    });                                        // Line 36: End page.evaluate()

    console.log('⏱️  Custom Performance Marks:');           // Line 37
    console.log(`Navigation time: ${measurements.duration.toFixed(2)}ms`);  // Line 38
    
    measurements.marks.forEach(mark => {                   // Line 40
      console.log(`Mark: ${mark.name} @ ${mark.time.toFixed(2)}ms`);  // Line 41
    });

    measurements.measurements.forEach(measure => {         // Line 44
      console.log(`Measure: ${measure.name} = ${measure.duration.toFixed(2)}ms`);  // Line 45
    });

    expect(measurements.duration).toBeGreaterThan(100);     // Line 48
  });
```

### Line 37-38: Print Header & Duration
```javascript
console.log('⏱️  Custom Performance Marks:');
console.log(`Navigation time: ${measurements.duration.toFixed(2)}ms`);
```

**Output:**
```
⏱️  Custom Performance Marks:
Navigation time: 100.45ms
```

| Method | Explanation |
|--------|-------------|
| `.toFixed(2)` | Round to 2 decimal places |
| Template literal | `` `...${variable}...` `` allows inserting variables |

---

### Lines 40-41: Loop Through Marks
```javascript
measurements.marks.forEach(mark => {
  console.log(`Mark: ${mark.name} @ ${mark.time.toFixed(2)}ms`);
});
```

**Loop executes twice:**
1. First iteration: `mark = { name: 'user-navigation-start', time: 0 }`
   - Output: `Mark: user-navigation-start @ 0.00ms`

2. Second iteration: `mark = { name: 'user-navigation-end', time: 100.45 }`
   - Output: `Mark: user-navigation-end @ 100.45ms`

---

### Lines 44-45: Loop Through Measures
```javascript
measurements.measurements.forEach(measure => {
  console.log(`Measure: ${measure.name} = ${measure.duration.toFixed(2)}ms`);
});
```

**Output:**
```
Measure: user-navigation-time = 100.45ms
```

---

### Line 48: Assertion
```javascript
expect(measurements.duration).toBeGreaterThan(100);
```

| Part | Explanation |
|------|-------------|
| `expect()` | Start an assertion |
| `measurements.duration` | The value to test (100.45) |
| `.toBeGreaterThan(100)` | Must be more than 100 |

**Evaluation:**
- Is `100.45 > 100`? ✅ YES → Test passes!

---

---

# 🟡 **TEST 2: Click to Display Timing** (Lines 52-97)

## Lines 52-74: Set Up Event Listener

```javascript
  test('should track button click to data display time', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Inject code to track interaction timing
    await page.evaluate(() => {                            // Line 55
      window.performanceMarks = {};

      // Find a button and track its interaction
      const buttons = document.querySelectorAll('button');  // Line 59
      if (buttons.length > 0) {                            // Line 60
        const button = buttons[0];                         // Line 61
        button.addEventListener('click', () => {          // Line 62
```

### Lines 59-62: Find Button & Attach Listener

```javascript
const buttons = document.querySelectorAll('button');  // Find ALL buttons
if (buttons.length > 0) {                             // If any exist
  const button = buttons[0];                          // Get the first one
  button.addEventListener('click', () => {           // When clicked, run function
```

**What this does:**
- Queries the DOM for all `<button>` elements
- If at least one exists, selects the first button
- Attaches a click event listener (waits for click)

🔑 **Key Difference from Test 1:**
- Test 1: Measures synchronous code
- Test 2: Measures **async** code (waits for result to appear)

---

## Lines 63-70: Mark on Click

```javascript
          performance.mark('interaction-start', { detail: { button: button.textContent } });
          
          // Simulate async operation
          setTimeout(() => {
            performance.mark('interaction-end');
            performance.measure('interaction-time', 'interaction-start', 'interaction-end');
          }, 200);
```

### Line 63: Mark with Metadata
```javascript
performance.mark('interaction-start', { detail: { button: button.textContent } });
```

| Part | Explanation |
|------|-------------|
| First arg: `'interaction-start'` | Mark name |
| Second arg: `{ detail: {...} }` | Optional metadata about this mark |

**What's stored:**
```javascript
{
  name: 'interaction-start',
  startTime: 0,
  detail: {
    button: "Click me"  // The button's text content
  }
}
```

---

### Lines 65-70: Async Completion

```javascript
setTimeout(() => {
  performance.mark('interaction-end');
  performance.measure('interaction-time', 'interaction-start', 'interaction-end');
}, 200);
```

| Timeline | Event |
|----------|-------|
| T=0ms | User clicks button |
| T=0ms | `interaction-start` mark created |
| T=0-200ms | Simulated async work (API call, processing) |
| T=200ms | `interaction-end` mark created |
| T=200ms | Measure created (duration = 200ms) |

**Purpose:**
- Measures time from user action → visible result
- Real apps: API time + DOM rendering time

---

## Lines 72-90: Click & Retrieve

```javascript
    });                                                 // Line 72: End setup

    // Click the button
    await page.click('button');                         // Line 75
    
    // Wait for async operation
    await page.waitForTimeout(500);                     // Line 78

    // Get the measurement
    const measurement = await page.evaluate(() => {     // Line 81
      const measures = performance.getEntriesByName('interaction-time');  // Line 82
      if (measures.length > 0) {                        // Line 83
        return measures[0].duration;                    // Line 84
      }
      return null;                                      // Line 86
    });
```

### Line 75: Click Button
```javascript
await page.click('button');
```

- Tells Playwright to click the button
- This **triggers the event listener** we set up earlier
- ✅ `interaction-start` mark is created immediately

---

### Line 78: Wait for Completion
```javascript
await page.waitForTimeout(500);
```

**Why wait 500ms?**
- The `setTimeout(..., 200)` will fire at 200ms
- We wait 500ms to be safe (ensures mark is created)
- Like waiting for a delivery: set timer for longer than expected

---

### Lines 81-86: Retrieve Duration

```javascript
const measurement = await page.evaluate(() => {         // Run in browser
  const measures = performance.getEntriesByName('interaction-time');
  if (measures.length > 0) {
    return measures[0].duration;    // Example: 200.15
  }
  return null;                       // If no measure found
});
```

| Step | Result |
|------|--------|
| Get all measures named 'interaction-time' | Array with 1 item |
| Check if array has items | YES (length > 0) |
| Get first item's duration | 200.15 |
| Return to test | measurement = 200.15 |

---

## Lines 91-97: Display & Assert

```javascript
    if (measurement) {                                   // Line 91
      console.log(`⚡ Button click to data display: ${measurement.toFixed(2)}ms`);  // Line 92
      expect(measurement).toBeLessThan(1000);           // Line 93
    }
  });
```

### Line 91: Check if Measurement Exists
```javascript
if (measurement) {
```

- If `measurement` is not null/undefined
- Means the mark was successfully created
- Prevents errors if something went wrong

---

### Line 92: Print Result
```javascript
console.log(`⚡ Button click to data display: ${measurement.toFixed(2)}ms`);
```

**Output example:**
```
⚡ Button click to data display: 200.15ms
```

---

### Line 93: Performance Budget

```javascript
expect(measurement).toBeLessThan(1000);
```

**Assertion:**
- Duration must be less than 1000ms (1 second)
- User experience requirement: button should respond within 1 second
- If > 1000ms: Test fails ❌

**Real-world context:**
```
0-100ms:   User perceives as instant
100-200ms: Feels responsive
200-500ms: User notices lag
500-1000ms: User might think app is broken
1000ms+:   Clearly broken from user perspective
```

---

---

# 🟠 **TEST 3: Search/Filter Operations** (Lines 99-150)

## Lines 99-124: Set Up Multi-Phase Timing

```javascript
  test('should measure search/filter operations', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const searchMetrics = await page.evaluate(() => {     // Line 103
      const metrics = {                                    // Line 104
        searchStart: null,
        inputStart: null,
        filterStart: null,
        displayStart: null,
      };

      // Create marks for different phases
      performance.mark('search-operation-start');         // Line 111

      // Simulate user typing
      setTimeout(() => performance.mark('user-input-complete'), 100);    // Line 114

      // Simulate filtering
      setTimeout(() => performance.mark('filter-complete'), 200);        // Line 117

      // Simulate display of results
      setTimeout(() => {                                  // Line 120
        performance.mark('results-displayed');
        performance.measure(
          'search-interaction-time',
          'search-operation-start',
          'results-displayed'
        );
      }, 300);
```

### The Idea: Multi-Phase Timeline

Instead of just measuring start → end, this test measures **multiple phases**:

| Phase | Time | Mark Name | Event |
|-------|------|-----------|-------|
| 1 | 0ms | `search-operation-start` | User types in search box |
| 2 | 100ms | `user-input-complete` | API receives query |
| 3 | 200ms | `filter-complete` | Database filters results |
| 4 | 300ms | `results-displayed` | Results render on page |
| Final | 300ms | measure created | Total = 300ms |

```
0ms      100ms      200ms      300ms
|---------|---------|---------|
search   input     filter    results    
start    done      done      shown
|←─────────── 300ms ──────────→|
    search-interaction-time
```

---

### Lines 111-124: Create Marks

```javascript
performance.mark('search-operation-start');         // T=0ms

setTimeout(() => performance.mark('user-input-complete'), 100);    // T=100ms
setTimeout(() => performance.mark('filter-complete'), 200);        // T=200ms
setTimeout(() => {                                  // T=300ms
  performance.mark('results-displayed');
  performance.measure('search-interaction-time', 'search-operation-start', 'results-displayed');
}, 300);
```

**JavaScript executes these lines immediately**, but:
- First mark: created right now
- Other 3 marks + measure: scheduled for future (via `setTimeout`)

---

## Lines 125-141: Return Data via Promise

```javascript
      return new Promise(resolve => {                 // Line 125
        setTimeout(() => {                            // Line 126
          const measures = performance.getEntriesByName('search-interaction-time');  // Line 127
          resolve({                                   // Line 128
            totalTime: measures.length > 0 ? measures[0].duration : 0,  // Line 129
            marks: performance.getEntriesByType('mark')                 // Line 130
              .filter(m => m.name.includes('search') || m.name.includes('input') || m.name.includes('filter') || m.name.includes('result'))  // Line 131
              .map(m => ({ name: m.name, time: m.startTime })),// Line 132
          });
        }, 400);
      });
```

### Why Use `new Promise()`?

We can't immediately return data because the `setTimeout(..., 300)` hasn't fired yet!

```
Timeline:
T=0ms:   This function executes
T=0ms:   Creates first mark
T=0ms:   Schedules other marks for future
T=0ms:   We want to return data... but marks don't exist yet! ❌

Solution:
T=0ms:   Wrap return in Promise
T=0ms:   Schedule a check for T=400ms
...
T=400ms: All marks exist now ✓ Return data
```

---

### Lines 126-135: Wait & Collect

```javascript
setTimeout(() => {         // Wait 400ms (longer than 300ms)
  const measures = performance.getEntriesByName('search-interaction-time');
  resolve({
    totalTime: measures.length > 0 ? measures[0].duration : 0,
    marks: performance.getEntriesByType('mark')
      .filter(m => ...)    // Keep only search-related marks
      .map(m => ({ name: m.name, time: m.startTime })),
  });
}, 400);
```

| Part | Meaning |
|------|---------|
| `measures.length > 0` | If measurement exists |
| `? measures[0].duration` | Use its duration |
| `: 0` | Otherwise use 0 |
| `.filter(m => ...)` | Keep only marks with 'search', 'input', 'filter', or 'result' in name |
| `.map(...)` | Transform to simple objects |

---

## Lines 142-150: Display & Assert

```javascript
    });

    console.log('🔍 Search/Filter Operation Metrics:');     // Line 142
    console.log(`Total time: ${searchMetrics.totalTime.toFixed(2)}ms`);  // Line 143
    searchMetrics.marks.forEach(mark => {                   // Line 144
      console.log(`   ${mark.name} @ ${mark.time.toFixed(2)}ms`);  // Line 145
    });

    // Search should complete within 2 seconds
    expect(searchMetrics.totalTime).toBeLessThan(2000);     // Line 150
  });
```

**Output:**
```
🔍 Search/Filter Operation Metrics:
Total time: 300.45ms
   search-operation-start @ 0.00ms
   user-input-complete @ 100.10ms
   filter-complete @ 200.20ms
   results-displayed @ 300.45ms
```

**Assertion:**
```javascript
expect(searchMetrics.totalTime).toBeLessThan(2000);
```
- Total search time must be < 2 seconds
- Real benchmark: Google search is ~200-300ms

---

---

# 🔵 **TEST 4: Fetch & Processing** (Lines 152-204)

## Lines 152-194: Measure Two Phases

```javascript
  test('should measure data fetching and processing time', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const fetchMetrics = await page.evaluate(() => {      // Line 155
      return new Promise(resolve => {                      // Line 156
        performance.mark('fetch-start');                  // Line 157

        // Simulate API call
        const mockApiCall = new Promise(res => {          // Line 160
          setTimeout(() => {                              // Line 161
            performance.mark('fetch-complete');          // Line 162
            res({ data: [1, 2, 3] });                    // Line 163
          }, 150);
        });

        mockApiCall.then(data => {                         // Line 166
          performance.mark('data-processing-start');      // Line 167

          // Simulate data processing
          let result = 0;                                  // Line 170
          for (let i = 0; i < 1000000; i++) {              // Line 171
            result += Math.sqrt(i);                        // Line 172
          }

          performance.mark('data-processing-complete');    // Line 175
```

### The Idea: Break Down Operations

Often you want to know:
- ❓ How long did the **API call** take?
- ❓ How long did **data processing** take?
- ❓ What's the **total**?

This test measures all three!

**Three Measures:**
1. **fetch-duration** = line 162 - line 157 = 150ms
2. **processing-duration** = line 175 - line 167 = varies
3. **total-duration** = line 175 - line 157 = ~200ms

---

### Lines 157-164: Fetch Phase

```javascript
performance.mark('fetch-start');                  // 0ms: API starts

const mockApiCall = new Promise(res => {
  setTimeout(() => {
    performance.mark('fetch-complete');          // 150ms: API completes
    res({ data: [1, 2, 3] });                   // Return mock data
  }, 150);
});
```

**What happens:**
- Creates promise that resolves after 150ms
- When done, creates 'fetch-complete' mark
- Simulates a real API call

---

### Lines 166-175: Processing Phase

```javascript
mockApiCall.then(data => {                        // After API completes
  performance.mark('data-processing-start');      // Mark: start processing

  // Heavy computation
  let result = 0;
  for (let i = 0; i < 1000000; i++) {              // Loop 1 million times
    result += Math.sqrt(i);                        // Calculate square root
  }

  performance.mark('data-processing-complete');    // Mark: end processing
```

**Why the loop?**
- Simulates CPU-intensive work (real example: sorting, filtering, transforming data)
- Creates measurable processing time

---

## Lines 177-195: Create Measures

```javascript
          // Create measures for each phase
          performance.measure('fetch-duration', 'fetch-start', 'fetch-complete');         // Line 178
          performance.measure('processing-duration', 'data-processing-start', 'data-processing-complete');  // Line 179
          performance.measure('total-duration', 'fetch-start', 'data-processing-complete');  // Line 180

          const measures = {                                // Line 182
            fetch: performance.getEntriesByName('fetch-duration')[0],                     // Line 183
            processing: performance.getEntriesByName('processing-duration')[0],          // Line 184
            total: performance.getEntriesByName('total-duration')[0],                    // Line 185
          };

          resolve({                                         // Line 187
            fetchTime: measures.fetch.duration,             // Line 188
            processingTime: measures.processing.duration,   // Line 189
            totalTime: measures.total.duration,             // Line 190
          });
```

**What gets measured:**

| Measure | From | To | Duration Example |
|---------|------|-----|-----------------|
| fetch-duration | fetch-start | fetch-complete | 150ms |
| processing-duration | data-processing-start | data-processing-complete | 50ms |
| total-duration | fetch-start | data-processing-complete | 200ms |

---

## Lines 196-204: Display & Assert

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

**Output:**
```
📥 Data Fetch & Processing Metrics:
   Fetch time: 150.25ms
   Processing time: 47.30ms
   Total time: 197.55ms
```

**Assertion:**
```javascript
expect(fetchMetrics.totalTime).toBeLessThan(5000);
```
- Total operation must be < 5 seconds
- Breakdown shows where time is spent
- **Bottleneck analysis:** Is it API (150ms) or processing (47ms)?

---

---

# 🟣 **TEST 5: Complete Workflow** (Lines 206-265)

## Lines 206-220: Define Workflow Array

```javascript
  test('should create performance timeline for complex workflow', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const timeline = await page.evaluate(() => {          // Line 210
      // Record entire workflow with multiple marks
      const workflow = [                                   // Line 212
        { name: 'page-load-start', delay: 0 },           // Line 213
        { name: 'page-ready', delay: 100 },              // Line 214
        { name: 'interaction-start', delay: 200 },       // Line 215
        { name: 'api-call-start', delay: 250 },          // Line 216
        { name: 'api-response', delay: 400 },            // Line 217
        { name: 'dom-update', delay: 500 },              // Line 218
        { name: 'animation-complete', delay: 1000 },     // Line 219
        { name: 'viewport-settled', delay: 1200 },       // Line 220
      ];
```

**This represents a complete page lifecycle:**

| Delay | Event | What's Happening |
|-------|-------|------------------|
| 0ms | page-load-start | Browser starts loading |
| 100ms | page-ready | DOM fully parsed |
| 200ms | interaction-start | User can click buttons |
| 250ms | api-call-start | First API request sent |
| 400ms | api-response | API returns data |
| 500ms | dom-update | DOM updated with data |
| 1000ms | animation-complete | CSS animations finish |
| 1200ms | viewport-settled | Page is fully stable |

---

## Lines 223-227: Create Marks for All Events

```javascript
      // Create marks on a timeline
      workflow.forEach(event => {                          // Line 223
        setTimeout(() => {                                 // Line 224
          performance.mark(event.name);                   // Line 225
        }, event.delay);
      });
```

**Loop executes 8 times:**

```javascript
// Iteration 1:
setTimeout(() => performance.mark('page-load-start'), 0);

// Iteration 2:
setTimeout(() => performance.mark('page-ready'), 100);

// Iteration 3:
setTimeout(() => performance.mark('interaction-start'), 200);

// ... and so on
```

**Result:**
- 8 marks created at different times
- Creates a timeline of the entire workflow

---

## Lines 228-250: Wait & Measure

```javascript
      return new Promise(resolve => {                     // Line 228
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

### Key Measures Created:

| Measure | From | To | Means | Duration |
|---------|------|-----|-------|----------|
| time-to-interactive | page-load-start (0) | page-ready (100) | How fast is DOM ready? | 100ms |
| api-response-time | api-call-start (250) | api-response (400) | How fast is API? | 150ms |
| total-workflow | page-load-start (0) | viewport-settled (1200) | Complete workflow | 1200ms |

---

### Line 236-240: Try-Catch

```javascript
try {
  // Create measures (may fail if marks don't exist)
  performance.measure(...)
} catch (e) {
  // If marks aren't created, don't crash
}
```

**Why try-catch?**
- If the test runs too fast, marks might not exist yet
- `try` prevents the test from crashing
- Graceful degradation

---

## Lines 251-265: Display & Assert

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

**Output:**
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

# 🟡 **TEST 6: Memory Usage** (Lines 267-306)

## Lines 269-272: Setup

```javascript
  test('should measure memory usage with performance entries', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const memoryInfo = await page.evaluate(() => {        // Line 272
      const perf = performance.memory || performance.mozMemory || null;  // Line 273
```

### Line 273: Get Memory Object

```javascript
const perf = performance.memory || performance.mozMemory || null;
```

| Browser | API |
|---------|-----|
| Chrome | `performance.memory` |
| Firefox | `performance.mozMemory` |
| Safari | (not supported) |

This checks Chrome first, falls back to Firefox, otherwise `null`.

---

## Lines 274-283: Extract Memory Data

```javascript
      
      if (perf) {                                           // Line 274
        return {                                            // Line 275
          usedJSHeapSize: (perf.usedJSHeapSize / 1048576).toFixed(2),          // Line 276
          totalJSHeapSize: (perf.totalJSHeapSize / 1048576).toFixed(2),        // Line 277
          jsHeapSizeLimit: (perf.jsHeapSizeLimit / 1048576).toFixed(2),        // Line 278
          heapUtilization: ((perf.usedJSHeapSize / perf.jsHeapSizeLimit) * 100).toFixed(2),  // Line 279
        };
      }
      
      return null;                                          // Line 283
```

### Memory Metrics Explained

| Line | Metric | Formula | Meaning |
|------|--------|---------|---------|
| 276 | `usedJSHeapSize` | bytes / 1048576 | Current memory in use (MB) |
| 277 | `totalJSHeapSize` | bytes / 1048576 | Total allocated memory (MB) |
| 278 | `jsHeapSizeLimit` | bytes / 1048576 | Maximum possible memory (MB) |
| 279 | `heapUtilization` | (used / limit) × 100 | Percent of max being used |

**Why divide by 1,048,576?**
```
1,048,576 = 1024 × 1024
           = converts bytes to megabytes (MB)

Example:
52,428,800 bytes ÷ 1,048,576 = 50 MB
```

---

### Real-World Example

```
JavaScript heap:
┌─────────────────────────────────────┐  2048 MB (limit)
│                                     │
│  ┌─────────────────────────────┐    │  100 MB (allocated)
│  │ ███████░░░░░░░░░░░░░░░░░░░ │    │  50 MB (used)
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘

Utilization = (50 / 2048) × 100 = 2.44%
```

---

## Lines 289-306: Display & Assert

```javascript
    });

    if (memoryInfo) {                                       // Line 289
      console.log('\n💾 Memory Information:');              // Line 290
      console.log(`   Used Heap: ${memoryInfo.usedJSHeapSize}MB`);          // Line 291
      console.log(`   Total Heap: ${memoryInfo.totalJSHeapSize}MB`);        // Line 292
      console.log(`   Heap Limit: ${memoryInfo.jsHeapSizeLimit}MB`);        // Line 293
      console.log(`   Utilization: ${memoryInfo.heapUtilization}%`);        // Line 294

      // Page should not consume excessive memory
      expect(parseFloat(memoryInfo.heapUtilization)).toBeLessThan(90);      // Line 297
    } else {
      console.log('⚠️  Memory API not available in this browser');          // Line 299
    }
  });
});
```

### Lines 290-294: Display Memory Info

**Output:**
```
💾 Memory Information:
   Used Heap: 45.50MB
   Total Heap: 60.00MB
   Heap Limit: 2048.00MB
   Utilization: 2.22%
```

---

### Line 297: Memory Assertion

```javascript
expect(parseFloat(memoryInfo.heapUtilization)).toBeLessThan(90);
```

| Part | Explanation |
|------|-------------|
| `parseFloat()` | Convert string "2.22%" to number 2.22 |
| `.toBeLessThan(90)` | Must be < 90% |

**What this checks:**
- ✅ App doesn't use excessive memory
- ✅ No memory leaks during test
- ✅ Heap utilization < 90%

---

### Lines 298-299: Browser Compatibility

```javascript
} else {
  console.log('⚠️  Memory API not available in this browser');
}
```

- If `performance.memory` doesn't exist
- Print warning instead of failing
- Graceful degradation for unsupported browsers

---

## Line 306: End Test Suite

```javascript
});
```

Closes the entire test suite. All 6 tests are now complete!

---

---

# 📊 Complete Overview

## Pattern Used in ALL Tests

Every test follows this pattern:

```
1. Navigation
   └─ await page.goto('...')

2. Measure (in browser)
   └─ const data = await page.evaluate(() => {
        performance.mark('...')
        performance.measure('...')
        return data
      })

3. Display Results
   └─ console.log(...)

4. Assert
   └─ expect(...).toBe...()
```

---

## Key Performance Concepts

### 🏁 Marks
```javascript
performance.mark('event-name')
// Creates a timestamp
```

### ⏱️ Measures
```javascript
performance.measure('duration', 'start-mark', 'end-mark')
// Calculates: end_time - start_time
```

### 📊 Retrieval
```javascript
performance.getEntriesByType('mark')      // All marks
performance.getEntriesByType('measure')   // All measures
performance.getEntriesByName('name')      // Specific entries
```

---

## Performance Budgets in This File

| Test | Metric | Budget | Purpose |
|------|--------|--------|---------|
| 1 | Navigation duration | > 100ms | Ensure delay is measured |
| 2 | Click to display | < 1000ms | User responsiveness |
| 3 | Search completion | < 2000ms | Search speed |
| 4 | Data operations | < 5000ms | Overall speed |
| 5 | Workflow completion | < 5000ms | Page load speed |
| 6 | Memory utilization | < 90% | No leaks |

---

That's the complete breakdown! Every line explained! 🎯
