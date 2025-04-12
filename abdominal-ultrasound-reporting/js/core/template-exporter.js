// js/core/template-exporter.js (ADAPTED for Abdominal Project)
// Provides functionality to export the current state as a JSON template
// and import templates from JSON files for ABDOMINAL reports.

import { showNotification } from './ui-core.js';
// Import saveTemplate which is already adapted for abdominal storage key
import { saveTemplate } from './template-core.js';

/**
 * Initializes the import/export button listeners.
 * (No changes needed inside this function, it calls the adapted helpers)
 */
export function initTemplateExporter() {
    const exportBtn = document.getElementById('export-template-btn');
    const importBtn = document.getElementById('import-template-btn'); // Assuming this button exists
    const importFile = document.getElementById('import-template-file'); // Assuming this input exists

    if (exportBtn) {
        exportBtn.addEventListener('click', async () => {
            // === UPDATED Log ===
            console.log("[TemplateExporter - Abdominal] Export template button clicked.");
            // === UPDATED Function Call ===
            await exportCurrentAbdominalState(); // Calls the adapted export function <-- CHANGED
        });
    } else {
         // === UPDATED Log ===
        console.error("[TemplateExporter - Abdominal] Export button ('#export-template-btn') not found.");
    }

    if (importBtn && importFile) {
        // Trigger file input click when the styled button/label is clicked
         importBtn.addEventListener('click', () => importFile.click());

         // Handle file selection
        importFile.addEventListener('change', (event) => {
             // === UPDATED Log ===
            console.log("[TemplateExporter - Abdominal] Import file selected.");
            if (event.target.files.length === 0) {
                // showNotification('No file selected.', 'info'); // Maybe not needed if user cancelled
                return;
            }
            const file = event.target.files[0];
            // Calls the adapted import function
            importTemplateFromJson(file);
        });
    } else {
         // === UPDATED Log ===
        console.error("[TemplateExporter - Abdominal] Import button ('#import-template-btn') or file input ('#import-template-file') not found.");
    }
     // === UPDATED Log ===
    console.log("[TemplateExporter - Abdominal] Template exporter/importer initialized.");
}

/**
 * Collects the current state of the abdominal form and exports it as JSON. (ADAPTED)
 */
// === RENAMED Function ===
async function exportCurrentAbdominalState() {
    try {
        // ** Directly import and call abdominal data collector **
        // === UPDATED Import Path and Function Call ===
        const { collectAbdominalData } = await import('../organs/abdominal/abdominal-module.js'); // <-- CHANGE
        const fullAbdominalData = collectAbdominalData(); // <-- CHANGE

        if (!fullAbdominalData) {
            throw new Error("Failed to collect current abdominal data for export."); // <-- CHANGE
        }

        // Remove the formatter function before exporting
        delete fullAbdominalData.formatReportSectionHtml;

        const currentState = {
             // === UPDATED Data Key ===
            abdominal: fullAbdominalData, // <-- Store data under 'abdominal' key
            metadata: {
                exportedAt: new Date().toISOString(),
                 // === UPDATED Source Name ===
                source: 'Abdominal Ultrasound Reporting System Export' // <-- Update source name <-- CHANGE
            }
        };

        // Suggest a filename
        // === UPDATED Filename Prefix ===
        const filename = `abdominal_us_template_${new Date().toISOString().split('T')[0]}.json`; // <-- CHANGE filename prefix
        exportDataAsJson(currentState, filename); // Call the generic JSON exporter
        showNotification('Current state exported as JSON template.', 'success'); // <-- Message Clarified

    } catch (error) {
         // === UPDATED Log ===
        console.error("[TemplateExporter - Abdominal] Error collecting data for export:", error);
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
        // === UPDATED Log ===
        console.log(`[TemplateExporter - Abdominal] Data exported as ${filename}`);
    } catch (error) {
         // === UPDATED Log ===
        console.error("[TemplateExporter - Abdominal] Error exporting data as JSON:", error);
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
        if (importFile) importFile.value = ''; // Clear the input
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

            // ** Specifically check for the 'abdominal' key for this project **
            // === UPDATED Check ===
            if (!importedData.abdominal) { // <-- CHANGE Check for 'abdominal' key
                // === UPDATED Log ===
                console.warn("[TemplateExporter - Abdominal] Imported JSON structure might be incorrect (missing 'abdominal' key).", importedData);
                 // === UPDATED Error Message ===
                 throw new Error("Imported JSON doesn't seem to be a valid Abdominal template (missing 'abdominal' data)."); // <-- CHANGE
            }

            // Ask user for a name to save the imported template
             // === UPDATED Default Name ===
            const defaultName = file.name.replace(/\.json$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_') || `imported_abdominal_${Date.now()}`; // <-- CHANGE default name prefix
             // === UPDATED Prompt Text ===
            const templateName = prompt("Enter a name for the imported abdominal template:", defaultName); // <-- CHANGE prompt text

            if (templateName && templateName.trim()) {
                // Add metadata if it doesn't exist in the imported file
                 if (!importedData.metadata) {
                     importedData.metadata = {};
                 }
                 // Ensure metadata reflects import and type
                 importedData.metadata.name = templateName.trim();
                 importedData.metadata.importedFrom = file.name;
                 importedData.metadata.organ = 'abdominal'; // Ensure correct organ type <-- CHANGE
                 importedData.metadata.importedAt = new Date().toISOString();


                // Use the saveTemplate function from template-core (already adapted for abdominal storage)
                saveTemplate(templateName.trim(), importedData);
                // saveTemplate already shows notification and updates dropdown
            } else {
                showNotification('Import cancelled by user or invalid name.', 'info');
            }

        } catch (error) {
             // === UPDATED Log ===
            console.error("[TemplateExporter - Abdominal] Error reading or parsing JSON file:", error);
            showNotification(`Failed to import template: ${error.message}`, 'error');
        } finally {
            // Clear the file input value
            const importFile = document.getElementById('import-template-file');
            if (importFile) importFile.value = '';
        }
    };

    reader.onerror = (event) => {
         // === UPDATED Log ===
        console.error("[TemplateExporter - Abdominal] Error reading file:", event.target.error);
        showNotification('Failed to read the selected file.', 'error');
        const importFile = document.getElementById('import-template-file');
        if (importFile) importFile.value = ''; // Clear the input
    };

    reader.readAsText(file); // Read the file content as text
}

// === UPDATED Log ===
console.log("template-exporter.js (Abdominal Version) loaded."); // <-- CHANGED