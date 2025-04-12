// js/core/template-exporter.js (ADAPTED for Breast Project)
// Provides functionality to export the current state as a JSON template
// and import templates from JSON files for BREAST reports.

import { showNotification } from './ui-core.js';
// form-core might not be needed directly here, but breast-module uses it
// import { getFormData } from './form-core.js';
import { saveTemplate } from './template-core.js'; // To save the imported template

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
            console.log("[TemplateExporter - Breast] Export template button clicked.");
            // Calls the adapted exportCurrentBreastState
            await exportCurrentBreastState();
        });
    } else {
        console.error("[TemplateExporter - Breast] Export button not found.");
    }

    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => {
            console.log("[TemplateExporter - Breast] Import template button clicked.");
            if (importFile.files.length === 0) {
                showNotification('Please select a JSON file to import.', 'info');
                return;
            }
            const file = importFile.files[0];
            // Calls the standard import function
            importTemplateFromJson(file);
        });
    } else {
        console.error("[TemplateExporter - Breast] Import button or file input not found.");
    }
    console.log("[TemplateExporter - Breast] Template exporter/importer initialized.");
}

/**
 * Collects the current state of the breast form and exports it as JSON. (ADAPTED)
 */
async function exportCurrentBreastState() {
    try {
        // ** Directly import and call breast data collector **
        const { collectBreastData } = await import('../organs/breast/breast-module.js'); // <-- CHANGE
        const fullBreastData = collectBreastData(); // <-- CHANGE

        if (!fullBreastData) {
            throw new Error("Failed to collect current breast data for export.");
        }

        const currentState = {
            breast: fullBreastData, // <-- Store data under 'breast' key
            metadata: {
                exportedAt: new Date().toISOString(),
                source: 'Breast Ultrasound Reporting System Export' // <-- Update source name
            }
        };

        // Suggest a filename
        // You could try to generate a more specific name based on patient ID if available,
        // but a timestamped name is generally safe.
        const filename = `breast_us_template_${new Date().toISOString().split('T')[0]}.json`; // <-- CHANGE filename prefix
        exportDataAsJson(currentState, filename); // Call the generic JSON exporter
        showNotification('Current state exported as JSON.', 'success');

    } catch (error) {
        console.error("[TemplateExporter - Breast] Error collecting data for export:", error);
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
 * (No changes needed inside, relies on saveTemplate which is adapted)
 * @param {File} file - The JSON file selected by the user.
 */
function importTemplateFromJson(file) {
    if (!file || !file.type.match('application/json')) {
        showNotification('Invalid file type. Please select a JSON file (.json).', 'error');
        // Clear the input field in case of error
        const importFile = document.getElementById('import-template-file');
        if (importFile) importFile.value = '';
        return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
        try {
            const importedData = JSON.parse(event.target.result);

            // Basic validation - Check if it's an object and has the 'breast' key
            if (typeof importedData !== 'object' || importedData === null) {
                throw new Error("Imported file does not contain valid JSON object data.");
            }
            // ** Specifically check for the 'breast' key for this project **
            if (!importedData.breast) {
                console.warn("[TemplateExporter - Breast] Imported JSON structure might be incorrect (missing 'breast' key).", importedData);
                // You might want to throw an error here if the key is strictly required
                 throw new Error("Imported JSON doesn't seem to be a valid Breast template (missing 'breast' data).");
            }

            // Ask user for a name to save the imported template
            const defaultName = file.name.replace(/\.json$/i, '') || `imported_breast_${Date.now()}`;
            const templateName = prompt("Enter a name for the imported breast template:", defaultName);

            if (templateName && templateName.trim()) {
                // Use the saveTemplate function from template-core (already adapted for breast storage)
                saveTemplate(templateName.trim(), importedData);
                // saveTemplate already shows notification and updates dropdown
                // showNotification(`Template "${templateName.trim()}" imported successfully. You can now load it from the dropdown.`, 'success');
            } else {
                showNotification('Import cancelled by user or invalid name.', 'info');
            }

        } catch (error) {
            console.error("[TemplateExporter - Breast] Error reading or parsing JSON file:", error);
            showNotification(`Failed to import template: ${error.message}`, 'error');
        } finally {
            // Clear the file input value so the same file can be selected again
            const importFile = document.getElementById('import-template-file');
            if (importFile) importFile.value = '';
        }
    };

    reader.onerror = (event) => {
        console.error("[TemplateExporter - Breast] Error reading file:", event.target.error);
        showNotification('Failed to read the selected file.', 'error');
        const importFile = document.getElementById('import-template-file');
        if (importFile) importFile.value = '';
    };

    reader.readAsText(file); // Read the file content as text
}

console.log("template-exporter.js (Breast Version) loaded.");