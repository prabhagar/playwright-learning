# 🎭 Playwright Learning Lab

A comprehensive, hands-on learning platform for mastering Playwright automation testing, from beginner to advanced level.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Day 1: Fundamentals](#day-1-fundamentals)
- [Running Tests](#running-tests)
- [Learning Path](#learning-path)
- [YouTube Tutorial Content](#youtube-tutorial-content)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the local server:**
   ```bash
   npm run serve
   ```

   The website will be available at `http://localhost:3000`

3. **In another terminal, run tests:**
   ```bash
   npm test
   ```

## 📁 Project Structure

```
playwright-learning/
├── website/                          # Sample website for testing
│   └── index.html                   # Feature-rich demo application
├── tests/
│   ├── day-1-basics/               # Day 1: Fundamentals
│   │   ├── 1-basic-navigation.spec.js
│   │   ├── 2-form-interactions.spec.js
│   │   ├── 3-table-interactions.spec.js
│   │   └── 4-modal-interactions.spec.js
│   └── fixtures/                    # Playwright fixtures and helpers
├── helpers/                          # Reusable test utilities
├── server.js                        # Express.js server
├── playwright.config.js             # Playwright configuration
├── package.json                     # Project dependencies
└── README.md                        # This file
```

## 📚 Day 1: Fundamentals

Day 1 covers the absolute basics of Playwright automation testing.

### Concepts Covered

✅ **Basic Navigation** (`1-basic-navigation.spec.js`)
- Page navigation and loading
- Element location and identification
- Basic assertions and expectations
- Text extraction
- Performance measurement

Tests:
- Page title verification
- Header content validation
- Section navigation
- Multi-section navigation
- Card counting and verification
- Button visibility checks
- Text extraction
- Footer verification
- Page load performance
- URL verification

✅ **Form Interactions** (`2-form-interactions.spec.js`)
- Filling text inputs
- Submitting forms
- Form validation
- Dropdown selection
- Radio buttons
- Checkboxes
- Textarea handling
- Form reset/clear

Tests:
- Form submission with valid data
- Form field verification
- Empty field validation
- Email format validation
- Password validation
- Checkbox interactions
- Radio button selection
- Dropdown handling
- Textarea filling
- Form reset
- Complete submission flow
- Input value extraction

✅ **Table & Data Interactions** (`3-table-interactions.spec.js`)
- Loading table data
- Data extraction from tables
- Row counting
- Filtering data
- Dynamic content handling
- Table navigation

Tests:
- Table data loading
- Table structure verification
- Row counting
- Data extraction from rows
- Complete table data extraction
- Premium plan filtering
- Free plan filtering
- Show all filter
- Edit button interaction
- User search in table
- Data type validation
- Hover effects
- Expected data verification
- Filter and count combination

✅ **Modal & Dialog Interactions** (`4-modal-interactions.spec.js`)
- Opening modals
- Closing modals
- Modal form filling
- Modal button interactions
- Multiple modal scenarios
- Modal content verification

Tests:
- Success modal opening
- Modal closing
- Error modal handling
- Danger button closing
- Input modal form submission
- Modal cancellation
- Confirmation modal cancel
- Confirmation modal confirm
- Sequential modal interactions
- Modal content verification
- Overlay click handling
- Button type verification
- Form submission in modals
- Multiple modal scenarios

## 🧪 Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Headed Mode (See Browser)
```bash
npm run test:headed
```

### Run Tests with UI (Interactive)
```bash
npm run test:ui
```

### Run Tests in Debug Mode
```bash
npm run test:debug
```

### Run Specific Test File
```bash
npm test -- tests/day-1-basics/1-basic-navigation.spec.js
```

### Run Tests in Specific Browser
```bash
npm run test:chrome     # Chromium only
npm run test:firefox    # Firefox only
npm run test:webkit     # Safari only
npm run test:mobile     # Mobile Chrome
```

### Run Tests with Video/Screenshots
Tests automatically record videos and screenshots on failure. Check `test-results/` folder.

## 📖 Learning Path

### Week 1: Foundations
- **Day 1**: Navigation, Forms, Tables, Modals ← YOU ARE HERE
- **Day 2**: Async Operations, Waiting Strategies, API Testing
- **Day 3**: Advanced Locators, CI/CD Integration, Best Practices
- **Day 4**: Fixtures, Custom Utilities, Page Objects
- **Day 5**: Cross-browser Testing, Mobile Testing, Performance
- **Day 6**: API Mocking, Network Interception, Advanced Scenarios
- **Day 7**: Parallel Testing, Reporting, Real-world Applications

### Week 2-4: Intermediate & Advanced
- Multi-browser coordination
- Advanced waits and retries
- Complex data-driven tests
- Performance optimization
- Production-ready patterns

## 🎥 YouTube Tutorial Content

### Day 1 Script - "Playwright Basics in 30 Minutes"

**Intro (0:00-0:30)**
```
"Hey everyone! Welcome to Playwright Automation Basics. 
I'm [Your Name], and today we're going to learn how to 
automate web testing with Playwright - from zero to hero in 30 minutes!"
```

**Segment 1: Setup (0:30-2:00)**
- Show project setup
- Run `npm install`
- Start server with `npm run serve`
- Show website at localhost:3000

**Segment 2: Basic Navigation (2:00-8:00)**
- Open test file: `1-basic-navigation.spec.js`
- Explain page loading
- Show different locator strategies
- Run test with: `npm run test:headed`
- Show test results

**Segment 3: Form Testing (8:00-15:00)**
- Open Forms section in live demo
- Show test file: `2-form-interactions.spec.js`
- Demonstrate: filling inputs, dropdowns, radio buttons, checkboxes
- Run form tests
- Show form validation

**Segment 4: Tables (15:00-22:00)**
- Navigate to Tables section
- Show test file: `3-table-interactions.spec.js`
- Demonstrate: data extraction, filtering, row selection
- Run table tests step by step

**Segment 5: Modals (22:00-28:00)**
- Show Modals section
- Demonstrate: opening, closing, form submission in modals
- Run modal tests
- Show test reports

**Outro (28:00-30:00)**
```
"Great job! You've now learned the basics of Playwright testing.
In the next video, we'll cover advanced waiting strategies and async operations.
Don't forget to like and subscribe!"
```

### Key Points to Mention in Videos

1. **What is Playwright?**
   - End-to-end testing framework
   - Multiple browser support
   - Fast and reliable
   - Modern automation

2. **Why use Playwright?**
   - Better waits and stability
   - Multiple languages support
   - Built-in trace viewer
   - Great debugging

3. **Best Practices Mentioned**
   - Use data-testid for locators
   - Avoid waits when possible
   - Use fixtures for setup
   - Keep tests independent

## 🔧 Test Configuration

### Browsers Tested
- Chromium
- Firefox
- WebKit (Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

### Configuration Features
- Screenshots on failure
- Videos on failure
- HTML reports
- Trace viewer
- Parallel execution (configurable)

## 📊 Test Reports

After running tests, view reports:
```bash
npx playwright show-report
```

## 🎯 Next Steps

1. **Complete Day 1 Tests**
   - Run each test file
   - Understand each concept
   - Run in different modes (headed, debug, UI)

2. **Experiment**
   - Modify tests to explore different selectors
   - Add new assertions
   - Try different browser configurations

3. **Document Your Learning**
   - Take notes on key concepts
   - Record your own test runs
   - Create your own test files based on Day 1

4. **Prepare for Day 2**
   - Learn about async operations
   - Understand waiting strategies
   - Explore API testing

## 📝 Key Concepts & Terminology

### Locators
```javascript
page.locator('css selector')           // CSS selector
page.locator('button')                 // By tag name
page.locator('text="Click Me"')        // By text
page.locator('[data-testid="submit"]') // By attribute
```

### Interactions
```javascript
await page.click('button')             // Click
await page.fill('input', 'text')       // Fill input
await page.check('checkbox')           // Check checkbox
await page.selectOption('select', value) // Select dropdown
```

### Assertions
```javascript
await expect(element).toBeVisible()    // Element visible
await expect(element).toHaveText('...')// Exact text
await expect(element).toContainText('...')// Partial text
await expect(element).toBeEnabled()    // Element enabled
```

## 🤝 Contributing

As you learn and create your own tests, feel free to:
- Add more test scenarios
- Create helper functions
- Build page objects
- Share YouTube content

## 📄 License

MIT License - Feel free to use this for learning and teaching

## 🎓 Ready to Start?

1. Run `npm install` to setup
2. Run `npm run serve` in one terminal
3. Run `npm test -- tests/day-1-basics/1-basic-navigation.spec.js` in another
4. Watch tests execute and learn!

---

**Happy Testing! 🚀**

For updates and new content, follow this project and check back regularly!
