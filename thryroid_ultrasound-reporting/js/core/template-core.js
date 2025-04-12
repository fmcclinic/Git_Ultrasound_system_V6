// js/core/template-core.js
// Manages saving, loading, and deleting report templates using localStorage.

import { showNotification } from './ui-core.js';
import { populateForm, getFormData } from './form-core.js';
// Import presets if they are defined in JS
import { thyroidPresets } from '../organs/thyroid/thyroid-presets.js';

const TEMPLATE_STORAGE_KEY = 'ultrasoundReportTemplates_v1'; // Changed key to avoid conflicts
const PRESET_INDICATOR = '[Preset] ';

/**
 * Initializes the template system UI elements (dropdowns, buttons).
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
                 // Collect data from ALL relevant forms/modules
                 collectAndSaveTemplate(name);
            } else {
                showNotification('Please enter a valid template name (cannot start with "[Preset] ").', 'error');
            }
        });
    }

    if (loadBtn && templateSelect) {
        loadBtn.addEventListener('click', () => {
            const selectedValue = templateSelect.value;
            if (selectedValue) {
                loadTemplate(selectedValue);
            } else {
                showNotification('Please select a template to load.', 'info');
            }
        });
    }

     if (deleteBtn && templateSelect) {
         deleteBtn.addEventListener('click', () => {
             const selectedValue = templateSelect.value;
             if (selectedValue && !selectedValue.startsWith(PRESET_INDICATOR)) { // Can't delete presets
                 if (confirm(`Are you sure you want to delete the template "${selectedValue}"?`)) {
                     deleteTemplate(selectedValue);
                 }
             } else if (selectedValue.startsWith(PRESET_INDICATOR)) {
                 showNotification('Preset templates cannot be deleted.', 'info');
             } else {
                  showNotification('Please select a user-saved template to delete.', 'info');
             }
         });
     }

    // Initial population of the select dropdown
    populateTemplateDropdown();
    console.log("Template system UI initialized.");
}

/**
 * Collects data from relevant forms/modules and saves it as a template.
 * @param {string} name - The name for the template.
 */
async function collectAndSaveTemplate(name) {
     try {
        // Get data from standard forms
        const patientData = getFormData('#patient-info-form');
        // const basicThyroidData = getFormData('#thyroid-form'); // Less useful, get full data

        // Get detailed data from the active module(s)
        // For now, hardcode thyroid. Later, could check registered/active modules.
        const { collectThyroidData } = await import('../organs/thyroid/thyroid-module.js');
        const fullThyroidData = collectThyroidData();

        // Combine data - structure it clearly, perhaps namespaced by module
        const templateData = {
            // patientInfo: patientData, // Usually don't save patient specifics in templates
            thyroid: fullThyroidData,
            // Add other organs here in the future:
            // breast: breastData,
            // liver: liverData,
            metadata: { // Optional: store info about the template
                name: name,
                createdAt: new Date().toISOString(),
                organ: 'thyroid' // Indicate the primary organ/context
            }
        };

        saveTemplate(name, templateData);
        const templateNameInput = document.getElementById('template-name');
         if(templateNameInput) templateNameInput.value = ''; // Clear name input after save

    } catch (error) {
        console.error("Error collecting data for template:", error);
        showNotification('Failed to collect data for template.', 'error');
    }
}


/**
 * Retrieves all saved templates from localStorage.
 * @returns {object} - An object where keys are template names and values are template data.
 */
function getSavedTemplates() {
    const storedTemplates = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    try {
        return storedTemplates ? JSON.parse(storedTemplates) : {};
    } catch (e) {
        console.error("Error parsing templates from localStorage:", e);
        return {}; // Return empty object on error
    }
}

/**
 * Saves a template to localStorage.
 * @param {string} name - The name of the template.
 * @param {object} data - The template data object to save.
 */
export function saveTemplate(name, data) {
    if (!name || typeof data !== 'object') {
        console.error("Invalid template name or data.");
        showNotification('Failed to save template: Invalid name or data.', 'error');
        return;
    }

    const templates = getSavedTemplates();

     // Prevent overwriting presets (though shouldn't happen with name check)
     if (name.startsWith(PRESET_INDICATOR)) {
         showNotification('Cannot overwrite preset templates.', 'error');
         return;
     }

    // Warn if overwriting existing user template
    if (templates[name]) {
        if (!confirm(`Template "${name}" already exists. Overwrite?`)) {
            return; // User cancelled overwrite
        }
    }

    templates[name] = data;

    try {
        localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
        showNotification(`Template "${name}" saved successfully.`, 'success');
        populateTemplateDropdown(); // Update the dropdown
    } catch (e) {
        console.error("Error saving templates to localStorage:", e);
        showNotification('Failed to save template. Storage might be full.', 'error');
    }
}

/**
 * Loads a template and populates the form(s).
 * @param {string} name - The name of the template to load.
 */
export async function loadTemplate(name) {
    let templateData;
    let isPreset = name.startsWith(PRESET_INDICATOR);
    let actualName = isPreset ? name.substring(PRESET_INDICATOR.length) : name;


    if (isPreset) {
        // Find the preset data (assuming thyroidPresets is structured { name: data })
        templateData = thyroidPresets.find(p => p.name === actualName)?.data;
         console.log(`Loading preset template: ${actualName}`);
    } else {
        const templates = getSavedTemplates();
        templateData = templates[actualName];
         console.log(`Loading user template: ${actualName}`);
    }


    if (templateData) {
        try {
            // Clear existing form data? Optional, maybe prompt user.
            // document.getElementById('patient-info-form').reset();
            // document.getElementById('thyroid-form').reset(); // Basic reset

            // Populate standard forms (if data exists)
            if (templateData.patientInfo) { // Usually excluded from templates
                 // populateForm('#patient-info-form', templateData.patientInfo);
                 console.warn("Skipping population of patient info from template.");
            }

            // Populate organ-specific forms/data
            if (templateData.thyroid) {
                 // Basic form fields
                 populateForm('#thyroid-form', templateData.thyroid);

                 // Delegate complex parts (like lesions) to the module
                 const { loadThyroidTemplateData } = await import('../organs/thyroid/thyroid-module.js');
                 loadThyroidTemplateData(templateData.thyroid); // Pass the thyroid-specific part
            }

            // Handle other organs in the future...

            showNotification(`Template "${name}" loaded successfully.`, 'success');
        } catch (error) {
             console.error(`Error applying template "${name}":`, error);
             showNotification('Failed to apply template data.', 'error');
        }

    } else {
        console.error(`Template "${name}" not found.`);
        showNotification(`Template "${name}" could not be loaded.`, 'error');
    }
}

/**
 * Deletes a template from localStorage.
 * @param {string} name - The name of the template to delete.
 */
export function deleteTemplate(name) {
     // Double-check it's not a preset
     if (name.startsWith(PRESET_INDICATOR)) {
         showNotification('Preset templates cannot be deleted.', 'info');
         return;
     }

    const templates = getSavedTemplates();
    if (templates[name]) {
        delete templates[name];
        try {
            localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
            showNotification(`Template "${name}" deleted.`, 'success');
            populateTemplateDropdown(); // Update the dropdown
        } catch (e) {
            console.error("Error saving updated templates to localStorage:", e);
            showNotification('Failed to delete template from storage.', 'error');
        }
    } else {
        console.warn(`Template "${name}" not found for deletion.`);
        showNotification(`Template "${name}" not found.`, 'error');
    }
}

/**
 * Populates the template selection dropdown with saved and preset templates.
 */
function populateTemplateDropdown() {
    const select = document.getElementById('load-template-select');
    const userGroup = document.getElementById('user-templates-group');
    const presetGroup = document.getElementById('preset-templates-group');

    if (!select || !userGroup || !presetGroup) {
        console.warn("Template dropdown elements not found.");
        return;
    }

    // Clear existing options
    userGroup.innerHTML = '';
    presetGroup.innerHTML = '';

    // Add preset templates
    if (thyroidPresets && thyroidPresets.length > 0) {
        thyroidPresets.forEach(preset => {
            if (preset.name && preset.data) {
                const option = document.createElement('option');
                // Distinguish presets in the display value/text
                option.value = PRESET_INDICATOR + preset.name;
                option.textContent = preset.name;
                presetGroup.appendChild(option);
            }
        });
    } else {
        // Optionally hide the preset group if empty
        presetGroup.style.display = 'none';
    }


    // Add user-saved templates
    const savedTemplates = getSavedTemplates();
    const templateNames = Object.keys(savedTemplates).sort(); // Sort alphabetically

    if (templateNames.length > 0) {
         userGroup.style.display = 'block'; // Show group if there are templates
        templateNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            userGroup.appendChild(option);
        });
    } else {
         // Optionally hide the user group if empty
         userGroup.style.display = 'none';
         // Add a placeholder if both groups are empty?
         if (presetGroup.style.display === 'none') {
            const placeholder = document.createElement('option');
            placeholder.value = "";
            placeholder.textContent = "-- No Templates Saved --";
            placeholder.disabled = true;
             // Add placeholder directly to select or to a default group if needed
             select.insertBefore(placeholder, select.firstChild.nextSibling); // Add after the "-- Select --" option
         }
    }
     console.log("Template dropdown populated.");
}