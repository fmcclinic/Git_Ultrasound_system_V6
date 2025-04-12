// js/core/template-exporter.js (ADAPTED for Carotid Project)
// Provides functionality to export the current state as a JSON template
// and import templates from JSON files for CAROTID reports.

import { showNotification } from './ui-core.js';
// Import saveTemplate which is already adapted for carotid storage key
import { saveTemplate } from './template-core.js';

/**
 * Initializes the import/export button listeners.
 * (No changes needed inside this function, it calls the adapted helpers)
 */
export function initTemplateExporter() {
    const exportBtn = document.getElementById('export-template-btn');
    const importBtn = document.getElementById('import-template-btn');
    const importFile = document.getElementById('import-template-file');

    if (exportBtn) {
        exportBtn.addEventListener('click', async () => {
            // === UPDATED Log ===
            console.log("[TemplateExporter - Carotid] Export template button clicked.");
            // === UPDATED Function Call ===
            await exportCurrentCarotidState(); // Calls the adapted export function
        });
    } else {
         // === UPDATED Log ===
        console.error("[TemplateExporter - Carotid] Export button not found.");
    }

    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => {
             // === UPDATED Log ===
            console.log("[TemplateExporter - Carotid] Import template button clicked.");
            if (importFile.files.length === 0) {
                showNotification('Please select a JSON file to import.', 'info');
                return;
            }
            const file = importFile.files[0];
            // Calls the adapted import function
            importTemplateFromJson(file);
        });
    } else {
         // === UPDATED Log ===
        console.error("[TemplateExporter - Carotid] Import button or file input not found.");
    }
     // === UPDATED Log ===
    console.log("[TemplateExporter - Carotid] Template exporter/importer initialized.");
}

/**
 * Collects the current state of the carotid form and exports it as JSON. (ADAPTED)
 */
// === RENAMED Function ===
async function exportCurrentCarotidState() {
    try {
        // ** Directly import and call carotid data collector **
        // === UPDATED Import Path and Function Call ===
        const { collectCarotidData } = await import('../organs/carotid/carotid-module.js'); // <-- CHANGE
        const fullCarotidData = collectCarotidData(); // <-- CHANGE

        if (!fullCarotidData) {
            throw new Error("Failed to collect current carotid data for export.");
        }

        const currentState = {
             // === UPDATED Data Key ===
            carotid: fullCarotidData, // <-- Store data under 'carotid' key
            metadata: {
                exportedAt: new Date().toISOString(),
                 // === UPDATED Source Name ===
                source: 'Carotid Ultrasound Reporting System Export' // <-- Update source name
            }
        };

        // Suggest a filename
        // === UPDATED Filename Prefix ===
        const filename = `carotid_us_template_${new Date().toISOString().split('T')[0]}.json`; // <-- CHANGE filename prefix
        exportDataAsJson(currentState, filename); // Call the generic JSON exporter
        showNotification('Current state exported as JSON.', 'success');

    } catch (error) {
         // === UPDATED Log ===
        console.error("[TemplateExporter - Carotid] Error collecting data for export:", error);
        showNotification(`Failed to collect data for export: ${error.message}`, 'error');
    }
}


/**
 * Exports data object as a downloadable JSON file.
 * (No changes needed in this helper function)
 * @param {object} data - The data object to export.
 * @param {string} filename - The suggested filename.
 */
function exportDataAsJson(data, filename = 'template.json') {
    try {
        const jsonString = JSON.stringify(data, null, 2); // Pretty print JSON
        const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log(`[TemplateExporter] Data exported as ${filename}`);
    } catch (error) {
        console.error("[TemplateExporter] Error exporting data as JSON:", error);
        showNotification('Failed to export data as JSON.', 'error');
    }
}

/**
 * Imports a template from a selected JSON file and saves it using template-core.
 * (ADAPTED Check and Prompt)
 * @param {File} file - The JSON file selected by the user.
 */
function importTemplateFromJson(file) {
    if (!file || !file.type.match('application/json')) {
        showNotification('Invalid file type. Please select a JSON file (.json).', 'error');
        const importFile = document.getElementById('import-template-file');
        if (importFile) importFile.value = '';
        return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
        try {
            const importedData = JSON.parse(event.target.result);

            // Basic validation - Check if it's an object
            if (typeof importedData !== 'object' || importedData === null) {
                throw new Error("Imported file does not contain valid JSON object data.");
            }
            // ** Specifically check for the 'carotid' key for this project **
            // === UPDATED Check ===
            if (!importedData.carotid) {
                // === UPDATED Log ===
                console.warn("[TemplateExporter - Carotid] Imported JSON structure might be incorrect (missing 'carotid' key).", importedData);
                 // === UPDATED Error Message ===
                 throw new Error("Imported JSON doesn't seem to be a valid Carotid template (missing 'carotid' data).");
            }

            // Ask user for a name to save the imported template
             // === UPDATED Default Name ===
            const defaultName = file.name.replace(/\.json$/i, '') || `imported_carotid_${Date.now()}`;
             // === UPDATED Prompt Text ===
            const templateName = prompt("Enter a name for the imported carotid template:", defaultName);

            if (templateName && templateName.trim()) {
                // Use the saveTemplate function from template-core (already adapted for carotid storage)
                saveTemplate(templateName.trim(), importedData);
                // saveTemplate already shows notification and updates dropdown
            } else {
                showNotification('Import cancelled by user or invalid name.', 'info');
            }

        } catch (error) {
             // === UPDATED Log ===
            console.error("[TemplateExporter - Carotid] Error reading or parsing JSON file:", error);
            showNotification(`Failed to import template: ${error.message}`, 'error');
        } finally {
            // Clear the file input value
            const importFile = document.getElementById('import-template-file');
            if (importFile) importFile.value = '';
        }
    };

    reader.onerror = (event) => {
         // === UPDATED Log ===
        console.error("[TemplateExporter - Carotid] Error reading file:", event.target.error);
        showNotification('Failed to read the selected file.', 'error');
        const importFile = document.getElementById('import-template-file');
        if (importFile) importFile.value = '';
    };

    reader.readAsText(file); // Read the file content as text
}

// === UPDATED Log ===
console.log("template-exporter.js (Carotid Version) loaded.");