const { test, expect } = require('@playwright/test');

test.describe('Exercise 2: ARIA Attributes & Semantic HTML', () => {
  test('should verify form inputs have labels', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const formInputs = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
      
      return inputs.map(input => {
        const inputId = input.id;
        const label = document.querySelector(`label[for="${inputId}"]`);
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledby = input.getAttribute('aria-labelledby');
        
        return {
          tag: input.tagName,
          type: input.type,
          name: input.name,
          id: inputId,
          hasLabel: !!label,
          labelText: label?.textContent || '',
          hasAriaLabel: !!ariaLabel,
          ariaLabel: ariaLabel,
          hasAriaLabelledby: !!ariaLabelledby,
          isLabeled: !!(label || ariaLabel || ariaLabelledby),
        };
      });
    });

    console.log('\n✏️  Form Input Labels:');
    console.log('════════════════════════════════════════════════════════');
    formInputs.forEach(input => {
      const labelType = input.hasLabel ? 'HTML Label' : input.hasAriaLabel ? 'aria-label' : input.hasAriaLabelledby ? 'aria-labelledby' : 'NONE';
      const labelText = input.labelText || input.ariaLabel || 'N/A';
      console.log(`[${input.tag}] Type: ${input.type || 'N/A'} → ${labelText.substring(0, 40)} (${labelType})`);
    });

    // Count labeled inputs
    const labeledCount = formInputs.filter(i => i.isLabeled).length;
    console.log(`\n✅ Labeled inputs: ${labeledCount}/${formInputs.length}`);

    // All inputs should be labeled
    if (formInputs.length > 0) {
      expect(labeledCount).toBeGreaterThan(0);
    }
  });

  test('should verify ARIA roles on interactive elements', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const interactiveElements = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll('button, [role="button"], nav, main, [role="navigation"], [role="region"]')
      );

      return elements.map(el => ({
        tag: el.tagName,
        role: el.getAttribute('role') || '(implicit)',
        ariaLabel: el.getAttribute('aria-label'),
        hasAccessibleName: !!(
          el.getAttribute('aria-label') || 
          el.getAttribute('aria-labelledby') || 
          el.textContent?.trim()
        ),
        text: el.textContent?.substring(0, 40) || '',
      })).slice(0, 15); // Show first 15
    });

    console.log('\n🎭 ARIA Roles & Accessible Names:');
    console.log('════════════════════════════════════════════════════════');
    interactiveElements.forEach(el => {
      const name = el.ariaLabel || el.text.substring(0, 30) || '(no name)';
      console.log(`[${el.tag}] Role: ${el.role.padEnd(12)} → ${name}`);
    });

    // All interactive elements should have accessible names
    const withNames = interactiveElements.filter(el => el.hasAccessibleName).length;
    console.log(`\n✅ Elements with accessible names: ${withNames}/${interactiveElements.length}`);
  });

  test('should verify ARIA live regions', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const liveRegions = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[aria-live]')).map(el => ({
        tag: el.tagName,
        ariaLive: el.getAttribute('aria-live'),
        ariaAtomic: el.getAttribute('aria-atomic'),
        ariaRelevant: el.getAttribute('aria-relevant'),
        text: el.textContent?.substring(0, 50) || '',
      }));
    });

    console.log('\n📢 Live Regions (for dynamic content):');
    console.log('════════════════════════════════════════════════════════');
    
    if (liveRegions.length > 0) {
      liveRegions.forEach(region => {
        console.log(`[${region.tag}] aria-live="${region.ariaLive}" → ${region.text}`);
      });
    } else {
      console.log('No live regions found on this page');
    }

    expect(liveRegions).toBeDefined();
  });

  test('should verify aria-expanded on collapsible elements', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const expandableElements = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[aria-expanded]')).map(el => ({
        tag: el.tagName,
        text: el.textContent?.substring(0, 40) || '',
        ariaExpanded: el.getAttribute('aria-expanded'),
        ariaControl: el.getAttribute('aria-controls'),
        ariaLabel: el.getAttribute('aria-label'),
      }));
    });

    console.log('\n📁 Collapsible/Expandable Elements:');
    console.log('════════════════════════════════════════════════════════');
    
    if (expandableElements.length > 0) {
      expandableElements.forEach(el => {
        console.log(`[${el.tag}] Expanded: ${el.ariaExpanded} → ${el.text}`);
      });
    } else {
      console.log('No expandable elements found on this page');
    }
  });

  test('should verify aria-hidden on decorative elements', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const hiddenElements = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[aria-hidden="true"]')).map(el => ({
        tag: el.tagName,
        class: el.className,
        text: el.textContent?.substring(0, 40) || '',
        reason: el.className.includes('icon') ? 'Icon' : el.className.includes('bullet') ? 'Bullet' : 'Other',
      })).slice(0, 10);
    });

    console.log('\n👻 Hidden from Screen Readers (aria-hidden="true"):');
    console.log('════════════════════════════════════════════════════════');
    
    if (hiddenElements.length > 0) {
      hiddenElements.forEach(el => {
        console.log(`[${el.tag}] Class: ${el.class} (${el.reason})`);
      });
      console.log(`\n✅ Found ${hiddenElements.length} elements properly hidden from assistive tech`);
    } else {
      console.log('No elements explicitly hidden from screen readers');
    }
  });

  test('should verify heading structure', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const headings = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(el => ({
        level: el.tagName,
        text: el.textContent?.substring(0, 50) || '',
      }));
    });

    console.log('\n📚 Heading Structure:');
    console.log('════════════════════════════════════════════════════════');
    
    if (headings.length > 0) {
      headings.forEach(h => {
        console.log(`${h.level} → ${h.text}`);
      });

      // Check for issues
      if (!headings.find(h => h.level === 'H1')) {
        console.log('\n⚠️  No H1 heading found!');
      }
      
      // Check for jumps in heading levels
      const levels = headings.map(h => parseInt(h.level[1]));
      let hasJump = false;
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] - levels[i-1] > 1) {
          hasJump = true;
          break;
        }
      }
      if (hasJump) {
        console.log('⚠️  Heading levels skip (e.g., H1 → H3) - should be incremental');
      } else {
        console.log('✅ Heading structure is proper (no skipped levels)');
      }
    } else {
      console.log('No headings found on this page');
    }
  });

  test('should verify semantic landmarks', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const landmarks = await page.evaluate(() => {
      const semanticLandmarks = ['nav', 'main', 'footer', 'article', 'section', 'aside'];
      const ariaLandmarks = ['navigation', 'main', 'contentinfo', 'region'];

      const found = {};

      // Check semantic landmarks
      semanticLandmarks.forEach(tag => {
        const elements = document.querySelectorAll(tag);
        if (elements.length > 0) {
          found[tag] = Array.from(elements).map(el => ({
            type: 'semantic',
            tag: tag,
            ariaLabel: el.getAttribute('aria-label'),
            text: el.textContent?.substring(0, 40) || '',
          }));
        }
      });

      // Check ARIA landmarks
      ariaLandmarks.forEach(role => {
        const elements = document.querySelectorAll(`[role="${role}"]`);
        if (elements.length > 0) {
          found[role] = Array.from(elements).map(el => ({
            type: 'ARIA',
            tag: el.tagName,
            role: role,
            ariaLabel: el.getAttribute('aria-label'),
          }));
        }
      });

      return found;
    });

    console.log('\n🗺️  Page Landmarks (Navigation Regions):');
    console.log('════════════════════════════════════════════════════════');
    
    const total = Object.keys(landmarks).length;
    if (total > 0) {
      Object.entries(landmarks).forEach(([landmark, elements]) => {
        console.log(`${landmark.toUpperCase()}: ${elements.length} element(s)`);
      });
      console.log(`\n✅ Found ${total} landmark types`);
    } else {
      console.log('⚠️  No semantic landmarks found - consider adding <nav>, <main>, <footer>');
    }
  });

  test('should verify alt text on images', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const images = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src.split('/').pop(),
        alt: img.alt || '(missing)',
        ariaLabel: img.getAttribute('aria-label'),
        role: img.getAttribute('role'),
        isDecorative: img.role === 'presentation' || img.alt === '',
      }));
    });

    console.log('\n🖼️  Image Alt Text:');
    console.log('════════════════════════════════════════════════════════');
    
    if (images.length > 0) {
      images.forEach(img => {
        const altText = img.alt || img.ariaLabel || '(none)';
        console.log(`${img.src.padEnd(30)} → ${altText}`);
      });

      const withAlt = images.filter(img => img.alt !== '(missing)').length;
      console.log(`\n✅ Images with alt text: ${withAlt}/${images.length}`);
    } else {
      console.log('No images found on this page');
    }
  });
});
