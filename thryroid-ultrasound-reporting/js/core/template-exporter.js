// js/core/template-exporter.js
// Provides functionality to export the current state as a JSON template
// and import templates from JSON files.

import { showNotification } from './ui-core.js';
import { getFormData } from './form-core.js';
import { saveTemplate } from './template-core.js'; // To save the imported template

/**
 * Initializes the import/export button listeners.
 */
export function initTemplateExporter() { // Renamed to avoid conflict if called from template-core
    const exportBtn = document.getElementById('export-template-btn');
    const importBtn = document.getElementById('import-template-btn');
    const importFile = document.getElementById('import-template-file');

    if (exportBtn) {
        exportBtn.addEventListener('click', async () => {
             console.log("Export template button clicked.");
             try {
                 // Collect current state similar to saving a template
                 const { collectThyroidData } = await import('../organs/thyroid/thyroid-module.js');
                 const fullThyroidData = collectThyroidData();
                 const currentState = {
                     thyroid: fullThyroidData,
                     // Add other organ data if applicable
                     metadata: {
                         exportedAt: new Date().toISOString(),
                         source: 'Ultrasound Reporting System Export'
                     }
                 };
                 // Suggest a filename based on current content if possible, or generic
                 const filename = `ultrasound_template_${new Date().toISOString().split('T')[0]}.json`;
                 exportDataAsJson(currentState, filename);
                 showNotification('Current state exported as JSON.', 'success');

             } catch (error) {
                 console.error("Error collecting data for export:", error);
                 showNotification('Failed to collect data for export.', 'error');
             }
        });
    }

    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => {
             console.log("Import template button clicked.");
            if (importFile.files.length === 0) {
                showNotification('Please select a JSON file to import.', 'info');
                return;
            }
            const file = importFile.files[0];
            importTemplateFromJson(file);
        });
    }
     console.log("Template exporter/importer initialized.");
}

/**
 * Exports data object as a downloadable JSON file.
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
         console.log(`Data exported as ${filename}`);
    } catch (error) {
        console.error("Error exporting data as JSON:", error);
        showNotification('Failed to export data as JSON.', 'error');
    }
}

/**
 * Imports a template from a selected JSON file.
 * @param {File} file - The JSON file selected by the user.
 */
function importTemplateFromJson(file) {
    if (!file || !file.type.match('application/json')) {
        showNotification('Invalid file type. Please select a JSON file.', 'error');
        return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
        try {
            const importedData = JSON.parse(event.target.result);

            // Basic validation of imported data structure (can be more thorough)
            if (typeof importedData !== 'object' || importedData === null) {
                 throw new Error("Imported file does not contain valid JSON data.");
            }
             // Check for expected top-level keys (like 'thyroid' or 'metadata')
             if (!importedData.thyroid && !importedData.metadata) { // Example check
                 console.warn("Imported JSON structure might not match expected template format.");
                 // Decide whether to proceed or reject
             }


            // Ask user for a name to save the imported template
            const defaultName = file.name.replace(/\.json$/i, '') || `imported_${Date.now()}`;
            const templateName = prompt("Enter a name for the imported template:", defaultName);

            if (templateName) {
                // Use the saveTemplate function from template-core to add it to storage
                saveTemplate(templateName, importedData);
                 // Optionally, immediately load the imported template?
                 // loadTemplate(templateName);
                 showNotification(`Template "${templateName}" imported successfully. You can now load it from the dropdown.`, 'success');
            } else {
                showNotification('Import cancelled by user.', 'info');
            }

        } catch (error) {
            console.error("Error reading or parsing JSON file:", error);
            showNotification(`Failed to import template: ${error.message}`, 'error');
        } finally {
            // Clear the file input value so the same file can be selected again if needed
            const importFile = document.getElementById('import-template-file');
            if (importFile) importFile.value = '';
        }
    };

    reader.onerror = (event) => {
        console.error("Error reading file:", event.target.error);
        showNotification('Failed to read the selected file.', 'error');
         const importFile = document.getElementById('import-template-file');
         if (importFile) importFile.value = '';
    };

    reader.readAsText(file); // Read the file content as text
}

// Self-initialize if needed, or rely on main.js to call initTemplateExporter
// initTemplateExporter();
// It's better to initialize from main.js after DOM is ready.
// Make sure template-core's init runs first if this relies on it.
// Or combine the initialization logic if they are tightly coupled.
// Let's assume main.js calls both initTemplateSystem and initTemplateExporter.