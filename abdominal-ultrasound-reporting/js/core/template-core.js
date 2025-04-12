// js/core/template-core.js (ADAPTED for Abdominal Project)
// Manages saving, loading, and deleting report templates using localStorage for ABDOMINAL reports.

import { showNotification } from './ui-core.js';
import { populateForm, getFormData } from './form-core.js'; // form-core might be used indirectly
// ** Import Abdominal presets and module loader function **
// === UPDATED IMPORTS ===
import { abdominalPresets } from '../organs/abdominal/abdominal-presets.js'; // <-- CHANGE: Import abdominal presets (Assuming this file will be created)
import { loadAbdominalTemplateData } from '../organs/abdominal/abdominal-module.js'; // <-- CHANGE: Import abdominal template loader

// ** Use a different storage key specific to the abdominal project **
// === UPDATED STORAGE KEY ===
const TEMPLATE_STORAGE_KEY = 'abdominalUltrasoundTemplates_v1'; // <-- CHANGE: Unique key
const PRESET_INDICATOR = '[Preset] '; // Indicator remains the same

/**
 * Initializes the template system UI elements (dropdowns, buttons).
 * (No changes needed inside this function itself, it calls the adapted helpers)
 */
export function initTemplateSystem() {
    const saveBtn = document.getElementById('save-template-btn');
    const loadBtn = document.getElementById('load-template-btn'); // Assumes this button exists in the HTML for loading
    const deleteBtn = document.getElementById('delete-template-btn');
    const templateSelect = document.getElementById('load-template-select'); // Changed ID from dropdown to select for clarity
    const templateNameInput = document.getElementById('template-name');

    // Check if templateSelect exists, if not, log warning but continue
    if (!templateSelect) {
        // === UPDATED Log ===
        console.warn("[TemplateCore - Abdominal] Template select dropdown ('#load-template-select') not found. Loading/Deleting disabled.");
    }

    if (saveBtn && templateNameInput) {
        saveBtn.addEventListener('click', () => {
            const name = templateNameInput.value.trim();
            if (name && !name.startsWith(PRESET_INDICATOR)) {
                // Calls the adapted collectAndSaveTemplate for abdominal
                collectAndSaveTemplate(name);
            } else {
                showNotification('Please enter a valid template name (cannot start with "[Preset] ").', 'error');
            }
        });
    } else {
         // === UPDATED Log ===
         console.error("[TemplateCore - Abdominal] Save button or template name input not found.");
    }

    // Only add listeners if the elements exist
    if (loadBtn && templateSelect) {
        loadBtn.addEventListener('click', () => {
            const selectedValue = templateSelect.value;
            if (selectedValue) {
                 // Calls the adapted loadTemplate for abdominal
                loadTemplate(selectedValue);
            } else {
                showNotification('Please select a template to load.', 'info');
            }
        });
    } else if (!loadBtn && templateSelect) {
         console.warn("[TemplateCore - Abdominal] Load button ('#load-template-btn') not found.");
    }


    if (deleteBtn && templateSelect) {
        deleteBtn.addEventListener('click', () => {
            const selectedValue = templateSelect.value;
            if (selectedValue && !selectedValue.startsWith(PRESET_INDICATOR)) {
                if (confirm(`Are you sure you want to delete the template "${selectedValue}"?`)) {
                    // Calls the standard deleteTemplate
                    deleteTemplate(selectedValue);
                }
            } else if (selectedValue.startsWith(PRESET_INDICATOR)) {
                showNotification('Preset templates cannot be deleted.', 'info');
            } else {
                 showNotification('Please select a user-saved template to delete.', 'info');
            }
        });
    } else if (!deleteBtn && templateSelect) {
        console.warn("[TemplateCore - Abdominal] Delete button ('#delete-template-btn') not found.");
    }

    // Initial population of the select dropdown using abdominal presets
    populateTemplateDropdown();
    // === UPDATED Log ===
    console.log("[TemplateCore - Abdominal] Template system UI initialized.");
}

/**
 * Collects data from the abdominal module and saves it as a template. (ADAPTED)
 * @param {string} name - The name for the template.
 */
async function collectAndSaveTemplate(name) {
    // === UPDATED Log ===
    console.log(`[TemplateCore - Abdominal] Attempting to save template: ${name}`);
    try {
        // ** Directly import and call abdominal data collector **
        // Path is relative to template-core.js
        // === UPDATED Import Path and Function Call ===
        const { collectAbdominalData } = await import('../organs/abdominal/abdominal-module.js'); // <-- CHANGE
        const fullAbdominalData = collectAbdominalData(); // Get current abdominal form data <-- CHANGE

        if (!fullAbdominalData) {
             throw new Error("Failed to collect abdominal data for template."); // <-- CHANGE
        }

        // Structure template data with 'abdominal' key
        const templateData = {
            // === UPDATED Data Key ===
            abdominal: fullAbdominalData, // <-- Store data under 'abdominal' key
            metadata: {
                name: name,
                createdAt: new Date().toISOString(),
                // === UPDATED Organ Type ===
                organ: 'abdominal', // Clearly mark as an abdominal template <-- CHANGE
                version: '1.0' // Optional versioning
            }
        };

        // Use the generic save function
        saveTemplate(name, templateData);

        // Clear the name input after successful save attempt
        const templateNameInput = document.getElementById('template-name');
        if(templateNameInput) templateNameInput.value = '';

    } catch (error) {
        // === UPDATED Log ===
        console.error("[TemplateCore - Abdominal] Error collecting/saving template:", error);
        showNotification(`Failed to save template: ${error.message}`, 'error');
    }
}


/**
 * Retrieves all saved templates from localStorage (using the abdominal-specific key).
 * (No changes needed inside, uses the TEMPLATE_STORAGE_KEY constant)
 * @returns {object} - An object where keys are template names and values are template data.
 */
function getSavedTemplates() {
    const storedTemplates = localStorage.getItem(TEMPLATE_STORAGE_KEY); // Uses the abdominal-specific key
    try {
        return storedTemplates ? JSON.parse(storedTemplates) : {};
    } catch (e) {
         // === UPDATED Log ===
        console.error("[TemplateCore - Abdominal] Error parsing templates from localStorage:", e);
        return {}; // Return empty object on error
    }
}

/**
 * Saves a template to localStorage. (ADAPTED Check)
 * @param {string} name - The name of the template.
 * @param {object} data - The template data object to save.
 */
export function saveTemplate(name, data) { // Exporting allows import function to use it
    if (!name || typeof data !== 'object') {
         // === UPDATED Log ===
        console.error("[TemplateCore - Abdominal] Invalid template name or data for saving.");
        showNotification('Failed to save template: Invalid name or data.', 'error');
        return;
    }
    // === UPDATED Check: Ensure it has 'abdominal' key or correct metadata ===
     if (!data.abdominal && data.metadata?.organ !== 'abdominal') { // <-- CHANGE Check 'abdominal' key
        console.warn("[TemplateCore - Abdominal] Saving template with potentially incorrect structure (missing 'abdominal' key or wrong metadata):", data); // <-- CHANGE
        // Decide if you want to prevent saving templates without the 'abdominal' key
        // showNotification('Template data format must include an "abdominal" key.', 'error'); // <-- CHANGE
        // return;
     }


    const templates = getSavedTemplates();

    if (name.startsWith(PRESET_INDICATOR)) {
        showNotification('Cannot overwrite preset templates.', 'error');
        return;
    }

    if (templates[name]) {
        if (!confirm(`Template "${name}" already exists. Overwrite?`)) {
            return; // User cancelled overwrite
        }
         // === UPDATED Log ===
         console.log(`[TemplateCore - Abdominal] Overwriting existing template: ${name}`);
    }

    templates[name] = data;

    try {
        localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates)); // Uses the abdominal-specific key
        showNotification(`Template "${name}" saved successfully.`, 'success');
        populateTemplateDropdown(); // Update the dropdown
    } catch (e) {
         // === UPDATED Log ===
        console.error("[TemplateCore - Abdominal] Error saving templates to localStorage:", e);
        if (e.name === 'QuotaExceededError') {
             showNotification('Failed to save template: Storage quota exceeded.', 'error', 5000);
        } else {
             showNotification('Failed to save template to storage.', 'error');
        }
    }
}

/**
 * Loads a template and populates the abdominal form. (ADAPTED)
 * @param {string} name - The name of the template to load (can include [Preset] prefix).
 */
export async function loadTemplate(name) { // Changed to export async
    let templateData;
    let isPreset = name.startsWith(PRESET_INDICATOR);
    let actualName = isPreset ? name.substring(PRESET_INDICATOR.length) : name;
    let dataSource = isPreset ? "Preset" : "User Saved";

     // === UPDATED Log ===
    console.log(`[TemplateCore - Abdominal] Attempting to load ${dataSource} template: ${actualName}`);

    if (isPreset) {
        // ** Find in abdominalPresets **
        // === UPDATED Preset Source Check ===
        if (typeof abdominalPresets !== 'undefined' && Array.isArray(abdominalPresets)) { // <-- CHANGE Check abdominalPresets
            templateData = abdominalPresets.find(p => p.name === actualName)?.data; // <-- CHANGE Iterate abdominalPresets
        } else {
              // === UPDATED Log ===
             console.error("[TemplateCore - Abdominal] abdominalPresets is not loaded or not an array."); // <-- CHANGE
             showNotification("Error: Preset data is missing.", "error");
             return;
        }
    } else {
        const templates = getSavedTemplates(); // Uses abdominal key
        templateData = templates[actualName];
    }

    if (templateData) {
        // ** Check for the 'abdominal' key specifically **
        // === UPDATED Data Key Check ===
        if (templateData.abdominal && typeof templateData.abdominal === 'object') { // <-- CHANGE Check 'abdominal' key
            try {
                 // Call the specific loader function for the abdominal module
                 // Make sure loadAbdominalTemplateData is correctly imported
                 // === UPDATED Function Call ===
                await loadAbdominalTemplateData(templateData.abdominal); // Pass only the abdominal data part <-- CHANGE
                showNotification(`${dataSource} template "${actualName}" loaded successfully.`, 'success');
                 // Optionally switch to the assessment tab after loading
                const assessmentTabButton = document.querySelector('.tab-button[data-tab="abdominal-assessment"]');
                 if (assessmentTabButton) {
                    assessmentTabButton.click(); // Simulate click to switch tab
                 }
            } catch (error) {
                  // === UPDATED Log ===
                 console.error(`[TemplateCore - Abdominal] Error applying template "${actualName}" via loadAbdominalTemplateData:`, error); // <-- CHANGE
                 showNotification('Failed to apply template data to the form.', 'error');
            }
        } else {
             // === UPDATED Log ===
            console.error(`[TemplateCore - Abdominal] Template "${actualName}" is missing the required 'abdominal' data key or it's not an object.`); // <-- CHANGE
            showNotification(`Template "${actualName}" format is incorrect (missing 'abdominal' data).`, 'error'); // <-- CHANGE
        }
    } else {
         // === UPDATED Log ===
        console.error(`[TemplateCore - Abdominal] Template "${actualName}" not found.`);
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

    const templates = getSavedTemplates(); // Uses abdominal key
    if (templates[name]) {
        delete templates[name];
        try {
            localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates)); // Uses abdominal key
            showNotification(`Template "${name}" deleted.`, 'success');
            populateTemplateDropdown(); // Update the dropdown
        } catch (e) {
             // === UPDATED Log ===
            console.error("[TemplateCore - Abdominal] Error saving updated templates after deletion:", e);
            showNotification('Failed to delete template from storage.', 'error');
        }
    } else {
         // === UPDATED Log ===
        console.warn(`[TemplateCore - Abdominal] Template "${name}" not found for deletion.`);
        showNotification(`Template "${name}" not found.`, 'error');
    }
}

/**
 * Populates the template selection dropdown with saved and preset abdominal templates. (ADAPTED)
 */
function populateTemplateDropdown() {
    const select = document.getElementById('load-template-select');
    // Assuming HTML structure uses optgroups with specific IDs
    const userGroup = select ? select.querySelector('#user-templates-group') || select.querySelector('optgroup[label="My Templates / Mẫu của tôi"]') : null;
    const presetGroup = select ? select.querySelector('#preset-templates-group') || select.querySelector('optgroup[label="Presets / Mẫu có sẵn"]') : null;

    if (!select) {
         console.warn("[TemplateCore - Abdominal] Template dropdown select element ('#load-template-select') not found. Cannot populate.");
         return;
     }
     if (!userGroup || !presetGroup) {
         console.warn("[TemplateCore - Abdominal] Template dropdown optgroups not found. Creating them.");
         // Create optgroups dynamically if missing (adjust labels as needed)
         let missingPreset = !presetGroup;
         let missingUser = !userGroup;
         if(missingPreset) { presetGroup = document.createElement('optgroup'); presetGroup.id = 'preset-templates-group'; presetGroup.label="Presets / Mẫu có sẵn"; }
         if(missingUser) { userGroup = document.createElement('optgroup'); userGroup.id = 'user-templates-group'; userGroup.label="My Templates / Mẫu của tôi"; }
         // Clear existing options/optgroups before adding potentially new ones
         select.innerHTML = '<option value="">-- Select Template / Chọn Mẫu --</option>';
         if(missingPreset) select.appendChild(presetGroup);
         if(missingUser) select.appendChild(userGroup);
     }


    // Clear existing options within groups
     while (userGroup.firstChild) { userGroup.removeChild(userGroup.firstChild); }
     while (presetGroup.firstChild) { presetGroup.removeChild(presetGroup.firstChild); }
     userGroup.style.display = 'none'; // Hide until populated
     presetGroup.style.display = 'none'; // Hide until populated


    // ** Add Abdominal presets **
    // === UPDATED Preset Source Check and Iteration ===
     if (typeof abdominalPresets !== 'undefined' && Array.isArray(abdominalPresets) && abdominalPresets.length > 0) {
        presetGroup.style.display = 'block'; // Show the optgroup
        abdominalPresets.forEach(preset => { // <-- Iterate abdominalPresets
            if (preset.name && preset.data) {
                const option = document.createElement('option');
                option.value = PRESET_INDICATOR + preset.name;
                option.textContent = preset.name; // Display name without prefix
                presetGroup.appendChild(option);
            }
        });
    }

    // Add user-saved templates (Uses abdominal-specific storage key via getSavedTemplates)
    const savedTemplates = getSavedTemplates();
    const templateNames = Object.keys(savedTemplates).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    if (templateNames.length > 0) {
        userGroup.style.display = 'block'; // Show the optgroup
        templateNames.forEach(name => {
            // Basic check to ensure it's likely an abdominal template if metadata exists
             if(savedTemplates[name]?.metadata?.organ === 'abdominal' || !savedTemplates[name]?.metadata?.organ) {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                userGroup.appendChild(option);
             } else {
                 console.log(`[TemplateCore - Abdominal] Skipping template "${name}" as it's not marked for 'abdominal'.`);
             }
        });
    }

     // Add placeholder if both groups are effectively empty
     if (presetGroup.childNodes.length === 0 && userGroup.childNodes.length === 0) {
        const placeholder = document.createElement('option');
        placeholder.value = ""; placeholder.textContent = "-- No Templates Available --"; placeholder.disabled = true;
        // Insert placeholder after the default "-- Select Template --" option if it exists
         const defaultOption = select.querySelector('option[value=""]');
         if(defaultOption && defaultOption.nextSibling) {
             select.insertBefore(placeholder, defaultOption.nextSibling);
         } else if (defaultOption) {
             select.appendChild(placeholder);
         } else { // If even the default is missing
             select.prepend(placeholder); // Add at the beginning
         }
     }
     // === UPDATED Log ===
    console.log("[TemplateCore - Abdominal] Template dropdown populated.");
}

// === UPDATED Log ===
console.log("template-core.js (Abdominal Version) loaded.");