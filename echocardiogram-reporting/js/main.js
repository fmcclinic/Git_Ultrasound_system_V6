// js/main.js - For the INDEPENDENT Echocardiogram Reporting Project

// --- Core Module Imports ---
// UI/Form/Utils
import { initTabs, showNotification } from './core/ui-core.js'; // Using standard UI core
// Template system - will be adapted internally to use echo presets/storage key
import { initTemplateSystem } from './core/template-core.js';
// Template exporter - will be adapted internally for echo data
import { initTemplateExporter } from './core/template-exporter.js';
// Report core - will be adapted internally to call collectEchoData
import { initReportSystem } from './core/report-core.js';
// Image handler (generic)
import { initImageHandler } from './modules/image-handler.js';
// Note: form-core.js is likely imported internally by other core modules

// --- Functional Module Imports ---
// report-translator.js is imported internally by report-core.js

// --- Organ Specific Module Import ---
// === UPDATED IMPORT ===
import { init as initEchoModule } from './organs/echo/echo-module.js'; // Import init function from the new echo module

// --- Global Config Variables ---
let apiKey = null;
let translationPrompt = null;

// --- Configuration Loading ---
/**
 * Fetches configuration files (API key and translation prompt).
 */
async function loadConfig() {
    // === UPDATED Log Message ===
    console.log("[Main - Echo] Loading configuration...");
    try {
        // 1. Load API Key (Remains the same logic)
        let keyResponse;
        try {
            keyResponse = await fetch('apikey.txt');
            if (!keyResponse.ok) throw new Error(`Primary fetch failed: ${keyResponse.status}`);
        } catch (e1) {
             try {
                 // Try fetching from parent directory if in nested structure during dev
                 const keyResponseAlt = await fetch('../apikey.txt');
                 if (!keyResponseAlt.ok) throw new Error(`Alternative fetch failed: ${keyResponseAlt.status}`);
                 keyResponse = keyResponseAlt;
             } catch(e2) {
                 throw new Error(`API key file (apikey.txt) not found or inaccessible. Primary: ${e1.message} / Alt: ${e2.message}`);
             }
        }
        apiKey = (await keyResponse.text()).trim();


        if (!apiKey) {
            // === UPDATED Log Message ===
            console.warn("[Main - Echo] API Key is empty in apikey.txt. Translation will likely fail.");
            showNotification("Warning: API Key is empty.", "info", 4000);
        } else {
             // === UPDATED Log Message ===
            console.log("[Main - Echo] API Key loaded.");
        }

        // 2. Load Echo-Specific Translation Prompt
        // === UPDATED PROMPT FILENAME ===
        const promptFileName = 'prompt_translate_vi_echo.txt';
        let promptResponse;
        try {
             promptResponse = await fetch(promptFileName);
             if (!promptResponse.ok) throw new Error(`Primary fetch failed: ${promptResponse.status}`);
        } catch (e1) {
            try {
                 // Try fetching from parent directory if in nested structure during dev
                 const promptResponseAlt = await fetch(`../${promptFileName}`);
                 if (!promptResponseAlt.ok) throw new Error(`Alternative fetch failed: ${promptResponseAlt.status}`);
                 promptResponse = promptResponseAlt;
            } catch(e2) {
                // === UPDATED Error Message ===
                 throw new Error(`Echocardiogram translation prompt file (${promptFileName}) not found or inaccessible. Primary: ${e1.message} / Alt: ${e2.message}`);
            }
        }

        translationPrompt = await promptResponse.text();
        if (!translationPrompt) {
             // === UPDATED Log Message ===
            console.warn(`[Main - Echo] Translation prompt is empty in ${promptFileName}.`);
            showNotification("Warning: Translation prompt is empty.", "info", 4000);
        } else {
             // === UPDATED Log Message ===
            console.log("[Main - Echo] Echocardiogram translation prompt loaded.");
        }
         // === UPDATED Log Message ===
        console.log("[Main - Echo] Configuration loading process completed.");

    } catch (error) {
         // === UPDATED Log Message ===
        console.error("[Main - Echo] Failed to load configuration:", error);
        showNotification(`Error loading config: ${error.message}. Translation may not work.`, "error", 10000);
        // Set defaults to null if loading fails
        apiKey = null;
        translationPrompt = null;
    }
}

// --- Configuration Getters (Exported for other modules - Unchanged) ---
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
    // === UPDATED Log Message ===
    console.log("[Main - Echo] DOM fully loaded and parsed. Initializing Echocardiogram Reporting application...");

    // Load configuration files first (API key, prompt)
    await loadConfig();

    // Initialize Core UI & Utilities
    try {
        initTabs();
        // initSectionToggles(); // Not needed with <details>/<summary> in echo-report.html
        initImageHandler();     // Handle image uploads/previews
        initTemplateSystem();   // Handle localStorage templates (Will load echo presets via its adapted import)
        initTemplateExporter(); // Handle JSON import/export (Will collect echo data via its adapted import)
        initReportSystem();     // Handle report generation/translation/printing (Will call collectEchoData via its adapted import)

        // === UPDATED MODULE INITIALIZATION ===
        // Initialize the Echocardiogram Assessment Module specifically
        initEchoModule();

         // Set default exam date to today if empty (Unchanged logic)
        const examDateInput = document.getElementById('exam-date');
        if (examDateInput && !examDateInput.value) {
            try {
                const today = new Date();
                const timezoneOffset = today.getTimezoneOffset() * 60000;
                const localDate = new Date(today.getTime() - timezoneOffset);
                examDateInput.value = localDate.toISOString().split('T')[0];
                 // === UPDATED Log Message ===
                console.log("[Main - Echo] Default exam date set to today:", examDateInput.value);
            } catch (dateError) {
                 // === UPDATED Log Message ===
                console.error("[Main - Echo] Error setting default date:", dateError);
            }
        }

        // === UPDATED Log/Notification Messages ===
        console.log("[Main - Echo] Echocardiogram Reporting Application Initialized Successfully.");
        showNotification("Echocardiogram Reporting System Ready / Hệ thống sẵn sàng.", "success", 2000);

    } catch (initError) {
         // === UPDATED Log Message ===
         console.error("[Main - Echo] CRITICAL ERROR during initialization:", initError);
         showNotification("Application initialization failed! Check console.", "error", 10000);
    }
});