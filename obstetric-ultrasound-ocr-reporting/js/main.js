// js/main.js - For the INDEPENDENT Obstetric Ultrasound Reporting Project (OCR Integration)

// --- Core Module Imports ---
import { initTabs, showNotification } from './core/ui-core.js';
import { initTemplateSystem } from './core/template-core.js';
import { initTemplateExporter } from './core/template-exporter.js';
import { initReportSystem } from './core/report-core.js';
// --- Module Imports ---
import { initImageHandler } from './modules/image-handler.js'; // Updated image handler
// --- Organ Specific Module Import ---
import { init as initObstetricModule } from './organs/obstetric/obstetric-module.js'; // Updated OB module

// --- Global Config & State Variables ---
let apiKey = null;
let translationPrompt = null;
let ocrHandlerModule = null; // To store the loaded OCR module

// --- Configuration Loading ---
/**
 * Fetches configuration files (API key and translation prompt).
 */
async function loadConfig() {
    console.log("[Main - Obstetric] Loading configuration...");
    try {
        // Load API Key
        let keyResponse;
        try {
             keyResponse = await fetch('apikey.txt');
             if (!keyResponse.ok) throw new Error('apikey.txt not found in root');
        } catch (e1) {
            console.warn("apikey.txt not found in root, trying parent directory...");
            try {
                keyResponse = await fetch('../apikey.txt'); // Try parent dir
                if (!keyResponse.ok) throw new Error('apikey.txt not found in root or parent');
            } catch (e2) {
                console.error(`Failed to load API key: ${e1.message} / ${e2.message}`);
                throw new Error('API key file (apikey.txt) not found or inaccessible.');
            }
        }
        apiKey = (await keyResponse.text()).trim();
        if (!apiKey) {
             console.warn("[Main - Obstetric] API Key is empty in apikey.txt. Translation/OCR will likely fail.");
             showNotification("Warning: API Key is empty.", "info", 4000);
        } else {
             console.log("[Main - Obstetric] API Key loaded.");
        }

        // Load OB Translation Prompt
        const transPromptFileName = 'prompt_translate_vi_ob.txt';
        let transPromptResponse;
        try {
             transPromptResponse = await fetch(transPromptFileName);
             if (!transPromptResponse.ok) throw new Error(`${transPromptFileName} not found in root`);
        } catch (e1) {
             console.warn(`${transPromptFileName} not found in root, trying parent directory...`);
             try {
                 transPromptResponse = await fetch(`../${transPromptFileName}`); // Try parent dir
                 if (!transPromptResponse.ok) throw new Error(`${transPromptFileName} not found in root or parent`);
             } catch(e2) {
                  console.error(`Failed to load OB translation prompt: ${e1.message} / ${e2.message}`);
                 throw new Error(`OB translation prompt file (${transPromptFileName}) not found or inaccessible.`);
             }
        }
        translationPrompt = await transPromptResponse.text();
        if (!translationPrompt) {
             console.warn(`[Main - Obstetric] OB Translation prompt is empty.`);
             showNotification("Warning: OB Translation prompt is empty.", "info", 4000);
        } else {
             console.log("[Main - Obstetric] OB Translation prompt loaded.");
        }

        console.log("[Main - Obstetric] Configuration loading completed.");
    } catch (error) {
        console.error("[Main - Obstetric] Failed to load configuration:", error);
        showNotification(`Error loading config: ${error.message}. Some features may not work.`, "error", 7000);
        // Reset potentially partially loaded configs
        apiKey = null;
        translationPrompt = null;
    }
}

// --- Attempt to Load OCR Module ---
/**
 * Tries to dynamically load the OCR handler module.
 * Sets the ocrHandlerModule variable and adds/removes CSS class for UI feedback.
 */
async function loadOcrModule() {
    try {
        // Dynamically import the OCR handler module
        // NOTE: The path must be correct relative to the main.js file location
        const ocrModule = await import('./modules/ocr-handler.js');
        ocrHandlerModule = ocrModule; // Store the module object if loaded successfully

        // Optionally call an init function from the OCR module if it exists
        if (typeof ocrHandlerModule.initOcrHandler === 'function') {
             ocrHandlerModule.initOcrHandler();
        }
        console.log("[Main - Obstetric] OCR Handler module loaded successfully.");
        // Remove class to enable OCR buttons via CSS
        document.body.classList.remove('ocr-feature-disabled');
    } catch (error) {
        console.warn("[Main - Obstetric] OCR Handler module ('./modules/ocr-handler.js') not found or failed to load. OCR feature disabled.", error);
        ocrHandlerModule = null; // Ensure it's null if loading failed
        // Add class to disable OCR buttons via CSS
        document.body.classList.add('ocr-feature-disabled');
    }
}

// --- Exported Functions ---
/**
 * Returns the loaded API key.
 * @returns {string | null} The API key or null if not loaded/empty.
 */
export function getApiKey() {
    return apiKey;
}

/**
 * Returns the loaded translation prompt.
 * @returns {string | null} The translation prompt or null if not loaded/empty.
 */
export function getTranslationPrompt() {
    return translationPrompt;
}

/**
 * Checks if the OCR module was loaded successfully.
 * @returns {boolean} True if OCR functionality is available, false otherwise.
 */
export function isOcrAvailable() {
    return !!ocrHandlerModule; // Returns true if the module object exists (is truthy), false if null
}

/**
 * Gets the loaded OCR handler module (if available).
 * Used by other modules to call OCR functions.
 * @returns {object | null} The OCR handler module object or null.
 */
export function getOcrHandler() {
    // Make sure to return the actual module object, not just the boolean check
    return ocrHandlerModule;
}


// --- Initialization on DOMContentLoaded ---
/**
 * Main entry point when the HTML document is fully loaded.
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log("[Main - Obstetric] DOM fully loaded. Initializing Obstetric Reporting application...");

    // Load configurations first (API key, prompts)
    await loadConfig();

    // **Attempt to load the optional OCR module**
    await loadOcrModule();

    // Initialize Core UI & Utilities
    try {
        initTabs();
        initImageHandler(); // Initializes image uploads and adds OCR buttons (visibility controlled by CSS/JS)
        initTemplateSystem(); // Initializes template load/save/delete
        initTemplateExporter(); // Initializes template import/export
        initReportSystem(); // Initializes report generation/preview/print/translate

        // Initialize Obstetric specific module AFTER core systems and OCR check
        // The OB module will internally check isOcrAvailable() to enable listeners
        await initObstetricModule(); // Make OB init async if it needs to load prompts

         // Set default exam date to today if empty
        const examDateInput = document.getElementById('exam-date');
        if (examDateInput && !examDateInput.value) {
             try {
                 const today = new Date();
                 // Format to YYYY-MM-DD for the input type="date"
                 const year = today.getFullYear();
                 const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
                 const day = String(today.getDate()).padStart(2, '0');
                 examDateInput.value = `${year}-${month}-${day}`;
                 console.log(`[Main - Obstetric] Default exam date set to: ${examDateInput.value}`);
             } catch (dateError) {
                 console.error("Error setting default date:", dateError);
             }
        }

        console.log("[Main - Obstetric] Obstetric Reporting Application Initialized Successfully.");
        // Update status message based on OCR availability
        showNotification(`Obstetric Reporting System Ready (OCR ${isOcrAvailable() ? 'Enabled' : 'Disabled'}) / Hệ thống Sẵn sàng (OCR ${isOcrAvailable() ? 'Bật' : 'Tắt'})`, "success", 3000);

    } catch (initError) {
         console.error("[Main - Obstetric] CRITICAL ERROR during initialization:", initError);
         showNotification("Application initialization failed! Check console.", "error", 10000);
    }
});