# Day 6: Accessibility Testing

Comprehensive accessibility (a11y) testing using Playwright, covering WCAG 2.1 guidelines, keyboard navigation, ARIA attributes, screen reader compatibility, and automated audits.

## Test Files

### 1. Keyboard Navigation (`1-keyboard-navigation.spec.js`)
Tests full keyboard accessibility including Tab navigation, focus management, and keyboard traps.

**Tests:**
- Navigate page with Tab key and track focus path
- Verify visible focus indicators on all elements
- Test Shift+Tab for reverse navigation
- Verify focus order matches visual order
- Test Enter key activation of buttons
- Detect keyboard traps

**Run:**
```bash
npx playwright test tests/day-6-accessibility/1-keyboard-navigation.spec.js
```

### 2. ARIA Attributes (`2-aria-attributes.spec.js`)
Verifies proper use of ARIA attributes, semantic HTML, and accessible names.

**Tests:**
- Verify form inputs have proper labels
- Check ARIA roles on interactive elements
- Verify live regions for dynamic content
- Check aria-expanded on collapsible elements
- Verify aria-hidden on decorative elements
- Validate heading structure (h1-h6) and hierarchy
- Check page landmarks (nav, main, footer)
- Verify alt text on images

**Run:**
```bash
npx playwright test tests/day-6-accessibility/2-aria-attributes.spec.js
```

### 3. Automated Audits (`3-automated-audits.spec.js`)
Manual and automated accessibility checks. Can integrate with axe-core for deeper analysis.

**Tests:**
- Run manual a11y checks
- Identify missing form labels
- Detect low contrast issues
- Find role/semantic problems
- Simulate screen reader view
- Generate a11y checklist

**Install axe-core (optional):**
```bash
npm install @axe-core/playwright
```

**Run:**
```bash
npx playwright test tests/day-6-accessibility/3-automated-audits.spec.js
```

### 4. Form Accessibility (`4-form-accessibility.spec.js`)
Tests form-specific accessibility requirements.

**Tests:**
- Verify all form fields have labels
- Check required field indicators (*, aria-required)
- Verify error message accessibility
- Check form field grouping (fieldset + legend)
- Verify submit control accessibility
- Check form instructions and helper text

**Run:**
```bash
npx playwright test tests/day-6-accessibility/4-form-accessibility.spec.js
```

### 5. Color Contrast (`5-color-contrast.spec.js`)
Validates text contrast ratios, visual accessibility, and color-blind friendliness.

**Tests:**
- Check text contrast ratios (WCAG AA/AAA standards)
- Verify error states are not color-only
- Check touch target sizes (44x44px minimum)
- Verify color-blind accessibility
- Generate visual accessibility report

**Run:**
```bash
npx playwright test tests/day-6-accessibility/5-color-contrast.spec.js
```

## Running All Accessibility Tests

Start server and run tests:

```bash
npm run serve
npm test -- tests/day-6-accessibility
```

With detailed output:
```bash
npx playwright test tests/day-6-accessibility --reporter=list
```

## WCAG 2.1 Quick Reference

### Levels
- **A** — Basic level (minimum required)
- **AA** — Enhanced level (industry standard, recommended)
- **AAA** — Advanced level (strict compliance)

### Key Standards

| Criterion | AA Standard | Test Method |
|-----------|-----------|-----------|
| Contrast | 4.5:1 (normal), 3:1 (large) | Color contrast checker |
| Touch target | 44x44 CSS pixels minimum | Measure element size |
| Keyboard | All functions keyboard accessible | Tab through page |
| Form labels | Associated with inputs | Check label/aria-label |
| Focus visible | Clear focus indicator | Tab and look for outline |
| Alt text | Meaningful descriptions | Check img alt attributes |
| Heading hierarchy | H1, then H2, H3 in order | Check heading levels |
| Landmarks | nav, main, footer defined | Check semantic elements |

## POUR Principles

### Perceivable
- ✅ Text alternatives for images (alt text)
- ✅ Sufficient color contrast (4.5:1)
- ✅ Readable and clear language
- ✅ Captions for audio/video

### Operable
- ✅ All functions keyboard accessible
- ✅ No keyboard traps
- ✅ Clear focus indicators
- ✅ Enough time to read/interact

### Understandable
- ✅ Clear, simple language
- ✅ Predictable navigation
- ✅ Consistent design patterns
- ✅ Error prevention and recovery

### Robust
- ✅ Valid HTML
- ✅ Proper ARIA use
- ✅ Screen reader compatible
- ✅ Works with assistive technologies

## Common Accessibility Issues & Fixes

| Issue | Impact | Fix |
|-------|--------|-----|
| Missing form labels | Screen reader users can't find fields | `<label for="id">Text</label>` |
| Low contrast text | Hard to read for low-vision users | Ensure 4.5:1 ratio |
| No alt text on images | Screen reader users get "image" | Add meaningful alt text |
| Keyboard traps | Keyboard-only users get stuck | Ensure Tab key works everywhere |
| Missing focus indicator | Users don't know where they are | Use `:focus-visible` with visible style |
| Color-only status | Color-blind users can't distinguish | Add icon or text indicator |
| No skip link | Keyboard users repeat navigation | Add skip to main content link |
| Missing heading h1 | Page structure unclear | Add h1 at top of page |
| Semantic HTML misuse | Complex navigation for AT users | Use `<nav>`, `<main>`, `<button>` |
| Unlabeled buttons | Screen readers read random text | `<button aria-label="Close">✕</button>` |

## Automatic Checking Tools

### Browser Extensions
- **axe DevTools** (Chrome/Firefox)
- **WAVE** (Web Accessibility Evaluation Tool)
- **Lighthouse** (Chrome built-in)
- **Accessibility Insights** (Microsoft)

### Command Line
```bash
# Install axe CLI
npm install -g @axe-core/cli

# Run audit
axe https://localhost:3000
```

## Manual Testing Checklist

- [ ] **Keyboard Only** - Use Tab, Shift+Tab, Enter, Arrow keys, Escape
- [ ] **Screen Reader** - Test with NVDA (Windows), JAWS (Windows), VoiceOver (Mac)
- [ ] **Focus** - Tab through page, verify focus is visible
- [ ] **Forms** - Fill & submit forms using keyboard only
- [ ] **Dynamic** - Test modals, dropdowns, pop-ups for keyboard access
- [ ] **Links** - Verify link text is descriptive (not "click here")
- [ ] **Images** - Check alt text is meaningful (not "image.jpg")
- [ ] **Headings** - Proper hierarchy, no skipped levels
- [ ] **Contrast** - Read text with reduced brightness
- [ ] **Zoom** - Test with 200% zoom level

## Resources

### Guidelines
- [WCAG 2.1 Standard](https://www.w3.org/WAI/WCAG21/quickref/) — Official guidelines
- [WebAIM](https://webaim.org/) — Accessibility information & resources
- [MDN ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA) — ARIA documentation

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Blindness Simulator](https://www.color-blindness.com/coblis-color-blindness-simulator/)
- [NVDA Screen Reader](https://www.nvaccess.org/)

### Testing
- [WebAIM Color Contrast](https://webaim.org/resources/contrastchecker/)
- [WAVE](https://wave.webaim.org/)
- [Accessibility Insights](https://accessibilityinsights.io/)

## Best Practices

1. **Start with Semantic HTML** — Use correct elements before ARIA
2. **Test with Real Technology** — Automated tests find ~40% of issues; manual testing finds the rest
3. **Keyboard First** — All features must work with keyboard alone
4. **Focus Visible** — Always show clear focus indicators
5. **Labels Matter** — Every input needs a label (HTML or aria-label)
6. **Test Color Combinations** — Don't rely on color alone
7. **Meaningful Alt Text** — Describe function, not "image.jpeg"
8. **Proper Heading Structure** — One H1, then H2, H3 in sequential order
9. **Skip Links** — Add link to skip navigation
10. **Test Everything** — Modals, dropdowns, dynamic content, forms

## Why Accessibility Matters

- **15% of world population has disabilities**
- **Many use assistive technologies** (screen readers, voice control, eye trackers)
- **Legal requirement** in many jurisdictions (ADA, GDPR, EN 301 549)
- **Benefits everyone** — keyboard shortcuts help power users, captions help in noisy environments
- **Better design** — Accessibility often improves overall UX

---

**Need help?** Check the WCAG guidelines or run tests with `--headed` flag to see what screen readers would see.
