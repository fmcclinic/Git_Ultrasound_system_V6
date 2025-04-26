// js/core/template-exporter.js (ADAPTED for Echocardiogram Project)
// Provides functionality to export the current state as a JSON template
// and import templates from JSON files for ECHOCARDIOGRAM reports.

import { showNotification } from './ui-core.js';
// Import saveTemplate which is already adapted for echo storage key via template-core.js
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
            console.log("[TemplateExporter - Echo] Export template button clicked.");
            // === UPDATED Function Call ===
            await exportCurrentEchoState(); // Calls the adapted export function <-- CHANGED
        });
    } else {
         // === UPDATED Log ===
        console.error("[TemplateExporter - Echo] Export button ('#export-template-btn') not found.");
    }

    if (importBtn && importFile) {
        // Trigger file input click when the styled button/label is clicked
         importBtn.addEventListener('click', () => importFile.click());

         // Handle file selection
        importFile.addEventListener('change', (event) => {
             // === UPDATED Log ===
            console.log("[TemplateExporter - Echo] Import file selected.");
            if (event.target.files.length === 0) {
                return; // User cancelled
            }
            const file = event.target.files[0];
            // Calls the adapted import function
            importTemplateFromJson(file); // <-- Will call adapted version
        });
    } else {
         // === UPDATED Log ===
        console.error("[TemplateExporter - Echo] Import button ('#import-template-btn') or file input ('#import-template-file') not found.");
    }
     // === UPDATED Log ===
    console.log("[TemplateExporter - Echo] Template exporter/importer initialized.");
}

/**
 * Collects the current state of the echo form and exports it as JSON. (ADAPTED)
 */
// === RENAMED Function ===
async function exportCurrentEchoState() {
    try {
        // ** Directly import and call echo data collector **
        // === UPDATED Import Path and Function Call ===
        const { collectEchoData } = await import('../organs/echo/echo-module.js'); // <-- CHANGE
        const fullEchoData = collectEchoData(); // <-- CHANGE

        if (!fullEchoData) {
             // === UPDATED Error Message ===
            throw new Error("Failed to collect current echocardiogram data for export."); // <-- CHANGE
        }

        // Remove the formatter function before exporting
        const { formatReportSectionHtml, ...dataToStore } = fullEchoData;


        const currentState = {
             // === UPDATED Data Key ===
            echo: dataToStore, // <-- Store structured data under 'echo' key
            metadata: {
                exportedAt: new Date().toISOString(),
                 // === UPDATED Source Name ===
                source: 'Echocardiogram Reporting System Export' // <-- Update source name <-- CHANGE
            }
        };

        // Suggest a filename
        // === UPDATED Filename Prefix ===
        const filename = `echocardiogram_template_${new Date().toISOString().split('T')[0]}.json`; // <-- CHANGE filename prefix
        exportDataAsJson(currentState, filename); // Call the generic JSON exporter
        showNotification('Current state exported as JSON template.', 'success');

    } catch (error) {
         // === UPDATED Log ===
        console.error("[TemplateExporter - Echo] Error collecting data for export:", error);
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
        console.log(`[TemplateExporter - Echo] Data exported as ${filename}`);
    } catch (error) {
         // === UPDATED Log ===
        console.error("[TemplateExporter - Echo] Error exporting data as JSON:", error);
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

            // ** Specifically check for the 'echo' key for this project **
            // === UPDATED Check ===
            if (!importedData.echo) { // <-- CHANGE Check for 'echo' key
                // === UPDATED Log ===
                console.warn("[TemplateExporter - Echo] Imported JSON structure might be incorrect (missing 'echo' key).", importedData);
                 // === UPDATED Error Message ===
                 throw new Error("Imported JSON doesn't seem to be a valid Echocardiogram template (missing 'echo' data)."); // <-- CHANGE
            }

            // Ask user for a name to save the imported template
             // === UPDATED Default Name ===
            const defaultName = file.name.replace(/\.json$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_') || `imported_echo_${Date.now()}`; // <-- CHANGE default name prefix
             // === UPDATED Prompt Text ===
            const templateName = prompt("Enter a name for the imported echocardiogram template:", defaultName); // <-- CHANGE prompt text

            if (templateName && templateName.trim()) {
                // Add metadata if it doesn't exist in the imported file
                 if (!importedData.metadata) {
                     importedData.metadata = {};
                 }
                 // Ensure metadata reflects import and type
                 importedData.metadata.name = templateName.trim();
                 importedData.metadata.importedFrom = file.name;
                  // === UPDATED Organ Type ===
                 importedData.metadata.organ = 'echo'; // Ensure correct organ type <-- CHANGE
                 importedData.metadata.importedAt = new Date().toISOString();


                // Use the saveTemplate function from template-core (already adapted for echo storage)
                saveTemplate(templateName.trim(), importedData);
                // saveTemplate already shows notification and updates dropdown
            } else {
                showNotification('Import cancelled by user or invalid name.', 'info');
            }

        } catch (error) {
             // === UPDATED Log ===
            console.error("[TemplateExporter - Echo] Error reading or parsing JSON file:", error);
            showNotification(`Failed to import template: ${error.message}`, 'error');
        } finally {
            // Clear the file input value
            const importFile = document.getElementById('import-template-file');
            if (importFile) importFile.value = '';
        }
    };

    reader.onerror = (event) => {
         // === UPDATED Log ===
        console.error("[TemplateExporter - Echo] Error reading file:", event.target.error);
        showNotification('Failed to read the selected file.', 'error');
        const importFile = document.getElementById('import-template-file');
        if (importFile) importFile.value = ''; // Clear the input
    };

    reader.readAsText(file); // Read the file content as text
}

// === UPDATED Log ===
console.log("template-exporter.js (Echo Version) loaded."); // <-- CHANGED