// js/core/template-exporter.js (ADAPTED for Obstetric Project)
// Provides functionality to export the current state as a JSON template
// and import templates from JSON files for OBSTETRIC reports.

import { showNotification } from './ui-core.js';
// Import saveTemplate which is already adapted for Obstetric storage key/structure
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
            console.log("[TemplateExporter - Obstetric] Export template button clicked.");
            // === UPDATED Function Call ===
            await exportCurrentObstetricState(); // Calls the adapted export function <-- CHANGED
        });
    } else {
         // === UPDATED Log ===
        console.error("[TemplateExporter - Obstetric] Export button ('#export-template-btn') not found.");
    }

    if (importBtn && importFile) {
         importBtn.addEventListener('click', () => importFile.click());

        importFile.addEventListener('change', (event) => {
             // === UPDATED Log ===
            console.log("[TemplateExporter - Obstetric] Import file selected.");
            if (event.target.files.length === 0) { return; }
            const file = event.target.files[0];
            importTemplateFromJson(file); // Calls the adapted import function
        });
    } else {
         // === UPDATED Log ===
        console.error("[TemplateExporter - Obstetric] Import button ('#import-template-btn') or file input ('#import-template-file') not found.");
    }
     // === UPDATED Log ===
    console.log("[TemplateExporter - Obstetric] Template exporter/importer initialized.");
}

/**
 * Collects the current state of the Obstetric form and exports it as JSON. (ADAPTED)
 */
// === RENAMED & UPDATED Function ===
async function exportCurrentObstetricState() { // <-- RENAMED
    try {
        // ** Directly import and call Obstetric data collector **
        // === UPDATED Import Path and Function Call ===
        const { collectObstetricData } = await import('../organs/obstetric/obstetric-module.js'); // <-- CHANGE
        const fullObstetricData = collectObstetricData(); // <-- CHANGE

        if (!fullObstetricData) {
            throw new Error("Failed to collect current Obstetric data for export."); // <-- CHANGE
        }

        // Remove the formatter function before exporting
        delete fullObstetricData.formatReportSectionHtml;

        const currentState = {
             // === UPDATED Data Key ===
            obstetric: fullObstetricData, // <-- Store data under 'obstetric' key
            metadata: {
                exportedAt: new Date().toISOString(),
                 // === UPDATED Source Name ===
                source: 'Obstetric Ultrasound Reporting System Export' // <-- Update source name <-- CHANGE
            }
        };

        // Suggest a filename
        // === UPDATED Filename Prefix ===
        const filename = `ob_us_template_${new Date().toISOString().split('T')[0]}.json`; // <-- CHANGE filename prefix
        exportDataAsJson(currentState, filename); // Call the generic JSON exporter
        showNotification('Current state exported as JSON template.', 'success');

    } catch (error) {
         // === UPDATED Log ===
        console.error("[TemplateExporter - Obstetric] Error collecting data for export:", error);
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
        console.log(`[TemplateExporter - Obstetric] Data exported as ${filename}`);
    } catch (error) {
         // === UPDATED Log ===
        console.error("[TemplateExporter - Obstetric] Error exporting data as JSON:", error);
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

            // ** Specifically check for the 'obstetric' key for this project **
            // === UPDATED Check ===
            if (!importedData.obstetric) { // <-- CHANGE Check for 'obstetric' key
                // === UPDATED Log ===
                console.warn("[TemplateExporter - Obstetric] Imported JSON structure might be incorrect (missing 'obstetric' key).", importedData);
                 // === UPDATED Error Message ===
                 throw new Error("Imported JSON doesn't seem to be a valid Obstetric template (missing 'obstetric' data)."); // <-- CHANGE
            }

            // Ask user for a name
             // === UPDATED Default Name ===
            const defaultName = file.name.replace(/\.json$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_') || `imported_ob_us_${Date.now()}`; // <-- CHANGE default name prefix
             // === UPDATED Prompt Text ===
            const templateName = prompt("Enter a name for the imported Obstetric template:", defaultName); // <-- CHANGE prompt text

            if (templateName && templateName.trim()) {
                 if (!importedData.metadata) { importedData.metadata = {}; }
                 // Ensure metadata reflects import and type
                 importedData.metadata.name = templateName.trim();
                 importedData.metadata.importedFrom = file.name;
                 importedData.metadata.organ = 'obstetric'; // Ensure correct organ type <-- CHANGE
                 importedData.metadata.importedAt = new Date().toISOString();

                // Use the saveTemplate function from template-core (already adapted for Obstetric storage)
                saveTemplate(templateName.trim(), importedData); // saveTemplate shows notification
            } else {
                showNotification('Import cancelled by user or invalid name.', 'info');
            }

        } catch (error) {
             // === UPDATED Log ===
            console.error("[TemplateExporter - Obstetric] Error reading or parsing JSON file:", error);
            showNotification(`Failed to import template: ${error.message}`, 'error');
        } finally {
            const importFile = document.getElementById('import-template-file');
            if (importFile) importFile.value = '';
        }
    };

    reader.onerror = (event) => {
         // === UPDATED Log ===
        console.error("[TemplateExporter - Obstetric] Error reading file:", event.target.error);
        showNotification('Failed to read the selected file.', 'error');
        const importFile = document.getElementById('import-template-file');
        if (importFile) importFile.value = '';
    };

    reader.readAsText(file);
}

// === UPDATED Log ===
console.log("template-exporter.js (Obstetric Version) loaded."); // <-- CHANGED