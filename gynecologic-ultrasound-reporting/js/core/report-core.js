// js/core/report-core.js (ADAPTED for Gynecologic Project - v1 Single Column)
// Handles report generation, preview, translation, editing, printing, and exporting for GYNECOLOGIC reports.

import { getFormData } from './form-core.js';
import { getUploadedImageData } from '../modules/image-handler.js';
import { showNotification } from './ui-core.js';
import { translateReportViaApi } from '../modules/report-translator.js';
import { getApiKey, getTranslationPrompt } from '../main.js';

// --- Module Scope Variables ---
let generatedReportHtml = '';
let currentPatientData = {};
let currentTranslationMarkdown = '';
let isEditingTranslation = false;

// --- Default Report Titles ---
// === UPDATED Report Titles ===
const defaultReportTitleEN = "GYNECOLOGIC ULTRASOUND REPORT"; // <-- CHANGED
const defaultReportTitleVI = "BÁO CÁO SIÊU ÂM PHỤ KHOA"; // <-- CHANGED

// --- Helper Functions ---

/**
 * Formats the English report structure.
 * Calls the organ-specific formatting function for the findings section.
 */
function formatReportAsHtml(patientData, organData, images, reportTitle = defaultReportTitleEN) {
    // === UPDATED Log ===
    console.log("[ReportCore - Gynecologic] Formatting English report as HTML..."); // <-- CHANGED
    if (!organData || typeof organData.formatReportSectionHtml !== 'function') {
        // === UPDATED Log ===
        console.error("[ReportCore - Gynecologic] Invalid organData or missing formatReportSectionHtml method."); // <-- CHANGED
        throw new Error("Internal error: Cannot format report findings section.");
    }
    let report = `<div class="report-container">`;
    report += `<h2 class="report-title">${reportTitle}</h2><hr class="report-hr">`;
    report += `<div class="report-section">
    <h3 class="report-section-title">PATIENT INFORMATION / THÔNG TIN BỆNH NHÂN</h3>
    <p><strong>Name / Họ Tên:</strong> ${patientData.patientName || 'N/A'}</p>
    <p><strong>Patient ID / Mã BN:</strong> ${patientData.patientId || 'N/A'}</p>
    <p><strong>Date of Birth / Ngày sinh:</strong> ${patientData.patientDob || 'N/A'}</p>
    <p><strong>Exam Date / Ngày khám:</strong> ${patientData.examDate || 'N/A'}</p>
    <p><strong>Requesting Dr / BS Chỉ định:</strong> ${patientData.requestingPhysician || 'N/A'}</p>
    <p><strong>Reason for Exam / Lý do khám:</strong> ${patientData.reason ? String(patientData.reason).replace(/\n/g, '<br>') : 'N/A'}</p>
    </div><hr class="report-hr">`;
    report += `<div class="report-section report-findings-section">
                <h3 class="report-section-title">FINDINGS / KẾT QUẢ SIÊU ÂM</h3>
                ${ organData.formatReportSectionHtml() } </div>`; // This call remains the same, relies on the imported module
    // Image section (remains the same)
    const validImages = images.filter(img => img.dataUrl && img.dataUrl.startsWith('data:image/'));
    if (validImages.length > 0) {
        report += `<hr class="report-hr"><div class="report-section report-images-section">
            <h3 class="report-section-title">IMAGES / HÌNH ẢNH</h3>
            <div class="image-flex-container">`;
        validImages.forEach((img, index) => {
            report += `<div class="report-image-item">
                <img src="${img.dataUrl}" alt="Ultrasound Image ${index + 1}" title="${img.name || `Image ${index + 1}`}" style="object-fit: contain; max-width: 100%; max-height: 100%; display: block; margin: auto;">
                <p class="caption">${img.name || `Image ${index + 1}`}</p></div>`;
        });
        report += `</div></div>`;
    }
    // Footer/Signature (remains the same)
    report += `<hr class="report-hr"><div class="report-footer signature-section">
        <p class="signature-title">Bác sĩ siêu âm</p>
        <div class="signature-space"></div> <p class="signature-name">${patientData.reportingDoctor || '[ Họ tên bác sĩ siêu âm ]'}</p>
    </div>`;
    report += `</div>`;
    return report;
}

/**
 * Formats the Vietnamese report structure for printing.
 */
function generateVietnameseReportHtmlForPrint(patientData, translatedBodyHtml, images) {
    // === UPDATED Log ===
    console.log("[ReportCore - Gynecologic] Generating Vietnamese HTML report structure for printing..."); // <-- CHANGED
    const reportTitleVI = defaultReportTitleVI; // Use constant
    let report = `<div class="report-container">`;
    report += `<h2 class="report-title">${reportTitleVI}</h2><hr class="report-hr">`;
    // Patient Info (same structure, potentially translate labels if needed, but kept bilingual here)
    report += `<div class="report-section">
                <h3 class="report-section-title">THÔNG TIN BỆNH NHÂN</h3>
                <p><strong>Họ Tên:</strong> ${patientData.patientName || 'N/A'}</p>
                <p><strong>Mã BN:</strong> ${patientData.patientId || 'N/A'}</p>
                <p><strong>Ngày sinh:</strong> ${patientData.patientDob || 'N/A'}</p>
                <p><strong>Ngày khám:</strong> ${patientData.examDate || 'N/A'}</p>
                <p><strong>BS Chỉ định:</strong> ${patientData.requestingPhysician || 'N/A'}</p>
                <p><strong>Lý do khám:</strong> ${patientData.reason ? String(patientData.reason).replace(/\n/g, '<br>') : 'N/A'}</p>
            </div><hr class="report-hr">`;
    // Findings section - Embed translated HTML
    report += `<div class="report-section report-findings-section">
                 ${ translatedBodyHtml || '<p><i>Nội dung dịch không có sẵn.</i></p>' }
            </div>`;
    // Image section (same structure)
    const validImages = images.filter(img => img.dataUrl?.startsWith('data:image/'));
    if (validImages.length > 0) {
        report += `<hr class="report-hr"><div class="report-section report-images-section">
            <h3 class="report-section-title">HÌNH ẢNH</h3>
            <div class="image-flex-container">`;
        validImages.forEach((img, index) => {
            report += `<div class="report-image-item">
                <img src="${img.dataUrl}" alt="Hình Siêu âm ${index + 1}" title="${img.name || `Hình ${index + 1}`}" style="object-fit: contain; max-width: 100%; max-height: 100%; display: block; margin: auto;">
                <p class="caption">${img.name || `Hình ${index + 1}`}</p></div>`;
        });
        report += `</div></div>`;
    }
    // Footer/Signature (same structure)
    report += `<hr class="report-hr"><div class="report-footer signature-section">
        <p class="signature-title">Bác sĩ siêu âm</p>
        <div class="signature-space"></div>
        <p class="signature-name">${patientData.reportingDoctor || '[ Họ tên bác sĩ siêu âm ]'}</p>
    </div>`;
    report += `</div>`;
     // === UPDATED Log ===
    console.log("[ReportCore - Gynecologic] Vietnamese HTML for print generated."); // <-- CHANGED
    return report;
}

/**
 * Opens a print window with the provided HTML content and styles.
 * *** UPDATED embedded CSS to use single-column layout for GYN findings. ***
 */
function printPreparedHtml(htmlContent, title = 'Print Report') {
    try {
        const printWindow = window.open('', '_blank');
        if (!printWindow) { showNotification("Popup blocker may be active.", "error"); return; }

        printWindow.document.write(`
            <!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>${title}</title>
            <style>
                /* === Embedded Print Styles (Gynecologic - v1 Single Column) === */
                @page { size: A4; margin: 12mm; }
                body { margin: 0 !important; padding: 0 !important; font-family: 'Times New Roman', Times, serif; line-height: 1.35; color: #000; background: #fff !important; font-size: 10.5pt; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                p { margin: 0.15em 0 0.3em 0 !important; orphans: 3; widows: 3; }
                strong { font-weight: bold; }
                hr.report-hr { border: none; border-top: 1px solid #ccc; margin: 0.5em 0; }
                h2, h3, h4, h5 { margin: 0.4em 0 0.15em 0 !important; padding: 0; font-family: Arial, sans-serif; page-break-after: avoid; font-weight: bold; }
                h2.report-title { text-align: center; font-size: 1.2em; margin-bottom: 0.5em; color: #000; }
                h3.report-section-title { font-size: 1.1em; border-bottom: 1px solid #999; margin-bottom: 0.3em; padding-bottom: 0.1em; color: #000;}

                /* --- *** START: Gynecologic Findings Section Print Styles (Single Column) *** --- */
                .report-findings-section { page-break-inside: auto; }
                /* *** TARGET THE CORRECT CONTAINER CLASS *** */
                .report-findings-section .gynecologic-findings-container {
                    margin-top: 3mm !important;
                    page-break-inside: auto !important; /* Allow findings to break across pages */
                }
                /* Titles within the single column (H4, H5) */
                .report-findings-section .gynecologic-findings-container h4 { /* e.g., Uterus, Adnexa... */
                    font-size: 1.05em; font-weight: bold; color: #000; margin-top: 0.6em; margin-bottom: 0.3em; padding-bottom: 1px; border-bottom: 1px dotted #aaa; page-break-after: avoid; page-break-inside: avoid;
                }
                .report-findings-section .gynecologic-findings-container h4:first-child { margin-top: 0;}
                .report-findings-section .gynecologic-findings-container h5 { /* e.g., Right Ovary, Fibroid 1... */
                    font-size: 1em; font-weight: bold; color: #333; margin-top: 0.5em; margin-bottom: 0.2em; border-bottom: none; padding-bottom: 0; page-break-after: avoid; page-break-inside: avoid; padding-left: 5mm;
                }
                /* List items within the single column */
                .report-findings-section .gynecologic-findings-container ul {
                    list-style: none; padding-left: 5mm; margin-top: 0.2em; margin-bottom: 0.8em; page-break-inside: avoid;
                }
                .report-findings-section .gynecologic-findings-container li {
                    margin-bottom: 0.3em; line-height: 1.4; page-break-inside: avoid; /* Avoid breaking mid-item if possible */
                }
                .report-findings-section .gynecologic-findings-container li strong {
                    color: #000; margin-right: 4px; display: inline-block; min-width: 120px; /* Adjust if needed for GYN */
                }
                /* Impression/Recommendation in Print */
                .report-findings-section .gynecologic-findings-container > hr + h4,
                .report-findings-section .gynecologic-findings-container > h4:last-of-type {
                    margin-top: 8mm; padding-top: 4mm; border-top: 1px solid #ccc; border-bottom: none; page-break-before: auto; page-break-inside: avoid; font-size: 1.05em; padding-left: 0;
                }
                .report-findings-section .gynecologic-findings-container > h4 + p {
                    page-break-inside: auto; /* Allow breaking within long paragraphs */
                }
                /* --- *** END: Gynecologic Findings Section Print Styles *** --- */

                /* General Layout & Images/Signature */
                .report-container { width: 100%; }
                .report-section { margin-bottom: 0.6em !important; }
                .report-images-section { page-break-before: auto; }
                .report-images-section .image-flex-container { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4mm !important; margin-top: 0.3em !important; }
                .report-image-item { flex: 0 1 calc(50% - 2.5mm); box-sizing: border-box; text-align: center; page-break-inside: avoid !important; margin-bottom: 4mm !important; border: 1px solid #ccc; padding: 1.5mm; background-color: #fdfdfd !important; print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; overflow: hidden; max-height: 45mm; display: flex; flex-direction: column; justify-content: center; align-items: center; }
                .report-image-item img { display: block; max-width: 100%; height: auto; max-height: 42mm; object-fit: contain; margin: 0 auto 1mm auto; }
                .report-image-item .caption { font-size: 7.5pt; color: #333; margin-top: 0; line-height: 1.1; word-wrap: break-word; }
                .signature-section { margin-top: 8mm !important; text-align: center; page-break-inside: avoid; }
                .signature-title { font-size: 9.5pt; margin-bottom: 1mm; font-weight: bold;}
                .signature-space { height: 10mm; margin-bottom: 1mm; border-bottom: 1px dotted #aaa; width: 55%; margin-left: auto; margin-right: auto; }
                .signature-name { font-size: 9.5pt; font-weight: bold; margin-top: 0; }
                .report-footer { margin-top: 0.8em !important; font-size: 8.5pt; color: #333; text-align: center; border-top: 1px solid #ccc; padding-top: 0.4em !important; }
                pre { white-space: pre-wrap; word-wrap: break-word; font-family: 'Courier New', monospace; font-size: 9.5pt; margin: 0.4em 0 !important; }
                a[href]:after { content: none !important; }
                br { margin: 0 !important; padding: 0 !important; height: 0 !important; line-height: 0.1em !important; content: "" !important; display: block !important; }
            </style>
            </head><body>
        `);
        printWindow.document.write(`<div class="printable-content">${htmlContent}</div>`);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        // Increased timeout for slower printers/systems
        setTimeout(() => {
            try {
                if (!printWindow.closed) {
                    printWindow.print();
                    // Delay closing slightly more
                    setTimeout(() => { if (!printWindow.closed) printWindow.close(); }, 5000);
                }
            } catch (e) { console.error("Error during print()/close():", e); if (!printWindow.closed) printWindow.close(); }
        }, 1000); // Increased delay before print command

    } catch (e) {
        console.error("Error creating print window:", e);
        showNotification("Failed to create print window. Check popup blocker.", "error");
    }
}

/**
 * Exports the report HTML content as a downloadable file.
 * *** UPDATED embedded CSS for single-column GYN findings. ***
 */
function exportReportAsHtml(reportHtml, filename = 'gynecologic-ultrasound-report.html') { // <-- CHANGED default filename
    // === *** UPDATED Embedded Styles to match printPreparedHtml (Gynecologic Single Column) *** ===
    const printStyles = `
        @page { size: A4; margin: 12mm; }
        body { margin: 0 !important; padding: 0 !important; font-family: 'Times New Roman', Times, serif; line-height: 1.35; color: #000; background: #fff !important; font-size: 10.5pt; }
        p { margin: 0.15em 0 0.3em 0 !important; } strong { font-weight: bold; } hr.report-hr { border: none; border-top: 1px solid #ccc; margin: 0.5em 0; }
        h2, h3, h4, h5 { margin: 0.4em 0 0.15em 0 !important; padding: 0; font-family: Arial, sans-serif; font-weight: bold; } h2.report-title { text-align: center; font-size: 1.2em; margin-bottom: 0.5em; color: #000; } h3.report-section-title { font-size: 1.1em; border-bottom: 1px solid #999; margin-bottom: 0.3em; padding-bottom: 0.1em; color: #000;}
        /* *** Gynecologic Findings Styles (Single Column) *** */
        /* *** TARGET THE CORRECT CONTAINER CLASS *** */
        .report-findings-section .gynecologic-findings-container { margin-top: 3mm !important; }
        .report-findings-section .gynecologic-findings-container h4 { font-size: 1.05em; font-weight: bold; color: #000; margin-top: 0.6em; margin-bottom: 0.3em; padding-bottom: 1px; border-bottom: 1px dotted #aaa; }
        .report-findings-section .gynecologic-findings-container h4:first-child { margin-top: 0;}
        .report-findings-section .gynecologic-findings-container h5 { font-size: 1em; font-weight: bold; color: #333; margin-top: 0.5em; margin-bottom: 0.2em; border-bottom: none; padding-bottom: 0; padding-left: 5mm;}
        .report-findings-section .gynecologic-findings-container ul { list-style: none; padding-left: 5mm; margin-top: 0.2em; margin-bottom: 0.8em; }
        .report-findings-section .gynecologic-findings-container li { margin-bottom: 0.3em; line-height: 1.4; }
        .report-findings-section .gynecologic-findings-container li strong { color: #000; margin-right: 4px; display: inline-block; min-width: 120px; }
        .report-findings-section .gynecologic-findings-container > hr + h4, .report-findings-section .gynecologic-findings-container > h4:last-of-type { margin-top: 8mm; padding-top: 4mm; border-top: 1px solid #ccc; border-bottom: none; font-size: 1.05em; padding-left: 0;}
        /* General layout */
        .report-container { width: 100%; max-width: 180mm; margin: auto; } .report-section { margin-bottom: 0.6em !important; }
        /* Images */
        .report-images-section .image-flex-container { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4mm !important; margin-top: 0.3em !important; } .report-image-item { flex: 0 1 calc(50% - 2.5mm); box-sizing: border-box; text-align: center; margin-bottom: 4mm !important; border: 1px solid #ccc; padding: 1.5mm; background-color: #fdfdfd; overflow: hidden; max-height: 45mm; display: flex; flex-direction: column; justify-content: center; align-items: center; } .report-image-item img { display: block; max-width: 100%; height: auto; max-height: 42mm; object-fit: contain; margin: 0 auto 1mm auto; } .report-image-item .caption { font-size: 7.5pt; color: #333; margin-top: 0; line-height: 1.1; word-wrap: break-word; }
        /* Signature */
        .signature-section { margin-top: 8mm !important; text-align: center; } .signature-title { font-size: 9.5pt; margin-bottom: 1mm; font-weight: bold;} .signature-space { height: 10mm; margin-bottom: 1mm; border-bottom: 1px dotted #aaa; width: 55%; margin-left: auto; margin-right: auto; } .signature-name { font-size: 9.5pt; font-weight: bold; margin-top: 0; }
        .report-footer { margin-top: 0.8em !important; font-size: 8.5pt; color: #333; text-align: center; border-top: 1px solid #ccc; padding-top: 0.4em !important; }
        pre { white-space: pre-wrap; word-wrap: break-word; font-family: 'Courier New', monospace; font-size: 9.5pt; margin: 0.4em 0 !important; } a[href]:after { content: none !important; } br { margin: 0 !important; padding: 0 !important; height: 0 !important; line-height: 0.1em !important; content: "" !important; display: block !important; }
    `;
    const fullHtml = `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>${filename.replace('.html', '')}</title><style>${printStyles}</style></head><body><div class="printable-content">${reportHtml}</div></body></html>`;
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
     // === UPDATED Log ===
    console.log(`[ReportCore - Gynecologic] Report exported as ${filename}`); // <-- CHANGED
}

// --- Main Initialization Function ---
export function initReportSystem() {
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

    // Check if all required elements exist
    const requiredElements = { generateBtn, printBtn, exportBtn, translateBtn, printTranslationBtn, reportPreview, translationSection, translationContent, translationEditArea, editTranslationBtn, translationLoading };
    for (const key in requiredElements) {
        if (!requiredElements[key]) {
            // === UPDATED Log ===
            console.error(`[ReportCore - Gynecologic] Initialization failed: Element with ID matching '${key}' not found.`); // <-- CHANGED
            showNotification(`Report UI element missing: ${key}. Check HTML.`, "error");
            return; // Stop initialization if UI is broken
        }
    }
     // === UPDATED Log ===
    console.log("[ReportCore - Gynecologic] All required report UI elements found."); // <-- CHANGED

    // --- Generate Report Button Listener ---
    generateBtn.addEventListener('click', async () => {
        // === UPDATED Log ===
        console.log("[ReportCore - Gynecologic] Generate Report button clicked."); // <-- CHANGED
        // Reset UI
        reportPreview.innerHTML = '<p class="placeholder-text"><i>Generating report... / Đang tạo báo cáo...</i></p>';
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

        // Data Collection & Formatting
        try {
            currentPatientData = getFormData('#patient-info-form'); // Get patient info
            if (!currentPatientData.reportingDoctor) {
                 // === UPDATED Log ===
                console.warn("[ReportCore - Gynecologic] Reporting doctor name is empty."); // <-- CHANGED
                // Optionally provide a default or prompt? For now, just warn.
            }

            // === *** UPDATED: Dynamically import and call GYN data collection *** ===
            // === UPDATED PATH ===
            const { collectGynecologicData } = await import('../organs/gynecologic/gynecologic-module.js'); // <-- CHANGE
            // === UPDATED FUNCTION CALL ===
            const organData = collectGynecologicData(); // <-- CHANGE
            if (!organData || typeof organData.formatReportSectionHtml !== 'function') {
                 // === UPDATED ERROR MESSAGE ===
                 throw new Error("Failed to collect or format Gynecologic assessment data."); // <-- CHANGE
            }

            const images = getUploadedImageData(true); // Get image data
            const reportTitle = defaultReportTitleEN; // Use GYN default title
            generatedReportHtml = formatReportAsHtml(currentPatientData, organData, images, reportTitle); // <-- Uses GYN title
            // === UPDATED Log ===
            console.log("[ReportCore - Gynecologic] Report HTML generated."); // <-- CHANGED

            // Display Report & Show Buttons
            reportPreview.innerHTML = generatedReportHtml;
            // === UPDATED Log ===
            console.log("[ReportCore - Gynecologic] Report preview updated."); // <-- CHANGED
            printBtn.style.display = 'inline-block';
            exportBtn.style.display = 'inline-block';
            // Show translate button only if API key and prompt are loaded
            if (getApiKey() && getTranslationPrompt()) {
                translateBtn.style.display = 'inline-block';
            } else {
                // === UPDATED Log ===
                console.warn("[ReportCore - Gynecologic] Translate button hidden: API Key or Prompt missing."); // <-- CHANGED
                showNotification("Translation disabled: Config missing.", "info");
            }
            // === UPDATED Notification ===
            showNotification("Gynecologic report generated successfully!", "success"); // <-- CHANGED

        } catch (error) {
            // === UPDATED Log ===
            console.error("[ReportCore - Gynecologic] Error during report generation:", error); // <-- CHANGED
            reportPreview.innerHTML = `<p class="placeholder-text" style="color: red;"><b>Error generating report:</b> ${error.message}</p>`;
            showNotification(`Report Generation Failed: ${error.message}`, 'error', 6000);
        }
    });

    // --- Translate Button Listener ---
    translateBtn.addEventListener('click', async () => {
        // === UPDATED Log ===
        console.log("[ReportCore - Gynecologic] Translate Report button clicked."); // <-- CHANGED
        if (!generatedReportHtml) { showNotification("Generate the report first.", "info"); return; }
        const apiKey = getApiKey(); const systemPrompt = getTranslationPrompt();
        if (!apiKey || !systemPrompt) { showNotification("Translation config missing (API Key or Prompt).", "error"); return; }

        // Extract text content specifically from the findings section for translation
        let reportTextContent = '';
        try {
             const tempDiv = document.createElement('div'); tempDiv.innerHTML = generatedReportHtml;
             // === *** UPDATED: Target the correct findings container *** ===
             const findingsContainer = tempDiv.querySelector('.report-findings-section .gynecologic-findings-container'); // <-- CHANGE
             if (!findingsContainer) {
                 // === UPDATED Error Message ===
                throw new Error("Could not find the findings container (.gynecologic-findings-container) in the generated HTML."); // <-- CHANGE
             }
             reportTextContent = (findingsContainer.innerText || findingsContainer.textContent || '').trim();
             if (!reportTextContent) {
                throw new Error("Could not extract text content from report findings container.");
             }
             // console.log("Text for translation:", reportTextContent); // Debug
        } catch (extractError){
             // === UPDATED Log ===
             console.error("[ReportCore - Gynecologic] Error extracting text:", extractError); // <-- CHANGED
             showNotification(`Error preparing text for translation: ${extractError.message}`, "error");
             return;
        }

        // Reset translation UI
        translationSection.style.display = 'block'; translationContent.style.display = 'none'; translationEditArea.style.display = 'none';
        editTranslationBtn.style.display = 'none'; printTranslationBtn.style.display = 'none'; translationLoading.style.display = 'block';
        translateBtn.disabled = true; isEditingTranslation = false; currentTranslationMarkdown = '';

        try {
            // Call the translation API
            const translatedMarkdown = await translateReportViaApi(reportTextContent, apiKey, systemPrompt);
            currentTranslationMarkdown = translatedMarkdown; // Store the raw markdown response

            // Use marked.js to render Markdown to HTML if available
            if (typeof marked !== 'undefined' && marked.parse) {
                 marked.setOptions({ breaks: true, gfm: true }); // Ensure line breaks are handled
                translationContent.innerHTML = marked.parse(currentTranslationMarkdown);
                translationContent.style.whiteSpace = 'normal'; // Allow wrapping
            } else {
                console.warn("Marked.js library not found. Displaying raw Markdown.");
                translationContent.innerText = currentTranslationMarkdown; // Display as plain text
                translationContent.style.whiteSpace = 'pre-wrap'; // Preserve line breaks and spacing
            }
            // Show translated content and buttons
            translationContent.style.display = 'block';
            editTranslationBtn.innerHTML = '<i class="fas fa-edit"></i> Sửa bản dịch'; editTranslationBtn.classList.remove('editing');
            editTranslationBtn.style.display = 'inline-block'; printTranslationBtn.style.display = 'inline-block';
            showNotification("Report translated successfully!", "success");
            translationSection.scrollIntoView({ behavior: 'smooth', block: 'nearest'});

        } catch (error) {
            // === UPDATED Log ===
            console.error("[ReportCore - Gynecologic] Translation failed:", error); // <-- CHANGED
            translationContent.innerHTML = `<p class="placeholder-text" style="color: red;"><b>Translation Failed:</b> ${error.message}</p>`;
            translationContent.style.display = 'block';
             // No need to showNotification here as translateReportViaApi already does on error
        } finally {
            translationLoading.style.display = 'none';
            translateBtn.disabled = false; // Re-enable button
        }
    });

    // --- Edit/Save Translation Button Listener --- (Logic unchanged)
    editTranslationBtn.addEventListener('click', () => {
        if (isEditingTranslation) { // Currently editing, so save
            currentTranslationMarkdown = translationEditArea.value; // Get edited markdown
             // Re-render the preview
             if (typeof marked !== 'undefined') {
                 marked.setOptions({ breaks: true, gfm: true });
                 translationContent.innerHTML = marked.parse(currentTranslationMarkdown);
                 translationContent.style.whiteSpace = 'normal';
             } else {
                 translationContent.innerText = currentTranslationMarkdown;
                 translationContent.style.whiteSpace = 'pre-wrap';
             }
            // Toggle UI back
            translationEditArea.style.display = 'none'; translationContent.style.display = 'block';
            editTranslationBtn.innerHTML = '<i class="fas fa-edit"></i> Sửa bản dịch'; editTranslationBtn.classList.remove('editing');
            isEditingTranslation = false; showNotification("Translation updated.", "success", 1500);
        } else { // Not editing, so start editing
            if (!currentTranslationMarkdown) { showNotification("No translation to edit.", "info"); return; }
            translationEditArea.value = currentTranslationMarkdown; // Populate textarea
            // Toggle UI
            translationContent.style.display = 'none'; translationEditArea.style.display = 'block';
            editTranslationBtn.innerHTML = '<i class="fas fa-save"></i> Lưu bản dịch'; editTranslationBtn.classList.add('editing');
            isEditingTranslation = true; translationEditArea.focus();
        }
    });

    // --- Print Original Report (EN) Button Listener ---
    printBtn.addEventListener('click', () => {
        if (generatedReportHtml) {
            // === UPDATED Title ===
            const title = `GYN US Report - ${currentPatientData?.patientId || 'Unknown'} - ${currentPatientData?.examDate || ''}`; // <-- CHANGED
            printPreparedHtml(generatedReportHtml, title); // Uses the updated function with GYN CSS
        } else { showNotification("Please generate the report first.", "info"); }
    });

    // --- Print Translation (VI) Button Listener ---
    printTranslationBtn.addEventListener('click', () => {
        if (currentTranslationMarkdown) {
             let translatedBodyHtml = '';
             // Render markdown to HTML for printing
             if (typeof marked !== 'undefined') {
                 marked.setOptions({ breaks: true, gfm: true });
                 translatedBodyHtml = marked.parse(currentTranslationMarkdown);
             } else {
                 // Fallback: use <pre> for raw markdown
                 translatedBodyHtml = `<pre style="white-space: pre-wrap; word-wrap: break-word;">${currentTranslationMarkdown.replace(/</g,"&lt;")}</pre>`;
             }
             const images = getUploadedImageData(true); // Get images
             // Generate the full Vietnamese report structure
             const vietnameseReportHtml = generateVietnameseReportHtmlForPrint(currentPatientData, translatedBodyHtml, images);
             // === UPDATED Title ===
             const titleVI = `Báo cáo SA Phụ Khoa - ${currentPatientData?.patientId || 'Unknown'} - ${currentPatientData?.examDate || ''}`; // <-- CHANGED
             printPreparedHtml(vietnameseReportHtml, titleVI); // Use the same print function with GYN CSS
        } else { showNotification("No translation available to print.", "info"); }
    });

    // --- Export HTML Button Listener ---
    exportBtn.addEventListener('click', () => {
         if (generatedReportHtml) {
             const patientId = currentPatientData?.patientId || 'UnknownID';
             const examDate = currentPatientData?.examDate || new Date().toISOString().split('T')[0];
             // === *** UPDATED Filename *** ===
             const filename = `GYN_US_Report_${patientId}_${examDate}.html`; // <-- CHANGED
             exportReportAsHtml(generatedReportHtml, filename); // Uses updated embedded CSS and filename
         } else { showNotification("Please generate the report first.", "info"); }
     });

} // === End of initReportSystem ===

// === UPDATED Log ===
console.log("report-core.js (Gynecologic Version - v1 Single Column) loaded."); // <-- CHANGED