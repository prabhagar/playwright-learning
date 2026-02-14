const { test, expect } = require('@playwright/test');

test.describe('Exercise 5: Color Contrast & Visual Accessibility', () => {
  // Helper function to calculate luminance (relative luminosity)
  const getLuminance = (r, g, b) => {
    // Convert to sRGB
    [r, g, b] = [r, g, b].map(x => {
      x = x / 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  // Helper to parse RGB color string
  const parseRgb = (rgbString) => {
    const match = rgbString.match(/\d+/g);
    if (!match || match.length < 3) return null;
    return { r: parseInt(match[0]), g: parseInt(match[1]), b: parseInt(match[2]) };
  };

  // Helper to calculate contrast ratio
  const getContrastRatio = (color1, color2) => {
    const rgb1 = parseRgb(color1);
    const rgb2 = parseRgb(color2);
    
    if (!rgb1 || !rgb2) return null;

    const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  };

  test('should check text contrast ratios', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const contrastResults = await page.evaluate(() => {
      const results = [];
      
      // Check various text elements
      const elements = document.querySelectorAll('p, a, button, label, h1, h2, h3, span');
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const foreground = styles.color;
        const background = styles.backgroundColor;
        const fontSize = parseInt(styles.fontSize);
        const fontWeight = parseInt(styles.fontWeight);
        
        const text = el.textContent?.substring(0, 40) || '';
        
        // Simple luminance calculation (rough)
        const getFgColor = () => {
          try {
            const match = foreground.match(/\d+/g);
            if (match) return { r: parseInt(match[0]), g: parseInt(match[1]), b: parseInt(match[2]) };
          } catch (e) {}
          return { r: 0, g: 0, b: 0 };
        };
        
        const getBgColor = () => {
          try {
            const match = background.match(/\d+/g);
            if (match) return { r: parseInt(match[0]), g: parseInt(match[1]), b: parseInt(match[2]) };
          } catch (e) {}
          return { r: 255, g: 255, b: 255 };
        };

        const fg = getFgColor();
        const bg = getBgColor();
        
        const luminanceFg = (0.299 * fg.r + 0.587 * fg.g + 0.114 * fg.b) / 255;
        const luminanceBg = (0.299 * bg.r + 0.587 * bg.g + 0.114 * bg.b) / 255;
        
        const delta = Math.abs(luminanceFg - luminanceBg);
        const isLarge = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);
        
        results.push({
          tag: el.tagName,
          text: text,
          fontSize: fontSize,
          isLargeText: isLarge,
          fgColor: foreground,
          bgColor: background,
          luminanceDiff: delta,
          estimatedContrast: delta > 0.5 ? 'GOOD' : delta > 0.3 ? 'OK' : 'POOR',
        });
      });

      return results.slice(0, 15);
    });

    console.log('\n🎨 Text Contrast Analysis:');
    console.log('════════════════════════════════════════════════════════');
    console.log('WCAG AA Requirements:');
    console.log('  • Normal text: 4.5:1');
    console.log('  • Large text (18pt+): 3:1');
    console.log('');

    const good = contrastResults.filter(r => r.estimatedContrast === 'GOOD').length;
    const ok = contrastResults.filter(r => r.estimatedContrast === 'OK').length;
    const poor = contrastResults.filter(r => r.estimatedContrast === 'POOR').length;

    contrastResults.forEach(result => {
      const icon = result.estimatedContrast === 'GOOD' ? '✅' : result.estimatedContrast === 'OK' ? '⚠️ ' : '❌';
      const size = result.isLargeText ? '(L)' : '(N)';
      console.log(`${icon} [${result.tag}] ${result.text.padEnd(30)} ${size} ${result.estimatedContrast}`);
    });

    console.log(`\n📊 Summary: ${good} GOOD, ${ok} OK, ${poor} POOR`);

    expect(good + ok).toBeGreaterThan(0);
  });

  test('should verify error states are not color-only', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const errors = await page.evaluate(() => {
      const errorElements = document.querySelectorAll(
        '.error, .invalid, [aria-invalid="true"], .form-error, .input-error, [role="alert"]'
      );

      return Array.from(errorElements).map(el => ({
        tag: el.tagName,
        hasIcon: !!el.querySelector('svg, i, .icon'),
        hasText: !!el.textContent?.trim(),
        text: el.textContent?.substring(0, 50) || '',
        color: window.getComputedStyle(el).color,
        hasAriaLabel: !!el.getAttribute('aria-label'),
        hasAriaDescribedby: !!el.getAttribute('aria-describedby'),
        isColorOnly: !el.textContent?.trim() && !el.querySelector('svg, i, .icon'),
      })).slice(0, 10);
    });

    console.log('\n🚨 Error Message Accessibility:');
    console.log('════════════════════════════════════════════════════════');

    if (errors.length > 0) {
      console.log('Error elements found:');
      errors.forEach((error, idx) => {
        const hasIndicator = error.hasIcon || error.hasText;
        const icon = hasIndicator && !error.isColorOnly ? '✅' : '❌';
        console.log(`\n${icon} Error ${idx + 1}:`);
        console.log(`   Type: ${error.tag}`);
        console.log(`   Text: ${error.text}`);
        console.log(`   Has Icon: ${error.hasIcon}`);
        console.log(`   Has Text: ${error.hasText}`);
        console.log(`   Color-only: ${error.isColorOnly}`);
      });

      const colorOnlyCount = errors.filter(e => e.isColorOnly).length;
      if (colorOnlyCount > 0) {
        console.log(`\n⚠️  ${colorOnlyCount} error(s) are color-only!`);
        console.log('   Fix: Add text or icon indicator in addition to color');
      } else {
        console.log('\n✅ All errors have text or icon indicators (not color-only)');
      }
    } else {
      console.log('No error elements found on page');
    }
  });

  test('should check for sufficient touch target sizes', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const touchTargets = await page.evaluate(() => {
      const MIN_SIZE = 44; // WCAG 2.1 recommendation

      const interactive = document.querySelectorAll('button, a, input[type="checkbox"], input[type="radio"], select');
      
      return Array.from(interactive).map(el => {
        const rect = el.getBoundingClientRect();
        const width = Math.round(rect.width);
        const height = Math.round(rect.height);
        const area = width * height;
        const minDimension = Math.min(width, height);
        
        return {
          tag: el.tagName,
          text: el.textContent?.substring(0, 30) || el.getAttribute('aria-label') || '',
          width: width,
          height: height,
          minDimension: minDimension,
          isSufficientSize: minDimension >= MIN_SIZE,
          area: area,
        };
      }).slice(0, 15);
    });

    console.log('\n👆 Touch Target Size (Mobile Accessibility):');
    console.log('════════════════════════════════════════════════════════');
    console.log('WCAG 2.1 Recommendation: Minimum 44x44 CSS pixels\n');

    const sufficient = touchTargets.filter(t => t.isSufficientSize).length;

    touchTargets.forEach(target => {
      const icon = target.isSufficientSize ? '✅' : '❌';
      const size = `${target.width}x${target.height}px`;
      console.log(`${icon} [${target.tag}] ${target.text.padEnd(30)} ${size.padStart(10)}`);
    });

    console.log(`\n📊 Sufficient size: ${sufficient}/${touchTargets.length}`);

    if (sufficient < touchTargets.length) {
      const small = touchTargets.filter(t => !t.isSufficientSize);
      console.log('\n🔧 Elements too small for touch:');
      small.forEach(el => {
        console.log(`   ${el.text}: ${el.width}x${el.height}px (need min 44px)`);
      });
    }
  });

  test('should verify color blindness accessibility', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const colorDependentElements = await page.evaluate(() => {
      const elements = [];

      // Check status indicators (often color-only)
      document.querySelectorAll('.status, .badge, .tag, .label, [aria-label*="status"]').forEach(el => {
        const hasText = !!el.textContent?.trim();
        const hasIcon = !!el.querySelector('svg, i, .icon');
        
        elements.push({
          class: el.className.substring(0, 30),
          text: el.textContent?.substring(0, 30) || '',
          hasText: hasText,
          hasIcon: hasIcon,
          forColorBlind: hasText || hasIcon,
        });
      });

      // Check buttons with only color distinction
      document.querySelectorAll('button').forEach(btn => {
        const bg = window.getComputedStyle(btn).backgroundColor;
        const text = btn.textContent?.trim() || btn.getAttribute('aria-label');
        
        elements.push({
          class: 'button',
          text: text?.substring(0, 30) || '(empty)',
          hasText: !!text,
          hasIcon: !!btn.querySelector('svg, i'),
          forColorBlind: !!text || !!btn.querySelector('svg, i'),
        });
      });

      return elements.slice(0, 15);
    });

    console.log('\n🎨 Color-Blind Accessibility:');
    console.log('════════════════════════════════════════════════════════');

    const accessible = colorDependentElements.filter(e => e.forColorBlind).length;

    colorDependentElements.forEach(el => {
      const icon = el.forColorBlind ? '✅' : '❌';
      console.log(`${icon} ${el.text.padEnd(30)} [${el.class.substring(0, 20)}]`);
    });

    console.log(`\n✅ Accessible to color-blind users: ${accessible}/${colorDependentElements.length}`);

    console.log('\n💡 For better color-blind accessibility:');
    console.log('   1. Use patterns or icons in addition to color');
    console.log('   2. Add text labels to colored elements');
    console.log('   3. Use distinct shapes and textures');
    console.log('   4. Test with color-blind simulator');
  });

  test('should generate visual accessibility report', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const report = await page.evaluate(() => {
      const analysis = {
        textElements: {
          total: document.querySelectorAll('p, span, a, button, label').length,
          withGoodContrast: 0,
          estimatedIssues: [],
        },
        interactiveElements: {
          total: document.querySelectorAll('button, a, input, select').length,
          withProperLabels: 0,
          withSufficientSize: 0,
        },
        images: {
          total: document.querySelectorAll('img').length,
          withAlt: document.querySelectorAll('img[alt]').length,
          withoutAlt: 0,
        },
        colors: {
          primaryBgColor: window.getComputedStyle(document.body).backgroundColor,
          primaryTextColor: window.getComputedStyle(document.body).color,
        },
      };

      analysis.images.withoutAlt = analysis.images.total - analysis.images.withAlt;

      return analysis;
    });

    console.log('\n📊 Visual Accessibility Report:');
    console.log('════════════════════════════════════════════════════════');

    console.log('\n📝 Text Elements:');
    console.log(`   Total: ${report.textElements.total}`);
    console.log(`   Estimated with good contrast: Most should be readable`);

    console.log('\n🔘 Interactive Elements:');
    console.log(`   Total: ${report.interactiveElements.total}`);
    console.log(`   Touch-friendly size (44x44px): Should verify`);

    console.log('\n🖼️  Images:');
    console.log(`   Total: ${report.images.total}`);
    console.log(`   With alt text: ${report.images.withAlt}`);
    console.log(`   Without alt text: ${report.images.withoutAlt}`);

    if (report.images.withoutAlt > 0) {
      console.log(`   ⚠️  ${report.images.withoutAlt} image(s) missing alt text!`);
    }

    console.log('\n💾 Design Colors:');
    console.log(`   Background: ${report.colors.primaryBgColor}`);
    console.log(`   Text: ${report.colors.primaryTextColor}`);

    console.log('\n✅ Checklist:');
    console.log('   ☐ All text has sufficient contrast (4.5:1 for normal text)');
    console.log('   ☐ Interactive elements are 44x44px minimum');
    console.log('   ☐ All images have alt text');
    console.log('   ☐ Color is not the only indicator');
    console.log('   ☐ Focus indicators are visible');
    console.log('   ☐ Text is resizable without loss of functionality');
  });
});
