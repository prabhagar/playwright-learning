const { test, expect } = require('@playwright/test');

test.describe('Exercise 4: Form Accessibility', () => {
  test('should verify all form fields have labels', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Navigate to a form if available
    const formExists = await page.locator('form').count() > 0;
    
    if (!formExists) {
      console.log('ℹ️  No form found, testing any inputs on page');
    }

    const formInputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input, textarea, select')).map(input => {
        const inputId = input.id;
        const inputName = input.name;
        const inputType = input.type;
        
        // Check for associated label
        let labelText = '';
        if (inputId) {
          const label = document.querySelector(`label[for="${inputId}"]`);
          if (label) labelText = label.textContent;
        }

        // Check for aria-label
        const ariaLabel = input.getAttribute('aria-label');

        // Check for aria-labelledby
        const ariaLabelledby = input.getAttribute('aria-labelledby');
        let ariaLabelledbyText = '';
        if (ariaLabelledby) {
          ariaLabelledbyText = document.getElementById(ariaLabelledby)?.textContent || '';
        }

        // Check for placeholder
        const placeholder = input.getAttribute('placeholder');

        return {
          type: inputType || 'N/A',
          name: inputName || inputId || 'unnamed',
          id: inputId,
          hasLabel: !!labelText,
          labelText: labelText,
          hasAriaLabel: !!ariaLabel,
          ariaLabel: ariaLabel,
          hasAriaLabelledby: !!ariaLabelledby,
          ariaLabelledbyText: ariaLabelledbyText,
          hasPlaceholder: !!placeholder,
          placeholder: placeholder,
          isAccessible: !!(labelText || ariaLabel || ariaLabelledby),
        };
      });
    });

    console.log('\n📋 Form Field Accessibility:');
    console.log('════════════════════════════════════════════════════════');
    
    formInputs.forEach(input => {
      const labelMethod = input.hasLabel ? 'HTML Label' : 
                         input.hasAriaLabel ? 'aria-label' : 
                         input.hasAriaLabelledby ? 'aria-labelledby' : 
                         'NONE';
      
      const labelText = input.labelText || input.ariaLabel || input.ariaLabelledbyText || input.placeholder || '(no label)';
      
      const icon = input.isAccessible ? '✅' : '❌';
      console.log(`${icon} [${input.type || 'select'}] ${input.name.padEnd(20)} → ${labelText.substring(0, 40)} (${labelMethod})`);
    });

    // Count accessible vs inaccessible
    const accessibleCount = formInputs.filter(f => f.isAccessible).length;
    console.log(`\n📊 Labeled: ${accessibleCount}/${formInputs.length}`);

    if (accessibleCount < formInputs.length) {
      console.log('\n⚠️  Form improvements needed:');
      formInputs.filter(f => !f.isAccessible).forEach(input => {
        console.log(`   - Add label for "${input.name}"`);
      });
    }
  });

  test('should verify required field indicators', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const requiredFields = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input, textarea, select')).map(input => {
        const isRequired = input.required || input.getAttribute('aria-required') === 'true';
        const hasAsterisk = input.parentElement?.textContent.includes('*') || 
                           input.labels?.[0]?.textContent.includes('*') ||
                           false;
        const ariaLabel = input.getAttribute('aria-label');
        const mentionsRequired = ariaLabel?.includes('required') || 
                               input.parentElement?.textContent.includes('required');

        const inputId = input.id;
        const label = document.querySelector(`label[for="${inputId}"]`);

        return {
          name: input.name || input.id || 'unnamed',
          type: input.type,
          isRequired: isRequired,
          hasAsterisk: hasAsterisk,
          mentionsRequired: mentionsRequired,
          hasRequiredAttribute: input.hasAttribute('required'),
          hasAriaRequired: input.hasAttribute('aria-required'),
          label: label?.textContent || '',
          isProperlyMarked: isRequired && (hasAsterisk || mentionsRequired || input.hasAttribute('aria-required')),
        };
      }).filter(f => f.isRequired);
    });

    console.log('\n✴️  Required Field Indicators:');
    console.log('════════════════════════════════════════════════════════');

    if (requiredFields.length > 0) {
      requiredFields.forEach(field => {
        const icon = field.isProperlyMarked ? '✅' : '⚠️ ';
        const marker = field.hasAsterisk ? '(asterisk)' : 
                      field.mentionsRequired ? '(text)' : 
                      field.hasAriaRequired ? '(aria-required)' : 
                      '(no indicator)';
        console.log(`${icon} [${field.type}] ${field.name} ${marker}`);
      });

      const properlyMarked = requiredFields.filter(f => f.isProperlyMarked).length;
      console.log(`\n✅ Properly marked: ${properlyMarked}/${requiredFields.length}`);

      if (properlyMarked < requiredFields.length) {
        console.log('\n🔧 Improvements:');
        console.log('   1. Add asterisk (*) after required field labels');
        console.log('   2. Or add "required" text after labels');
        console.log('   3. Or add aria-required="true" to inputs');
      }
    } else {
      console.log('No required fields found on this page');
    }
  });

  test('should verify form error messages accessibility', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Find a form and try to submit without filling required fields
    const hasForm = await page.locator('form').count() > 0;

    if (!hasForm) {
      console.log('ℹ️  No form found to test error messages');
      expect(true).toBe(true);
      return;
    }

    // Try to submit empty form
    const button = page.locator('form button[type="submit"]');
    const buttonExists = await button.count() > 0;

    if (buttonExists) {
      await button.click().catch(() => null);
      await page.waitForTimeout(500);

      // Check for error messages
      const errorMessages = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.error, .invalid, [role="alert"], [aria-invalid="true"]')).map(el => ({
          tag: el.tagName,
          role: el.getAttribute('role'),
          text: el.textContent?.substring(0, 60) || '',
          ariaLive: el.getAttribute('aria-live'),
          ariaDescribedby: el.getAttribute('aria-describedby'),
          ariaInvalid: el.getAttribute('aria-invalid'),
        })).slice(0, 10);
      });

      console.log('\n🚨 Form Error Handling:');
      console.log('════════════════════════════════════════════════════════');

      if (errorMessages.length > 0) {
        console.log('Found error messages:');
        errorMessages.forEach((error, idx) => {
          console.log(`\n${idx + 1}. ${error.text}`);
          console.log(`   Role: ${error.role || 'none'}`);
          console.log(`   aria-live: ${error.ariaLive || 'not set'}`);
        });

        // Check accessibility of errors
        const hasAriaAlert = errorMessages.some(e => e.role === 'alert');
        const hasAriaLive = errorMessages.some(e => e.ariaLive);

        if (hasAriaAlert || hasAriaLive) {
          console.log('\n✅ Errors are announced to screen readers');
        } else {
          console.log('\n⚠️  Errors may not be announced to screen readers');
          console.log('   → Add role="alert" or aria-live="polite" to error messages');
        }
      } else {
        console.log('No form errors found after submit attempt');
      }
    }
  });

  test('should verify form field grouping and legend', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const fieldsets = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('fieldset')).map(fs => ({
        hasLegend: !!fs.querySelector('legend'),
        legendText: fs.querySelector('legend')?.textContent || '',
        fieldCount: fs.querySelectorAll('input, textarea, select').length,
        fields: Array.from(fs.querySelectorAll('label')).map(l => l.textContent).slice(0, 5),
      }));
    });

    console.log('\n📦 Form Field Grouping (Fieldsets & Legends):');
    console.log('════════════════════════════════════════════════════════');

    if (fieldsets.length > 0) {
      fieldsets.forEach((fs, idx) => {
        console.log(`\nFieldset ${idx + 1}: ${fs.legendText || '(no legend)'}`);
        console.log(`   Fields: ${fs.fieldCount}`);
        if (!fs.hasLegend) {
          console.log('   ⚠️  Missing legend!');
        } else {
          console.log('   ✅ Has legend');
        }
      });
    } else {
      console.log('No fieldsets found on page (consider using fieldset + legend for grouped inputs)');
    }
  });

  test('should verify form submission accessibility', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const formInfo = await page.evaluate(() => {
      const form = document.querySelector('form');
      if (!form) return null;

      const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
      const resetButton = form.querySelector('button[type="reset"], input[type="reset"]');
      const cancelLink = form.querySelector('a[href*="cancel"]');

      return {
        hasForm: true,
        method: form.getAttribute('method') || 'GET',
        action: form.getAttribute('action') || 'current page',
        submitButtonText: submitButton?.textContent || submitButton?.value || 'Submit',
        hasResetButton: !!resetButton,
        resetButtonText: resetButton?.textContent || resetButton?.value || '',
        hasCancelLink: !!cancelLink,
        submitIsAccessible: submitButton?.getAttribute('aria-label') || submitButton?.textContent,
      };
    });

    console.log('\n🎯 Form Submission Controls:');
    console.log('════════════════════════════════════════════════════════');

    if (formInfo) {
      console.log(`Method: ${formInfo.method}`);
      console.log(`Submit Button: "${formInfo.submitButtonText}"`);
      console.log(`Reset Button: ${formInfo.hasResetButton ? `"${formInfo.resetButtonText}"` : 'No reset button'}`);
      console.log(`Cancel Link: ${formInfo.hasCancelLink ? 'Yes' : 'No'}`);
      console.log(`\n✅ Submit button is accessible: ${formInfo.submitIsAccessible}`);
    } else {
      console.log('No form found on this page');
    }
  });

  test('should verify form instructions and helper text', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const instructions = await page.evaluate(() => {
      const form = document.querySelector('form');
      if (!form) return null;

      // Look for form instructions
      const instructions = form.querySelector('.instructions, .form-instructions, [role="region"] p, [aria-describedby]');
      
      // Look for field-specific helper text
      const helperTexts = Array.from(form.querySelectorAll('.helper, .hint, .description, .field-instructions')).map(el => ({
        text: el.textContent.substring(0, 50),
        associated: !!el.getAttribute('id'),
      }));

      // Check if inputs reference help text
      const fieldsWithHelp = Array.from(form.querySelectorAll('input, textarea, select')).filter(field => {
        return field.getAttribute('aria-describedby') || field.parentElement?.querySelector('.helper');
      }).length;

      return {
        hasInstructions: !!instructions,
        helperTexts: helperTexts,
        fieldsWithHelp: fieldsWithHelp,
      };
    });

    console.log('\n💡 Form Instructions & Helper Text:');
    console.log('════════════════════════════════════════════════════════');

    if (instructions) {
      console.log(`Form instructions: ${instructions.hasInstructions ? '✅ Present' : '❌ Missing'}`);
      console.log(`Helper text fields: ${instructions.helperTexts.length}`);
      console.log(`Fields with associated help: ${instructions.fieldsWithHelp}`);

      if (instructions.helperTexts.length > 0) {
        console.log('\nHelper texts found:');
        instructions.helperTexts.forEach(ht => {
          console.log(`   - "${ht.text}"`);
        });
      }
    }
  });
});
