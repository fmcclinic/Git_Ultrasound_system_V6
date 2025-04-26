// js/main.js - For the INDEPENDENT Echocardiogram Reporting Project
// *** UPDATED WITH OCR + VIDEO CAPTURE MODULE LOADING & INITIALIZATION ***

// --- Core Module Imports ---
import { initTabs, showNotification } from './core/ui-core.js';
import { initTemplateSystem } from './core/template-core.js';
import { initTemplateExporter } from './core/template-exporter.js';
import { initReportSystem } from './core/report-core.js';

// --- Module Imports ---
// *** Import specific function needed for Video Capture callback ***
import { initImageHandler, addImageFromDataUrl } from './modules/image-handler.js';
// OCR handler is loaded dynamically below
// Video Capture handler is loaded dynamically below

// --- Organ Specific Module Import ---
import { init as initEchoModule } from './organs/echo/echo-module.js'; // Echo module

// --- Global Config & State Variables ---
let apiKey = null;
let translationPrompt = null;
let ocrHandlerModule = null;    // Stores loaded OCR module
let videoCaptureModule = null; // *** NEW: Stores loaded Video Capture module ***

// --- Configuration Loading ---
/**
 * Fetches configuration files (API key and translation prompt).
 */
async function loadConfig() {
    console.log("[Main - Echo] Loading configuration...");
    try {
        // Load API Key
        let keyResponse;
        try {
            keyResponse = await fetch('apikey.txt');
            if (!keyResponse.ok) throw new Error('Primary fetch failed');
        } catch (e1) {
            console.warn("[Main - Echo] apikey.txt not found in root, trying parent directory...");
            try {
                keyResponse = await fetch('../apikey.txt'); // Try parent dir
                if (!keyResponse.ok) throw new Error('Alternative fetch failed');
            } catch (e2) {
                 throw new Error(`API key file (apikey.txt) not found or inaccessible. Primary: ${e1.message} / Alt: ${e2.message}`);
            }
        }
        apiKey = (await keyResponse.text()).trim();
        if (!apiKey) {
             console.warn("[Main - Echo] API Key is empty. Translation/OCR will fail.");
             showNotification("Warning: API Key is empty.", "info", 4000);
             // Disable features requiring API key
             document.body.classList.add('ocr-feature-disabled');
             // Note: Video capture doesn't strictly need the API key itself,
             // but we might disable it too if the overall setup is incomplete.
             // For now, let's keep video capture potentially enabled even without API key.
        } else {
             console.log("[Main - Echo] API Key loaded.");
        }

        // Load Echo-Specific Translation Prompt
        const promptFileName = 'prompt_translate_vi_echo.txt';
        let promptResponse;
        try {
             promptResponse = await fetch(promptFileName);
             if (!promptResponse.ok) throw new Error(`Primary fetch failed: ${promptResponse.status}`);
        } catch (e1) {
             console.warn(`[Main - Echo] ${promptFileName} not found in root, trying parent...`);
            try {
                 const promptResponseAlt = await fetch(`../${promptFileName}`);
                 if (!promptResponseAlt.ok) throw new Error(`Alternative fetch failed: ${promptResponseAlt.status}`);
                 promptResponse = promptResponseAlt;
            } catch(e2) {
                 throw new Error(`Echocardiogram translation prompt file (${promptFileName}) not found. Primary: ${e1.message} / Alt: ${e2.message}`);
            }
        }
        translationPrompt = await promptResponse.text();
        if (!translationPrompt) {
             console.warn(`[Main - Echo] Translation prompt is empty in ${promptFileName}.`);
             showNotification("Warning: Translation prompt is empty.", "info", 4000);
        } else {
             console.log("[Main - Echo] Echocardiogram translation prompt loaded.");
        }
        console.log("[Main - Echo] Configuration loading completed.");

    } catch (error) {
        console.error("[Main - Echo] Failed to load configuration:", error);
        showNotification(`Error loading config: ${error.message}. Some features may not work.`, "error", 10000);
        apiKey = null;
        translationPrompt = null;
        // Disable features if config fails
        document.body.classList.add('ocr-feature-disabled');
        document.body.classList.add('video-capture-disabled');
    }
}

// --- Attempt to Load Optional OCR Module ---
/**
 * Tries to dynamically load the OCR handler module.
 */
async function loadOcrModule() {
    if (!apiKey) { // Don't bother loading if no API key
        console.log("[Main - Echo] Skipping OCR module load: API Key is missing.");
        document.body.classList.add('ocr-feature-disabled');
        return;
    }
    try {
        const ocrModule = await import('./modules/ocr-handler.js');
        ocrHandlerModule = ocrModule;
        if (typeof ocrHandlerModule.initOcrHandler === 'function') {
             ocrHandlerModule.initOcrHandler();
        }
        console.log("[Main - Echo] OCR Handler module loaded successfully.");
        document.body.classList.remove('ocr-feature-disabled'); // Enable feature
    } catch (error) {
        console.warn("[Main - Echo] OCR Handler module failed to load. OCR feature disabled.", error);
        ocrHandlerModule = null;
        document.body.classList.add('ocr-feature-disabled'); // Disable feature
    }
}

// --- *** NEW: Attempt to Load Optional Video Capture Module *** ---
/**
 * Tries to dynamically load the Video Capture module.
 */
async function loadVideoCaptureModule() {
    try {
        const module = await import('./modules/video-capture.js');
        videoCaptureModule = module;
        console.log("[Main - Echo] Video Capture module loaded successfully.");
        document.body.classList.remove('video-capture-disabled'); // Enable feature
    } catch (error) {
        console.warn("[Main - Echo] Video Capture module failed to load. Feature disabled.", error);
        videoCaptureModule = null;
        document.body.classList.add('video-capture-disabled'); // Disable feature
    }
}

// --- Configuration & Module Getters ---
export function getApiKey() { return apiKey; }
export function getTranslationPrompt() { return translationPrompt; }
// OCR Accessors
export function isOcrAvailable() { return !!ocrHandlerModule && !!apiKey; }
export function getOcrHandler() { return ocrHandlerModule; }
// *** NEW: Video Capture Accessors ***
export function isVideoCaptureAvailable() { return !!videoCaptureModule; }
export function getVideoCaptureModule() { return videoCaptureModule; }


// --- *** NEW: Function to Initialize Video Capture UI *** ---
function initializeVideoCaptureUI() {
    if (!isVideoCaptureAvailable()) {
        console.log("[Main - Echo] Video capture not available, skipping UI initialization.");
        return;
    }

    const videoCapture = getVideoCaptureModule();
    if (videoCapture && typeof videoCapture.initVideoCapture === 'function') {
        console.log("[Main - Echo] Initializing video capture UI...");
        const videoCaptureOptions = {
            videoElementId: 'live-video-feed',      // ID of the <video> tag
            // canvasElementId: 'capture-canvas',   // Canvas ID (less critical now if used internally)
            captureButtonId: 'capture-frame-btn',   // ID of the capture button
            sourceSelectorId: 'video-source-select',// ID of the <select> dropdown
            startButtonId: 'start-preview-btn',     // ID of the start/select button
            // --- Callback Function ---
            onCaptureSuccess: (dataUrl, filename) => { // Receives dataUrl and filename
                console.log(`[Main - Echo] Video frame captured: ${filename}`);
                try {
                    // Call the function imported from image-handler.js
                    addImageFromDataUrl(dataUrl, filename);
                    showNotification("Ảnh đã được chụp và thêm vào xem trước!", "success", 2500);
                } catch (error) {
                    console.error("[Main - Echo] Error adding captured image via image-handler:", error);
                    showNotification("Lỗi khi thêm ảnh đã chụp.", "error");
                }
            }
        };
        // Initialize the capture UI defined in video-capture.js
        videoCapture.initVideoCapture(videoCaptureOptions);
    } else {
        console.error("[Main - Echo] Video capture module loaded, but initVideoCapture function not found.");
        document.body.classList.add('video-capture-disabled'); // Disable if init fails
    }
}


// --- Initialization on DOMContentLoaded ---
/**
 * Main entry point when the HTML document is fully loaded.
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log("[Main - Echo] DOM fully loaded. Initializing Echocardiogram Reporting application...");

    // 1. Load configurations (API key, prompts)
    await loadConfig();

    // 2. Attempt to load optional modules (OCR, Video Capture)
    await loadOcrModule();
    await loadVideoCaptureModule(); // *** NEW: Load video module ***

    // 3. Initialize Core UI & Systems
    try {
        initTabs();
        initImageHandler();     // Handles image uploads/previews (adds button placeholders)
        initTemplateSystem();   // Handles localStorage templates
        initTemplateExporter(); // Handles JSON import/export
        initReportSystem();     // Handles report generation/preview/print/translate

        // 4. Initialize Organ-Specific Module (Echo)
        await initEchoModule(); // Echo module might rely on OCR state

        // *** NEW: Initialize Video Capture UI (if available) ***
        initializeVideoCaptureUI();

        // 5. Set default exam date
        const examDateInput = document.getElementById('exam-date');
        if (examDateInput && !examDateInput.value) {
            try {
                const today = new Date();
                const timezoneOffset = today.getTimezoneOffset() * 60000;
                const localDate = new Date(today.getTime() - timezoneOffset);
                examDateInput.value = localDate.toISOString().split('T')[0];
                console.log("[Main - Echo] Default exam date set:", examDateInput.value);
            } catch (dateError) {
                console.error("[Main - Echo] Error setting default date:", dateError);
            }
        }

        // 6. Final Status Notification
        console.log("[Main - Echo] Application Initialized Successfully.");
        const ocrStatus = isOcrAvailable() ? 'Bật' : 'Tắt';
        const captureStatus = isVideoCaptureAvailable() ? 'Bật' : 'Tắt'; // *** NEW ***
        showNotification(`Hệ thống Sẵn sàng (OCR: ${ocrStatus}, Capture: ${captureStatus})`, "success", 3500);

    } catch (initError) {
         console.error("[Main - Echo] CRITICAL ERROR during initialization:", initError);
         showNotification("Application initialization failed! Check console.", "error", 10000);
         // Ensure features are disabled on critical error
         document.body.classList.add('ocr-feature-disabled');
         document.body.classList.add('video-capture-disabled');
    }
});