// js/core/template-core.js (ADAPTED for Breast Project)
// Manages saving, loading, and deleting report templates using localStorage for BREAST reports.

import { showNotification } from './ui-core.js';
import { populateForm, getFormData } from './form-core.js'; // form-core likely used by breast-module as well
// ** Import Breast presets and module loader function **
import { breastPresets } from '../organs/breast/breast-presets.js'; // <-- CHANGE: Import breast presets
import { loadBreastTemplateData } from '../organs/breast/breast-module.js'; // <-- CHANGE: Import breast template loader

// ** Use a different storage key specific to the breast project **
const TEMPLATE_STORAGE_KEY = 'breastUltrasoundReportTemplates_v1'; // <-- CHANGE: Unique key
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
                // Calls the adapted collectAndSaveTemplate for breast
                collectAndSaveTemplate(name);
            } else {
                showNotification('Please enter a valid template name (cannot start with "[Preset] ").', 'error');
            }
        });
    } else {
         console.error("[TemplateCore - Breast] Save button or template name input not found.");
    }

    if (loadBtn && templateSelect) {
        loadBtn.addEventListener('click', () => {
            const selectedValue = templateSelect.value;
            if (selectedValue) {
                 // Calls the adapted loadTemplate for breast
                loadTemplate(selectedValue);
            } else {
                showNotification('Please select a template to load.', 'info');
            }
        });
    } else {
         console.error("[TemplateCore - Breast] Load button or template select not found.");
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
        console.error("[TemplateCore - Breast] Delete button or template select not found.");
    }

    // Initial population of the select dropdown using breast presets
    populateTemplateDropdown();
    console.log("[TemplateCore - Breast] Template system UI initialized.");
}

/**
 * Collects data from the breast module and saves it as a template. (ADAPTED)
 * @param {string} name - The name for the template.
 */
async function collectAndSaveTemplate(name) {
    console.log(`[TemplateCore - Breast] Attempting to save template: ${name}`);
    try {
        // ** Directly import and call breast data collector **
        // Path is relative to template-core.js
        const { collectBreastData } = await import('../organs/breast/breast-module.js');
        const fullBreastData = collectBreastData(); // Get current breast form data

        if (!fullBreastData) {
             throw new Error("Failed to collect breast data for template.");
        }

        // Structure template data with 'breast' key
        const templateData = {
            breast: fullBreastData, // <-- Store data under 'breast' key
            metadata: {
                name: name,
                createdAt: new Date().toISOString(),
                organ: 'breast', // Clearly mark as a breast template
                version: '1.0' // Optional versioning
            }
        };

        // Use the generic save function
        saveTemplate(name, templateData);

        // Clear the name input after successful save attempt
        const templateNameInput = document.getElementById('template-name');
        if(templateNameInput) templateNameInput.value = '';

    } catch (error) {
        console.error("[TemplateCore - Breast] Error collecting/saving template:", error);
        showNotification(`Failed to save template: ${error.message}`, 'error');
    }
}


/**
 * Retrieves all saved templates from localStorage (using the breast-specific key).
 * (No changes needed inside, uses the TEMPLATE_STORAGE_KEY constant)
 * @returns {object} - An object where keys are template names and values are template data.
 */
function getSavedTemplates() {
    const storedTemplates = localStorage.getItem(TEMPLATE_STORAGE_KEY); // Uses the breast-specific key
    try {
        return storedTemplates ? JSON.parse(storedTemplates) : {};
    } catch (e) {
        console.error("[TemplateCore - Breast] Error parsing templates from localStorage:", e);
        // Optionally clear corrupted data?
        // localStorage.removeItem(TEMPLATE_STORAGE_KEY);
        return {}; // Return empty object on error
    }
}

/**
 * Saves a template to localStorage.
 * (No changes needed inside, uses the TEMPLATE_STORAGE_KEY constant)
 * @param {string} name - The name of the template.
 * @param {object} data - The template data object to save.
 */
export function saveTemplate(name, data) { // Exporting allows import function to use it
    if (!name || typeof data !== 'object') {
        console.error("[TemplateCore - Breast] Invalid template name or data for saving.");
        showNotification('Failed to save template: Invalid name or data.', 'error');
        return;
    }
    // Basic check for expected structure (at least 'breast' or 'metadata' key)
     if (!data.breast && !data.metadata) {
        console.warn("[TemplateCore - Breast] Saving template with unexpected structure:", data);
         // Decide if you want to prevent saving templates without the 'breast' key
         // showNotification('Template data format is incorrect.', 'error');
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
         console.log(`[TemplateCore - Breast] Overwriting existing template: ${name}`);
    }

    templates[name] = data;

    try {
        localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates)); // Uses the breast-specific key
        showNotification(`Template "${name}" saved successfully.`, 'success');
        populateTemplateDropdown(); // Update the dropdown
    } catch (e) {
        console.error("[TemplateCore - Breast] Error saving templates to localStorage:", e);
        // Handle potential storage full error
        if (e.name === 'QuotaExceededError') {
             showNotification('Failed to save template: Storage quota exceeded.', 'error', 5000);
        } else {
             showNotification('Failed to save template to storage.', 'error');
        }
    }
}

/**
 * Loads a template and populates the breast form. (ADAPTED)
 * @param {string} name - The name of the template to load (can include [Preset] prefix).
 */
export async function loadTemplate(name) { // Changed to export async
    let templateData;
    let isPreset = name.startsWith(PRESET_INDICATOR);
    let actualName = isPreset ? name.substring(PRESET_INDICATOR.length) : name;
    let dataSource = isPreset ? "Preset" : "User Saved";

    console.log(`[TemplateCore - Breast] Attempting to load ${dataSource} template: ${actualName}`);

    if (isPreset) {
        // ** Find in breastPresets **
        // Ensure breastPresets is defined and is an array
        if (typeof breastPresets !== 'undefined' && Array.isArray(breastPresets)) {
            templateData = breastPresets.find(p => p.name === actualName)?.data;
        } else {
             console.error("[TemplateCore - Breast] breastPresets is not loaded or not an array.");
             showNotification("Error: Preset data is missing.", "error");
             return;
        }
    } else {
        const templates = getSavedTemplates();
        templateData = templates[actualName];
    }

    if (templateData) {
        // ** Check for the 'breast' key specifically **
        if (templateData.breast && typeof templateData.breast === 'object') {
            try {
                 // Call the specific loader function for the breast module
                 // Make sure loadBreastTemplateData is correctly imported
                await loadBreastTemplateData(templateData.breast); // Pass only the breast data part
                showNotification(`${dataSource} template "${actualName}" loaded successfully.`, 'success');
            } catch (error) {
                 console.error(`[TemplateCore - Breast] Error applying template "${actualName}" via loadBreastTemplateData:`, error);
                 showNotification('Failed to apply template data to the form.', 'error');
            }
        } else {
            console.error(`[TemplateCore - Breast] Template "${actualName}" is missing the required 'breast' data key or it's not an object.`);
            showNotification(`Template "${actualName}" format is incorrect (missing 'breast' data).`, 'error');
        }
    } else {
        console.error(`[TemplateCore - Breast] Template "${actualName}" not found.`);
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

    const templates = getSavedTemplates();
    if (templates[name]) {
        delete templates[name];
        try {
            localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates)); // Uses breast key
            showNotification(`Template "${name}" deleted.`, 'success');
            populateTemplateDropdown(); // Update the dropdown
        } catch (e) {
            console.error("[TemplateCore - Breast] Error saving updated templates after deletion:", e);
            showNotification('Failed to delete template from storage.', 'error');
        }
    } else {
        console.warn(`[TemplateCore - Breast] Template "${name}" not found for deletion.`);
        showNotification(`Template "${name}" not found.`, 'error');
    }
}

/**
 * Populates the template selection dropdown with saved and preset breast templates. (ADAPTED)
 */
function populateTemplateDropdown() {
    const select = document.getElementById('load-template-select');
    const userGroup = document.getElementById('user-templates-group');
    const presetGroup = document.getElementById('preset-templates-group');

    if (!select || !userGroup || !presetGroup) {
        console.warn("[TemplateCore - Breast] Template dropdown UI elements not found.");
        // Try to ensure the default option exists
        if (select && select.options.length === 0) {
            const defaultOption = document.createElement('option');
            defaultOption.value = "";
            defaultOption.textContent = "-- Select Template / Chọn Mẫu --";
            select.appendChild(defaultOption);
        }
        return;
    }

    // Clear existing options except the first default one
     while (userGroup.firstChild) { userGroup.removeChild(userGroup.firstChild); }
     while (presetGroup.firstChild) { presetGroup.removeChild(presetGroup.firstChild); }
     // Reset display states
     userGroup.style.display = 'none';
     presetGroup.style.display = 'none';
     // Remove any previous placeholder
     const existingPlaceholder = select.querySelector('option[disabled]');
     if(existingPlaceholder) existingPlaceholder.remove();


    // ** Add Breast presets **
     if (typeof breastPresets !== 'undefined' && Array.isArray(breastPresets) && breastPresets.length > 0) { // <-- Check breastPresets
        presetGroup.style.display = 'block'; // Show the optgroup
        breastPresets.forEach(preset => { // <-- Iterate breastPresets
            if (preset.name && preset.data) {
                const option = document.createElement('option');
                option.value = PRESET_INDICATOR + preset.name;
                option.textContent = preset.name; // Display name without prefix
                presetGroup.appendChild(option);
            }
        });
    }

    // Add user-saved templates (Uses breast-specific storage key via getSavedTemplates)
    const savedTemplates = getSavedTemplates();
    const templateNames = Object.keys(savedTemplates).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())); // Case-insensitive sort

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
        placeholder.value = "";
        placeholder.textContent = "-- No Templates Available --";
        placeholder.disabled = true;
        // Insert after the "-- Select --" option
         if(select.options[0]) {
            select.insertBefore(placeholder, select.options[1]);
         } else {
             select.appendChild(placeholder);
         }
     }
    console.log("[TemplateCore - Breast] Template dropdown populated.");
}

console.log("template-core.js (Breast Version) loaded.");