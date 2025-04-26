// js/main.js - For the INDEPENDENT Obstetric Ultrasound Reporting Project (OCR + Video Capture Integration)

// --- Core Module Imports ---
import { initTabs, showNotification } from './core/ui-core.js';
import { initTemplateSystem } from './core/template-core.js';
import { initTemplateExporter } from './core/template-exporter.js';
import { initReportSystem } from './core/report-core.js';
// --- Module Imports ---
// Import image handler (đã được cập nhật để hỗ trợ addImageFromDataUrl)
import { initImageHandler } from './modules/image-handler.js';
// --- Organ Specific Module Import ---
import { init as initObstetricModule } from './organs/obstetric/obstetric-module.js'; // OB module (đã cập nhật)

// --- Global Config & State Variables ---
let apiKey = null;
let translationPrompt = null;
let ocrHandlerModule = null; // Stores loaded OCR module
let videoCaptureModule = null; // Stores loaded Video Capture module

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
             if (!keyResponse.ok) throw new Error('apikey.txt root');
        } catch (e1) {
            console.warn("apikey.txt not found in root, trying parent directory...");
            try {
                keyResponse = await fetch('../apikey.txt'); // Try parent dir
                if (!keyResponse.ok) throw new Error('apikey.txt parent');
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
             if (!transPromptResponse.ok) throw new Error(transPromptFileName);
        } catch (e1) {
             console.warn(`${transPromptFileName} not found in root, trying parent directory...`);
             try {
                 transPromptResponse = await fetch(`../${transPromptFileName}`); // Try parent dir
                 if (!transPromptResponse.ok) throw new Error(`${transPromptFileName} parent`);
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
        apiKey = null;
        translationPrompt = null;
    }
}

// --- Attempt to Load Optional Modules ---
/**
 * Tries to dynamically load the OCR handler module.
 */
async function loadOcrModule() {
    try {
        const ocrModule = await import('./modules/ocr-handler.js');
        ocrHandlerModule = ocrModule;
        if (typeof ocrHandlerModule.initOcrHandler === 'function') {
             ocrHandlerModule.initOcrHandler();
        }
        console.log("[Main - Obstetric] OCR Handler module loaded successfully.");
        document.body.classList.remove('ocr-feature-disabled');
    } catch (error) {
        console.warn("[Main - Obstetric] OCR Handler module ('./modules/ocr-handler.js') not found or failed to load. OCR feature disabled.", error);
        ocrHandlerModule = null;
        document.body.classList.add('ocr-feature-disabled');
    }
}

/**
 * Tries to dynamically load the Video Capture module.
 */
async function loadVideoCaptureModule() {
    try {
        const module = await import('./modules/video-capture.js');
        videoCaptureModule = module;
        console.log("[Main - Obstetric] Video Capture module loaded successfully.");
        document.body.classList.remove('video-capture-disabled'); // Remove class to show UI
    } catch (error) {
        console.warn("[Main - Obstetric] Video Capture module ('./modules/video-capture.js') not found or failed to load. Feature disabled.", error);
        videoCaptureModule = null;
        document.body.classList.add('video-capture-disabled'); // Add class to hide UI via CSS
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
    return !!ocrHandlerModule;
}

/**
 * Gets the loaded OCR handler module (if available).
 * @returns {object | null} The OCR handler module object or null.
 */
export function getOcrHandler() {
    return ocrHandlerModule;
}

/**
 * Checks if the Video Capture module was loaded successfully.
 * @returns {boolean} True if Video Capture functionality is available, false otherwise.
 */
export function isVideoCaptureAvailable() { // <-- NEW EXPORT
    return !!videoCaptureModule;
}

/**
 * Gets the loaded Video Capture module (if available).
 * @returns {object | null} The Video Capture module object or null.
 */
export function getVideoCaptureModule() { // <-- NEW EXPORT
    return videoCaptureModule;
}


// --- Initialization on DOMContentLoaded ---
/**
 * Main entry point when the HTML document is fully loaded.
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log("[Main - Obstetric] DOM fully loaded. Initializing Obstetric Reporting application...");

    // Load configurations first (API key, prompts)
    await loadConfig();

    // **Attempt to load optional modules**
    await loadOcrModule();
    await loadVideoCaptureModule(); // <-- LOAD VIDEO CAPTURE MODULE

    // Initialize Core UI & Utilities
    try {
        initTabs();
        initImageHandler(); // Initializes image uploads, adds OCR/Video buttons (visibility controlled by CSS/JS)
        initTemplateSystem(); // Initializes template load/save/delete
        initTemplateExporter(); // Initializes template import/export
        initReportSystem(); // Initializes report generation/preview/print/translate

        // Initialize Obstetric specific module AFTER core systems and optional module checks
        // The OB module will internally check isOcrAvailable() and isVideoCaptureAvailable()
        await initObstetricModule(); // Make OB init async if it needs to load prompts or init capture

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
        // Update status message based on feature availability
        const ocrStatus = isOcrAvailable() ? 'Bật' : 'Tắt';
        const captureStatus = isVideoCaptureAvailable() ? 'Bật' : 'Tắt';
        showNotification(`Hệ thống Sẵn sàng (OCR: ${ocrStatus}, Capture: ${captureStatus})`, "success", 3500);

    } catch (initError) {
         console.error("[Main - Obstetric] CRITICAL ERROR during initialization:", initError);
         showNotification("Application initialization failed! Check console.", "error", 10000);
    }
});