// js/organs/thyroid/thyroid-module.js
// Module specific to Thyroid ultrasound reporting.
// Handles UI interactions, data collection, and report formatting for the thyroid.

import { showNotification } from '../../core/ui-core.js';
import { populateForm, getFormData } from '../../core/form-core.js';
import { setupThyroidVolumeCalculations } from '../../modules/volume-calculator.js';
import { setupTiradsCalculationForLesion, updateTiradsDisplay, calculateTiradsScore, getTiradsCategory, getTiradsRecommendation } from '../../modules/tirads-calculator.js'; // Import necessary functions
import { clearImageData } from '../../modules/image-handler.js'; // To clear images when loading template

let lesionCounter = 0; // Counter to give unique IDs to lesions

/**
 * Initializes the thyroid module functionalities:
 * - Sets up volume calculation listeners.
 * - Sets up lesion add/remove button listeners.
 * - Sets up event delegation for dynamic lesion elements.
 */
export function init() {
    console.log("Initializing Thyroid Module...");

    try {
        // Setup volume calculations for lobes
        setupThyroidVolumeCalculations();

        // Setup button listeners
        const addLesionBtn = document.getElementById('add-lesion-btn');
        if (addLesionBtn) {
            addLesionBtn.addEventListener('click', addLesionElement);
        } else {
            console.warn("Add Lesion button not found.");
        }

        // Setup event delegation for removing lesions
        const lesionsContainer = document.getElementById('lesions-container');
        if (lesionsContainer) {
            lesionsContainer.addEventListener('click', (event) => {
                // Check if the clicked element *is* the remove button
                if (event.target.classList.contains('remove-lesion-btn')) {
                    removeLesionElement(event.target);
                }
                // Could add delegation for other dynamic elements here if needed
            });
        } else {
             console.warn("Lesions container not found.");
        }

        console.log("Thyroid Module initialized successfully.");

    } catch (error) {
         console.error("Error during Thyroid Module initialization:", error);
         showNotification("Failed to initialize thyroid module.", "error");
    }
}

/**
 * Adds a new lesion entry section to the form using the HTML template.
 * Also sets up TI-RADS calculations for the new lesion.
 */
function addLesionElement() {
    lesionCounter++;
    const template = document.getElementById('lesion-template');
    const lesionsContainer = document.getElementById('lesions-container');

    if (template && lesionsContainer) {
        // Clone the content of the template tag
        const clone = template.content.cloneNode(true);
        const lesionItem = clone.querySelector('.lesion-item');

        if (lesionItem) {
            const lesionId = `lesion_${lesionCounter}`;
            lesionItem.dataset.lesionId = lesionId; // Set unique ID for reference

            // Update lesion number display
            const numberSpan = lesionItem.querySelector('.lesion-number');
            if (numberSpan) numberSpan.textContent = lesionCounter;

            // Append the new lesion form to the container
            lesionsContainer.appendChild(clone);

            // Setup TI-RADS calculation listeners for the newly added lesion
            // Pass the newly created lesionItem element
            setupTiradsCalculationForLesion(lesionItem);

            showNotification(`Lesion ${lesionCounter} added.`, 'info', 1500);
            // Scroll the new element into view smoothly
            lesionItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            console.error("Could not find '.lesion-item' within the lesion template clone.");
            showNotification("Error: Template structure incorrect.", "error");
        }

    } else {
        console.error("Lesion template or container element not found in the DOM.");
        showNotification("Error: Cannot add lesion form.", "error");
    }
}

/**
 * Removes a lesion entry section from the form after confirmation.
 * @param {HTMLButtonElement} removeButton - The remove button that was clicked.
 */
function removeLesionElement(removeButton) {
    // Find the closest ancestor '.lesion-item' element
    const lesionItem = removeButton.closest('.lesion-item');
    if (lesionItem) {
        const lesionId = lesionItem.dataset.lesionId;
        const lesionNumber = lesionItem.querySelector('.lesion-number')?.textContent || lesionId; // Get display number or ID
        // Confirm before deleting
        if (confirm(`Are you sure you want to remove Lesion ${lesionNumber}?`)) {
            lesionItem.remove(); // Remove the element from the DOM
            showNotification(`Lesion ${lesionNumber} removed.`, 'info', 1500);
            // Note: Renumbering lesions dynamically after removal adds complexity and
            // might not be desired behavior. Current approach keeps original numbers.
            // If renumbering is needed, iterate over remaining .lesion-item elements
            // and update their .lesion-number span text content.
        }
    } else {
         console.warn("Could not find parent lesion item for remove button:", removeButton);
    }
}

/**
 * Collects all data specifically for the thyroid assessment, including dynamic lesions.
 * Attaches the HTML report section formatting method to the returned object.
 * @returns {object} - An object containing all thyroid form data and formatting method.
 */
export function collectThyroidData() {
    // 1. Get basic form data (size, texture, lobes, isthmus, lymph nodes, impression)
    const basicData = getFormData('#thyroid-form');

    // 2. Get data from dynamic lesion elements
    const lesionsData = [];
    const lesionElements = document.querySelectorAll('#lesions-container .lesion-item');

    lesionElements.forEach((lesionElement, index) => {
        const lesionFormData = {};
        // Select all relevant input/select/textarea fields within this lesion item
        // Also include hidden inputs used to store calculated values (like TI-RADS score)
        const fields = lesionElement.querySelectorAll('.lesion-field, input[type="hidden"]');

        fields.forEach(field => {
            const name = field.name;
            if (!name) return; // Skip elements without a name

            // Handle different field types appropriately
            if (field.type === 'select-multiple') {
                lesionFormData[name] = Array.from(field.selectedOptions).map(opt => opt.value);
            } else if (field.type === 'checkbox') {
                 lesionFormData[name] = field.checked;
            } else {
                 // Ensure numeric fields are stored as numbers if possible (optional)
                 // if (field.type === 'number' && field.value !== '') {
                 //     lesionFormData[name] = parseFloat(field.value);
                 // } else {
                    lesionFormData[name] = field.value;
                 // }
            }
        });

        // Add lesion ID and sequential number for reference
        lesionFormData.id = lesionElement.dataset.lesionId;
        lesionFormData.number = index + 1; // Based on current order in DOM
        lesionsData.push(lesionFormData);
    });

    // 3. Combine basic data and lesions data
    const fullData = {
        ...basicData, // Spread basic form data
        lesions: lesionsData, // Add the array of lesion objects
        // ** Crucial: Add the method to format its own report section as HTML **
        formatReportSectionHtml: function() { return formatThyroidReportSectionHtml(this); }
    };

    console.log("Collected full thyroid data (with HTML formatter method):", JSON.stringify(fullData, null, 2)); // Log collected data for debugging
    return fullData;
}

/**
 * Loads template data specifically into the thyroid section.
 * Clears existing lesions, populates static fields, then adds and populates lesions from the template data.
 * @param {object} thyroidTemplateData - The thyroid-specific part of the loaded template data.
 */
export function loadThyroidTemplateData(thyroidTemplateData) {
    if (!thyroidTemplateData) {
         console.warn("No thyroid template data provided to load.");
         return;
    }

    console.log("Loading thyroid template data:", JSON.stringify(thyroidTemplateData, null, 2));

    // 1. Clear existing dynamic content (lesions)
    const lesionsContainer = document.getElementById('lesions-container');
    if (lesionsContainer) lesionsContainer.innerHTML = '';
    lesionCounter = 0; // Reset lesion counter

    // Optional: Clear associated images if templates should be clean slates
    // clearImageData(); // Uncomment if desired

    // 2. Populate the static fields using form-core utility
    // This handles gland size, texture, lobe findings, isthmus, nodes, impression etc.
    populateForm('#thyroid-form', thyroidTemplateData);

    // 3. Re-create and populate lesion elements from the template data
    if (thyroidTemplateData.lesions && Array.isArray(thyroidTemplateData.lesions)) {
        thyroidTemplateData.lesions.forEach(lesionData => {
            addLesionElementAndPopulate(lesionData); // Use helper function
        });
         console.log(`Loaded ${thyroidTemplateData.lesions.length} lesions from template.`);
    } else {
         console.log("No lesions found in the template data to load.");
    }

    // Important: After populating, ensure calculated fields (like volume) are updated
    // Triggering 'input' or 'change' events during populateForm helps,
    // but explicit updates might be needed if populateForm doesn't trigger all listeners.
    // Example: Re-run volume calculation if needed
     document.querySelectorAll('#thyroid-assessment .dimension-group input.dimension').forEach(input => {
         input.dispatchEvent(new Event('input', { bubbles: true })); // Trigger update
     });

}

/**
 * Helper function used by `loadThyroidTemplateData`.
 * Adds a new lesion element based on the template and populates it with data from a template object.
 * @param {object} lesionData - The data object for a single lesion from the template.
 */
function addLesionElementAndPopulate(lesionData) {
     lesionCounter++; // Increment counter for each lesion added
     const template = document.getElementById('lesion-template');
     const lesionsContainer = document.getElementById('lesions-container');

     if (template && lesionsContainer) {
         const clone = template.content.cloneNode(true);
         const lesionItem = clone.querySelector('.lesion-item');

         if (lesionItem) {
             // Use ID from template data if available, otherwise generate one
             const lesionId = lesionData.id || `lesion_${lesionCounter}`;
             lesionItem.dataset.lesionId = lesionId;

             const numberSpan = lesionItem.querySelector('.lesion-number');
             if (numberSpan) numberSpan.textContent = lesionCounter; // Display sequential number

             // Populate the fields within this specific new lesion item
             // Scope populateForm to the newly cloned element for accuracy
             populateForm(lesionItem, lesionData);

             // Append the populated lesion to the container
             lesionsContainer.appendChild(clone);

             // Setup TI-RADS calculation listeners AFTER populating the fields
             setupTiradsCalculationForLesion(lesionItem);
             // ** Explicitly update TI-RADS display after loading data **
             // This ensures score/category/reco reflect the loaded template values
             updateTiradsDisplay(lesionItem);

             console.log(`Added and populated lesion ${lesionCounter} (ID: ${lesionId}) from template data.`);

         } else {
             console.error("Could not find '.lesion-item' within the lesion template clone during population.");
         }
     } else {
         console.error("Lesion template or container not found during population.");
     }
}


/**
 * Formats the FINDINGS section of the report specifically for Thyroid as an HTML string.
 * This function is intended to be called by the method attached to the collected data object.
 * @param {object} data - The collected thyroid data (including lesions array).
 * @returns {string} - Formatted findings section HTML block.
 */
function formatThyroidReportSectionHtml(data) {
     console.log("Formatting Thyroid report section as HTML using data:", data);

     let findings = `<h4>THYROID GLAND:</h4>`;
     findings += `<p><strong>Overall Size:</strong> ${data.overallSize || 'Not assessed'}<br>`;
     findings += `<strong>Echotexture:</strong> ${data.echotexture || 'Not assessed'}<br>`;
     findings += `<strong>Vascularity:</strong> ${data.vascularity || 'Not assessed'}</p>`;

     findings += `<p><strong>Right Lobe:</strong><br>`;
     findings += `&nbsp;&nbsp;Dimensions (WxAPxL): ${data.rightLobeD1 || '?'} x ${data.rightLobeD2 || '?'} x ${data.rightLobeD3 || '?'} mm<br>`;
     findings += `&nbsp;&nbsp;Volume: ${data.rightLobeVolume !== undefined && data.rightLobeVolume !== '' ? data.rightLobeVolume + ' mL' : 'Not calculated'}<br>`;
     findings += `&nbsp;&nbsp;Findings: ${data.rightLobeFindings ? data.rightLobeFindings.replace(/\n/g, '<br>&nbsp;&nbsp;') : 'Unremarkable appearance.'}</p>`;

     findings += `<p><strong>Left Lobe:</strong><br>`;
     findings += `&nbsp;&nbsp;Dimensions (WxAPxL): ${data.leftLobeD1 || '?'} x ${data.leftLobeD2 || '?'} x ${data.leftLobeD3 || '?'} mm<br>`;
     findings += `&nbsp;&nbsp;Volume: ${data.leftLobeVolume !== undefined && data.leftLobeVolume !== '' ? data.leftLobeVolume + ' mL' : 'Not calculated'}<br>`;
     findings += `&nbsp;&nbsp;Findings: ${data.leftLobeFindings ? data.leftLobeFindings.replace(/\n/g, '<br>&nbsp;&nbsp;') : 'Unremarkable appearance.'}</p>`;

     findings += `<p><strong>Isthmus:</strong><br>`;
     findings += `&nbsp;&nbsp;AP Thickness: ${data.isthmusThickness ? data.isthmusThickness + ' mm' : 'Not measured'}<br>`;
     findings += `&nbsp;&nbsp;Findings: ${data.isthmusFindings ? data.isthmusFindings.replace(/\n/g, '<br>&nbsp;&nbsp;') : 'Unremarkable appearance.'}</p>`;

    findings += `<h4>FOCAL LESIONS:</h4>`;
    if (data.lesions && data.lesions.length > 0) {
        data.lesions.forEach((lesion, index) => {
            // Get descriptive text for TI-RADS features using the helper
            const compositionText = getTiradsFeatureText('Composition', lesion.lesionComposition);
            const echogenicityText = getTiradsFeatureText('Echogenicity', lesion.lesionEchogenicity);
            const shapeText = getTiradsFeatureText('Shape', lesion.lesionShape);
            const marginText = getTiradsFeatureText('Margin', lesion.lesionMargin);
            // Handle multiple foci selections correctly
            const fociValues = Array.isArray(lesion.lesionEchogenicFoci) ? lesion.lesionEchogenicFoci : [lesion.lesionEchogenicFoci];
            const fociTexts = fociValues
                .map(f => getTiradsFeatureText('EchogenicFoci', f))
                .filter(text => text && text !== 'N/A' && text !== 'None or Large comet-tail artifacts') // Filter out 'none' if other foci exist
                .join(', ');

            findings += `<div class="report-lesion-item">`; // Add class for potential styling
            findings += `<strong>Lesion #${index + 1}:</strong><br>`; // Use index+1 for display number
            findings += `&nbsp;&nbsp;Location: ${lesion.lesionLocation || 'N/A'}<br>`;
            findings += `&nbsp;&nbsp;Dimensions: ${lesion.lesionD1 || '?'} x ${lesion.lesionD2 || '?'} x ${lesion.lesionD3 || '?'} mm<br>`;
            findings += `&nbsp;&nbsp;Composition: ${compositionText}<br>`;
            findings += `&nbsp;&nbsp;Echogenicity: ${echogenicityText}<br>`;
            findings += `&nbsp;&nbsp;Shape: ${shapeText}<br>`;
            findings += `&nbsp;&nbsp;Margin: ${marginText}<br>`;
            findings += `&nbsp;&nbsp;Echogenic Foci: ${fociTexts || 'None'}<br>`; // Display "None" if array was empty after filtering
            findings += `&nbsp;&nbsp;Description: ${lesion.lesionDescription ? lesion.lesionDescription.replace(/\n/g, '<br>&nbsp;&nbsp;') : 'N/A'}<br>`;
            // Use stored calculated values if available
            findings += `&nbsp;&nbsp;ACR TI-RADS: ${lesion.tiradsCategory || 'N/A'} (Score: ${lesion.tiradsScore !== undefined ? lesion.tiradsScore : 'N/A'})<br>`;
            findings += `&nbsp;&nbsp;Recommendation: ${lesion.tiradsRecommendation || 'N/A'}`;
            findings += `</div>`;
        });
    } else {
        findings += `<p>No discrete focal lesions identified.</p>`;
    }

    findings += `<h4>REGIONAL LYMPH NODES:</h4>`;
    findings += `<p>${data.lymphNodes ? data.lymphNodes.replace(/\n/g, '<br>') : 'No suspicious cervical lymphadenopathy identified.'}</p>`;

    return findings;
}

/**
 * Helper function to get descriptive text for TI-RADS feature point values.
 * This mapping should ideally match the options presented in the lesion template HTML.
 * @param {string} featureType - Category like 'Composition', 'Echogenicity', etc.
 * @param {string|number} value - The point value (e.g., '0', '1', '2', '3') from the form selection.
 * @returns {string} - Descriptive text corresponding to the value.
 */
function getTiradsFeatureText(featureType, value) {
    // Ensure value is treated as a string for consistent key lookup
    const stringValue = String(value);

     const map = {
         Composition: {
             '0': 'Cystic / Spongiform',
             '1': 'Mixed cystic and solid',
             '2': 'Solid or almost completely solid'
         },
         Echogenicity: {
             '0': 'Anechoic',
             '1': 'Hyperechoic or Isoechoic',
             '2': 'Hypoechoic',
             '3': 'Very hypoechoic'
         },
         Shape: {
             '0': 'Wider-than-tall',
             '3': 'Taller-than-wide'
         },
         Margin: {
              '0': 'Smooth or Ill-defined',
              '2': 'Lobulated or Irregular',
              '3': 'Extra-thyroidal extension'
         },
         EchogenicFoci: {
              '0': 'None or Large comet-tail artifacts',
              '1': 'Macrocalcifications / Peripheral (rim) calcifications',
              '2': 'Punctate echogenic foci (PEF)',
              // No '3' points for foci in standard ACR TI-RADS V1
         }
     };

     if (map[featureType] && map[featureType][stringValue] !== undefined) {
         return map[featureType][stringValue];
     }
     // Return a default or the value itself if no mapping found
     return stringValue || 'N/A';
}

// Note: This module doesn't export the 'thyroidModule' object directly anymore.
// Instead, main.js imports and calls the exported 'init' function.
// Other functions like 'collectThyroidData' and 'loadThyroidTemplateData'
// are imported directly by core modules (report-core, template-core) when needed.