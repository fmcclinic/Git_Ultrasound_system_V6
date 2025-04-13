// js/core/template-core.js (ADAPTED for LE Vascular Project)
// Manages saving, loading, and deleting report templates using localStorage for LE VASCULAR reports.

import { showNotification } from './ui-core.js';
import { populateForm, getFormData } from './form-core.js'; // Used indirectly if needed

// ** Import LE Vascular presets and module loader function **
// === UPDATED IMPORTS ===
import { leVascularPresets } from '../organs/le-vascular/le-vascular-presets.js'; // <-- CHANGE: Import LE Vascular presets
import { loadLEVascularTemplateData } from '../organs/le-vascular/le-vascular-module.js'; // <-- CHANGE: Import LE Vascular template loader

// ** Use a different storage key specific to the LE Vascular project **
// === UPDATED STORAGE KEY ===
const TEMPLATE_STORAGE_KEY = 'leVascularTemplates_v1'; // <-- CHANGE: Unique key
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
        console.warn("[TemplateCore - LE Vascular] Template select dropdown ('#load-template-select') not found. Loading/Deleting disabled.");
    }

    if (saveBtn && templateNameInput) {
        saveBtn.addEventListener('click', () => {
            const name = templateNameInput.value.trim();
            if (name && !name.startsWith(PRESET_INDICATOR)) {
                // Calls the adapted collectAndSaveTemplate for LE Vascular
                collectAndSaveTemplate(name);
            } else {
                showNotification('Please enter a valid template name (cannot start with "[Preset] ").', 'error');
            }
        });
    } else {
         // === UPDATED Log ===
         console.error("[TemplateCore - LE Vascular] Save button or template name input not found.");
    }

    if (loadBtn && templateSelect) {
        loadBtn.addEventListener('click', () => {
            const selectedValue = templateSelect.value;
            if (selectedValue) {
                 // Calls the adapted loadTemplate for LE Vascular
                loadTemplate(selectedValue);
            } else {
                showNotification('Please select a template to load.', 'info');
            }
        });
    } else if (!loadBtn && templateSelect) {
         console.warn("[TemplateCore - LE Vascular] Load button ('#load-template-btn') not found.");
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
        console.warn("[TemplateCore - LE Vascular] Delete button ('#delete-template-btn') not found.");
    }

    // Initial population of the select dropdown using LE Vascular presets
    populateTemplateDropdown();
    // === UPDATED Log ===
    console.log("[TemplateCore - LE Vascular] Template system UI initialized.");
}

/**
 * Collects data from the LE Vascular module and saves it as a template. (ADAPTED)
 * @param {string} name - The name for the template.
 */
async function collectAndSaveTemplate(name) {
    // === UPDATED Log ===
    console.log(`[TemplateCore - LE Vascular] Attempting to save template: ${name}`);
    try {
        // ** Directly import and call LE Vascular data collector **
        // === UPDATED Import Path and Function Call ===
        const { collectLEVascularData } = await import('../organs/le-vascular/le-vascular-module.js'); // <-- CHANGE
        const fullLEVascularData = collectLEVascularData(); // Get current LE Vascular form data <-- CHANGE

        if (!fullLEVascularData) {
             throw new Error("Failed to collect LE Vascular data for template."); // <-- CHANGE
        }
         // Remove the formatter function before saving template
        delete fullLEVascularData.formatReportSectionHtml;

        // Structure template data with 'leVascular' key
        const templateData = {
            // === UPDATED Data Key ===
            leVascular: fullLEVascularData, // <-- Store data under 'leVascular' key
            metadata: {
                name: name,
                createdAt: new Date().toISOString(),
                // === UPDATED Organ Type ===
                organ: 'leVascular', // Clearly mark as an LE Vascular template <-- CHANGE
                version: '1.0' // Optional versioning
            }
        };

        // Use the generic save function
        saveTemplate(name, templateData);

        const templateNameInput = document.getElementById('template-name');
        if(templateNameInput) templateNameInput.value = '';

    } catch (error) {
        // === UPDATED Log ===
        console.error("[TemplateCore - LE Vascular] Error collecting/saving template:", error);
        showNotification(`Failed to save template: ${error.message}`, 'error');
    }
}


/**
 * Retrieves all saved templates from localStorage (using the LE Vascular-specific key).
 * (No changes needed inside, uses the TEMPLATE_STORAGE_KEY constant)
 * @returns {object} - An object where keys are template names and values are template data.
 */
function getSavedTemplates() {
    const storedTemplates = localStorage.getItem(TEMPLATE_STORAGE_KEY); // Uses the LE Vascular-specific key
    try {
        return storedTemplates ? JSON.parse(storedTemplates) : {};
    } catch (e) {
         // === UPDATED Log ===
        console.error("[TemplateCore - LE Vascular] Error parsing templates from localStorage:", e);
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
        console.error("[TemplateCore - LE Vascular] Invalid template name or data for saving.");
        showNotification('Failed to save template: Invalid name or data.', 'error');
        return;
    }
    // === UPDATED Check: Ensure it has 'leVascular' key or correct metadata ===
     if (!data.leVascular && data.metadata?.organ !== 'leVascular') { // <-- CHANGE Check 'leVascular' key
        console.warn("[TemplateCore - LE Vascular] Saving template with potentially incorrect structure (missing 'leVascular' key or wrong metadata):", data); // <-- CHANGE
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
         console.log(`[TemplateCore - LE Vascular] Overwriting existing template: ${name}`);
    }

    templates[name] = data;

    try {
        localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates)); // Uses the LE Vascular-specific key
        showNotification(`Template "${name}" saved successfully.`, 'success');
        populateTemplateDropdown(); // Update the dropdown
    } catch (e) {
         // === UPDATED Log ===
        console.error("[TemplateCore - LE Vascular] Error saving templates to localStorage:", e);
        if (e.name === 'QuotaExceededError') {
             showNotification('Failed to save template: Storage quota exceeded.', 'error', 5000);
        } else {
             showNotification('Failed to save template to storage.', 'error');
        }
    }
}

/**
 * Loads a template and populates the LE Vascular form. (ADAPTED)
 * @param {string} name - The name of the template to load (can include [Preset] prefix).
 */
export async function loadTemplate(name) { // Changed to export async
    let templateData;
    let isPreset = name.startsWith(PRESET_INDICATOR);
    let actualName = isPreset ? name.substring(PRESET_INDICATOR.length) : name;
    let dataSource = isPreset ? "Preset" : "User Saved";

     // === UPDATED Log ===
    console.log(`[TemplateCore - LE Vascular] Attempting to load ${dataSource} template: ${actualName}`);

    if (isPreset) {
        // ** Find in leVascularPresets **
        // === UPDATED Preset Source Check ===
        if (typeof leVascularPresets !== 'undefined' && Array.isArray(leVascularPresets)) { // <-- CHANGE Check leVascularPresets
            templateData = leVascularPresets.find(p => p.name === actualName)?.data; // <-- CHANGE Iterate leVascularPresets
        } else {
              // === UPDATED Log ===
             console.error("[TemplateCore - LE Vascular] leVascularPresets is not loaded or not an array."); // <-- CHANGE
             showNotification("Error: Preset data is missing.", "error");
             return;
        }
    } else {
        const templates = getSavedTemplates(); // Uses LE Vascular key
        templateData = templates[actualName];
    }

    if (templateData) {
        // ** Check for the 'leVascular' key specifically **
        // === UPDATED Data Key Check ===
        if (templateData.leVascular && typeof templateData.leVascular === 'object') { // <-- CHANGE Check 'leVascular' key
            try {
                 // Call the specific loader function for the LE Vascular module
                 // === UPDATED Function Call ===
                await loadLEVascularTemplateData(templateData.leVascular); // Pass only the leVascular data part <-- CHANGE
                showNotification(`${dataSource} template "${actualName}" loaded successfully.`, 'success');
                 // Optionally switch to the assessment tab after loading
                 // === UPDATED Target Tab ID ===
                const assessmentTabButton = document.querySelector('.tab-button[data-tab="le-vascular-assessment"]'); // <-- CHANGED
                 if (assessmentTabButton) {
                    assessmentTabButton.click();
                 }
            } catch (error) {
                  // === UPDATED Log ===
                 console.error(`[TemplateCore - LE Vascular] Error applying template "${actualName}" via loadLEVascularTemplateData:`, error); // <-- CHANGE
                 showNotification('Failed to apply template data to the form.', 'error');
            }
        } else {
             // === UPDATED Log ===
            console.error(`[TemplateCore - LE Vascular] Template "${actualName}" is missing the required 'leVascular' data key or it's not an object.`); // <-- CHANGE
            showNotification(`Template "${actualName}" format is incorrect (missing 'leVascular' data).`, 'error'); // <-- CHANGE
        }
    } else {
         // === UPDATED Log ===
        console.error(`[TemplateCore - LE Vascular] Template "${actualName}" not found.`);
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

    const templates = getSavedTemplates(); // Uses LE Vascular key
    if (templates[name]) {
        delete templates[name];
        try {
            localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates)); // Uses LE Vascular key
            showNotification(`Template "${name}" deleted.`, 'success');
            populateTemplateDropdown();
        } catch (e) {
             // === UPDATED Log ===
            console.error("[TemplateCore - LE Vascular] Error saving updated templates after deletion:", e);
            showNotification('Failed to delete template from storage.', 'error');
        }
    } else {
         // === UPDATED Log ===
        console.warn(`[TemplateCore - LE Vascular] Template "${name}" not found for deletion.`);
        showNotification(`Template "${name}" not found.`, 'error');
    }
}

/**
 * Populates the template selection dropdown with saved and preset LE Vascular templates. (ADAPTED)
 */
function populateTemplateDropdown() {
    const select = document.getElementById('load-template-select');
    const userGroup = select ? select.querySelector('#user-templates-group') || select.querySelector('optgroup[label="My Templates / Mẫu của tôi"]') : null;
    const presetGroup = select ? select.querySelector('#preset-templates-group') || select.querySelector('optgroup[label="Presets / Mẫu có sẵn"]') : null;

    if (!select) {
         console.warn("[TemplateCore - LE Vascular] Template dropdown select element ('#load-template-select') not found. Cannot populate.");
         return;
     }
     if (!userGroup || !presetGroup) {
         console.warn("[TemplateCore - LE Vascular] Template dropdown optgroups not found. Creating them.");
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

    // ** Add LE Vascular presets **
    // === UPDATED Preset Source Check and Iteration ===
     if (typeof leVascularPresets !== 'undefined' && Array.isArray(leVascularPresets) && leVascularPresets.length > 0) { // <-- CHANGE Check leVascularPresets
        presetGroup.style.display = 'block';
        leVascularPresets.forEach(preset => { // <-- Iterate leVascularPresets
            if (preset.name && preset.data) {
                const option = document.createElement('option');
                option.value = PRESET_INDICATOR + preset.name;
                option.textContent = preset.name;
                presetGroup.appendChild(option);
            }
        });
    }

    // Add user-saved templates (Uses LE Vascular-specific storage key via getSavedTemplates)
    const savedTemplates = getSavedTemplates();
    const templateNames = Object.keys(savedTemplates).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    if (templateNames.length > 0) {
        userGroup.style.display = 'block';
        templateNames.forEach(name => {
            // === UPDATED Metadata Check ===
             if(savedTemplates[name]?.metadata?.organ === 'leVascular' || !savedTemplates[name]?.metadata?.organ) { // <-- CHANGE check organ type
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                userGroup.appendChild(option);
             } else {
                 console.log(`[TemplateCore - LE Vascular] Skipping template "${name}" as it's not marked for 'leVascular'.`);
             }
        });
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
    console.log("[TemplateCore - LE Vascular] Template dropdown populated.");
}

// === UPDATED Log ===
console.log("template-core.js (LE Vascular Version) loaded."); // <-- CHANGED