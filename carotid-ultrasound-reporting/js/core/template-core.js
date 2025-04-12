// js/core/template-core.js (ADAPTED for Carotid Project)
// Manages saving, loading, and deleting report templates using localStorage for CAROTID reports.

import { showNotification } from './ui-core.js';
import { populateForm, getFormData } from './form-core.js'; // form-core might be used by carotid-module
// ** Import Carotid presets and module loader function **
// === UPDATED IMPORTS ===
import { carotidPresets } from '../organs/carotid/carotid-presets.js'; // <-- CHANGE: Import carotid presets
import { loadCarotidTemplateData } from '../organs/carotid/carotid-module.js'; // <-- CHANGE: Import carotid template loader

// ** Use a different storage key specific to the carotid project **
// === UPDATED STORAGE KEY ===
const TEMPLATE_STORAGE_KEY = 'carotidUltrasoundTemplates_v1'; // <-- CHANGE: Unique key
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

    if (saveBtn && templateNameInput) {
        saveBtn.addEventListener('click', () => {
            const name = templateNameInput.value.trim();
            if (name && !name.startsWith(PRESET_INDICATOR)) {
                // Calls the adapted collectAndSaveTemplate for carotid
                collectAndSaveTemplate(name);
            } else {
                showNotification('Please enter a valid template name (cannot start with "[Preset] ").', 'error');
            }
        });
    } else {
         // === UPDATED Log ===
         console.error("[TemplateCore - Carotid] Save button or template name input not found.");
    }

    if (loadBtn && templateSelect) {
        loadBtn.addEventListener('click', () => {
            const selectedValue = templateSelect.value;
            if (selectedValue) {
                 // Calls the adapted loadTemplate for carotid
                loadTemplate(selectedValue);
            } else {
                showNotification('Please select a template to load.', 'info');
            }
        });
    } else {
         // === UPDATED Log ===
         console.error("[TemplateCore - Carotid] Load button or template select not found.");
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
    } else {
         // === UPDATED Log ===
        console.error("[TemplateCore - Carotid] Delete button or template select not found.");
    }

    // Initial population of the select dropdown using carotid presets
    populateTemplateDropdown();
    // === UPDATED Log ===
    console.log("[TemplateCore - Carotid] Template system UI initialized.");
}

/**
 * Collects data from the carotid module and saves it as a template. (ADAPTED)
 * @param {string} name - The name for the template.
 */
async function collectAndSaveTemplate(name) {
    // === UPDATED Log ===
    console.log(`[TemplateCore - Carotid] Attempting to save template: ${name}`);
    try {
        // ** Directly import and call carotid data collector **
        // Path is relative to template-core.js
        // === UPDATED Import Path and Function Call ===
        const { collectCarotidData } = await import('../organs/carotid/carotid-module.js');
        const fullCarotidData = collectCarotidData(); // Get current carotid form data

        if (!fullCarotidData) {
             throw new Error("Failed to collect carotid data for template.");
        }

        // Structure template data with 'carotid' key
        const templateData = {
            // === UPDATED Data Key ===
            carotid: fullCarotidData, // <-- Store data under 'carotid' key
            metadata: {
                name: name,
                createdAt: new Date().toISOString(),
                // === UPDATED Organ Type ===
                organ: 'carotid', // Clearly mark as a carotid template
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
        console.error("[TemplateCore - Carotid] Error collecting/saving template:", error);
        showNotification(`Failed to save template: ${error.message}`, 'error');
    }
}


/**
 * Retrieves all saved templates from localStorage (using the carotid-specific key).
 * (No changes needed inside, uses the TEMPLATE_STORAGE_KEY constant)
 * @returns {object} - An object where keys are template names and values are template data.
 */
function getSavedTemplates() {
    const storedTemplates = localStorage.getItem(TEMPLATE_STORAGE_KEY); // Uses the carotid-specific key
    try {
        return storedTemplates ? JSON.parse(storedTemplates) : {};
    } catch (e) {
         // === UPDATED Log ===
        console.error("[TemplateCore - Carotid] Error parsing templates from localStorage:", e);
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
        console.error("[TemplateCore - Carotid] Invalid template name or data for saving.");
        showNotification('Failed to save template: Invalid name or data.', 'error');
        return;
    }
    // === UPDATED Check: Ensure it has 'carotid' key or correct metadata ===
     if (!data.carotid && data.metadata?.organ !== 'carotid') {
        console.warn("[TemplateCore - Carotid] Saving template with potentially incorrect structure (missing 'carotid' key or wrong metadata):", data);
        // Decide if you want to prevent saving templates without the 'carotid' key
        // showNotification('Template data format must include a "carotid" key.', 'error');
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
         console.log(`[TemplateCore - Carotid] Overwriting existing template: ${name}`);
    }

    templates[name] = data;

    try {
        localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates)); // Uses the carotid-specific key
        showNotification(`Template "${name}" saved successfully.`, 'success');
        populateTemplateDropdown(); // Update the dropdown
    } catch (e) {
         // === UPDATED Log ===
        console.error("[TemplateCore - Carotid] Error saving templates to localStorage:", e);
        if (e.name === 'QuotaExceededError') {
             showNotification('Failed to save template: Storage quota exceeded.', 'error', 5000);
        } else {
             showNotification('Failed to save template to storage.', 'error');
        }
    }
}

/**
 * Loads a template and populates the carotid form. (ADAPTED)
 * @param {string} name - The name of the template to load (can include [Preset] prefix).
 */
export async function loadTemplate(name) { // Changed to export async
    let templateData;
    let isPreset = name.startsWith(PRESET_INDICATOR);
    let actualName = isPreset ? name.substring(PRESET_INDICATOR.length) : name;
    let dataSource = isPreset ? "Preset" : "User Saved";

     // === UPDATED Log ===
    console.log(`[TemplateCore - Carotid] Attempting to load ${dataSource} template: ${actualName}`);

    if (isPreset) {
        // ** Find in carotidPresets **
        // === UPDATED Preset Source Check ===
        if (typeof carotidPresets !== 'undefined' && Array.isArray(carotidPresets)) {
            templateData = carotidPresets.find(p => p.name === actualName)?.data;
        } else {
              // === UPDATED Log ===
             console.error("[TemplateCore - Carotid] carotidPresets is not loaded or not an array.");
             showNotification("Error: Preset data is missing.", "error");
             return;
        }
    } else {
        const templates = getSavedTemplates(); // Uses carotid key
        templateData = templates[actualName];
    }

    if (templateData) {
        // ** Check for the 'carotid' key specifically **
        // === UPDATED Data Key Check ===
        if (templateData.carotid && typeof templateData.carotid === 'object') {
            try {
                 // Call the specific loader function for the carotid module
                 // Make sure loadCarotidTemplateData is correctly imported
                 // === UPDATED Function Call ===
                await loadCarotidTemplateData(templateData.carotid); // Pass only the carotid data part
                showNotification(`${dataSource} template "${actualName}" loaded successfully.`, 'success');
            } catch (error) {
                  // === UPDATED Log ===
                 console.error(`[TemplateCore - Carotid] Error applying template "${actualName}" via loadCarotidTemplateData:`, error);
                 showNotification('Failed to apply template data to the form.', 'error');
            }
        } else {
             // === UPDATED Log ===
            console.error(`[TemplateCore - Carotid] Template "${actualName}" is missing the required 'carotid' data key or it's not an object.`);
            showNotification(`Template "${actualName}" format is incorrect (missing 'carotid' data).`, 'error');
        }
    } else {
         // === UPDATED Log ===
        console.error(`[TemplateCore - Carotid] Template "${actualName}" not found.`);
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

    const templates = getSavedTemplates(); // Uses carotid key
    if (templates[name]) {
        delete templates[name];
        try {
            localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates)); // Uses carotid key
            showNotification(`Template "${name}" deleted.`, 'success');
            populateTemplateDropdown(); // Update the dropdown
        } catch (e) {
             // === UPDATED Log ===
            console.error("[TemplateCore - Carotid] Error saving updated templates after deletion:", e);
            showNotification('Failed to delete template from storage.', 'error');
        }
    } else {
         // === UPDATED Log ===
        console.warn(`[TemplateCore - Carotid] Template "${name}" not found for deletion.`);
        showNotification(`Template "${name}" not found.`, 'error');
    }
}

/**
 * Populates the template selection dropdown with saved and preset carotid templates. (ADAPTED)
 */
function populateTemplateDropdown() {
    const select = document.getElementById('load-template-select');
    const userGroup = document.getElementById('user-templates-group');
    const presetGroup = document.getElementById('preset-templates-group');

    if (!select || !userGroup || !presetGroup) {
         // === UPDATED Log ===
        console.warn("[TemplateCore - Carotid] Template dropdown UI elements not found.");
        if (select && select.options.length === 0) {
            const defaultOption = document.createElement('option'); defaultOption.value = "";
            defaultOption.textContent = "-- Select Template / Chọn Mẫu --"; select.appendChild(defaultOption);
        }
        return;
    }

    // Clear existing options except the first default one
     while (userGroup.firstChild) { userGroup.removeChild(userGroup.firstChild); }
     while (presetGroup.firstChild) { presetGroup.removeChild(presetGroup.firstChild); }
     userGroup.style.display = 'none'; presetGroup.style.display = 'none';
     const existingPlaceholder = select.querySelector('option[disabled]');
     if(existingPlaceholder) existingPlaceholder.remove();

    // ** Add Carotid presets **
    // === UPDATED Preset Source Check and Iteration ===
     if (typeof carotidPresets !== 'undefined' && Array.isArray(carotidPresets) && carotidPresets.length > 0) {
        presetGroup.style.display = 'block'; // Show the optgroup
        carotidPresets.forEach(preset => { // <-- Iterate carotidPresets
            if (preset.name && preset.data) {
                const option = document.createElement('option');
                option.value = PRESET_INDICATOR + preset.name;
                option.textContent = preset.name; // Display name without prefix
                presetGroup.appendChild(option);
            }
        });
    }

    // Add user-saved templates (Uses carotid-specific storage key via getSavedTemplates)
    const savedTemplates = getSavedTemplates();
    const templateNames = Object.keys(savedTemplates).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    if (templateNames.length > 0) {
        userGroup.style.display = 'block'; // Show the optgroup
        templateNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            userGroup.appendChild(option);
        });
    }

     // Add placeholder if both groups are effectively empty
     if (presetGroup.childNodes.length === 0 && userGroup.childNodes.length === 0) {
        const placeholder = document.createElement('option');
        placeholder.value = ""; placeholder.textContent = "-- No Templates Available --"; placeholder.disabled = true;
         if(select.options[0]) { select.insertBefore(placeholder, select.options[1]); }
         else { select.appendChild(placeholder); }
     }
     // === UPDATED Log ===
    console.log("[TemplateCore - Carotid] Template dropdown populated.");
}

// === UPDATED Log ===
console.log("template-core.js (Carotid Version) loaded.");