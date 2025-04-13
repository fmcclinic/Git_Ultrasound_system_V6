// js/main.js - For the INDEPENDENT Lower Extremity Vascular Ultrasound Reporting Project

// --- Core Module Imports ---
// UI/Form/Utils
import { initTabs, showNotification } from './core/ui-core.js';
// Template system using LE Vascular presets/storage key (Will be adapted in template-core.js)
import { initTemplateSystem } from './core/template-core.js';
// Template exporter for LE Vascular data (Will be adapted in template-exporter.js)
import { initTemplateExporter } from './core/template-exporter.js';
// Report core calling collectLEVascularData (Will be adapted in report-core.js)
import { initReportSystem } from './core/report-core.js';
// Image handler (generic)
import { initImageHandler } from './modules/image-handler.js';
// Note: form-core.js is likely imported internally by other core modules

// --- Functional Module Imports ---
// report-translator.js is imported internally by report-core.js

// --- Organ Specific Module Import ---
// === UPDATED IMPORT: LE Vascular Module ===
import { init as initLEVascularModule } from './organs/le-vascular/le-vascular-module.js'; // Import hàm init của module LE Vascular

// --- Global Config Variables ---
let apiKey = null;
let translationPrompt = null;

// --- Configuration Loading ---
/**
 * Fetches configuration files (API key and translation prompt).
 */
async function loadConfig() {
    // === UPDATED Log Message ===
    console.log("[Main - LE Vascular] Loading configuration...");
    try {
        // 1. Load API Key (Remains the same logic)
        let keyResponse;
        try {
             keyResponse = await fetch('apikey.txt');
             if (!keyResponse.ok) throw new Error(`Status: ${keyResponse.status}`);
        } catch (e1) {
            try {
                const keyResponseAlt = await fetch('../apikey.txt'); // Try parent dir
                if (!keyResponseAlt.ok) throw new Error(`Status Alt: ${keyResponseAlt.status}`);
                 keyResponse = keyResponseAlt;
            } catch (e2) {
                throw new Error(`API key file (apikey.txt) not found or inaccessible. Error: ${e1.message} / ${e2.message}`);
            }
        }
        apiKey = (await keyResponse.text()).trim();


        if (!apiKey) {
             // === UPDATED Log Message ===
            console.warn("[Main - LE Vascular] API Key is empty in apikey.txt. Translation will likely fail.");
            showNotification("Warning: API Key is empty.", "info", 4000);
        } else {
             // === UPDATED Log Message ===
            console.log("[Main - LE Vascular] API Key loaded.");
        }

        // 2. Load LE Vascular-Specific Translation Prompt
        // === UPDATED PROMPT FILENAME ===
        const promptFileName = 'prompt_translate_vi_le_vascular.txt'; // <-- CHANGED
        let promptResponse;
        try {
             promptResponse = await fetch(promptFileName);
             if (!promptResponse.ok) throw new Error(`Status: ${promptResponse.status}`);
        } catch (e1) {
            try {
                 const promptResponseAlt = await fetch(`../${promptFileName}`); // Try parent dir
                 if (!promptResponseAlt.ok) throw new Error(`Status Alt: ${promptResponseAlt.status}`);
                 promptResponse = promptResponseAlt;
            } catch(e2) {
                 // === UPDATED Error Message ===
                 throw new Error(`LE Vascular translation prompt file (${promptFileName}) not found or inaccessible. Error: ${e1.message} / ${e2.message}`); // <-- CHANGED
            }
        }

        translationPrompt = await promptResponse.text();
        if (!translationPrompt) {
             // === UPDATED Log Message ===
            console.warn(`[Main - LE Vascular] Translation prompt is empty in ${promptFileName}.`); // <-- CHANGED
            showNotification("Warning: Translation prompt is empty.", "info", 4000);
        } else {
             // === UPDATED Log Message ===
            console.log("[Main - LE Vascular] LE Vascular translation prompt loaded."); // <-- CHANGED
        }
        // === UPDATED Log Message ===
        console.log("[Main - LE Vascular] Configuration loading process completed.");

    } catch (error) {
         // === UPDATED Log Message ===
        console.error("[Main - LE Vascular] Failed to load configuration:", error); // <-- CHANGED
        showNotification(`Error loading config: ${error.message}. Translation may not work.`, "error", 10000);
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
    console.log("[Main - LE Vascular] DOM fully loaded and parsed. Initializing LE Vascular Reporting application..."); // <-- CHANGED

    // Load configuration files first
    await loadConfig();

    // Initialize Core UI & Utilities
    try {
        initTabs();
        initImageHandler();
        initTemplateSystem();   // Will be adapted internally for LE Vascular
        initTemplateExporter(); // Will be adapted internally for LE Vascular
        initReportSystem();     // Will be adapted internally for LE Vascular

        // === UPDATED MODULE INITIALIZATION: Initialize LE Vascular specific module ===
        initLEVascularModule(); // <-- CHANGED

         // Set default exam date to today if empty (Unchanged logic)
        const examDateInput = document.getElementById('exam-date');
        if (examDateInput && !examDateInput.value) {
            try {
                initTabs(); // <--- Đảm bảo dòng này được gọi
                initImageHandler();
                initTemplateSystem();
                initTemplateExporter();
                initReportSystem();
                initLEVascularModule();
                // ... set default date ...
                console.log("[Main - LE Vascular] LE Vascular Reporting Application Initialized Successfully.");
                showNotification("LE Vascular Reporting System Ready / Hệ thống sẵn sàng.", "success", 2000);
            } catch (initError) {
                 console.error("[Main - LE Vascular] CRITICAL ERROR during initialization:", initError);
                 showNotification("Application initialization failed! Check console.", "error", 10000);
            }
        }

        // === UPDATED Log/Notification Messages ===
        console.log("[Main - LE Vascular] LE Vascular Reporting Application Initialized Successfully."); // <-- CHANGED
        showNotification("LE Vascular Reporting System Ready / Hệ thống sẵn sàng.", "success", 2000); // <-- CHANGED

    } catch (initError) {
         // === UPDATED Log Message ===
         console.error("[Main - LE Vascular] CRITICAL ERROR during initialization:", initError); // <-- CHANGED
         showNotification("Application initialization failed! Check console.", "error", 10000);
    }
});