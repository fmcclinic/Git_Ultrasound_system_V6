// js/main.js - For the INDEPENDENT Chest X-ray Reporting Project

// --- Core Module Imports ---
// UI/Form/Utils
import { initTabs, showNotification } from './core/ui-core.js';
// Template system (Will be adapted in template-core.js for CXR)
import { initTemplateSystem } from './core/template-core.js';
// Template exporter (Will be adapted in template-exporter.js for CXR)
import { initTemplateExporter } from './core/template-exporter.js';
// Report core (Will be adapted in report-core.js for CXR)
import { initReportSystem } from './core/report-core.js';
// Image handler (generic)
import { initImageHandler } from './modules/image-handler.js';
// Note: form-core.js is likely imported internally by other core modules

// --- Functional Module Imports ---
// report-translator.js is imported internally by report-core.js

// --- Organ Specific Module Import ---
// === UPDATED IMPORT: ChestXray Module ===
import { init as initChestXrayModule } from './organs/chestxray/chestxray-module.js'; // Import hàm init của module X quang Ngực

// --- Global Config Variables ---
let apiKey = null;
let translationPrompt = null;

// --- Configuration Loading ---
/**
 * Fetches configuration files (API key and translation prompt).
 */
async function loadConfig() {
    // === UPDATED Log Message ===
    console.log("[Main - ChestXray] Loading configuration...");
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
            console.warn("[Main - ChestXray] API Key is empty in apikey.txt. Translation will likely fail.");
            showNotification("Warning: API Key is empty.", "info", 4000);
        } else {
             // === UPDATED Log Message ===
            console.log("[Main - ChestXray] API Key loaded.");
        }

        // 2. Load ChestXray-Specific Translation Prompt
        // === UPDATED PROMPT FILENAME ===
        const promptFileName = 'prompt_translate_vi_cxr.txt'; // <-- CHANGED for CXR
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
                 throw new Error(`Chest X-ray translation prompt file (${promptFileName}) not found or inaccessible. Error: ${e1.message} / ${e2.message}`); // <-- CHANGED
            }
        }

        translationPrompt = await promptResponse.text();
        if (!translationPrompt) {
             // === UPDATED Log Message ===
            console.warn(`[Main - ChestXray] Translation prompt is empty in ${promptFileName}.`); // <-- CHANGED
            showNotification("Warning: Translation prompt is empty.", "info", 4000);
        } else {
             // === UPDATED Log Message ===
            console.log("[Main - ChestXray] Chest X-ray translation prompt loaded."); // <-- CHANGED
        }
        // === UPDATED Log Message ===
        console.log("[Main - ChestXray] Configuration loading process completed.");

    } catch (error) {
         // === UPDATED Log Message ===
        console.error("[Main - ChestXray] Failed to load configuration:", error); // <-- CHANGED
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
    console.log("[Main - ChestXray] DOM fully loaded and parsed. Initializing Chest X-ray Reporting application..."); // <-- CHANGED

    // Load configuration files first
    await loadConfig();

    // Initialize Core UI & Utilities
    try {
        initTabs();
        initImageHandler();
        initTemplateSystem();   // Will be adapted internally for CXR
        initTemplateExporter(); // Will be adapted internally for CXR
        initReportSystem();     // Will be adapted internally for CXR

        // === UPDATED MODULE INITIALIZATION: Initialize ChestXray specific module ===
        initChestXrayModule(); // <-- CHANGED

         // Set default exam date to today if empty (Unchanged logic)
        const examDateInput = document.getElementById('exam-date');
        if (examDateInput && !examDateInput.value) {
            // Use Intl API for reliable local date formatting YYYY-MM-DD
             const today = new Date();
             // Use Vietnam's timezone (+07:00) for consistency if needed, but usually local timezone is fine for default date.
             // Intl.DateTimeFormat is robust.
             const year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(today);
             const month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(today);
             const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(today);
             examDateInput.value = `${year}-${month}-${day}`;
             console.log(`[Main - ChestXray] Default exam date set to: ${examDateInput.value}`);
        }

        // === UPDATED Log/Notification Messages ===
        console.log("[Main - ChestXray] Chest X-ray Reporting Application Initialized Successfully."); // <-- CHANGED
        showNotification("Chest X-ray Reporting System Ready / Hệ thống X quang Ngực sẵn sàng.", "success", 2000); // <-- CHANGED

    } catch (initError) {
         // === UPDATED Log Message ===
         console.error("[Main - ChestXray] CRITICAL ERROR during initialization:", initError); // <-- CHANGED
         showNotification("Application initialization failed! Check console.", "error", 10000);
    }
});