// js/core/report-core.js
// Handles report generation, preview, translation, editing, printing, and exporting.

import { getFormData } from './form-core.js';
import { getUploadedImageData } from '../modules/image-handler.js';
import { showNotification } from './ui-core.js';
// Import translation function and config getters
import { translateReportViaApi } from '../modules/report-translator.js';
import { getApiKey, getTranslationPrompt } from '../main.js'; // Assuming getters are exported

// --- Module Scope Variables ---
let generatedReportHtml = '';       // Stores the latest generated English report HTML
let currentPatientData = {};        // Stores patient data for the current report
let currentTranslationMarkdown = '';// Stores the latest translation Markdown (original or edited)
let isEditingTranslation = false;   // Tracks if translation edit mode is active

// --- Helper Functions defined at module scope FIRST ---

/**
 * Formats the complete English report as an HTML string.
 * Removes Technical Details, Adds new Footer with Reporting Doctor.
 * @param {object} patientData - Patient information object (should include reportingDoctor).
 * @param {object} organData - Organ-specific data object (must have formatReportSectionHtml method).
 * @param {Array<object>} images - Array of image objects with { name, dataUrl }.
 * @returns {string} Formatted HTML report string.
 * @throws {Error} If formatting fails or organData is invalid.
 */
function formatReportAsHtml(patientData, organData, images) {
    console.log("[ReportCore] Formatting English report as HTML...");
    if (!organData || typeof organData.formatReportSectionHtml !== 'function') {
        console.error("[ReportCore] Invalid organData or missing formatReportSectionHtml method.");
        throw new Error("Internal error: Cannot format report findings section.");
    }

    let report = `<div class="report-container">`; // Outer container for styling/print

    // Title
    report += `<h2 class="report-title">ULTRASOUND REPORT - THYROID</h2><hr class="report-hr">`;

    // Patient Information Section
    report += `<div class="report-section">
    <h3 class="report-section-title">PATIENT INFORMATION / THÔNG TIN BỆNH NHÂN</h3>
    <p><strong>Name / Họ Tên:</strong> ${patientData.patientName || 'N/A'}</p>
    <p><strong>Patient ID / Mã BN:</strong> ${patientData.patientId || 'N/A'}</p>
    <p><strong>Date of Birth / Ngày sinh:</strong> ${patientData.patientDob || 'N/A'}</p>
    <p><strong>Exam Date / Ngày khám:</strong> ${patientData.examDate || 'N/A'}</p>
    <p><strong>Requesting Dr / BS Chỉ định:</strong> ${patientData.requestingPhysician || 'N/A'}</p>
    <p><strong>Reason for Exam / Lý do khám:</strong> ${patientData.reason ? patientData.reason.replace(/\n/g, '<br>') : 'N/A'}</p>
    </div><hr class="report-hr">`;

    // --- TECHNICAL DETAILS SECTION REMOVED ---

    // Findings Section (Delegated Call)
    report += `<div class="report-section report-findings-section">
                <h3 class="report-section-title">FINDINGS</h3>
                ${ organData.formatReportSectionHtml() /* Call the method from organData */ }
            </div><hr class="report-hr">`;

    // Impression Section
    report += `<div class="report-section">
                <h3 class="report-section-title">IMPRESSION</h3>
                <p>${organData.impression ? organData.impression.replace(/\n/g, '<br>') : 'No overall impression provided.'}</p>
            </div><hr class="report-hr">`;

    // Images Section
    const validImages = images.filter(img => img.dataUrl && img.dataUrl.startsWith('data:image/'));
    if (validImages.length > 0) {
        console.log(`[ReportCore] Formatting image section with ${validImages.length} valid images.`);
        report += `
    <div class="report-section report-images-section">
        <h3 class="report-section-title">IMAGES</h3>
        <div class="image-flex-container">`; // Flex container
        validImages.forEach((img, index) => {
            report += `
            <div class="report-image-item">
                <img src="${img.dataUrl}" alt="Ultrasound Image ${index + 1}" title="${img.name || `Image ${index + 1}`}" style="object-fit: contain; max-width: 100%; max-height: 100%; display: block; margin: auto;">
                <p class="caption">${img.name || `Image ${index + 1}`}</p>
            </div>`;
        });
        report += `
        </div> </div><hr class="report-hr">`;
    }

    // --- NEW FOOTER ---
    report += `
    <div class="report-footer signature-section">
        <p class="signature-title">Bác sĩ siêu âm</p>
        <div class="signature-space"></div> <p class="signature-name">${patientData.reportingDoctor || '[ Họ tên bác sĩ siêu âm ]'}</p>
    </div>`;

    report += `</div>`; // Close report-container
    return report;
}

/**
 * Generates the full Vietnamese report HTML string dynamically for printing.
 * Removes Technical Details, Adds new Footer with Reporting Doctor.
 * @param {object} patientData - Includes reportingDoctor.
 * @param {string} translatedBodyHtml - HTML string of translated findings/impression (parsed from Markdown).
 * @param {Array<object>} images - Array of image objects { name, dataUrl }.
 * @returns {string} Complete Vietnamese HTML report string for printing.
 */
function generateVietnameseReportHtmlForPrint(patientData, translatedBodyHtml, images) {
    console.log("[ReportCore] Generating Vietnamese HTML report structure for printing...");
    let report = `<div class="report-container">`;
    // Title (Vietnamese)
    report += `<h2 class="report-title">BÁO CÁO SIÊU ÂM - TUYẾN GIÁP</h2><hr class="report-hr">`;
    // Patient Info (Vietnamese Labels)
    report += `<div class="report-section">
                <h3 class="report-section-title">THÔNG TIN BỆNH NHÂN</h3>
                <p><strong>Họ Tên:</strong> ${patientData.patientName || 'N/A'}</p>
                <p><strong>Mã BN:</strong> ${patientData.patientId || 'N/A'}</p>
                <p><strong>Ngày sinh:</strong> ${patientData.patientDob || 'N/A'}</p>
                <p><strong>Ngày khám:</strong> ${patientData.examDate || 'N/A'}</p>
                <p><strong>BS Chỉ định:</strong> ${patientData.requestingPhysician || 'N/A'}</p>
                <p><strong>Lý do khám:</strong> ${patientData.reason ? patientData.reason.replace(/\n/g, '<br>') : 'N/A'}</p>
            </div><hr class="report-hr">`;

    // --- TECHNICAL DETAILS REMOVED ---

    // Translated Content Section
    report += `<div class="report-section report-findings-section">
                <h3 class="report-section-title">KẾT QUẢ SIÊU ÂM</h3>
                ${ translatedBodyHtml || '<p><i>Nội dung dịch không có sẵn.</i></p>' }
            </div><hr class="report-hr">`;

    // Images Section (Same structure as English version)
    const validImages = images.filter(img => img.dataUrl?.startsWith('data:image/'));
    if (validImages.length > 0) {
        console.log(`[ReportCore] Adding ${validImages.length} images to Vietnamese print version.`);
        report += `
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
        </div> </div><hr class="report-hr">`;
    }

    // --- NEW FOOTER ---
    report += `
    <div class="report-footer signature-section">
        <p class="signature-title">Bác sĩ siêu âm</p>
        <div class="signature-space"></div>
        <p class="signature-name">${patientData.reportingDoctor || '[ Họ tên bác sĩ siêu âm ]'}</p>
    </div>`;

    report += `</div>`; // Close report-container
    console.log("[ReportCore] Vietnamese HTML for print generated.");
    return report;
}

/**
 * Opens a print dialog for given HTML content with A4 styling,
 * including specific image formatting for 2-column, 16:9 fitting.
 * @param {string} htmlContent - The HTML string to print (either full EN or full VI report).
 * @param {string} title - The title for the print window.
 */
// MODIFIED printPreparedHtml function in report-core.js
// Focus on reducing vertical space and disabling page-break-inside for sections/images

function printPreparedHtml(htmlContent, title = 'Print Report') {
    try {
        const printWindow = window.open('', '_blank');
        if (!printWindow) { showNotification("Popup blocker may be active.", "error"); return; }

        printWindow.document.write(`
            <!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>${title}</title>
            <style>
                /* === Embedded Print Styles - Reduced Spacing === */
                @page {
                    size: A4;
                    margin: 15mm; /* Standard A4 margins */
                }

                body {
                    margin: 0 !important;
                    padding: 0 !important; /* Reset body padding */
                    font-family: 'Times New Roman', Times, serif;
                    line-height: 1.3; /* Reduced */
                    color: #000;
                    background: #fff !important;
                    font-size: 10pt;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }

                /* Basic elements - Reduced Margins */
                p {
                    margin: 0.1em 0 0.4em 0 !important; /* Significantly reduced paragraph margins */
                    orphans: 3;
                    widows: 3;
                }
                strong { font-weight: bold; }
                hr.report-hr { border: none; border-top: 1px solid #ccc; margin: 0.6em 0; } /* Reduced hr margin */

                /* Headings - Reduced Margins */
                h2, h3, h4 {
                    margin: 0.5em 0 0.2em 0 !important; /* Reduced heading margins */
                    padding: 0;
                    font-family: Arial, sans-serif;
                    page-break-after: avoid; /* Keep avoid after headings */
                    font-weight: bold;
                }
                h2.report-title { text-align: center; font-size: 1.3em; margin-bottom: 0.6em; }
                h3.report-section-title { font-size: 1.1em; border-bottom: 1px solid #999; margin-bottom: 0.3em; padding-bottom: 0.15em;}

                /* Report Structure - Reduced Margins & TEST: Page Break Avoid Disabled */
                .report-container { width: 100%; }
                .report-section {
                    margin-bottom: 0.6em !important; /* Reduced section margin */
                    /* page-break-inside: avoid !important; */ /* *** TEST: DISABLED *** */
                }
                .report-lesion-item {
                    margin-bottom: 0.4em !important; /* Reduced lesion margin */
                    padding-left: 0.8em !important;
                    border-left: 1px solid #ddd;
                     /* page-break-inside: avoid !important; */ /* *** TEST: DISABLED *** */
                }

                /* Image Print Styles - Reduced Margins/Gaps & TEST: Page Break Avoid Disabled */
                .report-images-section .image-flex-container {
                    display: flex; flex-wrap: wrap; justify-content: space-between;
                    gap: 5mm !important; /* Reduced gap */
                    margin-top: 0.4em !important;
                }
                .report-image-item {
                    flex: 0 1 calc(50% - 3mm); box-sizing: border-box; text-align: center;
                    /* page-break-inside: avoid !important; */ /* *** TEST: DISABLED *** */
                    margin-bottom: 5mm !important; /* Reduced bottom margin */
                    border: 1px solid #ccc; padding: 2mm; background-color: #fdfdfd;
                    overflow: hidden; /* Keep overflow hidden */
                    /* Remove fixed height, use max-height only */
                    /* height: 49mm; */
                    max-height: 47mm; /* Adjusted max-height slightly */
                    display: flex; flex-direction: column; justify-content: center; align-items: center;
                }
                .report-image-item img {
                    display: block; max-width: 100%; height: auto; max-height: 44mm; /* Max height for image itself */
                    object-fit: contain; margin: 0 auto 1mm auto;
                }
                .report-image-item .caption { font-size: 8pt; color: #333; margin-top: 0; line-height: 1.1; }

                /* Signature Styles - Reduced Margins */
                .signature-section { margin-top: 10mm !important; text-align: center; page-break-inside: avoid; } /* Keep avoid here */
                .signature-title { font-size: 10pt; margin-bottom: 1.5mm; font-weight: bold;}
                .signature-space { height: 12mm; margin-bottom: 1.5mm; border-bottom: 1px dotted #aaa; width: 60%; margin-left: auto; margin-right: auto; }
                .signature-name { font-size: 10pt; font-weight: bold; margin-top: 0; }

                /* Footer Styles - Reduced Margins */
                .report-footer { margin-top: 1em !important; font-size: 9pt; color: #333; text-align: center; border-top: 1px solid #ccc; padding-top: 0.5em !important; }
                .end-of-report { font-weight: bold; }

                /* Markdown generated styles - Reduced Margins/Padding */
                ul, ol { margin: 0.2em 0 0.5em 0 !important; padding-left: 18px !important; }
                li { margin-bottom: 0.1em !important; page-break-inside: avoid; } /* Keep avoid for list items */
                pre { white-space: pre-wrap; word-wrap: break-word; font-family: 'Courier New', monospace; font-size: 10pt; margin: 0.5em 0 !important; }

                /* Hide URLs */
                a[href]:after { content: none !important; }

                /* Minimal BR spacing */
                br { margin: 0 !important; padding: 0 !important; height: 0 !important; line-height: 0.1em !important; content: "" !important; display: block !important; }

            </style>
            </head><body>
        `);
        // Write the actual report content passed to the function
        // Adding a wrapper div for safety, though body styling should apply
        printWindow.document.write(`<div class="printable-content">${htmlContent}</div>`);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            try {
                if (!printWindow.closed) {
                    printWindow.print();
                    setTimeout(() => { if (!printWindow.closed) printWindow.close(); }, 2000);
                }
            } catch (e) { console.error("Error during print()/close():", e); if (!printWindow.closed) printWindow.close(); }
        }, 750);
    } catch (e) {
        console.error("Error creating print window:", e);
        showNotification("Failed to create print window. Check popup blocker.", "error");
    }
}

/**
 * Exports the English report HTML as a downloadable .html file with embedded styles.
 * @param {string} reportHtml - The HTML content string of the English report body.
 * @param {string} filename - Suggested filename.
 */
function exportReportAsHtml(reportHtml, filename = 'ultrasound-report.html') {
    // (Implementation remains the same - wraps reportHtml in boilerplate + styles)
     const fullHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${filename.replace('.html', '')}</title><style>body{margin:20px;font-family:Arial,sans-serif;line-height:1.4;}.report-container{max-width:800px;margin:auto;border:1px solid #eee;padding:15px;background-color:#fff;}p{margin:0.5em 0;}strong{font-weight:bold;}h2,h3,h4{margin:0.8em 0 0.4em 0;padding:0;font-family:Arial,sans-serif;}hr.report-hr{border:none;border-top:1px solid #eee;margin:1em 0;}.report-title{text-align:center;font-size:1.3em;font-weight:bold;}.report-section{margin-bottom:1em;}.report-section-title{font-size:1.1em;font-weight:bold;border-bottom:1px solid #ccc;margin-bottom:0.5em;padding-bottom:0.2em;}.report-lesion-item{margin-bottom:0.8em;padding-left:1em;border-left:2px solid #f0f0f0;}.report-images-section .image-flex-container{display:flex;flex-wrap:wrap;justify-content:flex-start;gap:15px;margin-top:10px;}.report-image-item{flex:0 1 calc(50% - 10px);box-sizing:border-box;text-align:center;margin-bottom:10px;}.report-image-item img{max-width:100%;max-height:100%;object-fit:contain;display:block;margin:0 auto 5px auto;border:1px solid #ccc;}.report-image-item .caption{font-size:9pt;color:#555;margin-top:0;word-wrap:break-word;}.signature-section{margin-top:40px;text-align:center;}.signature-title{font-weight:bold;margin-bottom:5px;font-size:11pt;}.signature-space{height:50px;margin-bottom:5px;}.signature-name{font-weight:bold;margin-top:0;font-size:11pt;}.report-footer{margin-top:1.5em;font-size:9pt;color:#444;text-align:center;border-top:1px solid #ccc;padding-top:1em;}.end-of-report{display:none;}</style></head><body>${reportHtml}</body></html>`;
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log(`[ReportCore] Report exported as ${filename}`);
}

// --- Main Initialization Function ---
/**
 * Initializes the report system event listeners and logic.
 */
export function initReportSystem() {
    // Get references to ALL needed DOM elements
    const generateBtn = document.getElementById('generate-report-btn');
    const printBtn = document.getElementById('print-report-btn');
    const exportBtn = document.getElementById('export-report-html-btn'); // Stays HTML export
    const translateBtn = document.getElementById('translate-report-btn');
    const printTranslationBtn = document.getElementById('print-translation-btn');
    const reportPreview = document.getElementById('report-preview');
    const translationSection = document.getElementById('translation-section');
    const translationContent = document.getElementById('translation-content');
    const translationEditArea = document.getElementById('translation-edit-area');
    const editTranslationBtn = document.getElementById('edit-translation-btn');
    const translationLoading = document.getElementById('translation-loading');

    // Initial check for element existence
    const requiredElements = { generateBtn, printBtn, exportBtn, translateBtn, printTranslationBtn, reportPreview, translationSection, translationContent, translationEditArea, editTranslationBtn, translationLoading };
    for (const key in requiredElements) {
        if (!requiredElements[key]) {
            console.error(`[ReportCore] Initialization failed: Element with ID matching '${key}' not found.`);
            showNotification(`Report UI element missing: ${key}. Please check HTML.`, "error");
            // return; // Stop initialization if a critical element is missing
        }
    }
    console.log("[ReportCore] All required report UI elements found.");

    // --- Generate Report Button Listener ---
    generateBtn.addEventListener('click', async () => {
        console.log("[ReportCore] Generate Report button clicked.");
        // 1. Reset UI State
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

        // --- 2. Data Collection & Formatting ---
        try {
            // Collect data (including reportingDoctor from patient info form)
            currentPatientData = getFormData('#patient-info-form');
            if (!currentPatientData.reportingDoctor) {
                 // Optionally warn if doctor name is missing but not required by form
                 console.warn("[ReportCore] Reporting doctor name is empty.");
            }

            let organData = {};
            try {
                const { collectThyroidData } = await import('../organs/thyroid/thyroid-module.js');
                organData = collectThyroidData();
                if (!organData?.formatReportSectionHtml) throw new Error("Organ data formatter missing.");
            } catch (organError) { throw new Error(`Findings data error: ${organError.message}`); }

            const images = getUploadedImageData(true);
            generatedReportHtml = formatReportAsHtml(currentPatientData, organData, images); // Call EN formatter
            console.log("[ReportCore] Report HTML generated.");

            // --- 3. Display Report ---
            reportPreview.innerHTML = generatedReportHtml;
            console.log("[ReportCore] Report preview updated.");

            // --- 4. Show Action Buttons ---
            printBtn.style.display = 'inline-block';
            exportBtn.style.display = 'inline-block';
            if (getApiKey() && getTranslationPrompt()) {
                translateBtn.style.display = 'inline-block';
            } else { console.warn("Translate button hidden: Config missing."); }
            showNotification("Report generated successfully!", "success");

        } catch (error) {
            console.error("[ReportCore] Error during report generation:", error);
            reportPreview.innerHTML = `<p class="placeholder-text" style="color: red;"><b>Error:</b> ${error.message}</p>`;
            showNotification(`Report Generation Failed: ${error.message}`, 'error', 5000);
        }
    });

    // --- Translate Button Listener ---
    translateBtn.addEventListener('click', async () => {
        console.log("[ReportCore] Translate Report button clicked.");
        if (!generatedReportHtml) { /* ... check prerequisite ... */ return; }
        const apiKey = getApiKey(); const systemPrompt = getTranslationPrompt();
        if (!apiKey || !systemPrompt) { /* ... check config ... */ return; }
        let reportTextContent = '';
        try { /* ... extract text ... */
             const tempDiv = document.createElement('div'); tempDiv.innerHTML = generatedReportHtml;
             reportTextContent = (tempDiv.innerText || tempDiv.textContent || '').trim();
             if (!reportTextContent) throw new Error("Extracted text empty.");
        } catch (extractError){ /* ... handle error ... */ return; }

        // Show Loading, Reset State
        translationSection.style.display = 'block'; translationContent.style.display = 'none'; translationEditArea.style.display = 'none';
        editTranslationBtn.style.display = 'none'; printTranslationBtn.style.display = 'none'; translationLoading.style.display = 'block';
        translateBtn.disabled = true; isEditingTranslation = false; currentTranslationMarkdown = '';

        try { // Call API
            const translatedMarkdown = await translateReportViaApi(reportTextContent, apiKey, systemPrompt);
            currentTranslationMarkdown = translatedMarkdown;

            // Parse and Display
            if (typeof marked !== 'undefined' && marked.parse) {
                marked.setOptions({ breaks: true, gfm: true });
                translationContent.innerHTML = marked.parse(currentTranslationMarkdown);
                translationContent.style.whiteSpace = 'normal';
            } else { /* fallback */ translationContent.innerText = currentTranslationMarkdown; translationContent.style.whiteSpace = 'pre-wrap'; }
            translationContent.style.display = 'block';
            editTranslationBtn.innerHTML = '<i class="fas fa-edit"></i> Sửa bản dịch'; editTranslationBtn.classList.remove('editing');
            editTranslationBtn.style.display = 'inline-block'; printTranslationBtn.style.display = 'inline-block';
            showNotification("Report translated successfully!", "success");
            translationSection.scrollIntoView({ behavior: 'smooth', block: 'nearest'});
        } catch (error) { /* ... handle error ... */ }
        finally { translationLoading.style.display = 'none'; translateBtn.disabled = false; }
    });

    // --- Edit/Save Translation Button Listener ---
    editTranslationBtn.addEventListener('click', () => {
        if (isEditingTranslation) { // Save
            currentTranslationMarkdown = translationEditArea.value;
            if (typeof marked !== 'undefined') { marked.setOptions({ breaks: true, gfm: true }); translationContent.innerHTML = marked.parse(currentTranslationMarkdown); translationContent.style.whiteSpace = 'normal'; }
            else { translationContent.innerText = currentTranslationMarkdown; translationContent.style.whiteSpace = 'pre-wrap'; }
            translationEditArea.style.display = 'none'; translationContent.style.display = 'block';
            editTranslationBtn.innerHTML = '<i class="fas fa-edit"></i> Sửa bản dịch'; editTranslationBtn.classList.remove('editing');
            isEditingTranslation = false; showNotification("Translation updated.", "success");
        } else { // Edit
            if (!currentTranslationMarkdown) { return; }
            translationEditArea.value = currentTranslationMarkdown;
            translationContent.style.display = 'none'; translationEditArea.style.display = 'block';
            editTranslationBtn.innerHTML = '<i class="fas fa-save"></i> Lưu bản dịch'; editTranslationBtn.classList.add('editing');
            isEditingTranslation = true; translationEditArea.focus();
        }
    });

    // --- Print Original Report (EN) Button Listener ---
    printBtn.addEventListener('click', () => {
        if (generatedReportHtml) {
            printPreparedHtml(generatedReportHtml, `Ultrasound Report - ${currentPatientData?.patientId || ''}`);
        } else { showNotification("Please generate the report first.", "info"); }
    });

    // --- Print Translation (VI) Button Listener ---
    printTranslationBtn.addEventListener('click', () => {
        if (currentTranslationMarkdown) {
             let translatedBodyHtml = ''; // This is just the FINDINGS+IMPRESSION block typically
             if (typeof marked !== 'undefined') { marked.setOptions({ breaks: true, gfm: true }); translatedBodyHtml = marked.parse(currentTranslationMarkdown); }
             else { translatedBodyHtml = `<pre>${currentTranslationMarkdown.replace(/</g,"&lt;")}</pre>`; }
             const images = getUploadedImageData(true);
             // Generate the FULL VI HTML structure for printing
             const vietnameseReportHtml = generateVietnameseReportHtmlForPrint(currentPatientData, translatedBodyHtml, images);
             printPreparedHtml(vietnameseReportHtml, `Báo cáo Siêu âm (VI) - ${currentPatientData?.patientId || ''}`);
        } else { showNotification("No translation available to print.", "info"); }
    });

    // --- Export HTML Button Listener (Exports English version) ---
    exportBtn.addEventListener('click', () => {
         if (generatedReportHtml) {
             const patientId = currentPatientData?.patientId || 'UnknownID';
             const examDate = currentPatientData?.examDate || new Date().toISOString().split('T')[0];
             const filename = `Ultrasound_Report_${patientId}_${examDate}.html`;
             exportReportAsHtml(generatedReportHtml, filename); // Calls export helper
         } else { showNotification("Please generate the report first.", "info"); }
     });

} // === End of initReportSystem ===