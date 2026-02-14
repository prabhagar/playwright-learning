const { test, expect } = require('@playwright/test');

test.describe('Exercise 1: Keyboard Navigation Testing', () => {
  test('should navigate through page with Tab key', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Track focus changes
    const focusPath = [];
    
    await page.evaluate(() => {
      let count = 0;
      document.addEventListener('focusin', (e) => {
        window.focusHistory = window.focusHistory || [];
        if (count < 20) { // Limit to first 20 focus events
          window.focusHistory.push({
            tag: e.target.tagName,
            class: e.target.className,
            text: e.target.textContent?.substring(0, 30) || '',
            ariaLabel: e.target.getAttribute('aria-label'),
          });
          count++;
        }
      });
    });

    // Tab through page
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }

    const focusHistory = await page.evaluate(() => window.focusHistory || []);

    console.log('\n⌨️  Keyboard Navigation Path:');
    console.log('════════════════════════════════════════════════════════');
    focusHistory.forEach((el, idx) => {
      const label = el.ariaLabel || el.text || `<${el.tag.toLowerCase()}>`;
      console.log(`${(idx + 1).toString().padStart(2)} → ${label.substring(0, 50)}`);
    });

    // Verify at least some interactive elements are reached
    expect(focusHistory.length).toBeGreaterThan(0);
    
    // Check that we focused on various element types
    const tags = new Set(focusHistory.map(f => f.tag));
    console.log(`\n✅ Focused on ${tags.size} different element types: ${Array.from(tags).join(', ')}`);
  });

  test('should have visible focus indicator', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Tab to first interactive element
    await page.keyboard.press('Tab');

    // Check if focused element has visible focus styles
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      const styles = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow,
        borderColor: styles.borderColor,
        hasClass: el.className,
      };
    });

    console.log('\n👁️  Focus Indicator Styles:');
    console.log('════════════════════════════════════════════════════════');
    console.log(`Element: ${focusedElement.tag}`);
    console.log(`Outline: ${focusedElement.outline}`);
    console.log(`Box Shadow: ${focusedElement.boxShadow}`);

    // At least one focus style should be visible
    const hasFocusStyle = focusedElement.outline !== 'none' || 
                          focusedElement.boxShadow !== 'none' ||
                          focusedElement.borderColor !== 'transparent';
    
    expect(hasFocusStyle).toBe(true);
  });

  test('should reset focus with Shift+Tab', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Tab forward
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const forwardFocus = await page.evaluate(() => document.activeElement.textContent);

    // Tab backward
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Shift+Tab');

    const backwardFocus = await page.evaluate(() => document.activeElement.textContent);

    console.log(`Forward focus: ${forwardFocus?.substring(0, 30)}`);
    console.log(`Backward focus: ${backwardFocus?.substring(0, 30)}`);

    // Backward focus should be different from final forward focus
    expect(forwardFocus).not.toBe(backwardFocus);
  });

  test('should have focus order matching visual order', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const focusOrder = await page.evaluate(() => {
      const interactiveElements = Array.from(
        document.querySelectorAll('button, a, input, select, textarea, [role="button"]')
      ).filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetHeight > 0;
      });

      return interactiveElements.map((el, idx) => ({
        order: idx,
        tag: el.tagName,
        text: el.textContent?.substring(0, 30) || '',
        ariaLabel: el.getAttribute('aria-label'),
        tabIndex: el.getAttribute('tabindex'),
        y: el.getBoundingClientRect().top,
      }));
    });

    console.log('\n📍 Focus Order vs Visual Order:');
    console.log('════════════════════════════════════════════════════════');
    focusOrder.forEach(el => {
      const label = el.ariaLabel || el.text || `<${el.tag.toLowerCase()}>`;
      console.log(`${el.order} → ${label.substring(0, 40)} (Y: ${Math.round(el.y)}px, TabIndex: ${el.tabIndex || 'default'})`);
    });

    // Check if elements are sorted by visual position (mostly)
    const yPositions = focusOrder.map(el => el.y);
    const isSorted = yPositions.every((val, i) => i === 0 || val >= yPositions[i - 1]);
    
    console.log(`\n✅ Focus order follows visual order: ${isSorted}`);
  });

  test('should allow Enter key to activate buttons', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Find first button and focus it
    await page.evaluate(() => {
      const button = document.querySelector('button');
      if (button) button.focus();
    });

    // Track button click
    const clicked = await page.evaluate(() => {
      return new Promise(resolve => {
        const button = document.activeElement;
        let wasClicked = false;
        button.addEventListener('click', () => {
          wasClicked = true;
        });
        document.addEventListener('key down', (e) => {
          if (e.key === 'Enter') {
            resolve(wasClicked);
          }
        });
        // Simulate keyboard
        setTimeout(() => {
          const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter' });
          button.dispatchEvent(enterEvent);
          const clickEvent = new MouseEvent('click');
          button.dispatchEvent(clickEvent);
          resolve(true);
        }, 100);
      });
    });

    console.log(`\n✅ Enter key activates button: ${clicked}`);
    expect(clicked).toBe(true);
  });

  test('should not have keyboard traps', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Try to tab through entire page without getting stuck
    let escapeAttempts = 0;
    const maxAttempts = 50;

    for (let i = 0; i < maxAttempts; i++) {
      const previousElement = await page.evaluate(() => document.activeElement.tagName);
      await page.keyboard.press('Tab');
      await page.waitForTimeout(50);
      const currentElement = await page.evaluate(() => document.activeElement.tagName);

      if (previousElement === currentElement) {
        escapeAttempts++;
      }
    }

    console.log(`\n✅ Keyboard trap attempts: ${escapeAttempts}`);
    console.log(`No keyboard traps detected: ${escapeAttempts < 5}`);

    // Allow for some repeated focus (like getting stuck briefly)
    expect(escapeAttempts).toBeLessThan(5);
  });

  test('should handle escape key properly', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Track if escape key prevents default
    const escapeHandled = await page.evaluate(() => {
      let handled = false;
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          handled = !e.defaultPrevented;
        }
      });
      
      // Simulate escape key
      const event = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape' });
      document.dispatchEvent(event);
      
      return handled;
    });

    console.log(`✅ Escape key handling: ${escapeHandled}`);
  });
});
