// js/core/template-core.js (ADAPTED for Obstetric Project)
// Manages saving, loading, and deleting report templates using localStorage for OBSTETRIC reports.

import { showNotification } from './ui-core.js';
import { populateForm, getFormData } from './form-core.js'; // Used indirectly if needed

// ** Import Obstetric presets and module loader function **
// === UPDATED IMPORTS ===
import { obstetricPresets } from '../organs/obstetric/obstetric-presets.js'; // <-- CHANGE: Import Obstetric presets
import { loadObstetricTemplateData } from '../organs/obstetric/obstetric-module.js'; // <-- CHANGE: Import Obstetric template loader

// ** Use a different storage key specific to the Obstetric project **
// === UPDATED STORAGE KEY ===
const TEMPLATE_STORAGE_KEY = 'obTemplates_v1'; // <-- CHANGE: Unique key for Obstetric
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
        console.warn("[TemplateCore - Obstetric] Template select dropdown ('#load-template-select') not found. Loading/Deleting disabled.");
    }

    if (saveBtn && templateNameInput) {
        saveBtn.addEventListener('click', () => {
            const name = templateNameInput.value.trim();
            if (name && !name.startsWith(PRESET_INDICATOR)) {
                // Calls the adapted collectAndSaveTemplate for Obstetric
                collectAndSaveTemplate(name);
            } else {
                showNotification('Please enter a valid template name (cannot start with "[Preset] ").', 'error');
            }
        });
    } else {
         // === UPDATED Log ===
         console.error("[TemplateCore - Obstetric] Save button or template name input not found.");
    }

    if (loadBtn && templateSelect) {
        loadBtn.addEventListener('click', () => {
            const selectedValue = templateSelect.value;
            if (selectedValue) {
                 // Calls the adapted loadTemplate for Obstetric
                loadTemplate(selectedValue);
            } else {
                showNotification('Please select a template to load.', 'info');
            }
        });
    } else if (!loadBtn && templateSelect) {
         console.warn("[TemplateCore - Obstetric] Load button ('#load-template-btn') not found.");
    }

    if (deleteBtn && templateSelect) {
        deleteBtn.addEventListener('click', () => {
            const selectedValue = templateSelect.value;
            if (selectedValue && !selectedValue.startsWith(PRESET_INDICATOR)) {
                if (confirm(`Are you sure you want to delete the template "${selectedValue}"?`)) {
                    deleteTemplate(selectedValue);
                }
            } else if (selectedValue.startsWith(PRESET_INDICATOR)) {
                showNotification('Preset templates cannot be deleted.', 'info');
            } else {
                 showNotification('Please select a user-saved template to delete.', 'info');
            }
        });
    } else if (!deleteBtn && templateSelect) {
        console.warn("[TemplateCore - Obstetric] Delete button ('#delete-template-btn') not found.");
    }

    // Initial population of the select dropdown using Obstetric presets
    populateTemplateDropdown();
    // === UPDATED Log ===
    console.log("[TemplateCore - Obstetric] Template system UI initialized.");
}

/**
 * Collects data from the Obstetric module and saves it as a template. (ADAPTED)
 * @param {string} name - The name for the template.
 */
async function collectAndSaveTemplate(name) {
    // === UPDATED Log ===
    console.log(`[TemplateCore - Obstetric] Attempting to save template: ${name}`);
    try {
        // ** Directly import and call Obstetric data collector **
        // === UPDATED Import Path and Function Call ===
        const { collectObstetricData } = await import('../organs/obstetric/obstetric-module.js'); // <-- CHANGE
        const fullObstetricData = collectObstetricData(); // Get current Obstetric form data <-- CHANGE

        if (!fullObstetricData) {
             throw new Error("Failed to collect Obstetric data for template."); // <-- CHANGE
        }
         // Remove the formatter function before saving template
        delete fullObstetricData.formatReportSectionHtml;

        // Structure template data with 'obstetric' key
        const templateData = {
            // === UPDATED Data Key ===
            obstetric: fullObstetricData, // <-- Store data under 'obstetric' key
            metadata: {
                name: name,
                createdAt: new Date().toISOString(),
                // === UPDATED Organ Type ===
                organ: 'obstetric', // Clearly mark as an Obstetric template <-- CHANGE
                version: '1.0' // Optional versioning
            }
        };

        // Use the generic save function
        saveTemplate(name, templateData);

        const templateNameInput = document.getElementById('template-name');
        if(templateNameInput) templateNameInput.value = '';

    } catch (error) {
        // === UPDATED Log ===
        console.error("[TemplateCore - Obstetric] Error collecting/saving template:", error);
        showNotification(`Failed to save template: ${error.message}`, 'error');
    }
}


/**
 * Retrieves all saved templates from localStorage (using the Obstetric-specific key).
 * (No changes needed inside, uses the TEMPLATE_STORAGE_KEY constant)
 * @returns {object} - An object where keys are template names and values are template data.
 */
function getSavedTemplates() {
    const storedTemplates = localStorage.getItem(TEMPLATE_STORAGE_KEY); // Uses the Obstetric-specific key
    try {
        return storedTemplates ? JSON.parse(storedTemplates) : {};
    } catch (e) {
         // === UPDATED Log ===
        console.error("[TemplateCore - Obstetric] Error parsing templates from localStorage:", e);
        return {};
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
        console.error("[TemplateCore - Obstetric] Invalid template name or data for saving.");
        showNotification('Failed to save template: Invalid name or data.', 'error');
        return;
    }
    // === UPDATED Check: Ensure it has 'obstetric' key or correct metadata ===
     if (!data.obstetric && data.metadata?.organ !== 'obstetric') { // <-- CHANGE Check 'obstetric' key
        console.warn("[TemplateCore - Obstetric] Saving template with potentially incorrect structure (missing 'obstetric' key or wrong metadata):", data); // <-- CHANGE
     }

    const templates = getSavedTemplates();

    if (name.startsWith(PRESET_INDICATOR)) {
        showNotification('Cannot overwrite preset templates.', 'error');
        return;
    }

    if (templates[name]) {
        if (!confirm(`Template "${name}" already exists. Overwrite?`)) {
            return;
        }
         // === UPDATED Log ===
         console.log(`[TemplateCore - Obstetric] Overwriting existing template: ${name}`);
    }

    templates[name] = data;

    try {
        localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates)); // Uses the Obstetric-specific key
        showNotification(`Template "${name}" saved successfully.`, 'success');
        populateTemplateDropdown(); // Update the dropdown
    } catch (e) {
         // === UPDATED Log ===
        console.error("[TemplateCore - Obstetric] Error saving templates to localStorage:", e);
        if (e.name === 'QuotaExceededError') {
             showNotification('Failed to save template: Storage quota exceeded.', 'error', 5000);
        } else {
             showNotification('Failed to save template to storage.', 'error');
        }
    }
}

/**
 * Loads a template and populates the Obstetric form. (ADAPTED)
 * @param {string} name - The name of the template to load (can include [Preset] prefix).
 */
export async function loadTemplate(name) { // Changed to export async
    let templateData;
    let isPreset = name.startsWith(PRESET_INDICATOR);
    let actualName = isPreset ? name.substring(PRESET_INDICATOR.length) : name;
    let dataSource = isPreset ? "Preset" : "User Saved";

     // === UPDATED Log ===
    console.log(`[TemplateCore - Obstetric] Attempting to load ${dataSource} template: ${actualName}`);

    if (isPreset) {
        // ** Find in obstetricPresets **
        // === UPDATED Preset Source Check ===
        if (typeof obstetricPresets !== 'undefined' && Array.isArray(obstetricPresets)) { // <-- CHANGE Check obstetricPresets
            templateData = obstetricPresets.find(p => p.name === actualName)?.data; // <-- CHANGE Iterate obstetricPresets
        } else {
              // === UPDATED Log ===
             console.error("[TemplateCore - Obstetric] obstetricPresets is not loaded or not an array."); // <-- CHANGE
             showNotification("Error: Preset data is missing.", "error");
             return;
        }
    } else {
        const templates = getSavedTemplates(); // Uses Obstetric key
        templateData = templates[actualName];
    }

    if (templateData) {
        // ** Check for the 'obstetric' key specifically **
        // === UPDATED Data Key Check ===
        if (templateData.obstetric && typeof templateData.obstetric === 'object') { // <-- CHANGE Check 'obstetric' key
            try {
                 // Call the specific loader function for the Obstetric module
                 // === UPDATED Function Call ===
                await loadObstetricTemplateData(templateData.obstetric); // Pass only the obstetric data part <-- CHANGE
                showNotification(`${dataSource} template "${actualName}" loaded successfully.`, 'success');
                 // Optionally switch to the assessment tab after loading
                 // === UPDATED Target Tab ID ===
                const assessmentTabButton = document.querySelector('.tab-button[data-tab="ob-assessment"]'); // <-- CHANGED
                 if (assessmentTabButton) {
                    assessmentTabButton.click();
                 }
            } catch (error) {
                  // === UPDATED Log ===
                 console.error(`[TemplateCore - Obstetric] Error applying template "${actualName}" via loadObstetricTemplateData:`, error); // <-- CHANGE
                 showNotification('Failed to apply template data to the form.', 'error');
            }
        } else {
             // === UPDATED Log ===
            console.error(`[TemplateCore - Obstetric] Template "${actualName}" is missing the required 'obstetric' data key or it's not an object.`); // <-- CHANGE
            showNotification(`Template "${actualName}" format is incorrect (missing 'obstetric' data).`, 'error'); // <-- CHANGE
        }
    } else {
         // === UPDATED Log ===
        console.error(`[TemplateCore - Obstetric] Template "${actualName}" not found.`);
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

    const templates = getSavedTemplates(); // Uses Obstetric key
    if (templates[name]) {
        delete templates[name];
        try {
            localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates)); // Uses Obstetric key
            showNotification(`Template "${name}" deleted.`, 'success');
            populateTemplateDropdown();
        } catch (e) {
             // === UPDATED Log ===
            console.error("[TemplateCore - Obstetric] Error saving updated templates after deletion:", e);
            showNotification('Failed to delete template from storage.', 'error');
        }
    } else {
         // === UPDATED Log ===
        console.warn(`[TemplateCore - Obstetric] Template "${name}" not found for deletion.`);
        showNotification(`Template "${name}" not found.`, 'error');
    }
}

/**
 * Populates the template selection dropdown with saved and preset Obstetric templates. (ADAPTED)
 */
function populateTemplateDropdown() {
    const select = document.getElementById('load-template-select');
    const userGroup = select ? select.querySelector('#user-templates-group') || select.querySelector('optgroup[label="My Templates / Mẫu của tôi"]') : null;
    const presetGroup = select ? select.querySelector('#preset-templates-group') || select.querySelector('optgroup[label="Presets / Mẫu có sẵn"]') : null;

    if (!select) {
         console.warn("[TemplateCore - Obstetric] Template dropdown select element ('#load-template-select') not found. Cannot populate.");
         return;
     }
     if (!userGroup || !presetGroup) {
         console.warn("[TemplateCore - Obstetric] Template dropdown optgroups not found. Creating them.");
         let missingPreset = !presetGroup;
         let missingUser = !userGroup;
         if(missingPreset) { presetGroup = document.createElement('optgroup'); presetGroup.id = 'preset-templates-group'; presetGroup.label="Presets / Mẫu có sẵn"; }
         if(missingUser) { userGroup = document.createElement('optgroup'); userGroup.id = 'user-templates-group'; userGroup.label="My Templates / Mẫu của tôi"; }
         select.innerHTML = '<option value="">-- Select Template / Chọn Mẫu --</option>';
         if(missingPreset) select.appendChild(presetGroup);
         if(missingUser) select.appendChild(userGroup);
     }

     while (userGroup.firstChild) { userGroup.removeChild(userGroup.firstChild); }
     while (presetGroup.firstChild) { presetGroup.removeChild(presetGroup.firstChild); }
     userGroup.style.display = 'none';
     presetGroup.style.display = 'none';

    // ** Add Obstetric presets **
    // === UPDATED Preset Source Check and Iteration ===
     if (typeof obstetricPresets !== 'undefined' && Array.isArray(obstetricPresets) && obstetricPresets.length > 0) { // <-- CHANGE Check obstetricPresets
        presetGroup.style.display = 'block';
        obstetricPresets.forEach(preset => { // <-- Iterate obstetricPresets
            if (preset.name && preset.data) {
                const option = document.createElement('option');
                option.value = PRESET_INDICATOR + preset.name;
                option.textContent = preset.name;
                presetGroup.appendChild(option);
            }
        });
    }

    // Add user-saved templates (Uses Obstetric-specific storage key via getSavedTemplates)
    const savedTemplates = getSavedTemplates();
    const templateNames = Object.keys(savedTemplates).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    if (templateNames.length > 0) {
        let userTemplatesAdded = false; // Flag to see if any valid user templates are added
        templateNames.forEach(name => {
            // === UPDATED Metadata Check ===
             // Check if the template has the 'obstetric' data key OR if its metadata identifies it as 'obstetric'
             if(savedTemplates[name]?.obstetric || savedTemplates[name]?.metadata?.organ === 'obstetric') { // <-- CHANGE check 'obstetric' key or organ type
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                userGroup.appendChild(option);
                userTemplatesAdded = true; // Mark that we added at least one
             } else {
                 console.log(`[TemplateCore - Obstetric] Skipping template "${name}" as it's not marked for 'obstetric'.`);
             }
        });
         // Only display the optgroup if it actually contains templates
        if (userTemplatesAdded) {
            userGroup.style.display = 'block';
        }
    }

     if (presetGroup.childNodes.length === 0 && userGroup.childNodes.length === 0) {
        const placeholder = document.createElement('option');
        placeholder.value = ""; placeholder.textContent = "-- No Templates Available --"; placeholder.disabled = true;
         const defaultOption = select.querySelector('option[value=""]');
         if(defaultOption && defaultOption.nextSibling) { select.insertBefore(placeholder, defaultOption.nextSibling); }
         else if (defaultOption) { select.appendChild(placeholder); }
         else { select.prepend(placeholder); }
     }
     // === UPDATED Log ===
    console.log("[TemplateCore - Obstetric] Template dropdown populated.");
}

// === UPDATED Log ===
console.log("template-core.js (Obstetric Version) loaded."); // <-- CHANGED