// js/main.js - For the INDEPENDENT Carotid Ultrasound Reporting Project

// --- Core Module Imports ---
// UI/Form/Utils
import { initTabs, initSectionToggles, showNotification } from './core/ui-core.js';
// Sẽ dùng storage key và presets riêng cho carotid
import { initTemplateSystem } from './core/template-core.js';
// Sẽ export data carotid
import { initTemplateExporter } from './core/template-exporter.js';
// Sẽ gọi collectCarotidData
import { initReportSystem } from './core/report-core.js';
// Note: form-core.js is likely imported internally by report-core & template-core, no direct init needed here usually

// --- Functional Module Imports ---
import { initImageHandler } from './modules/image-handler.js';
// report-translator.js sẽ được import và sử dụng bên trong report-core.js khi cần

// --- Organ Specific Module Import ---
// === UPDATED IMPORT ===
import { init as initCarotidModule } from './organs/carotid/carotid-module.js'; // Import hàm init của module carotid

// --- Global Config Variables ---
let apiKey = null;
let translationPrompt = null;

// --- Configuration Loading ---
/**
 * Fetches configuration files (API key and translation prompt).
 */
async function loadConfig() {
    // === UPDATED Log Message ===
    console.log("[Main - Carotid] Loading configuration...");
    try {
        // 1. Load API Key (Remains the same logic)
        const keyResponse = await fetch('apikey.txt');
        if (!keyResponse.ok) {
            throw new Error(`API key file (apikey.txt) not found or inaccessible (Status: ${keyResponse.status})`);
        }
        apiKey = (await keyResponse.text()).trim();
        if (!apiKey) {
            console.warn("[Main - Carotid] API Key is empty in apikey.txt. Translation will likely fail.");
            showNotification("Warning: API Key is empty.", "info", 4000);
        } else {
             console.log("[Main - Carotid] API Key loaded.");
        }

        // 2. Load Carotid-Specific Translation Prompt
        // === UPDATED PROMPT FILENAME ===
        const promptFileName = 'prompt_translate_vi_carotid.txt';
        const promptResponse = await fetch(promptFileName);
        if (!promptResponse.ok) {
            // === UPDATED Error Message ===
            throw new Error(`Carotid translation prompt file (${promptFileName}) not found or inaccessible (Status: ${promptResponse.status})`);
        }
        translationPrompt = await promptResponse.text();
        if (!translationPrompt) {
            console.warn(`[Main - Carotid] Translation prompt is empty in ${promptFileName}.`);
            showNotification("Warning: Translation prompt is empty.", "info", 4000);
        } else {
             // === UPDATED Log Message ===
            console.log("[Main - Carotid] Carotid translation prompt loaded.");
        }

        console.log("[Main - Carotid] Configuration loading process completed.");

    } catch (error) {
        console.error("[Main - Carotid] Failed to load configuration:", error);
        showNotification(`Error loading config: ${error.message}. Translation may not work.`, "error", 10000);
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
    console.log("[Main - Carotid] DOM fully loaded and parsed. Initializing Carotid Reporting application...");

    // Load configuration files first (API key, prompt)
    await loadConfig();

    // Initialize Core UI & Utilities
    try {
        initTabs();
        // initSectionToggles(); // Might not be needed if using <details>/<summary> exclusively
        initImageHandler();     // Handle image uploads/previews
        initTemplateSystem();   // Handle localStorage templates (Uses carotid presets via its import)
        initTemplateExporter(); // Handle JSON import/export (Collects carotid data)
        initReportSystem();     // Handle report generation/translation/printing (Calls collectCarotidData)

        // === UPDATED MODULE INITIALIZATION ===
        // Initialize the Carotid Assessment Module specifically
        initCarotidModule();

         // Set default exam date to today if empty (Unchanged logic)
        const examDateInput = document.getElementById('exam-date');
        if (examDateInput && !examDateInput.value) {
            try {
                const today = new Date();
                const offset = today.getTimezoneOffset() * 60000;
                const localDate = new Date(today.getTime() - offset);
                examDateInput.value = localDate.toISOString().split('T')[0];
                 console.log("[Main - Carotid] Default exam date set to today.");
            } catch (dateError) {
                console.error("[Main - Carotid] Error setting default date:", dateError);
            }
        }

        // === UPDATED Log/Notification Messages ===
        console.log("[Main - Carotid] Carotid Reporting Application Initialized Successfully.");
        showNotification("Carotid Reporting System Ready / Hệ thống sẵn sàng.", "success", 2000);

    } catch (initError) {
         console.error("[Main - Carotid] CRITICAL ERROR during initialization:", initError);
         showNotification("Application initialization failed! Check console.", "error", 10000);
    }
});