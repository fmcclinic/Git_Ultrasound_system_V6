// js/core/template-core.js (ADAPTED for Echocardiogram Project)
// Manages saving, loading, and deleting report templates using localStorage for ECHOCARDIOGRAM reports.

import { showNotification } from './ui-core.js';
import { populateForm } from './form-core.js'; // Used indirectly by load function
// ** Import Echo presets and module loader function **
// === UPDATED IMPORTS ===
import { echoPresets } from '../organs/echo/echo-presets.js'; // <-- CHANGE: Import echo presets
import { loadEchoTemplateData } from '../organs/echo/echo-module.js'; // <-- CHANGE: Import echo template loader

// ** Use a different storage key specific to the echo project **
// === UPDATED STORAGE KEY ===
const TEMPLATE_STORAGE_KEY = 'echocardiogramTemplates_v1'; // <-- CHANGE: Unique key
const PRESET_INDICATOR = '[Preset] '; // Indicator remains the same

/**
 * Initializes the template system UI elements (dropdowns, buttons).
 * (No changes needed inside this function itself, it calls the adapted helpers)
 */
export function initTemplateSystem() {
    const saveBtn = document.getElementById('save-template-btn');
    const loadBtn = document.getElementById('load-template-btn');
    const deleteBtn = document.getElementById('delete-template-btn');
    const templateSelect = document.getElementById('load-template-select');
    const templateNameInput = document.getElementById('template-name');

    if (!templateSelect) {
        // === UPDATED Log ===
        console.warn("[TemplateCore - Echo] Template select dropdown ('#load-template-select') not found. Loading/Deleting disabled.");
    }

    if (saveBtn && templateNameInput) {
        saveBtn.addEventListener('click', () => {
            const name = templateNameInput.value.trim();
            if (name && !name.startsWith(PRESET_INDICATOR)) {
                // Calls the adapted collectAndSaveTemplate for echo
                collectAndSaveTemplate(name); // <-- Will call adapted version
            } else {
                showNotification('Please enter a valid template name (cannot start with "[Preset] ").', 'error');
            }
        });
    } else {
         // === UPDATED Log ===
         console.error("[TemplateCore - Echo] Save button or template name input not found.");
    }

    // Only add listeners if the elements exist
    if (loadBtn && templateSelect) {
        loadBtn.addEventListener('click', () => {
            const selectedValue = templateSelect.value;
            if (selectedValue) {
                 // Calls the adapted loadTemplate for echo
                loadTemplate(selectedValue); // <-- Will call adapted version
            } else {
                showNotification('Please select a template to load.', 'info');
            }
        });
    } else if (!loadBtn && templateSelect) {
         // === UPDATED Log ===
         console.warn("[TemplateCore - Echo] Load button ('#load-template-btn') not found.");
    }


    if (deleteBtn && templateSelect) {
        deleteBtn.addEventListener('click', () => {
            const selectedValue = templateSelect.value;
            if (selectedValue && !selectedValue.startsWith(PRESET_INDICATOR)) {
                if (confirm(`Are you sure you want to delete the template "${selectedValue}"?`)) {
                    // Calls the standard deleteTemplate (uses correct storage key)
                    deleteTemplate(selectedValue);
                }
            } else if (selectedValue.startsWith(PRESET_INDICATOR)) {
                showNotification('Preset templates cannot be deleted.', 'info');
            } else {
                 showNotification('Please select a user-saved template to delete.', 'info');
            }
        });
    } else if (!deleteBtn && templateSelect) {
         // === UPDATED Log ===
        console.warn("[TemplateCore - Echo] Delete button ('#delete-template-btn') not found.");
    }

    // Initial population of the select dropdown using echo presets
    populateTemplateDropdown(); // <-- Will call adapted version
    // === UPDATED Log ===
    console.log("[TemplateCore - Echo] Template system UI initialized.");
}

/**
 * Collects data from the echo module and saves it as a template. (ADAPTED)
 * @param {string} name - The name for the template.
 */
async function collectAndSaveTemplate(name) {
    // === UPDATED Log ===
    console.log(`[TemplateCore - Echo] Attempting to save template: ${name}`);
    try {
        // ** Directly import and call echo data collector **
        // Path is relative to template-core.js
        // === UPDATED Import Path and Function Call ===
        const { collectEchoData } = await import('../organs/echo/echo-module.js'); // <-- CHANGE
        const fullEchoData = collectEchoData(); // Get current echo form data <-- CHANGE

        if (!fullEchoData) {
             // === UPDATED Error Message ===
             throw new Error("Failed to collect echocardiogram data for template."); // <-- CHANGE
        }

        // Structure template data with 'echo' key
        // IMPORTANT: Store only the data part, not the formatter function
        const { formatReportSectionHtml, ...dataToStore } = fullEchoData;

        const templateData = {
            // === UPDATED Data Key ===
            echo: dataToStore, // <-- Store structured data under 'echo' key
            metadata: {
                name: name,
                createdAt: new Date().toISOString(),
                // === UPDATED Organ Type ===
                organ: 'echo', // Clearly mark as an echo template <-- CHANGE
                version: '1.0' // Optional versioning
            }
        };

        // Use the generic save function (which uses the correct storage key)
        saveTemplate(name, templateData);

        // Clear the name input after successful save attempt
        const templateNameInput = document.getElementById('template-name');
        if(templateNameInput) templateNameInput.value = '';

    } catch (error) {
        // === UPDATED Log ===
        console.error("[TemplateCore - Echo] Error collecting/saving template:", error);
        showNotification(`Failed to save template: ${error.message}`, 'error');
    }
}


/**
 * Retrieves all saved templates from localStorage (using the echo-specific key).
 * (No changes needed inside, uses the TEMPLATE_STORAGE_KEY constant)
 * @returns {object} - An object where keys are template names and values are template data.
 */
function getSavedTemplates() {
    const storedTemplates = localStorage.getItem(TEMPLATE_STORAGE_KEY); // Uses the echo-specific key
    try {
        return storedTemplates ? JSON.parse(storedTemplates) : {};
    } catch (e) {
         // === UPDATED Log ===
        console.error("[TemplateCore - Echo] Error parsing templates from localStorage:", e);
        return {}; // Return empty object on error
    }
}

/**
 * Saves a template to localStorage. (ADAPTED Check)
 * @param {string} name - The name of the template.
 * @param {object} data - The template data object to save (should have `echo` key).
 */
export function saveTemplate(name, data) { // Exporting allows import function to use it
    if (!name || typeof data !== 'object') {
         // === UPDATED Log ===
        console.error("[TemplateCore - Echo] Invalid template name or data for saving.");
        showNotification('Failed to save template: Invalid name or data.', 'error');
        return;
    }
    // === UPDATED Check: Ensure it has 'echo' key or correct metadata ===
     if (!data.echo && data.metadata?.organ !== 'echo') { // <-- CHANGE Check 'echo' key
        console.warn("[TemplateCore - Echo] Saving template with potentially incorrect structure (missing 'echo' key or wrong metadata):", data); // <-- CHANGE
        // Decide if you want to prevent saving templates without the 'echo' key
        // showNotification('Template data format must include an "echo" key.', 'error'); // <-- CHANGE
        // return; // Uncomment to enforce strict structure
     }

    const templates = getSavedTemplates(); // Uses echo key

    if (name.startsWith(PRESET_INDICATOR)) {
        showNotification('Cannot overwrite preset templates.', 'error');
        return;
    }

    if (templates[name]) {
        if (!confirm(`Template "${name}" already exists. Overwrite?`)) {
            return; // User cancelled overwrite
        }
         // === UPDATED Log ===
         console.log(`[TemplateCore - Echo] Overwriting existing template: ${name}`);
    }

    templates[name] = data;

    try {
        localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates)); // Uses the echo-specific key
        showNotification(`Template "${name}" saved successfully.`, 'success');
        populateTemplateDropdown(); // Update the dropdown
    } catch (e) {
         // === UPDATED Log ===
        console.error("[TemplateCore - Echo] Error saving templates to localStorage:", e);
        if (e.name === 'QuotaExceededError') {
             showNotification('Failed to save template: Storage quota exceeded.', 'error', 5000);
        } else {
             showNotification('Failed to save template to storage.', 'error');
        }
    }
}

/**
 * Loads a template and populates the echo form. (ADAPTED)
 * @param {string} name - The name of the template to load (can include [Preset] prefix).
 */
export async function loadTemplate(name) { // Changed to export async
    let templateDataContainer; // The object containing { echo: {...}, metadata: {...} } or just { echo: {...} } for presets
    let isPreset = name.startsWith(PRESET_INDICATOR);
    let actualName = isPreset ? name.substring(PRESET_INDICATOR.length) : name;
    let dataSource = isPreset ? "Preset" : "User Saved";

     // === UPDATED Log ===
    console.log(`[TemplateCore - Echo] Attempting to load ${dataSource} template: ${actualName}`);

    if (isPreset) {
        // ** Find in echoPresets **
        // === UPDATED Preset Source Check ===
        if (typeof echoPresets !== 'undefined' && Array.isArray(echoPresets)) { // <-- CHANGE Check echoPresets
            templateDataContainer = echoPresets.find(p => p.name === actualName)?.data; // Find the preset data <-- CHANGE
        } else {
              // === UPDATED Log ===
             console.error("[TemplateCore - Echo] echoPresets is not loaded or not an array."); // <-- CHANGE
             showNotification("Error: Preset data is missing.", "error");
             return;
        }
    } else {
        const templates = getSavedTemplates(); // Uses echo key
        templateDataContainer = templates[actualName]; // Get the container object { echo: ..., metadata: ... }
    }

    if (templateDataContainer) {
        // ** Extract the 'echo' data specifically **
        // === UPDATED Data Key Extraction ===
        const echoDataToLoad = templateDataContainer.echo; // <-- CHANGE Extract 'echo' key data

        if (echoDataToLoad && typeof echoDataToLoad === 'object') { // <-- Check if 'echo' data exists
            try {
                 // Call the specific loader function for the echo module
                 // Make sure loadEchoTemplateData is correctly imported
                 // === UPDATED Function Call ===
                await loadEchoTemplateData(echoDataToLoad); // Pass only the echo data part <-- CHANGE
                showNotification(`${dataSource} template "${actualName}" loaded successfully.`, 'success');
                 // Optionally switch to the assessment tab after loading
                 // === UPDATED Tab Selector ===
                const assessmentTabButton = document.querySelector('.tab-button[data-tab="echo-assessment"]'); // <-- CHANGE tab target
                 if (assessmentTabButton) {
                    assessmentTabButton.click(); // Simulate click to switch tab
                 }
            } catch (error) {
                  // === UPDATED Log ===
                 console.error(`[TemplateCore - Echo] Error applying template "${actualName}" via loadEchoTemplateData:`, error); // <-- CHANGE
                 showNotification('Failed to apply template data to the form.', 'error');
            }
        } else {
             // === UPDATED Log ===
            console.error(`[TemplateCore - Echo] Template "${actualName}" is missing the required 'echo' data key or it's not an object.`); // <-- CHANGE
            showNotification(`Template "${actualName}" format is incorrect (missing 'echo' data).`, 'error'); // <-- CHANGE
        }
    } else {
         // === UPDATED Log ===
        console.error(`[TemplateCore - Echo] Template "${actualName}" not found.`);
        showNotification(`Template "${actualName}" could not be loaded.`, 'error');
    }
}

/**
 * Deletes a user-saved template from localStorage.
 * (No changes needed inside, uses the TEMPLATE_STORAGE_KEY constant)
 * @param {string} name - The name of the template to delete.
 */
export function deleteTemplate(name) { // Needs to be exported if called directly from elsewhere
     if (name.startsWith(PRESET_INDICATOR)) {
        showNotification('Preset templates cannot be deleted.', 'info');
        return;
     }

    const templates = getSavedTemplates(); // Uses echo key
    if (templates[name]) {
        delete templates[name];
        try {
            localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates)); // Uses echo key
            showNotification(`Template "${name}" deleted.`, 'success');
            populateTemplateDropdown(); // Update the dropdown
        } catch (e) {
             // === UPDATED Log ===
            console.error("[TemplateCore - Echo] Error saving updated templates after deletion:", e);
            showNotification('Failed to delete template from storage.', 'error');
        }
    } else {
         // === UPDATED Log ===
        console.warn(`[TemplateCore - Echo] Template "${name}" not found for deletion.`);
        showNotification(`Template "${name}" not found.`, 'error');
    }
}

/**
 * Populates the template selection dropdown with saved and preset echo templates. (ADAPTED)
 */
function populateTemplateDropdown() {
    const select = document.getElementById('load-template-select');
    const userGroup = select ? select.querySelector('#user-templates-group') || select.querySelector('optgroup[label="My Templates / Mẫu của tôi"]') : null;
    const presetGroup = select ? select.querySelector('#preset-templates-group') || select.querySelector('optgroup[label="Presets / Mẫu có sẵn"]') : null;

    if (!select) {
         // === UPDATED Log ===
         console.warn("[TemplateCore - Echo] Template dropdown select element ('#load-template-select') not found. Cannot populate.");
         return;
     }
     if (!userGroup || !presetGroup) {
         // === UPDATED Log ===
         console.warn("[TemplateCore - Echo] Template dropdown optgroups not found. Recreating them.");
         let missingPreset = !presetGroup;
         let missingUser = !userGroup;
         if(missingPreset) { presetGroup = document.createElement('optgroup'); presetGroup.id = 'preset-templates-group'; presetGroup.label="Presets / Mẫu có sẵn"; }
         if(missingUser) { userGroup = document.createElement('optgroup'); userGroup.id = 'user-templates-group'; userGroup.label="My Templates / Mẫu của tôi"; }
         select.innerHTML = '<option value="">-- Select Template / Chọn Mẫu --</option>';
         if(missingPreset) select.appendChild(presetGroup);
         if(missingUser) select.appendChild(userGroup);
     }

    // Clear existing options within groups
     while (userGroup.firstChild) { userGroup.removeChild(userGroup.firstChild); }
     while (presetGroup.firstChild) { presetGroup.removeChild(presetGroup.firstChild); }
     userGroup.style.display = 'none'; // Hide until populated
     presetGroup.style.display = 'none'; // Hide until populated

    // ** Add Echo presets **
    // === UPDATED Preset Source Check and Iteration ===
     if (typeof echoPresets !== 'undefined' && Array.isArray(echoPresets) && echoPresets.length > 0) {
        presetGroup.style.display = 'block'; // Show the optgroup
        echoPresets.forEach(preset => { // <-- Iterate echoPresets
            if (preset.name && preset.data) { // Presets store data directly in .data.echo
                const option = document.createElement('option');
                option.value = PRESET_INDICATOR + preset.name;
                option.textContent = preset.name; // Display name without prefix
                presetGroup.appendChild(option);
            }
        });
    }

    // Add user-saved templates (Uses echo-specific storage key via getSavedTemplates)
    const savedTemplates = getSavedTemplates();
    const templateNames = Object.keys(savedTemplates).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    if (templateNames.length > 0) {
        let userTemplatesFound = false;
        templateNames.forEach(name => {
            // Basic check to ensure it's likely an echo template if metadata exists
             // === UPDATED Organ Check ===
             if(savedTemplates[name]?.metadata?.organ === 'echo' || !savedTemplates[name]?.metadata?.organ) { // <-- Check for 'echo' organ type
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                userGroup.appendChild(option);
                userTemplatesFound = true; // Mark that we found at least one user template
             } else {
                 // === UPDATED Log ===
                 console.log(`[TemplateCore - Echo] Skipping template "${name}" as it's not marked for 'echo'.`);
             }
        });
        if (userTemplatesFound) {
            userGroup.style.display = 'block'; // Show the optgroup only if it has relevant templates
        }
    }

     // Add placeholder if both groups are effectively empty
     if (presetGroup.childNodes.length === 0 && userGroup.childNodes.length === 0) {
        const placeholder = document.createElement('option');
        placeholder.value = ""; placeholder.textContent = "-- No Templates Available --"; placeholder.disabled = true;
        const defaultOption = select.querySelector('option[value=""]');
         if(defaultOption && defaultOption.nextSibling) select.insertBefore(placeholder, defaultOption.nextSibling);
         else if (defaultOption) select.appendChild(placeholder);
         else select.prepend(placeholder);
     }
     // === UPDATED Log ===
    console.log("[TemplateCore - Echo] Template dropdown populated.");
}

// === UPDATED Log ===
console.log("template-core.js (Echo Version) loaded.");