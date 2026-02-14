const { test, expect } = require('@playwright/test');
// Note: To use axe, first install: npm install @axe-core/playwright
// This is a template showing how to integrate axe. If not installed, tests will show how to use it.

test.describe('Exercise 3: Automated Accessibility Audits (axe-core)', () => {
  test('should run manual accessibility checks if axe not installed', async ({ page }) => {
    // This test shows how to do manual a11y checks without axe
    // Install axe with: npm install @axe-core/playwright
    
    await page.goto('http://localhost:3000');

    // Manual contrast check
    const elements = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button, a, p')).slice(0, 10).map(el => {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const bgColor = styles.backgroundColor;
        return {
          tag: el.tagName,
          text: el.textContent?.substring(0, 30) || '',
          foregroundColor: color,
          backgroundColor: bgColor,
        };
      });
    });

    console.log('\n🎨 Foreground vs Background Colors (Manual Check):');
    console.log('════════════════════════════════════════════════════════');
    elements.forEach(el => {
      console.log(`[${el.tag}] Text: ${el.text}`);
      console.log(`   Foreground: ${el.foregroundColor}`);
      console.log(`   Background: ${el.backgroundColor}`);
    });

    console.log('\n📝 To use automated axe auditing:');
    console.log('   1. Install: npm install @axe-core/playwright');
    console.log('   2. Import: const { injectAxe, checkA11y } = require(\'axe-playwright\');');
    console.log('   3. Run: await injectAxe(page);');
    console.log('   4. Check: await checkA11y(page);');
  });

  test('should identify missing labels manually', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const unlabeledInputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input:not([type="hidden"]), textarea')).filter(input => {
        const inputId = input.id;
        const label = document.querySelector(`label[for="${inputId}"]`);
        const ariaLabel = input.getAttribute('aria-label');
        const placeholder = input.getAttribute('placeholder');
        
        return !label && !ariaLabel && !placeholder;
      }).map(input => ({
        type: input.type,
        name: input.name,
        id: input.id,
      }));
    });

    console.log('\n🚨 Accessibility Issues Found (Manual Check):');
    console.log('════════════════════════════════════════════════════════');

    if (unlabeledInputs.length > 0) {
      console.log(`Found ${unlabeledInputs.length} input(s) without labels:`);
      unlabeledInputs.forEach(input => {
        console.log(`   [${input.type}] name="${input.name}" id="${input.id}"`);
        console.log(`   → Add: <label for="${input.id}">Label text</label>`);
      });
    } else {
      console.log('✅ All inputs have labels');
    }
  });

  test('should identify low contrast text manually', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Simple function to estimate contrast (not perfectly accurate)
    const estimateContrast = await page.evaluate(() => {
      function getLuminance(color) {
        if (color.startsWith('rgb')) {
          const match = color.match(/\d+/g);
          const [r, g, b] = match.slice(0, 3).map(Number);
          return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        }
        return 0.5; // default
      }

      function getContrastRatio(color1, color2) {
        const l1 = getLuminance(color1);
        const l2 = getLuminance(color2);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
      }

      const issues = [];
      Array.from(document.querySelectorAll('button, a, p, span')).slice(0, 20).forEach(el => {
        const styles = window.getComputedStyle(el);
        const fgColor = styles.color;
        const bgColor = styles.backgroundColor;
        const contrastRatio = getContrastRatio(fgColor, bgColor);

        if (contrastRatio < 4.5) {
          issues.push({
            tag: el.tagName,
            text: el.textContent?.substring(0, 30) || '',
            contrast: contrastRatio.toFixed(2),
            requirement: contrastRatio < 3 ? 'FAIL' : 'WARN',
          });
        }
      });

      return issues;
    });

    console.log('\n🎨 Contrast Ratio Issues (Estimated):');
    console.log('════════════════════════════════════════════════════════');

    if (estimateContrast.length > 0) {
      console.log('⚠️  Elements with low contrast (< 4.5:1 for AA):');
      estimateContrast.forEach(issue => {
        console.log(`[${issue.tag}] "${issue.text}" - Ratio: ${issue.contrast}:1 (${issue.requirement})`);
      });
    } else {
      console.log('✅ No obvious contrast issues detected');
    }

    console.log('\n💡 WCAG Contrast Requirements:');
    console.log('   Normal text: 4.5:1 (AA) or 7:1 (AAA)');
    console.log('   Large text (18pt+): 3:1 (AA) or 4.5:1 (AAA)');
  });

  test('should detect interactive elements without proper roles', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const issues = await page.evaluate(() => {
      const problematicElements = [];

      // Check div/span used as buttons without proper role
      document.querySelectorAll('div, span').forEach(el => {
        const onclick = el.onclick || el.getAttribute('onclick') || el.className.includes('button');
        const hasButtonRole = el.getAttribute('role') === 'button';
        
        if (onclick && !hasButtonRole) {
          problematicElements.push({
            issue: 'Clickable div/span without role="button"',
            element: `<${el.tagName} class="${el.className.substring(0, 30)}">`,
            text: el.textContent?.substring(0, 30) || '',
            fix: 'Add role="button" and handle keyboard (Enter/Space)',
          });
        }
      });

      // Check images without alt
      document.querySelectorAll('img').forEach(img => {
        if (!img.alt && !img.getAttribute('aria-label') && img.closest('[role="presentation"]') === null) {
          problematicElements.push({
            issue: 'Image without alt text',
            element: img.src.split('/').pop(),
            fix: 'Add alt attribute with meaningful description',
          });
        }
      });

      return problematicElements;
    });

    console.log('\n🔍 Semantic/Role Issues:');
    console.log('════════════════════════════════════════════════════════');

    if (issues.length > 0) {
      console.log(`Found ${issues.length} accessibility issue(s):`);
      issues.forEach((issue, idx) => {
        console.log(`\n${idx + 1}. ${issue.issue}`);
        console.log(`   Element: ${issue.element}`);
        console.log(`   Fix: ${issue.fix}`);
      });
    } else {
      console.log('✅ No obvious role/semantic issues detected');
    }
  });

  test('should test page with screen reader simulation', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Simulate what a screen reader would see
    const screenReaderView = await page.evaluate(() => {
      const accessibleText = [];

      // Headings
      document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
        accessibleText.push(`HEADING ${h.tagName}: ${h.textContent}`);
      });

      // Interactive elements
      document.querySelectorAll('button, a, input, select').forEach(el => {
        const label = el.getAttribute('aria-label') || 
                     document.querySelector(`label[for="${el.id}"]`)?.textContent ||
                     el.textContent ||
                     el.value ||
                     el.name ||
                     '(unlabeled)';
        accessibleText.push(`${el.tagName}: ${label.substring(0, 50)}`);
      });

      return accessibleText.slice(0, 15);
    });

    console.log('\n🔊 What Screen Reader Users Hear:');
    console.log('════════════════════════════════════════════════════════');
    screenReaderView.forEach((text, idx) => {
      console.log(`${idx + 1}. ${text}`);
    });
  });

  test('should generate a11y checklist', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const checks = await page.evaluate(() => {
      const results = {
        hasH1: !!document.querySelector('h1'),
        hasNav: !!document.querySelector('nav, [role="navigation"]'),
        hasMain: !!document.querySelector('main, [role="main"]'),
        hasFooter: !!document.querySelector('footer, [role="contentinfo"]'),
        inputsLabeled: Array.from(document.querySelectorAll('input:not([type="hidden"])')).every(input => {
          return input.getAttribute('aria-label') || 
                 input.getAttribute('aria-labelledby') ||
                 document.querySelector(`label[for="${input.id}"]`);
        }),
        buttonsHaveText: Array.from(document.querySelectorAll('button')).every(btn => {
          return btn.textContent?.trim() || btn.getAttribute('aria-label');
        }),
        imagesHaveAlt: Array.from(document.querySelectorAll('img')).every(img => {
          return img.alt || img.getAttribute('aria-label');
        }),
        focusVisible: !!document.querySelector(':focus-visible'),
        skipToMain: !!document.querySelector('a[href="#main"], a[href="#content"]'),
      };

      return results;
    });

    console.log('\n✅ Accessibility Checklist:');
    console.log('════════════════════════════════════════════════════════');
    console.log(`${checks.hasH1 ? '✅' : '❌'} Page has H1 heading`);
    console.log(`${checks.hasNav ? '✅' : '❌'} Page has navigation landmark`);
    console.log(`${checks.hasMain ? '✅' : '❌'} Page has main content landmark`);
    console.log(`${checks.hasFooter ? '✅' : '❌'} Page has footer landmark`);
    console.log(`${checks.inputsLabeled ? '✅' : '❌'} All inputs are labeled`);
    console.log(`${checks.buttonsHaveText ? '✅' : '❌'} All buttons have text/aria-label`);
    console.log(`${checks.imagesHaveAlt ? '✅' : '❌'} All images have alt text`);
    console.log(`${checks.skipToMain ? '✅' : '❌'} Has skip to main link`);

    const passed = Object.values(checks).filter(v => v === true).length;
    console.log(`\n📊 Passed: ${passed}/${Object.keys(checks).length} checks`);
  });
});
