// js/main.js - For the INDEPENDENT Abdominal Ultrasound Reporting Project

// --- Core Module Imports ---
// UI/Form/Utils
import { initTabs, showNotification } from './core/ui-core.js'; // initSectionToggles removed as using <details>
// Template system using abdominal presets/storage key
import { initTemplateSystem } from './core/template-core.js';
// Template exporter for abdominal data
import { initTemplateExporter } from './core/template-exporter.js';
// Report core calling collectAbdominalData
import { initReportSystem } from './core/report-core.js';
// Image handler (generic)
import { initImageHandler } from './modules/image-handler.js';
// Note: form-core.js is likely imported internally by other core modules

// --- Functional Module Imports ---
// report-translator.js is imported internally by report-core.js

// --- Organ Specific Module Import ---
// === UPDATED IMPORT ===
import { init as initAbdominalModule } from './organs/abdominal/abdominal-module.js'; // Import hàm init của module abdominal

// --- Global Config Variables ---
let apiKey = null;
let translationPrompt = null;

// --- Configuration Loading ---
/**
 * Fetches configuration files (API key and translation prompt).
 */
async function loadConfig() {
    // === UPDATED Log Message ===
    console.log("[Main - Abdominal] Loading configuration...");
    try {
        // 1. Load API Key (Remains the same logic)
        const keyResponse = await fetch('apikey.txt');
        if (!keyResponse.ok) {
            // Try fetching from parent directory if in nested structure during dev
            const keyResponseAlt = await fetch('../apikey.txt');
            if (!keyResponseAlt.ok) {
                throw new Error(`API key file (apikey.txt) not found or inaccessible (Status: ${keyResponse.status} / ${keyResponseAlt.status})`);
            }
             apiKey = (await keyResponseAlt.text()).trim();
        } else {
            apiKey = (await keyResponse.text()).trim();
        }

        if (!apiKey) {
            console.warn("[Main - Abdominal] API Key is empty in apikey.txt. Translation will likely fail.");
            showNotification("Warning: API Key is empty.", "info", 4000);
        } else {
             console.log("[Main - Abdominal] API Key loaded.");
        }

        // 2. Load Abdominal-Specific Translation Prompt
        // === UPDATED PROMPT FILENAME ===
        const promptFileName = 'prompt_translate_vi_abdominal.txt';
        let promptResponse;
        try {
             promptResponse = await fetch(promptFileName);
             if (!promptResponse.ok) throw new Error(`Status: ${promptResponse.status}`);
        } catch (e1) {
            try {
                 // Try fetching from parent directory if in nested structure during dev
                 const promptResponseAlt = await fetch(`../${promptFileName}`);
                 if (!promptResponseAlt.ok) throw new Error(`Status Alt: ${promptResponseAlt.status}`);
                 promptResponse = promptResponseAlt;
            } catch(e2) {
                // === UPDATED Error Message ===
                 throw new Error(`Abdominal translation prompt file (${promptFileName}) not found or inaccessible. Error: ${e1.message} / ${e2.message}`);
            }
        }

        translationPrompt = await promptResponse.text();
        if (!translationPrompt) {
            console.warn(`[Main - Abdominal] Translation prompt is empty in ${promptFileName}.`);
            showNotification("Warning: Translation prompt is empty.", "info", 4000);
        } else {
             // === UPDATED Log Message ===
            console.log("[Main - Abdominal] Abdominal translation prompt loaded.");
        }

        console.log("[Main - Abdominal] Configuration loading process completed.");

    } catch (error) {
        console.error("[Main - Abdominal] Failed to load configuration:", error);
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
    console.log("[Main - Abdominal] DOM fully loaded and parsed. Initializing Abdominal Reporting application...");

    // Load configuration files first (API key, prompt)
    await loadConfig();

    // Initialize Core UI & Utilities
    try {
        initTabs();
        // initSectionToggles(); // Not needed with <details>/<summary>
        initImageHandler();     // Handle image uploads/previews
        initTemplateSystem();   // Handle localStorage templates (Uses abdominal presets via its import)
        initTemplateExporter(); // Handle JSON import/export (Collects abdominal data)
        initReportSystem();     // Handle report generation/translation/printing (Calls collectAbdominalData)

        // === UPDATED MODULE INITIALIZATION ===
        // Initialize the Abdominal Assessment Module specifically
        initAbdominalModule();

         // Set default exam date to today if empty (Unchanged logic)
        const examDateInput = document.getElementById('exam-date');
        if (examDateInput && !examDateInput.value) {
            try {
                // More robust date setting considering timezone offset
                const today = new Date();
                // Get timezone offset in minutes, convert to milliseconds
                const timezoneOffset = today.getTimezoneOffset() * 60000;
                // Create a new Date object adjusted for local timezone
                const localDate = new Date(today.getTime() - timezoneOffset);
                // Format as YYYY-MM-DD
                examDateInput.value = localDate.toISOString().split('T')[0];
                console.log("[Main - Abdominal] Default exam date set to today:", examDateInput.value);
            } catch (dateError) {
                console.error("[Main - Abdominal] Error setting default date:", dateError);
            }
        }

        // === UPDATED Log/Notification Messages ===
        console.log("[Main - Abdominal] Abdominal Reporting Application Initialized Successfully.");
        showNotification("Abdominal Reporting System Ready / Hệ thống sẵn sàng.", "success", 2000);

    } catch (initError) {
         console.error("[Main - Abdominal] CRITICAL ERROR during initialization:", initError);
         showNotification("Application initialization failed! Check console.", "error", 10000);
    }
});