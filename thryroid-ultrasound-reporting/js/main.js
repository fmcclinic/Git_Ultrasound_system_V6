// js/main.js
// ... (các import khác) ...
import { initImageHandler } from './modules/image-handler.js'; // Đảm bảo import image handler
import { initTemplateSystem } from './core/template-core.js';
import { initTemplateExporter } from './core/template-exporter.js';
import { initReportSystem } from './core/report-core.js';
import * as uiCore from './core/ui-core.js';
import * as thyroidModule from './organs/thyroid/thyroid-module.js';

// Biến toàn cục (hoặc có thể truyền qua các module) để lưu config
let loadedApiKey = null;
let loadedTranslationPrompt = null;

/**
 * Tải các file cấu hình (API Key, Prompt) khi ứng dụng khởi động.
 * **CẢNH BÁO BẢO MẬT:** Tải API key trực tiếp từ client là KHÔNG AN TOÀN.
 */
async function loadConfigurationFiles() {
    try {
        console.log("[Config] Loading configuration files...");
        // Tải API Key
        const apiKeyResponse = await fetch('apikey.txt');
        if (!apiKeyResponse.ok) throw new Error(`Failed to fetch apikey.txt (${apiKeyResponse.status})`);
        loadedApiKey = (await apiKeyResponse.text()).trim();
        if (!loadedApiKey) throw new Error("API key file is empty.");
        console.log("[Config] API Key loaded successfully.");

        // Tải Prompt Dịch
        const promptResponse = await fetch('prompt_translate_vi.txt');
        if (!promptResponse.ok) throw new Error(`Failed to fetch prompt_translate_vi.txt (${promptResponse.status})`);
        loadedTranslationPrompt = await promptResponse.text();
        if (!loadedTranslationPrompt) throw new Error("Translation prompt file is empty.");
        console.log("[Config] Translation prompt loaded successfully.");

    } catch (error) {
        console.error("[Config] CRITICAL ERROR loading configuration:", error);
        uiCore.showNotification(`Error loading configuration: ${error.message}. Translation feature may not work.`, 'error', 7000);
        // Không gán giá trị null lại để tránh lỗi nếu người dùng thử dịch
        // loadedApiKey = null;
        // loadedTranslationPrompt = null;
    }
}

// Hàm getter để các module khác có thể lấy config một cách an toàn
// (tránh việc truy cập biến toàn cục trực tiếp nếu muốn)
export function getApiKey() { return loadedApiKey; }
export function getTranslationPrompt() { return loadedTranslationPrompt; }


// === Main Initialization Logic ===
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM fully loaded. Initializing system...");

    // *** TẢI CONFIG TRƯỚC TIÊN ***
    await loadConfigurationFiles(); // Đợi tải xong config

    try {
        // --- Initialize Core UI ---
        uiCore.initTabs();
        uiCore.initSectionToggles();
        console.log("Core UI initialized.");

        // --- Initialize Organ Modules ---
        thyroidModule.init();
        console.log("Thyroid module initialized.");

        // --- Initialize Functional Modules ---
        initImageHandler(); // Gọi hàm khởi tạo image handler
        console.log("Image Handler module initialized.");

        // --- Initialize Other Core Systems ---
        initReportSystem(); // Truyền config nếu cần, hoặc Report Core sẽ gọi getter
        console.log("Report system initialized.");

        initTemplateSystem();
        initTemplateExporter();
        console.log("Template system (core & exporter) initialized.");

        // --- Final Setup Steps ---
        const examDateInput = document.getElementById('exam-date');
        if (examDateInput && !examDateInput.value) {
            const today = new Date().toISOString().split('T')[0];
            examDateInput.value = today;
        }

        console.log("System initialization complete.");

    } catch (error) {
        console.error("CRITICAL ERROR during main initialization:", error);
        uiCore.showNotification('System initialization failed. Check console.', 'error');
    }
});

console.log("main.js script loaded.");