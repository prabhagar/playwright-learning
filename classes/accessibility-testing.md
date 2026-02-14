# Class 6 — Accessibility Testing

## Goal
Learn to test web application accessibility (a11y) using modern testing techniques: ARIA attributes, keyboard navigation, focus management, screen reader compatibility, and automated accessibility audits.

## Topics

### 1. Accessibility Basics
- What is accessibility (a11y) and why it matters
- WCAG 2.1 guidelines (Level A, AA, AAA)
- Common accessibility issues (missing labels, poor contrast, keyboard traps)
- Testing with keyboard navigation, screen readers, and tools

### 2. Semantic HTML & ARIA
- Semantic HTML elements (nav, main, footer, article, etc.)
- ARIA attributes: `aria-label`, `aria-labelledby`, `aria-describedby`
- ARIA roles: `button`, `navigation`, `region`, `alert`, etc.
- ARIA states: `aria-expanded`, `aria-disabled`, `aria-hidden`, `aria-current`

### 3. Keyboard Navigation Testing
- Test keyboard-only users: Tab, Shift+Tab, Enter, Escape, Arrow keys
- Verify focus order matches visual order
- Check for keyboard traps (elements you can't tab away from)
- Validate skip links and keyboard shortcuts

### 4. Screen Reader Testing
- Test with screen readers (NVDA, JAWS, VoiceOver on macOS/iOS)
- Verify announcements and labels are clear
- Test form field relationships (label → input)
- Validate dynamic content announcements (live regions)

### 5. Automated Accessibility Audits
- Use `axe-core` library for automated checks
- Integrate with Playwright for continuous testing
- Understand violation categories (color contrast, missing labels, etc.)
- Interpret and fix common violations

### 6. Color Contrast & Visual Accessibility
- Test text-to-background contrast ratios (WCAG AA: 4.5:1, AAA: 7:1)
- Validate form error messages are not color-only
- Test for color blindness (deuteranopia, protanopia, tritanopia)
- Use tools like WebAIM Color Contrast Checker

## Hands-on Exercises

### Exercise 1: Test Keyboard Navigation
- Navigate through a page using Tab, Shift+Tab, and Enter
- Verify visible focus indicators
- Ensure all interactive elements are reachable via keyboard
- Check for keyboard traps

### Exercise 2: Verify ARIA Attributes
- Locate missing or incorrect ARIA labels
- Verify `aria-label` and `aria-labelledby` on complex controls
- Test `aria-expanded` on expandable elements
- Validate `aria-hidden` on decorative elements

### Exercise 3: Run Automated Accessibility Audit (axe-core)
- Install and use `@axe-core/playwright`
- Run axe audit on complete pages
- Filter violations by severity
- Generate accessibility violation reports

### Exercise 4: Test Form Accessibility
- Verify all form inputs have associated labels
- Test error message announcements
- Validate required field indicators
- Check for helper text associations

### Exercise 5: Test Dynamic Content & Live Regions
- Use `aria-live="polite"` or `aria-live="assertive"` for announcements
- Verify notifications are announced to screen readers
- Test modal dialogs and focus management
- Validate skip links

### Exercise 6: Test Color Contrast
- Verify text contrast meets WCAG AA standards
- Test that error messages use more than just color
- Validate icon/image visibility
- Use contrast checking tools

## Common Patterns

### Checking ARIA Labels
```javascript
const label = await page.locator('button').getAttribute('aria-label');
expect(label).toBeTruthy();
expect(label).toContain('expected text');
```

### Testing Keyboard Navigation
```javascript
await page.keyboard.press('Tab');
const focused = await page.evaluate(() => document.activeElement.tagName);
expect(focused).toBe('BUTTON');
```

### Running Axe Accessibility Audit
```javascript
const { injectAxe, checkA11y } = require('axe-playwright');
await injectAxe(page);
await checkA11y(page, null, { detailedReport: true, detailedReportOptions: { html: true } });
```

### Verifying Focus Visible
```javascript
await page.keyboard.press('Tab');
const focused = page.locator(':focus');
const isFocusVisible = await focused.evaluate(el => {
  return getComputedStyle(el).outline !== 'none';
});
expect(isFocusVisible).toBe(true);
```

### Testing Live Region Announcements
```javascript
const liveRegion = page.locator('[aria-live]');
await liveRegion.waitFor({ state: 'attached' });
const announcement = await liveRegion.textContent();
expect(announcement).toContain('expected message');
```

## Running Tests

Start the local server and run Day-6 tests:

```bash
npm run serve
npm test -- tests/day-6-accessibility
```

Or with specific reporter:
```bash
npx playwright test tests/day-6-accessibility --reporter=list
```

## Key Accessibility Principles

### POUR Principle
- **Perceivable** — Information must be visible/audible to all users
- **Operable** — All functionality must be keyboard accessible
- **Understandable** — Content must be clear and predictable
- **Robust** — Content must work with assistive technologies

### WCAG Levels
- **Level A** — Basic accessibility (1.0 rating)
- **Level AA** — Enhanced accessibility (4:5:1 contrast) — Industry standard
- **Level AAA** — Advanced accessibility (7:1 contrast) — Strict standard

## Best Practices

1. **Semantic HTML First** — Use correct HTML elements before ARIA
2. **Test with Real Assistive Tech** — Automated testing catches ~40% of issues; manual testing finds the rest
3. **Keyboard Only** — Regularly use keyboard-only navigation
4. **Focus Management** — Always show visible focus indicators
5. **Labels & Descriptions** — Every input must have an associated label
6. **Color + More** — Don't rely on color alone to convey information
7. **Test Dynamically** — Test modals, dropdowns, live regions for a11y
8. **Accessible Forms** — Group related inputs, indicate required fields, show errors
9. **Content Hierarchy** — Use proper heading levels (h1, h2, h3)
10. **Alt Text** — Provide meaningful alt text for images

## Tools & Resources

### Testing Tools
- **axe DevTools** — Chrome/Firefox extension for audits
- **WAVE** — Web accessibility evaluation tool
- **Lighthouse** — Chrome built-in accessibility audit
- **NVDA** — Free screen reader for Windows
- **JAWS** — Premium screen reader for Windows
- **VoiceOver** — Built-in screen reader for macOS/iOS

### Libraries
- **axe-core** — Automated accessibility testing
- **@axe-core/playwright** — Playwright integration
- **deque/axe-core** — Popular open-source library
- **jest-axe** — Jest integration for a11y

### Keyboard Keys
- **Tab** — Move forward through interactive elements
- **Shift+Tab** — Move backward
- **Enter** — Activate buttons, submit forms
- **Space** — Toggle checkboxes, activate buttons
- **Arrow Keys** — Navigate menus, sliders, tabs
- **Escape** — Close modals, dropdowns

## Common Violations & Fixes

| Violation | Why It Matters | Fix |
|-----------|---|---|
| Missing form labels | Screen reader users can't identify form fields | Use `<label for="id">` or `aria-label` |
| Low contrast | Hard to read for low-vision users | Ensure 4.5:1 ratio for AA compliance |
| Missing alt text | Screen reader users see "image" instead of description | Add meaningful alt text to images |
| Keyboard traps | Keyboard-only users get stuck | Ensure Tab key works everywhere |
| Missing headings | Users can't navigate page structure | Use h1, h2, h3 in order |
| No focus indicator | Users don't know where they are | Use :focus-visible with visible styles |
| Missing ARIA roles | Complex widgets aren't understood | Add proper ARIA role attributes |
| Color-only indicators | Color-blind users miss information | Use icons, text, patterns too |

## Checklist

- [ ] Run axe audit and fix critical violations
- [ ] Test full keyboard navigation (Tab, Enter, Arrow keys, Escape)
- [ ] Verify all form inputs have labels
- [ ] Check contrast ratios (AA: 4.5:1, AAA: 7:1)
- [ ] Test with screen reader (at least VoiceOver on Mac)
- [ ] Verify focus visible on all interactive elements
- [ ] Check for keyboard traps
- [ ] Validate dynamic content announcements
- [ ] Test mobile accessibility (touch targets > 44px)
- [ ] Use semantic HTML elements

## Notes

- Accessibility testing is required by law in many jurisdictions (ADA, WCAG)
- ~15% of world population has disabilities; many use assistive technology
- Accessibility benefits all users (faster navigation, clearer content, etc.)
- Perfect automated audit ≠ Accessible — manual testing is essential
- Start with automated checks (axe), then manual testing (keyboard, screen readers)
