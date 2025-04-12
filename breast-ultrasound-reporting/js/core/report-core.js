// js/core/report-core.js (ADAPTED for Breast Project)
// Handles report generation, preview, translation, editing, printing, and exporting for BREAST reports.

import { getFormData } from './form-core.js'; // Used for patient info
import { getUploadedImageData } from '../modules/image-handler.js';
import { showNotification } from './ui-core.js';
// Import translation function and config getters
import { translateReportViaApi } from '../modules/report-translator.js';
import { getApiKey, getTranslationPrompt } from '../main.js'; // Getters from main.js

// --- Module Scope Variables ---
let generatedReportHtml = '';       // Stores the latest generated English report HTML
let currentPatientData = {};        // Stores patient data for the current report
let currentTranslationMarkdown = '';// Stores the latest translation Markdown (original or edited)
let isEditingTranslation = false;   // Tracks if translation edit mode is active

// --- Helper Functions ---

/**
 * Formats the complete English BREAST report as an HTML string.
 * @param {object} patientData - Patient information object (should include reportingDoctor).
 * @param {object} organData - Breast-specific data object (returned by collectBreastData).
 * @param {Array<object>} images - Array of image objects with { name, dataUrl }.
 * @param {string} reportTitle - The title for the report (e.g., "ULTRASOUND REPORT - BREAST").
 * @returns {string} Formatted HTML report string.
 * @throws {Error} If formatting fails or organData is invalid.
 */
function formatReportAsHtml(patientData, organData, images, reportTitle = "ULTRASOUND REPORT - BREAST") { // Default title updated
    console.log("[ReportCore - Breast] Formatting English report as HTML...");
    if (!organData || typeof organData.formatReportSectionHtml !== 'function') {
        console.error("[ReportCore - Breast] Invalid organData or missing formatReportSectionHtml method.");
        throw new Error("Internal error: Cannot format report findings section.");
    }

    let report = `<div class="report-container">`; // Outer container

    // Title - Uses the passed parameter
    report += `<h2 class="report-title">${reportTitle}</h2><hr class="report-hr">`;

    // Patient Information Section (remains the same logic)
    report += `<div class="report-section">
    <h3 class="report-section-title">PATIENT INFORMATION / THÔNG TIN BỆNH NHÂN</h3>
    <p><strong>Name / Họ Tên:</strong> ${patientData.patientName || 'N/A'}</p>
    <p><strong>Patient ID / Mã BN:</strong> ${patientData.patientId || 'N/A'}</p>
    <p><strong>Date of Birth / Ngày sinh:</strong> ${patientData.patientDob || 'N/A'}</p>
    <p><strong>Exam Date / Ngày khám:</strong> ${patientData.examDate || 'N/A'}</p>
    <p><strong>Requesting Dr / BS Chỉ định:</strong> ${patientData.requestingPhysician || 'N/A'}</p>
    <p><strong>Reason for Exam / Lý do khám:</strong> ${patientData.reason ? patientData.reason.replace(/\n/g, '<br>') : 'N/A'}</p>
    </div><hr class="report-hr">`;

    // Findings Section (Delegated Call - now calls the breast formatter)
    report += `<div class="report-section report-findings-section">
                <h3 class="report-section-title">FINDINGS</h3>
                ${ organData.formatReportSectionHtml() /* This will call formatBreastReportSectionHtml */ }
            </div>`;
            // No <hr> needed here if formatBreastReportSectionHtml includes Impression/Reco sections

    // Images Section (remains the same logic)
    const validImages = images.filter(img => img.dataUrl && img.dataUrl.startsWith('data:image/'));
    if (validImages.length > 0) {
        report += `
        <hr class="report-hr">
        <div class="report-section report-images-section">
            <h3 class="report-section-title">IMAGES / HÌNH ẢNH</h3>
            <div class="image-flex-container">`; // Flex container
        validImages.forEach((img, index) => {
            report += `
            <div class="report-image-item">
                <img src="${img.dataUrl}" alt="Ultrasound Image ${index + 1}" title="${img.name || `Image ${index + 1}`}" style="object-fit: contain; max-width: 100%; max-height: 100%; display: block; margin: auto;">
                <p class="caption">${img.name || `Image ${index + 1}`}</p>
            </div>`;
        });
        report += `
            </div>
        </div>`;
    }

    // Footer Section (remains the same logic)
    report += `
    <hr class="report-hr">
    <div class="report-footer signature-section">
        <p class="signature-title">Bác sĩ siêu âm</p>
        <div class="signature-space" style="height: 50px; margin-bottom: 5px;"></div> <p class="signature-name">${patientData.reportingDoctor || '[ Họ tên bác sĩ siêu âm ]'}</p>
    </div>`;

    report += `</div>`; // Close report-container
    return report;
}

/**
 * Generates the full Vietnamese BREAST report HTML string dynamically for printing.
 * @param {object} patientData - Includes reportingDoctor.
 * @param {string} translatedBodyHtml - HTML string of translated findings/impression (parsed from Markdown).
 * @param {Array<object>} images - Array of image objects { name, dataUrl }.
 * @returns {string} Complete Vietnamese HTML report string for printing.
 */
function generateVietnameseReportHtmlForPrint(patientData, translatedBodyHtml, images) {
    console.log("[ReportCore - Breast] Generating Vietnamese HTML report structure for printing...");
    const reportTitleVI = "BÁO CÁO SIÊU ÂM - TUYẾN VÚ"; // Fixed VI title
    let report = `<div class="report-container">`;

    // Title (Vietnamese)
    report += `<h2 class="report-title">${reportTitleVI}</h2><hr class="report-hr">`;

    // Patient Info (Vietnamese Labels - same logic)
    report += `<div class="report-section">
                <h3 class="report-section-title">THÔNG TIN BỆNH NHÂN</h3>
                <p><strong>Họ Tên:</strong> ${patientData.patientName || 'N/A'}</p>
                <p><strong>Mã BN:</strong> ${patientData.patientId || 'N/A'}</p>
                <p><strong>Ngày sinh:</strong> ${patientData.patientDob || 'N/A'}</p>
                <p><strong>Ngày khám:</strong> ${patientData.examDate || 'N/A'}</p>
                <p><strong>BS Chỉ định:</strong> ${patientData.requestingPhysician || 'N/A'}</p>
                <p><strong>Lý do khám:</strong> ${patientData.reason ? patientData.reason.replace(/\n/g, '<br>') : 'N/A'}</p>
            </div><hr class="report-hr">`;

    // Translated Content Section
    // Note: The translated markdown ideally includes headings like KẾT QUẢ SIÊU ÂM, KẾT LUẬN
    report += `<div class="report-section report-findings-section">
                 ${ translatedBodyHtml || '<p><i>Nội dung dịch không có sẵn.</i></p>' }
            </div>`;

    // Images Section (Same structure as English version, potentially update alt/title text)
    const validImages = images.filter(img => img.dataUrl?.startsWith('data:image/'));
    if (validImages.length > 0) {
        report += `
        <hr class="report-hr">
        <div class="report-section report-images-section">
            <h3 class="report-section-title">HÌNH ẢNH</h3>
            <div class="image-flex-container">`;
        validImages.forEach((img, index) => {
            report += `
            <div class="report-image-item">
                <img src="${img.dataUrl}" alt="Hình Siêu âm ${index + 1}" title="${img.name || `Hình ${index + 1}`}" style="object-fit: contain; max-width: 100%; max-height: 100%; display: block; margin: auto;">
                <p class="caption">${img.name || `Hình ${index + 1}`}</p>
            </div>`;
        });
        report += `
            </div>
        </div>`;
    }

    // Footer (same logic)
    report += `
    <hr class="report-hr">
    <div class="report-footer signature-section">
        <p class="signature-title">Bác sĩ siêu âm</p>
        <div class="signature-space" style="height: 50px; margin-bottom: 5px;"></div>
        <p class="signature-name">${patientData.reportingDoctor || '[ Họ tên bác sĩ siêu âm ]'}</p>
    </div>`;

    report += `</div>`; // Close report-container
    console.log("[ReportCore - Breast] Vietnamese HTML for print generated.");
    return report;
}


/**
 * Opens a print dialog for given HTML content. (Can remain the same)
 * Includes embedded print styles.
 * @param {string} htmlContent - The HTML string to print.
 * @param {string} title - The title for the print window.
 */
function printPreparedHtml(htmlContent, title = 'Print Report') {
    try {
        const printWindow = window.open('', '_blank');
        if (!printWindow) { showNotification("Popup blocker may be active.", "error"); return; }

        printWindow.document.write(`
            <!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>${title}</title>
            <style>
                /* === Embedded Print Styles === */
                @page { size: A4; margin: 15mm; }
                body { margin: 0 !important; padding: 0 !important; font-family: 'Times New Roman', Times, serif; line-height: 1.3; color: #000; background: #fff !important; font-size: 10pt; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                p { margin: 0.1em 0 0.4em 0 !important; orphans: 3; widows: 3; }
                strong { font-weight: bold; }
                hr.report-hr { border: none; border-top: 1px solid #ccc; margin: 0.6em 0; }
                h2, h3, h4 { margin: 0.5em 0 0.2em 0 !important; padding: 0; font-family: Arial, sans-serif; page-break-after: avoid; font-weight: bold; }
                h2.report-title { text-align: center; font-size: 1.3em; margin-bottom: 0.6em; }
                h3.report-section-title { font-size: 1.1em; border-bottom: 1px solid #999; margin-bottom: 0.3em; padding-bottom: 0.15em;}
                .report-container { width: 100%; }
                .report-section { margin-bottom: 0.6em !important; /* page-break-inside: avoid !important; */ /* Avoid can cause issues */ }
                .report-lesion-item { margin-bottom: 0.4em !important; padding-left: 0.8em !important; border-left: 1px solid #ddd; /* page-break-inside: avoid !important; */ }
                /* Image Styles */
                .report-images-section .image-flex-container { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 5mm !important; margin-top: 0.4em !important; }
                .report-image-item { flex: 0 1 calc(50% - 3mm); box-sizing: border-box; text-align: center; /* page-break-inside: avoid !important; */ margin-bottom: 5mm !important; border: 1px solid #ccc; padding: 2mm; background-color: #fdfdfd; overflow: hidden; max-height: 47mm; display: flex; flex-direction: column; justify-content: center; align-items: center; }
                .report-image-item img { display: block; max-width: 100%; height: auto; max-height: 44mm; object-fit: contain; margin: 0 auto 1mm auto; }
                .report-image-item .caption { font-size: 8pt; color: #333; margin-top: 0; line-height: 1.1; word-wrap: break-word; }
                /* Signature Styles */
                .signature-section { margin-top: 10mm !important; text-align: center; page-break-inside: avoid; }
                .signature-title { font-size: 10pt; margin-bottom: 1.5mm; font-weight: bold;}
                .signature-space { height: 12mm; margin-bottom: 1.5mm; border-bottom: 1px dotted #aaa; width: 60%; margin-left: auto; margin-right: auto; }
                .signature-name { font-size: 10pt; font-weight: bold; margin-top: 0; }
                /* Footer Styles */
                .report-footer { margin-top: 1em !important; font-size: 9pt; color: #333; text-align: center; border-top: 1px solid #ccc; padding-top: 0.5em !important; }
                /* Markdown generated styles */
                ul, ol { margin: 0.2em 0 0.5em 0 !important; padding-left: 18px !important; }
                li { margin-bottom: 0.1em !important; page-break-inside: avoid; }
                pre { white-space: pre-wrap; word-wrap: break-word; font-family: 'Courier New', monospace; font-size: 10pt; margin: 0.5em 0 !important; }
                a[href]:after { content: none !important; }
                br { margin: 0 !important; padding: 0 !important; height: 0 !important; line-height: 0.1em !important; content: "" !important; display: block !important; }
            </style>
            </head><body>
        `);
        printWindow.document.write(`<div class="printable-content">${htmlContent}</div>`);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        // Use timeouts for print dialog and closing
        setTimeout(() => {
            try {
                if (!printWindow.closed) {
                    printWindow.print();
                    // Add delay before trying to close, allows print dialog to fully render/process
                    setTimeout(() => { if (!printWindow.closed) printWindow.close(); }, 3000);
                }
            } catch (e) { console.error("Error during print()/close():", e); if (!printWindow.closed) printWindow.close(); }
        }, 750); // Delay before calling print()

    } catch (e) {
        console.error("Error creating print window:", e);
        showNotification("Failed to create print window. Check popup blocker.", "error");
    }
}


/**
 * Exports the English report HTML as a downloadable .html file. (Can remain the same)
 * @param {string} reportHtml - The HTML content string of the English report body.
 * @param {string} filename - Suggested filename.
 */
function exportReportAsHtml(reportHtml, filename = 'breast-ultrasound-report.html') { // Default filename updated
    const printStyles = `
        @page { size: A4; margin: 15mm; }
        body { margin: 0 !important; padding: 0 !important; font-family: 'Times New Roman', Times, serif; line-height: 1.3; color: #000; background: #fff !important; font-size: 10pt; }
        p { margin: 0.1em 0 0.4em 0 !important; } strong { font-weight: bold; } hr.report-hr { border: none; border-top: 1px solid #ccc; margin: 0.6em 0; }
        h2, h3, h4 { margin: 0.5em 0 0.2em 0 !important; padding: 0; font-family: Arial, sans-serif; font-weight: bold; } h2.report-title { text-align: center; font-size: 1.3em; margin-bottom: 0.6em; } h3.report-section-title { font-size: 1.1em; border-bottom: 1px solid #999; margin-bottom: 0.3em; padding-bottom: 0.15em;}
        .report-container { width: 100%; max-width: 180mm; margin: auto; /* Simulate page width */} .report-section { margin-bottom: 0.6em !important; } .report-lesion-item { margin-bottom: 0.4em !important; padding-left: 0.8em !important; border-left: 1px solid #ddd; }
        .report-images-section .image-flex-container { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 5mm !important; margin-top: 0.4em !important; } .report-image-item { flex: 0 1 calc(50% - 3mm); box-sizing: border-box; text-align: center; margin-bottom: 5mm !important; border: 1px solid #ccc; padding: 2mm; background-color: #fdfdfd; overflow: hidden; max-height: 47mm; display: flex; flex-direction: column; justify-content: center; align-items: center; } .report-image-item img { display: block; max-width: 100%; height: auto; max-height: 44mm; object-fit: contain; margin: 0 auto 1mm auto; } .report-image-item .caption { font-size: 8pt; color: #333; margin-top: 0; line-height: 1.1; word-wrap: break-word; }
        .signature-section { margin-top: 10mm !important; text-align: center; } .signature-title { font-size: 10pt; margin-bottom: 1.5mm; font-weight: bold;} .signature-space { height: 12mm; margin-bottom: 1.5mm; border-bottom: 1px dotted #aaa; width: 60%; margin-left: auto; margin-right: auto; } .signature-name { font-size: 10pt; font-weight: bold; margin-top: 0; }
        .report-footer { margin-top: 1em !important; font-size: 9pt; color: #333; text-align: center; border-top: 1px solid #ccc; padding-top: 0.5em !important; }
        ul, ol { margin: 0.2em 0 0.5em 0 !important; padding-left: 18px !important; } li { margin-bottom: 0.1em !important; } pre { white-space: pre-wrap; word-wrap: break-word; font-family: 'Courier New', monospace; font-size: 10pt; margin: 0.5em 0 !important; } a[href]:after { content: none !important; } br { margin: 0 !important; padding: 0 !important; height: 0 !important; line-height: 0.1em !important; content: "" !important; display: block !important; }
    `;
    const fullHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${filename.replace('.html', '')}</title><style>${printStyles}</style></head><body><div class="printable-content">${reportHtml}</div></body></html>`;
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log(`[ReportCore - Breast] Report exported as ${filename}`);
}

// --- Main Initialization Function ---
/**
 * Initializes the report system event listeners and logic.
 */
export function initReportSystem() {
    // Get references to ALL needed DOM elements (IDs should be the same)
    const generateBtn = document.getElementById('generate-report-btn');
    const printBtn = document.getElementById('print-report-btn');
    const exportBtn = document.getElementById('export-report-html-btn');
    const translateBtn = document.getElementById('translate-report-btn');
    const printTranslationBtn = document.getElementById('print-translation-btn');
    const reportPreview = document.getElementById('report-preview');
    const translationSection = document.getElementById('translation-section');
    const translationContent = document.getElementById('translation-content');
    const translationEditArea = document.getElementById('translation-edit-area');
    const editTranslationBtn = document.getElementById('edit-translation-btn');
    const translationLoading = document.getElementById('translation-loading');

    // Basic check for element existence
    const requiredElements = { generateBtn, printBtn, exportBtn, translateBtn, printTranslationBtn, reportPreview, translationSection, translationContent, translationEditArea, editTranslationBtn, translationLoading };
    for (const key in requiredElements) {
        if (!requiredElements[key]) {
            console.error(`[ReportCore - Breast] Initialization failed: Element with ID matching '${key}' not found.`);
            showNotification(`Report UI element missing: ${key}. Check HTML.`, "error");
            // Consider stopping initialization if critical elements are missing
            // return;
        }
    }
    console.log("[ReportCore - Breast] All required report UI elements found.");

    // --- Generate Report Button Listener (ADAPTED) ---
    generateBtn.addEventListener('click', async () => {
        console.log("[ReportCore - Breast] Generate Report button clicked.");
        // 1. Reset UI State (same as before)
        reportPreview.innerHTML = '<p class="placeholder-text"><i>Generating report...</i></p>';
        translationSection.style.display = 'none';
        translationContent.innerHTML = '';
        translationEditArea.value = '';
        translationEditArea.style.display = 'none';
        editTranslationBtn.style.display = 'none';
        editTranslationBtn.innerHTML = '<i class="fas fa-edit"></i> Sửa bản dịch';
        editTranslationBtn.classList.remove('editing');
        printTranslationBtn.style.display = 'none';
        printBtn.style.display = 'none';
        exportBtn.style.display = 'none';
        translateBtn.style.display = 'none';
        generatedReportHtml = '';
        currentPatientData = {};
        currentTranslationMarkdown = '';
        isEditingTranslation = false;

        // --- 2. Data Collection & Formatting (Simplified for Breast ONLY) ---
        try {
            // Collect patient data (including reporting doctor)
            currentPatientData = getFormData('#patient-info-form');
            if (!currentPatientData.reportingDoctor) {
                console.warn("[ReportCore - Breast] Reporting doctor name is empty.");
                 // You might want to make this field required in the HTML or show a specific warning
                // showNotification("Please enter the Reporting Doctor's name.", "info");
            }

            // ** Directly import and call breast data collector **
            const { collectBreastData } = await import('../organs/breast/breast-module.js'); // Path relative to report-core.js
            const organData = collectBreastData(); // Get breast data
            if (!organData) { // collectBreastData might return null on error
                 throw new Error("Failed to collect breast assessment data.");
            }
            if (typeof organData.formatReportSectionHtml !== 'function') {
                 throw new Error("Breast data formatter function is missing.");
            }

            const images = getUploadedImageData(true);

            // ** Use fixed Breast report title **
            const reportTitle = "ULTRASOUND REPORT - BREAST";
            generatedReportHtml = formatReportAsHtml(currentPatientData, organData, images, reportTitle);

            console.log("[ReportCore - Breast] Report HTML generated.");

            // --- 3. Display Report ---
            reportPreview.innerHTML = generatedReportHtml;
            console.log("[ReportCore - Breast] Report preview updated.");

            // --- 4. Show Action Buttons ---
            printBtn.style.display = 'inline-block';
            exportBtn.style.display = 'inline-block';
            if (getApiKey() && getTranslationPrompt()) {
                translateBtn.style.display = 'inline-block';
            } else {
                console.warn("[ReportCore - Breast] Translate button hidden: API Key or Prompt missing.");
                showNotification("Translation disabled: Config missing.", "info");
            }
            showNotification("Breast report generated successfully!", "success");

        } catch (error) {
            console.error("[ReportCore - Breast] Error during report generation:", error);
            reportPreview.innerHTML = `<p class="placeholder-text" style="color: red;"><b>Error generating report:</b> ${error.message}</p>`;
            showNotification(`Report Generation Failed: ${error.message}`, 'error', 6000);
        }
    });

    // --- Translate Button Listener (Remains the same logic) ---
    translateBtn.addEventListener('click', async () => {
        console.log("[ReportCore - Breast] Translate Report button clicked.");
        if (!generatedReportHtml) { showNotification("Generate the report first.", "info"); return; }
        const apiKey = getApiKey(); const systemPrompt = getTranslationPrompt();
        if (!apiKey || !systemPrompt) { showNotification("Translation config missing (API Key or Prompt).", "error"); return; }

        let reportTextContent = '';
        try { // Extract text content from generated HTML
             const tempDiv = document.createElement('div'); tempDiv.innerHTML = generatedReportHtml;
             // Attempt to exclude patient info section from translation if desired
             const findingsSection = tempDiv.querySelector('.report-findings-section');
             // Consider including Impression/Reco if they are within the formatted HTML section
             reportTextContent = (findingsSection?.innerText || findingsSection?.textContent || tempDiv.innerText || tempDiv.textContent || '').trim();
             if (!reportTextContent) throw new Error("Could not extract text content from report.");
        } catch (extractError){
             console.error("[ReportCore - Breast] Error extracting text:", extractError);
             showNotification(`Error preparing text for translation: ${extractError.message}`, "error");
             return;
        }

        // Show Loading, Reset State
        translationSection.style.display = 'block'; translationContent.style.display = 'none'; translationEditArea.style.display = 'none';
        editTranslationBtn.style.display = 'none'; printTranslationBtn.style.display = 'none'; translationLoading.style.display = 'block';
        translateBtn.disabled = true; isEditingTranslation = false; currentTranslationMarkdown = '';

        try { // Call API
            const translatedMarkdown = await translateReportViaApi(reportTextContent, apiKey, systemPrompt);
            currentTranslationMarkdown = translatedMarkdown;

            // Parse and Display using Marked.js
            if (typeof marked !== 'undefined' && marked.parse) {
                 // Configure marked for line breaks
                 marked.setOptions({
                    breaks: true, // Translate '\n' in paragraphs into <br>
                    gfm: true // Use GitHub Flavored Markdown
                 });
                translationContent.innerHTML = marked.parse(currentTranslationMarkdown);
                translationContent.style.whiteSpace = 'normal'; // Allow wrapping
            } else {
                console.warn("Marked.js library not found. Displaying raw Markdown.");
                translationContent.innerText = currentTranslationMarkdown;
                translationContent.style.whiteSpace = 'pre-wrap'; // Preserve whitespace for readability
            }
            translationContent.style.display = 'block';
            editTranslationBtn.innerHTML = '<i class="fas fa-edit"></i> Sửa bản dịch'; editTranslationBtn.classList.remove('editing');
            editTranslationBtn.style.display = 'inline-block'; printTranslationBtn.style.display = 'inline-block';
            showNotification("Report translated successfully!", "success");
            // Scroll to the translation section
             translationSection.scrollIntoView({ behavior: 'smooth', block: 'nearest'});

        } catch (error) {
            console.error("[ReportCore - Breast] Translation failed:", error);
            translationContent.innerHTML = `<p class="placeholder-text" style="color: red;"><b>Translation Failed:</b> ${error.message}</p>`;
            translationContent.style.display = 'block';
            // Do not show edit/print buttons on failure
        } finally {
            translationLoading.style.display = 'none';
            translateBtn.disabled = false;
        }
    });

    // --- Edit/Save Translation Button Listener (Remains the same logic) ---
    editTranslationBtn.addEventListener('click', () => {
        if (isEditingTranslation) { // Currently editing, now save
            currentTranslationMarkdown = translationEditArea.value;
            // Re-parse and display
             if (typeof marked !== 'undefined') {
                 marked.setOptions({ breaks: true, gfm: true });
                 translationContent.innerHTML = marked.parse(currentTranslationMarkdown);
                 translationContent.style.whiteSpace = 'normal';
             } else {
                 translationContent.innerText = currentTranslationMarkdown;
                 translationContent.style.whiteSpace = 'pre-wrap';
             }
            translationEditArea.style.display = 'none'; translationContent.style.display = 'block';
            editTranslationBtn.innerHTML = '<i class="fas fa-edit"></i> Sửa bản dịch'; editTranslationBtn.classList.remove('editing');
            isEditingTranslation = false; showNotification("Translation updated.", "success", 1500);
        } else { // Start editing
            if (!currentTranslationMarkdown) { return; } // No translation to edit
            translationEditArea.value = currentTranslationMarkdown;
            translationContent.style.display = 'none'; translationEditArea.style.display = 'block';
            editTranslationBtn.innerHTML = '<i class="fas fa-save"></i> Lưu bản dịch'; editTranslationBtn.classList.add('editing');
            isEditingTranslation = true; translationEditArea.focus();
        }
    });

    // --- Print Original Report (EN) Button Listener (Remains the same logic) ---
    printBtn.addEventListener('click', () => {
        if (generatedReportHtml) {
            // Generate a meaningful title for the print job
            const title = `Breast US Report - ${currentPatientData?.patientId || 'Unknown'} - ${currentPatientData?.examDate || ''}`;
            printPreparedHtml(generatedReportHtml, title);
        } else { showNotification("Please generate the report first.", "info"); }
    });

    // --- Print Translation (VI) Button Listener (Remains the same logic) ---
    printTranslationBtn.addEventListener('click', () => {
        if (currentTranslationMarkdown) {
             let translatedBodyHtml = ''; // This should contain the main content (Findings, Impression etc.)
             if (typeof marked !== 'undefined') {
                 marked.setOptions({ breaks: true, gfm: true });
                 translatedBodyHtml = marked.parse(currentTranslationMarkdown);
             } else {
                 translatedBodyHtml = `<pre>${currentTranslationMarkdown.replace(/</g,"&lt;")}</pre>`;
             }
             const images = getUploadedImageData(true);
             // Generate the FULL VI HTML structure including patient info, title, footer
             const vietnameseReportHtml = generateVietnameseReportHtmlForPrint(currentPatientData, translatedBodyHtml, images);
             const titleVI = `Báo cáo SA Vú - ${currentPatientData?.patientId || 'Unknown'} - ${currentPatientData?.examDate || ''}`;
             printPreparedHtml(vietnameseReportHtml, titleVI);
        } else { showNotification("No translation available to print.", "info"); }
    });

    // --- Export HTML Button Listener (Remains the same logic, default filename changed in helper) ---
    exportBtn.addEventListener('click', () => {
         if (generatedReportHtml) {
             const patientId = currentPatientData?.patientId || 'UnknownID';
             const examDate = currentPatientData?.examDate || new Date().toISOString().split('T')[0];
             const filename = `Breast_US_Report_${patientId}_${examDate}.html`; // Updated filename suggestion
             exportReportAsHtml(generatedReportHtml, filename); // Calls export helper
         } else { showNotification("Please generate the report first.", "info"); }
     });

} // === End of initReportSystem ===

console.log("report-core.js (Breast Version) loaded.");