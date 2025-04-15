// js/core/template-exporter.js (ADAPTED for Gynecologic Project)
// Provides functionality to export the current state as a JSON template
// and import templates from JSON files for GYNECOLOGIC reports.

import { showNotification } from './ui-core.js';
// Import saveTemplate which is already adapted for Gynecologic storage key/structure
import { saveTemplate } from './template-core.js'; // Uses adapted saveTemplate

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
            console.log("[TemplateExporter - Gynecologic] Export template button clicked."); // <-- CHANGED
            // === *** UPDATED Function Call *** ===
            await exportCurrentGynecologicState(); // Calls the adapted export function <-- CHANGED
        });
    } else {
         // === UPDATED Log ===
        console.error("[TemplateExporter - Gynecologic] Export button ('#export-template-btn') not found."); // <-- CHANGED
    }

    if (importBtn && importFile) {
         importBtn.addEventListener('click', () => importFile.click());

        importFile.addEventListener('change', (event) => {
             // === UPDATED Log ===
            console.log("[TemplateExporter - Gynecologic] Import file selected."); // <-- CHANGED
            if (event.target.files.length === 0) { return; }
            const file = event.target.files[0];
            importTemplateFromJson(file); // Calls the adapted import function
        });
    } else {
         // === UPDATED Log ===
        console.error("[TemplateExporter - Gynecologic] Import button ('#import-template-btn') or file input ('#import-template-file') not found."); // <-- CHANGED
    }
     // === UPDATED Log ===
    console.log("[TemplateExporter - Gynecologic] Template exporter/importer initialized."); // <-- CHANGED
}

/**
 * Collects the current state of the Gynecologic form and exports it as JSON. (ADAPTED)
 */
// === *** RENAMED & UPDATED Function *** ===
async function exportCurrentGynecologicState() { // <-- RENAMED
    try {
        // ** Directly import and call Gynecologic data collector **
        // === *** UPDATED Import Path and Function Call *** ===
        const { collectGynecologicData } = await import('../organs/gynecologic/gynecologic-module.js'); // <-- CHANGE
        const fullGynecologicData = collectGynecologicData(); // <-- CHANGE

        if (!fullGynecologicData) {
            // === UPDATED ERROR MESSAGE ===
            throw new Error("Failed to collect current Gynecologic data for export."); // <-- CHANGE
        }

        // Remove the formatter function before exporting
        delete fullGynecologicData.formatReportSectionHtml;

        const currentState = {
             // === *** UPDATED Data Key *** ===
            gynecologic: fullGynecologicData, // <-- Store data under 'gynecologic' key
            metadata: {
                exportedAt: new Date().toISOString(),
                 // === *** UPDATED Source Name *** ===
                source: 'Gynecologic Ultrasound Reporting System Export' // <-- Update source name <-- CHANGE
            }
        };

        // Suggest a filename
        // === *** UPDATED Filename Prefix *** ===
        const filename = `gyn_us_template_${new Date().toISOString().split('T')[0]}.json`; // <-- CHANGE filename prefix
        exportDataAsJson(currentState, filename); // Call the generic JSON exporter
        showNotification('Current state exported as JSON template.', 'success');

    } catch (error) {
         // === UPDATED Log ===
        console.error("[TemplateExporter - Gynecologic] Error collecting data for export:", error); // <-- CHANGED
        showNotification(`Failed to collect data for export: ${error.message}`, 'error');
    }
}


/**
 * Exports data object as a downloadable JSON file.
 * (No changes needed in this helper function logic)
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
        console.log(`[TemplateExporter - Gynecologic] Data exported as ${filename}`); // <-- CHANGED
    } catch (error) {
         // === UPDATED Log ===
        console.error("[TemplateExporter - Gynecologic] Error exporting data as JSON:", error); // <-- CHANGED
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

            if (typeof importedData !== 'object' || importedData === null) {
                throw new Error("Imported file does not contain valid JSON object data.");
            }

            // ** Specifically check for the 'gynecologic' key for this project **
            // === *** UPDATED Check *** ===
            if (!importedData.gynecologic) { // <-- CHANGE Check for 'gynecologic' key
                // === UPDATED Log ===
                console.warn("[TemplateExporter - Gynecologic] Imported JSON structure might be incorrect (missing 'gynecologic' key).", importedData); // <-- CHANGED
                 // === UPDATED Error Message ===
                 throw new Error("Imported JSON doesn't seem to be a valid Gynecologic template (missing 'gynecologic' data)."); // <-- CHANGE
            }

            // Ask user for a name
             // === *** UPDATED Default Name *** ===
            const defaultName = file.name.replace(/\.json$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_') || `imported_gyn_us_${Date.now()}`; // <-- CHANGE default name prefix
             // === *** UPDATED Prompt Text *** ===
            const templateName = prompt("Enter a name for the imported Gynecologic template:", defaultName); // <-- CHANGE prompt text

            if (templateName && templateName.trim()) {
                 if (!importedData.metadata) { importedData.metadata = {}; }
                 // Ensure metadata reflects import and type
                 importedData.metadata.name = templateName.trim();
                 importedData.metadata.importedFrom = file.name;
                 // === *** UPDATED Organ Type *** ===
                 importedData.metadata.organ = 'gynecologic'; // Ensure correct organ type <-- CHANGE
                 importedData.metadata.importedAt = new Date().toISOString();

                // Use the saveTemplate function from template-core (already adapted for Gynecologic storage)
                saveTemplate(templateName.trim(), importedData); // saveTemplate shows notification
            } else {
                showNotification('Import cancelled by user or invalid name.', 'info');
            }

        } catch (error) {
             // === UPDATED Log ===
            console.error("[TemplateExporter - Gynecologic] Error reading or parsing JSON file:", error); // <-- CHANGED
            showNotification(`Failed to import template: ${error.message}`, 'error');
        } finally {
            const importFile = document.getElementById('import-template-file');
            if (importFile) importFile.value = '';
        }
    };

    reader.onerror = (event) => {
         // === UPDATED Log ===
        console.error("[TemplateExporter - Gynecologic] Error reading file:", event.target.error); // <-- CHANGED
        showNotification('Failed to read the selected file.', 'error');
        const importFile = document.getElementById('import-template-file');
        if (importFile) importFile.value = '';
    };

    reader.readAsText(file);
}

// === UPDATED Log ===
console.log("template-exporter.js (Gynecologic Version) loaded."); // <-- CHANGED