// js/core/form-core.js
// Provides basic form handling utilities.

/**
 * Validates a single form field (example).
 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} field - The form field element.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function validateField(field) {
    // Basic required check (can be expanded)
    if (field.required && !field.value.trim()) {
        // console.warn(`Validation failed: Field ${field.name || field.id} is required.`);
        field.style.borderColor = 'red';
        return false;
    }
    // Add other checks like pattern, min/max length etc.
    field.style.borderColor = ''; // Reset border color if valid
    return true;
}

/**
 * Validates all required fields within a form or container.
 * @param {string | HTMLElement} containerSelectorOrElement - A CSS selector for the container or the element itself.
 * @returns {boolean} - True if all required fields are valid, false otherwise.
 */
export function validateForm(containerSelectorOrElement) {
    const container = typeof containerSelectorOrElement === 'string'
        ? document.querySelector(containerSelectorOrElement)
        : containerSelectorOrElement;

    if (!container) {
        console.error("[validateForm] Validation failed: Container element not found.");
        return false;
    }

    let isValid = true;
    // Query for elements that might have validation rules (e.g., required)
    const fieldsToValidate = container.querySelectorAll('input[required], select[required], textarea[required]');

    fieldsToValidate.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });

    // console.log(`[validateForm] Validation result for ${container.id || 'container'}: ${isValid}`);
    return isValid;
}

/**
 * Checks if a value is within a normal range (example).
 * @param {number} value - The value to check.
 * @param {number} min - The minimum normal value.
 * @param {number} max - The maximum normal value.
 * @returns {boolean} - True if within range.
 */
export function checkNormalRange(value, min, max) {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return false; // Not a number
    return numValue >= min && numValue <= max;
}

/**
 * Populates form fields within a container element with data from an object.
 * Matches object keys to form field 'name' attributes using querySelector.
 * Handles inputs, selects, textareas, checkboxes, radios.
 * @param {string | HTMLElement} containerSelectorOrElement - The container selector or element (can be a form or any other element like a DIV).
 * @param {object} data - The data object.
 * @param {object} [options] - Optional settings.
 * @param {boolean} [options.dispatchEvents=true] - Whether to dispatch 'change' and 'input' events after setting values.
 */
export function populateForm(containerSelectorOrElement, data, options = {}) {
    const container = typeof containerSelectorOrElement === 'string'
        ? document.querySelector(containerSelectorOrElement)
        : containerSelectorOrElement;

    if (!container || typeof data !== 'object' || data === null) {
        console.error("[populateForm] Cannot populate form. Invalid container element or data provided.", { container: containerSelectorOrElement, data });
        return; // Stop execution if container or data is invalid
    }

    const dispatchEvents = options.dispatchEvents !== false; // Default to true

    console.log(`[populateForm] Populating container '${container.id || container.tagName}' with data (dispatchEvents: ${dispatchEvents}):`, JSON.parse(JSON.stringify(data))); // Log a copy to avoid showing mutated data if happens elsewhere

    for (const key in data) {
        // Only process own properties of the data object
        if (Object.prototype.hasOwnProperty.call(data, key)) {

            // *** FIX: Use querySelector scoped within the container. Do NOT use .elements ***
            // This finds the first element within the container matching the name.
            const field = container.querySelector(`[name="${key}"]`);

            // Proceed only if a field with that name is found within the container
            if (field) {
                // Wrap assignment in try/catch for detailed error logging per field
                try {
                    const value = data[key];
                    // Log exactly what is about to be set
                    console.debug(`[populateForm] Attempting assignment for key "${key}" | Field found: [Name: ${field.name}, Type: ${field.type}, Tag: ${field.tagName}] | Value:`, value);

                    // Handle different field types
                    if (field.type === 'checkbox') {
                        field.checked = Boolean(value);
                    } else if (field.type === 'radio') {
                        // For radios, query specifically for the one with the matching value within the container
                        const radioToSelect = container.querySelector(`input[name="${key}"][value="${value}"]`);
                        if (radioToSelect) {
                            radioToSelect.checked = true;
                        } else {
                            // Uncheck all radios in the group if the value doesn't match any
                            container.querySelectorAll(`input[name="${key}"]`).forEach(r => r.checked = false);
                            // console.warn(`[populateForm] Radio value "${value}" not found for name "${key}". Unchecking group.`);
                        }
                    } else if (field.tagName === 'SELECT' && field.multiple) {
                        // Handle multi-select
                        if (Array.isArray(value)) {
                            const options = field.options;
                            // console.debug(`[populateForm] Setting multi-select '${key}'. Data values:`, value);
                            for (let i = 0; i < options.length; i++) {
                                // Check if the current option's value exists in the data array
                                options[i].selected = value.includes(options[i].value);
                                // console.debug(`  Option value: ${options[i].value}, Included in data: ${value.includes(options[i].value)}, Selected: ${options[i].selected}`);
                            }
                        } else {
                            // console.warn(`[populateForm] Data for multi-select '${key}' is not an array. Clearing selection. Data:`, value);
                            Array.from(field.options).forEach(opt => opt.selected = false);
                        }
                    } else {
                        // Standard input, select-one, textarea, hidden etc.
                        // Ensure value is not null/undefined before assigning
                        field.value = value !== null && value !== undefined ? value : '';
                    }

                    // Conditionally dispatch events AFTER value assignment attempt
                    if (dispatchEvents) {
                        // console.debug(`[populateForm] Dispatching events for key "${key}"`);
                        field.dispatchEvent(new Event('change', { bubbles: true }));
                        field.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                } catch (error) {
                    // Log the specific key/value/field that caused the error
                    console.error(`[populateForm] CRITICAL ERROR processing key "${key}" with value:`, data?.[key], ` for field:`, field, ` | Error:`, error);
                    // Re-throw the error to make it visible in the call stack and potentially stop further processing
                    throw error;
                }
            } else {
                // Log warning if field not found, excluding expected non-field keys
                if (key !== 'lesions' && key !== 'id' && key !== 'number' && key !== 'formatReportSectionHtml') {
                    // console.warn(`[populateForm] Form field with name '${key}' not found in container '${container.id || container.tagName}'.`);
                }
            }
        } // end hasOwnProperty
    } // end for..in loop
    // console.log(`[populateForm] Finished populating container '${container.id || container.tagName}'.`);
}


/**
 * Gathers data from form fields within a container element into an object.
 * Uses querySelectorAll to find named elements within the container.
 * @param {string | HTMLElement} containerSelectorOrElement - The container selector or element.
 * @returns {object} - An object containing form data {fieldName: value}.
 */
export function getFormData(containerSelectorOrElement) {
    const container = typeof containerSelectorOrElement === 'string'
        ? document.querySelector(containerSelectorOrElement)
        : containerSelectorOrElement;

    if (!container) {
        console.error("[getFormData] Cannot get form data. Container element not found for selector:", containerSelectorOrElement);
        return {};
    }

    const formData = {};
    // Query all relevant, named form elements *within the specific container*
    const elements = container.querySelectorAll('input[name], select[name], textarea[name]');

    elements.forEach(field => {
        const name = field.name;

        // Skip disabled, buttons, or elements inside a nested template tag
        if (field.disabled || field.type === 'button' || field.type === 'submit' || field.type === 'reset' || field.tagName === 'FIELDSET' || field.closest('template')) {
            return; // continue to next element in forEach
        }

        switch (field.type) {
            case 'checkbox':
                formData[name] = field.checked;
                break;
            case 'radio':
                if (field.checked) {
                    formData[name] = field.value;
                } else if (!formData.hasOwnProperty(name)) {
                    // Initialize key if no radio in the group is checked yet
                    formData[name] = null;
                }
                break;
            case 'select-multiple':
                // Ensure field is treated as the select element itself
                const selectedOptions = [];
                if (field.tagName === 'SELECT') {
                    for (let j = 0; j < field.options.length; j++) {
                        if (field.options[j].selected) {
                            selectedOptions.push(field.options[j].value);
                        }
                    }
                }
                formData[name] = selectedOptions;
                break;
            case 'file':
                // Skip file inputs
                break;
            default: // text, number, date, textarea, select-one, hidden, password, email, url, tel, search, color
                if (field.type !== 'radio') { // Avoid overwriting checked radio value
                     formData[name] = field.value;
                }
        }
    });
    // console.log(`[getFormData] Data gathered from container '${container.id || container.tagName}':`, formData);
    return formData;
}

console.log("form-core.js loaded v4");