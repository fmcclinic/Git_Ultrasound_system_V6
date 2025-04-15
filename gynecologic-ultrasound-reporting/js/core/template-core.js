// js/core/template-core.js (ADAPTED for Gynecologic Project)
// Manages saving, loading, and deleting report templates using localStorage for GYNECOLOGIC reports.

import { showNotification } from './ui-core.js';
import { populateForm, getFormData } from './form-core.js'; // Used indirectly if needed

// ** Import Gynecologic presets and module loader function **
// === *** UPDATED IMPORTS *** ===
import { gynecologicPresets } from '../organs/gynecologic/gynecologic-presets.js'; // <-- CHANGE: Import GYN presets
import { loadGynecologicTemplateData } from '../organs/gynecologic/gynecologic-module.js'; // <-- CHANGE: Import GYN template loader

// ** Use a different storage key specific to the Gynecologic project **
// === *** UPDATED STORAGE KEY *** ===
const TEMPLATE_STORAGE_KEY = 'gynTemplates_v1'; // <-- CHANGE: Unique key for Gynecologic
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
        console.warn("[TemplateCore - Gynecologic] Template select dropdown ('#load-template-select') not found. Loading/Deleting disabled."); // <-- CHANGED
    }

    if (saveBtn && templateNameInput) {
        saveBtn.addEventListener('click', () => {
            const name = templateNameInput.value.trim();
            if (name && !name.startsWith(PRESET_INDICATOR)) {
                // Calls the adapted collectAndSaveTemplate for Gynecologic
                collectAndSaveTemplate(name); // <-- Will call adapted function
            } else {
                showNotification('Please enter a valid template name (cannot start with "[Preset] ").', 'error');
            }
        });
    } else {
         // === UPDATED Log ===
         console.error("[TemplateCore - Gynecologic] Save button or template name input not found."); // <-- CHANGED
    }

    if (loadBtn && templateSelect) {
        loadBtn.addEventListener('click', () => {
            const selectedValue = templateSelect.value;
            if (selectedValue) {
                 // Calls the adapted loadTemplate for Gynecologic
                loadTemplate(selectedValue); // <-- Will call adapted function
            } else {
                showNotification('Please select a template to load.', 'info');
            }
        });
    } else if (!loadBtn && templateSelect) {
         // === UPDATED Log ===
         console.warn("[TemplateCore - Gynecologic] Load button ('#load-template-btn') not found."); // <-- CHANGED
    }

    if (deleteBtn && templateSelect) {
        deleteBtn.addEventListener('click', () => {
            const selectedValue = templateSelect.value;
            if (selectedValue && !selectedValue.startsWith(PRESET_INDICATOR)) {
                if (confirm(`Are you sure you want to delete the template "${selectedValue}"?`)) {
                    deleteTemplate(selectedValue); // Uses generic delete logic
                }
            } else if (selectedValue.startsWith(PRESET_INDICATOR)) {
                showNotification('Preset templates cannot be deleted.', 'info');
            } else {
                 showNotification('Please select a user-saved template to delete.', 'info');
            }
        });
    } else if (!deleteBtn && templateSelect) {
         // === UPDATED Log ===
        console.warn("[TemplateCore - Gynecologic] Delete button ('#delete-template-btn') not found."); // <-- CHANGED
    }

    // Initial population of the select dropdown using Gynecologic presets
    populateTemplateDropdown(); // <-- Will call adapted function
    // === UPDATED Log ===
    console.log("[TemplateCore - Gynecologic] Template system UI initialized."); // <-- CHANGED
}

/**
 * Collects data from the Gynecologic module and saves it as a template. (ADAPTED)
 * @param {string} name - The name for the template.
 */
async function collectAndSaveTemplate(name) {
    // === UPDATED Log ===
    console.log(`[TemplateCore - Gynecologic] Attempting to save template: ${name}`); // <-- CHANGED
    try {
        // ** Directly import and call Gynecologic data collector **
        // === *** UPDATED Import Path and Function Call *** ===
        const { collectGynecologicData } = await import('../organs/gynecologic/gynecologic-module.js'); // <-- CHANGE
        const fullGynecologicData = collectGynecologicData(); // Get current Gynecologic form data <-- CHANGE

        if (!fullGynecologicData) {
             // === UPDATED ERROR MESSAGE ===
             throw new Error("Failed to collect Gynecologic data for template."); // <-- CHANGE
        }
         // Remove the formatter function before saving template
        delete fullGynecologicData.formatReportSectionHtml;

        // Structure template data with 'gynecologic' key
        const templateData = {
            // === *** UPDATED Data Key *** ===
            gynecologic: fullGynecologicData, // <-- Store data under 'gynecologic' key
            metadata: {
                name: name,
                createdAt: new Date().toISOString(),
                // === *** UPDATED Organ Type *** ===
                organ: 'gynecologic', // Clearly mark as a Gynecologic template <-- CHANGE
                version: '1.0' // Optional versioning
            }
        };

        // Use the generic save function
        saveTemplate(name, templateData); // saveTemplate will use the GYN key constant

        const templateNameInput = document.getElementById('template-name');
        if(templateNameInput) templateNameInput.value = '';

    } catch (error) {
        // === UPDATED Log ===
        console.error("[TemplateCore - Gynecologic] Error collecting/saving template:", error); // <-- CHANGED
        showNotification(`Failed to save template: ${error.message}`, 'error');
    }
}


/**
 * Retrieves all saved templates from localStorage (using the Gynecologic-specific key).
 * (No changes needed inside, uses the TEMPLATE_STORAGE_KEY constant)
 * @returns {object} - An object where keys are template names and values are template data.
 */
function getSavedTemplates() {
    const storedTemplates = localStorage.getItem(TEMPLATE_STORAGE_KEY); // Uses the Gynecologic-specific key
    try {
        return storedTemplates ? JSON.parse(storedTemplates) : {};
    } catch (e) {
         // === UPDATED Log ===
        console.error("[TemplateCore - Gynecologic] Error parsing templates from localStorage:", e); // <-- CHANGED
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
        console.error("[TemplateCore - Gynecologic] Invalid template name or data for saving."); // <-- CHANGED
        showNotification('Failed to save template: Invalid name or data.', 'error');
        return;
    }
    // === *** UPDATED Check: Ensure it has 'gynecologic' key or correct metadata *** ===
     if (!data.gynecologic && data.metadata?.organ !== 'gynecologic') { // <-- CHANGE Check 'gynecologic' key
         // === UPDATED Log ===
        console.warn("[TemplateCore - Gynecologic] Saving template with potentially incorrect structure (missing 'gynecologic' key or wrong metadata):", data); // <-- CHANGE
     }

    const templates = getSavedTemplates(); // Uses GYN key

    if (name.startsWith(PRESET_INDICATOR)) {
        showNotification('Cannot overwrite preset templates.', 'error');
        return;
    }

    if (templates[name]) {
        if (!confirm(`Template "${name}" already exists. Overwrite?`)) {
            return;
        }
         // === UPDATED Log ===
         console.log(`[TemplateCore - Gynecologic] Overwriting existing template: ${name}`); // <-- CHANGED
    }

    templates[name] = data;

    try {
        localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates)); // Uses the Gynecologic-specific key
        showNotification(`Template "${name}" saved successfully.`, 'success');
        populateTemplateDropdown(); // Update the dropdown
    } catch (e) {
         // === UPDATED Log ===
        console.error("[TemplateCore - Gynecologic] Error saving templates to localStorage:", e); // <-- CHANGED
        if (e.name === 'QuotaExceededError') {
             showNotification('Failed to save template: Storage quota exceeded.', 'error', 5000);
        } else {
             showNotification('Failed to save template to storage.', 'error');
        }
    }
}

/**
 * Loads a template and populates the Gynecologic form. (ADAPTED)
 * @param {string} name - The name of the template to load (can include [Preset] prefix).
 */
export async function loadTemplate(name) { // Changed to export async
    let templateData;
    let isPreset = name.startsWith(PRESET_INDICATOR);
    let actualName = isPreset ? name.substring(PRESET_INDICATOR.length) : name;
    let dataSource = isPreset ? "Preset" : "User Saved";

     // === UPDATED Log ===
    console.log(`[TemplateCore - Gynecologic] Attempting to load ${dataSource} template: ${actualName}`); // <-- CHANGED

    if (isPreset) {
        // ** Find in gynecologicPresets **
        // === *** UPDATED Preset Source Check *** ===
        if (typeof gynecologicPresets !== 'undefined' && Array.isArray(gynecologicPresets)) { // <-- CHANGE Check gynecologicPresets
            templateData = gynecologicPresets.find(p => p.name === actualName)?.data; // <-- CHANGE Iterate gynecologicPresets
        } else {
              // === UPDATED Log ===
             console.error("[TemplateCore - Gynecologic] gynecologicPresets is not loaded or not an array."); // <-- CHANGE
             showNotification("Error: Preset data is missing.", "error");
             return;
        }
    } else {
        const templates = getSavedTemplates(); // Uses Gynecologic key
        templateData = templates[actualName];
    }

    if (templateData) {
        // ** Check for the 'gynecologic' key specifically **
        // === *** UPDATED Data Key Check *** ===
        if (templateData.gynecologic && typeof templateData.gynecologic === 'object') { // <-- CHANGE Check 'gynecologic' key
            try {
                 // Call the specific loader function for the Gynecologic module
                 // === *** UPDATED Function Call *** ===
                await loadGynecologicTemplateData(templateData.gynecologic); // Pass only the gynecologic data part <-- CHANGE
                showNotification(`${dataSource} template "${actualName}" loaded successfully.`, 'success');
                 // Optionally switch to the assessment tab after loading
                 // === *** UPDATED Target Tab ID *** ===
                const assessmentTabButton = document.querySelector('.tab-button[data-tab="gyn-assessment"]'); // <-- CHANGED
                 if (assessmentTabButton) {
                    assessmentTabButton.click();
                 }
            } catch (error) {
                  // === UPDATED Log ===
                 console.error(`[TemplateCore - Gynecologic] Error applying template "${actualName}" via loadGynecologicTemplateData:`, error); // <-- CHANGE
                 showNotification('Failed to apply template data to the form.', 'error');
            }
        } else {
             // === UPDATED Log ===
            console.error(`[TemplateCore - Gynecologic] Template "${actualName}" is missing the required 'gynecologic' data key or it's not an object.`); // <-- CHANGE
            showNotification(`Template "${actualName}" format is incorrect (missing 'gynecologic' data).`, 'error'); // <-- CHANGE
        }
    } else {
         // === UPDATED Log ===
        console.error(`[TemplateCore - Gynecologic] Template "${actualName}" not found.`); // <-- CHANGED
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

    const templates = getSavedTemplates(); // Uses GYN key
    if (templates[name]) {
        delete templates[name];
        try {
            localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates)); // Uses GYN key
            showNotification(`Template "${name}" deleted.`, 'success');
            populateTemplateDropdown();
        } catch (e) {
             // === UPDATED Log ===
            console.error("[TemplateCore - Gynecologic] Error saving updated templates after deletion:", e); // <-- CHANGED
            showNotification('Failed to delete template from storage.', 'error');
        }
    } else {
         // === UPDATED Log ===
        console.warn(`[TemplateCore - Gynecologic] Template "${name}" not found for deletion.`); // <-- CHANGED
        showNotification(`Template "${name}" not found.`, 'error');
    }
}

/**
 * Populates the template selection dropdown with saved and preset Gynecologic templates. (ADAPTED)
 */
function populateTemplateDropdown() {
    const select = document.getElementById('load-template-select');
    const userGroup = select ? select.querySelector('#user-templates-group') || select.querySelector('optgroup[label="My Templates / Mẫu của tôi"]') : null;
    const presetGroup = select ? select.querySelector('#preset-templates-group') || select.querySelector('optgroup[label="Presets / Mẫu có sẵn"]') : null;

    if (!select) {
          // === UPDATED Log ===
         console.warn("[TemplateCore - Gynecologic] Template dropdown select element ('#load-template-select') not found. Cannot populate."); // <-- CHANGED
         return;
     }
     if (!userGroup || !presetGroup) {
         // === UPDATED Log ===
         console.warn("[TemplateCore - Gynecologic] Template dropdown optgroups not found. Creating them."); // <-- CHANGED
         let missingPreset = !presetGroup;
         let missingUser = !userGroup;
         if(missingPreset) { presetGroup = document.createElement('optgroup'); presetGroup.id = 'preset-templates-group'; presetGroup.label="Presets / Mẫu có sẵn"; }
         if(missingUser) { userGroup = document.createElement('optgroup'); userGroup.id = 'user-templates-group'; userGroup.label="My Templates / Mẫu của tôi"; }
         select.innerHTML = '<option value="">-- Select Template / Chọn Mẫu --</option>';
         if(missingPreset) select.appendChild(presetGroup);
         if(missingUser) select.appendChild(userGroup);
     }

     // Clear existing options
     while (userGroup.firstChild) { userGroup.removeChild(userGroup.firstChild); }
     while (presetGroup.firstChild) { presetGroup.removeChild(presetGroup.firstChild); }
     userGroup.style.display = 'none'; // Hide until populated
     presetGroup.style.display = 'none'; // Hide until populated

    // ** Add Gynecologic presets **
    // === *** UPDATED Preset Source Check and Iteration *** ===
     if (typeof gynecologicPresets !== 'undefined' && Array.isArray(gynecologicPresets) && gynecologicPresets.length > 0) { // <-- CHANGE Check gynecologicPresets
        presetGroup.style.display = 'block';
        gynecologicPresets.forEach(preset => { // <-- Iterate gynecologicPresets
            if (preset.name && preset.data) {
                const option = document.createElement('option');
                option.value = PRESET_INDICATOR + preset.name;
                option.textContent = preset.name;
                presetGroup.appendChild(option);
            }
        });
    }

    // Add user-saved templates (Uses Gynecologic-specific storage key via getSavedTemplates)
    const savedTemplates = getSavedTemplates(); // Uses GYN key
    const templateNames = Object.keys(savedTemplates).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    if (templateNames.length > 0) {
        let userTemplatesAdded = false; // Flag to see if any valid user templates are added
        templateNames.forEach(name => {
            // === *** UPDATED Metadata Check *** ===
             // Check if the template has the 'gynecologic' data key OR if its metadata identifies it as 'gynecologic'
             if(savedTemplates[name]?.gynecologic || savedTemplates[name]?.metadata?.organ === 'gynecologic') { // <-- CHANGE check 'gynecologic' key or organ type
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                userGroup.appendChild(option);
                userTemplatesAdded = true; // Mark that we added at least one
             } else {
                 // === UPDATED Log ===
                 console.log(`[TemplateCore - Gynecologic] Skipping template "${name}" as it's not marked for 'gynecologic'.`); // <-- CHANGED
             }
        });
         // Only display the optgroup if it actually contains templates
        if (userTemplatesAdded) {
            userGroup.style.display = 'block';
        }
    }

     // Add placeholder if no templates found
     if (presetGroup.childNodes.length === 0 && userGroup.childNodes.length === 0) {
        const placeholder = document.createElement('option');
        placeholder.value = ""; placeholder.textContent = "-- No Templates Available --"; placeholder.disabled = true;
         const defaultOption = select.querySelector('option[value=""]');
         if(defaultOption && defaultOption.nextSibling) { select.insertBefore(placeholder, defaultOption.nextSibling); }
         else if (defaultOption) { select.appendChild(placeholder); }
         else { select.prepend(placeholder); }
     }
     // === UPDATED Log ===
    console.log("[TemplateCore - Gynecologic] Template dropdown populated."); // <-- CHANGED
}

// === UPDATED Log ===
console.log("template-core.js (Gynecologic Version) loaded."); // <-- CHANGED