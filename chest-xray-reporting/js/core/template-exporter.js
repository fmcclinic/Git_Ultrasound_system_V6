// js/core/template-exporter.js (ADAPTED for Chest X-ray Project)
// Provides functionality to export the current state as a JSON template
// and import templates from JSON files for CHEST X-RAY reports.

import { showNotification } from './ui-core.js';
// Import saveTemplate which is already adapted for ChestXray storage key/structure
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
            console.log("[TemplateExporter - ChestXray] Export template button clicked.");
            // === UPDATED Function Call ===
            await exportCurrentChestXrayState(); // Calls the adapted export function <-- CHANGED
        });
    } else {
         // === UPDATED Log ===
        console.error("[TemplateExporter - ChestXray] Export button ('#export-template-btn') not found.");
    }

    if (importBtn && importFile) {
         importBtn.addEventListener('click', () => importFile.click());

        importFile.addEventListener('change', (event) => {
             // === UPDATED Log ===
            console.log("[TemplateExporter - ChestXray] Import file selected.");
            if (event.target.files.length === 0) { return; }
            const file = event.target.files[0];
            importTemplateFromJson(file); // Calls the adapted import function
        });
    } else {
         // === UPDATED Log ===
        console.error("[TemplateExporter - ChestXray] Import button ('#import-template-btn') or file input ('#import-template-file') not found.");
    }
     // === UPDATED Log ===
    console.log("[TemplateExporter - ChestXray] Template exporter/importer initialized.");
}

/**
 * Collects the current state of the ChestXray form and exports it as JSON. (ADAPTED)
 */
// === RENAMED & UPDATED Function ===
async function exportCurrentChestXrayState() { // <-- RENAMED
    try {
        // ** Directly import and call ChestXray data collector **
        // === UPDATED Import Path and Function Call ===
        const { collectChestXrayData } = await import('../organs/chestxray/chestxray-module.js'); // <-- CHANGE
        const fullChestXrayData = collectChestXrayData(); // <-- CHANGE

        if (!fullChestXrayData) {
             // === UPDATED ===
            throw new Error("Failed to collect current Chest X-ray data for export."); // <-- CHANGE
        }

        // Remove the formatter function before exporting
        delete fullChestXrayData.formatReportSectionHtml;

        const currentState = {
             // === UPDATED Data Key ===
            chestXray: fullChestXrayData, // <-- Store data under 'chestXray' key
            metadata: {
                exportedAt: new Date().toISOString(),
                 // === UPDATED Source Name ===
                source: 'Chest X-ray Reporting System Export' // <-- Update source name <-- CHANGE
            }
        };

        // Suggest a filename
        // === UPDATED Filename Prefix ===
        const filename = `cxr_report_template_${new Date().toISOString().split('T')[0]}.json`; // <-- CHANGE filename prefix
        exportDataAsJson(currentState, filename); // Call the generic JSON exporter
        showNotification('Current state exported as JSON template.', 'success');

    } catch (error) {
         // === UPDATED Log ===
        console.error("[TemplateExporter - ChestXray] Error collecting data for export:", error);
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
        console.log(`[TemplateExporter - ChestXray] Data exported as ${filename}`);
    } catch (error) {
         // === UPDATED Log ===
        console.error("[TemplateExporter - ChestXray] Error exporting data as JSON:", error);
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

            // ** Specifically check for the 'chestXray' key for this project **
            // === UPDATED Check ===
            if (!importedData.chestXray) { // <-- CHANGE Check for 'chestXray' key
                // === UPDATED Log ===
                console.warn("[TemplateExporter - ChestXray] Imported JSON structure might be incorrect (missing 'chestXray' key).", importedData);
                 // === UPDATED Error Message ===
                 throw new Error("Imported JSON doesn't seem to be a valid Chest X-ray template (missing 'chestXray' data)."); // <-- CHANGE
            }

            // Ask user for a name
             // === UPDATED Default Name ===
            const defaultName = file.name.replace(/\.json$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_') || `imported_cxr_${Date.now()}`; // <-- CHANGE default name prefix
             // === UPDATED Prompt Text ===
            const templateName = prompt("Enter a name for the imported Chest X-ray template:", defaultName); // <-- CHANGE prompt text

            if (templateName && templateName.trim()) {
                 if (!importedData.metadata) { importedData.metadata = {}; }
                 // Ensure metadata reflects import and type
                 importedData.metadata.name = templateName.trim();
                 importedData.metadata.importedFrom = file.name;
                 importedData.metadata.organ = 'chestXray'; // Ensure correct organ type <-- CHANGE
                 importedData.metadata.importedAt = new Date().toISOString();

                // Use the saveTemplate function from template-core (already adapted for ChestXray storage)
                saveTemplate(templateName.trim(), importedData); // saveTemplate shows notification
            } else {
                showNotification('Import cancelled by user or invalid name.', 'info');
            }

        } catch (error) {
             // === UPDATED Log ===
            console.error("[TemplateExporter - ChestXray] Error reading or parsing JSON file:", error);
            showNotification(`Failed to import template: ${error.message}`, 'error');
        } finally {
            const importFile = document.getElementById('import-template-file');
            if (importFile) importFile.value = '';
        }
    };

    reader.onerror = (event) => {
         // === UPDATED Log ===
        console.error("[TemplateExporter - ChestXray] Error reading file:", event.target.error);
        showNotification('Failed to read the selected file.', 'error');
        const importFile = document.getElementById('import-template-file');
        if (importFile) importFile.value = '';
    };

    reader.readAsText(file);
}

// === UPDATED Log ===
console.log("template-exporter.js (ChestXray Version) loaded."); // <-- CHANGED