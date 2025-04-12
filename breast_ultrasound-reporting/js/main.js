// js/main.js - For the INDEPENDENT Breast Ultrasound Reporting Project

// --- Core Module Imports ---
// UI/Form/Utils
import { initTabs, initSectionToggles, showNotification } from './core/ui-core.js';
import { initTemplateSystem } from './core/template-core.js'; // Sẽ dùng storage key và presets riêng cho vú
import { initTemplateExporter } from './core/template-exporter.js'; // Sẽ export data vú
import { initReportSystem } from './core/report-core.js'; // Sẽ gọi collectBreastData
// Note: form-core.js is likely imported internally by report-core & template-core, no direct init needed here usually

// --- Functional Module Imports ---
import { initImageHandler } from './modules/image-handler.js';
// birads-calculator.js sẽ được import và sử dụng bên trong breast-module.js khi cần
// report-translator.js sẽ được import và sử dụng bên trong report-core.js khi cần

// --- Organ Specific Module Import ---
import { init as initBreastModule } from './organs/breast/breast-module.js'; // Import hàm init của module tuyến vú

// --- Global Config Variables ---
let apiKey = null;
let translationPrompt = null;

// --- Configuration Loading ---
/**
 * Fetches configuration files (API key and translation prompt).
 */
async function loadConfig() {
    console.log("[Main] Loading configuration...");
    try {
        // 1. Load API Key
        const keyResponse = await fetch('apikey.txt'); // Assumes apikey.txt is in the root
        if (!keyResponse.ok) {
            throw new Error(`API key file (apikey.txt) not found or inaccessible (Status: ${keyResponse.status})`);
        }
        apiKey = (await keyResponse.text()).trim();
        if (!apiKey) {
            console.warn("[Main] API Key is empty in apikey.txt. Translation will likely fail.");
            showNotification("Warning: API Key is empty.", "info", 4000);
        } else {
             console.log("[Main] API Key loaded.");
        }

        // 2. Load Breast-Specific Translation Prompt
        // ** SỬ DỤNG FILE PROMPT DÀNH RIÊNG CHO VÚ **
        const promptFileName = 'prompt_translate_vi_breast.txt';
        const promptResponse = await fetch(promptFileName);
        if (!promptResponse.ok) {
            throw new Error(`Breast translation prompt file (${promptFileName}) not found or inaccessible (Status: ${promptResponse.status})`);
        }
        translationPrompt = await promptResponse.text();
        if (!translationPrompt) {
            console.warn(`[Main] Translation prompt is empty in ${promptFileName}.`);
            showNotification("Warning: Translation prompt is empty.", "info", 4000);
        } else {
            console.log("[Main] Breast translation prompt loaded.");
        }

        console.log("[Main] Configuration loading process completed.");

    } catch (error) {
        console.error("[Main] Failed to load configuration:", error);
        // Show persistent error notification as translation depends on this
        showNotification(`Error loading config: ${error.message}. Translation may not work.`, "error", 10000);
    }
}

// --- Configuration Getters (Exported for other modules) ---
/**
 * Returns the loaded API key.
 * @returns {string | null} The API key or null if not loaded.
 */
export function getApiKey() {
    return apiKey;
}

/**
 * Returns the loaded translation prompt.
 * @returns {string | null} The translation prompt or null if not loaded.
 */
export function getTranslationPrompt() {
    return translationPrompt;
}

// --- Initialization on DOMContentLoaded ---
/**
 * Main entry point when the HTML document is fully loaded.
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log("[Main] DOM fully loaded and parsed. Initializing Breast Reporting application...");

    // Load configuration files first (API key, prompt)
    await loadConfig();

    // Initialize Core UI & Utilities
    try {
        initTabs();
        initSectionToggles(); // Handle collapsible sections
        initImageHandler();     // Handle image uploads/previews
        initTemplateSystem();   // Handle localStorage templates (Uses breast presets via its import)
        initTemplateExporter(); // Handle JSON import/export (Collects breast data)
        initReportSystem();     // Handle report generation/translation/printing (Calls collectBreastData)

        // Initialize the Breast Assessment Module specifically
        initBreastModule();

         // Set default exam date to today if empty
        const examDateInput = document.getElementById('exam-date');
        if (examDateInput && !examDateInput.value) {
            try {
                // Set current date in YYYY-MM-DD format
                const today = new Date();
                // Adjust for timezone offset to get local date correct
                const offset = today.getTimezoneOffset() * 60000; // offset in milliseconds
                const localDate = new Date(today.getTime() - offset);
                examDateInput.value = localDate.toISOString().split('T')[0];
                 console.log("[Main] Default exam date set to today.");
            } catch (dateError) {
                console.error("[Main] Error setting default date:", dateError);
            }
        }

        console.log("[Main] Breast Reporting Application Initialized Successfully.");
        showNotification("Breast Reporting System Ready / Hệ thống sẵn sàng.", "success", 2000);

    } catch (initError) {
         console.error("[Main] CRITICAL ERROR during initialization:", initError);
         showNotification("Application initialization failed! Check console.", "error", 10000);
         // Optionally disable parts of the UI if init fails critically
    }
});