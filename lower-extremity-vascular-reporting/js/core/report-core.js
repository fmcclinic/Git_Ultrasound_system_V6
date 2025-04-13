// js/core/report-core.js (ADAPTED for LE Vascular Project - v4 Aggressive Print Layout)
// Handles report generation, preview, translation, editing, printing, and exporting for LE VASCULAR reports.

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

// --- Helper Functions ---

function formatReportAsHtml(patientData, organData, images, reportTitle = "LOWER EXTREMITY VASCULAR ULTRASOUND REPORT") {
    // (Hàm này giữ nguyên như phiên bản trước - v3)
    console.log("[ReportCore - LE Vascular] Formatting English report as HTML...");
    if (!organData || typeof organData.formatReportSectionHtml !== 'function') {
        console.error("[ReportCore - LE Vascular] Invalid organData or missing formatReportSectionHtml method.");
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
                ${ organData.formatReportSectionHtml() }
            </div>`;
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
    report += `<hr class="report-hr"><div class="report-footer signature-section">
        <p class="signature-title">Bác sĩ siêu âm</p>
        <div class="signature-space"></div> <p class="signature-name">${patientData.reportingDoctor || '[ Họ tên bác sĩ siêu âm ]'}</p>
    </div>`;
    report += `</div>`;
    return report;
}

function generateVietnameseReportHtmlForPrint(patientData, translatedBodyHtml, images) {
     // (Hàm này giữ nguyên như phiên bản trước - v3)
    console.log("[ReportCore - LE Vascular] Generating Vietnamese HTML report structure for printing...");
    const reportTitleVI = "BÁO CÁO SIÊU ÂM MẠCH MÁU CHI DƯỚI";
    let report = `<div class="report-container">`;
    report += `<h2 class="report-title">${reportTitleVI}</h2><hr class="report-hr">`;
    report += `<div class="report-section">
                <h3 class="report-section-title">THÔNG TIN BỆNH NHÂN</h3>
                <p><strong>Họ Tên:</strong> ${patientData.patientName || 'N/A'}</p>
                <p><strong>Mã BN:</strong> ${patientData.patientId || 'N/A'}</p>
                <p><strong>Ngày sinh:</strong> ${patientData.patientDob || 'N/A'}</p>
                <p><strong>Ngày khám:</strong> ${patientData.examDate || 'N/A'}</p>
                <p><strong>BS Chỉ định:</strong> ${patientData.requestingPhysician || 'N/A'}</p>
                <p><strong>Lý do khám:</strong> ${patientData.reason ? String(patientData.reason).replace(/\n/g, '<br>') : 'N/A'}</p>
            </div><hr class="report-hr">`;
    report += `<div class="report-section report-findings-section">
                 ${ translatedBodyHtml || '<p><i>Nội dung dịch không có sẵn.</i></p>' }
            </div>`;
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
    report += `<hr class="report-hr"><div class="report-footer signature-section">
        <p class="signature-title">Bác sĩ siêu âm</p>
        <div class="signature-space"></div>
        <p class="signature-name">${patientData.reportingDoctor || '[ Họ tên bác sĩ siêu âm ]'}</p>
    </div>`;
    report += `</div>`;
    console.log("[ReportCore - LE Vascular] Vietnamese HTML for print generated.");
    return report;
}

// === UPDATED printPreparedHtml with more aggressive CSS changes for print layout ===
function printPreparedHtml(htmlContent, title = 'Print Report') {
    try {
        const printWindow = window.open('', '_blank');
        if (!printWindow) { showNotification("Popup blocker may be active.", "error"); return; }

        printWindow.document.write(`
            <!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>${title}</title>
            <style>
                /* === Embedded Print Styles (LE Vascular - v4 Aggressive Print Layout) === */
                @page { size: A4; margin: 12mm; } /* Slightly reduced page margin */
                body { margin: 0 !important; padding: 0 !important; font-family: 'Times New Roman', Times, serif; line-height: 1.35; /* Tighter */ color: #000; background: #fff !important; font-size: 10pt; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                p { margin: 0.15em 0 0.3em 0 !important; /* Reduced paragraph margin */ orphans: 3; widows: 3; }
                strong { font-weight: bold; }
                hr.report-hr { border: none; border-top: 1px solid #ccc; margin: 0.5em 0; /* Reduced hr margin */ }
                h2, h3, h4, h5 { margin: 0.4em 0 0.15em 0 !important; /* Reduced heading margin */ padding: 0; font-family: Arial, sans-serif; page-break-after: avoid; font-weight: bold; }
                h2.report-title { text-align: center; font-size: 1.2em; margin-bottom: 0.5em; color: #000; }
                h3.report-section-title { font-size: 1.05em; border-bottom: 1px solid #999; margin-bottom: 0.3em; padding-bottom: 0.1em; color: #000;}

                /* --- START: LE Vascular Findings Section Print Styles --- */
                .report-findings-section { page-break-inside: auto; }
                .report-findings-section .le-vascular-findings-container > div.findings-grid {
                    display: grid !important;
                    grid-template-columns: 1fr 1fr !important;
                    gap: 6mm !important; /* Reduced gap */
                    margin-top: 3mm !important; /* Reduced top margin */
                    page-break-inside: auto !important; /* Explicitly allow grid to break */
                }
                .report-findings-right-column { /* No page break avoid */ }
                .report-findings-left-column {
                    border-left: 1px solid #ccc !important; /* Separator line */
                    padding-left: 6mm !important; /* Reduced padding */
                    box-sizing: border-box;
                    /* No page break avoid */
                }
                .report-findings-section h4 { /* Leg Titles / Vessel Segments */
                     font-size: 1em; font-weight: bold; color: #000;
                     margin-top: 0.5em; margin-bottom: 0.15em; padding-bottom: 1px;
                     border-bottom: 1px dotted #aaa; page-break-after: avoid;
                 }
                 .report-findings-right-column > h4:first-of-type,
                 .report-findings-left-column > h4:first-of-type { margin-top: 0 !important; }
                 .report-findings-section h5 { /* Arterial/Venous Subtitles */
                    font-size: 0.95em; font-weight: bold; color: #333;
                    margin-top: 0.5em; margin-bottom: 0.15em; border-bottom: none;
                    padding-bottom: 0; page-break-after: avoid;
                 }
                .report-findings-section ul { list-style: none; padding-left: 4px; margin-top: 0.1em; margin-bottom: 0.5em; page-break-inside: avoid; }
                .report-findings-section li { margin-bottom: 0.15em; line-height: 1.3; page-break-inside: avoid; }
                .report-findings-section li strong { color: #000; margin-right: 3px; display: inline-block; min-width: 70px; } /* Adjusted */

                /* ABI/Reflux Summary in Print */
                 .report-findings-section .le-vascular-findings-container > .abi-summary-section,
                 .report-findings-section .le-vascular-findings-container > .reflux-summary-section {
                     margin-top: 5mm; padding-top: 2mm; border-top: 1px dashed #ccc;
                     page-break-before: auto; page-break-inside: avoid;
                 }
                 .report-findings-section .abi-summary-section h5,
                 .report-findings-section .reflux-summary-section h5 { font-size: 0.95em; font-weight: bold; margin-bottom: 1.5mm; color: #333; page-break-after: avoid; }
                 .report-findings-section .abi-summary-section p,
                 .report-findings-section .reflux-summary-section p { margin: 0.15em 0; font-size: 9pt; }

                 /* Impression/Recommendation in Print */
                  .report-findings-section .le-vascular-findings-container > h4:nth-of-type(n+2) { /* Target Impression/Reco H4s */
                     margin-top: 5mm; padding-top: 2mm; border-top: 1px solid #ccc; border-bottom: none;
                     page-break-before: auto; page-break-inside: avoid; font-size: 1.05em;
                 }
                  .report-findings-section .le-vascular-findings-container > h4:nth-of-type(n+2) + p { /* Paragraphs after Imp/Reco H4s */
                     page-break-inside: auto; /* Allow breaking */
                 }
                /* --- END: LE Vascular Findings Section Print Styles --- */

                /* General Layout & Images/Signature */
                .report-container { width: 100%; }
                .report-section { margin-bottom: 0.6em !important; /* Reduced */ }
                .report-images-section { page-break-before: auto; } /* Allow break before images if needed */
                .report-images-section .image-flex-container { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4mm !important; margin-top: 0.3em !important; }
                .report-image-item { flex: 0 1 calc(50% - 2.5mm); box-sizing: border-box; text-align: center; page-break-inside: avoid !important; margin-bottom: 4mm !important; border: 1px solid #ccc; padding: 1.5mm; background-color: #fdfdfd !important; print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; overflow: hidden; max-height: 45mm; display: flex; flex-direction: column; justify-content: center; align-items: center; }
                .report-image-item img { display: block; max-width: 100%; height: auto; max-height: 42mm; object-fit: contain; margin: 0 auto 1mm auto; }
                .report-image-item .caption { font-size: 7.5pt; color: #333; margin-top: 0; line-height: 1.1; word-wrap: break-word; }
                /* Signature */
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
        setTimeout(() => {
            try {
                if (!printWindow.closed) {
                    printWindow.print();
                    setTimeout(() => { if (!printWindow.closed) printWindow.close(); }, 3000);
                }
            } catch (e) { console.error("Error during print()/close():", e); if (!printWindow.closed) printWindow.close(); }
        }, 750);

    } catch (e) {
        console.error("Error creating print window:", e);
        showNotification("Failed to create print window. Check popup blocker.", "error");
    }
}

// Update embedded styles in exportReportAsHtml as well for consistency
function exportReportAsHtml(reportHtml, filename = 'le-vascular-ultrasound-report.html') {
    // === UPDATED Embedded Styles to match printPreparedHtml v4 ===
    const printStyles = `
        @page { size: A4; margin: 12mm; }
        body { margin: 0 !important; padding: 0 !important; font-family: 'Times New Roman', Times, serif; line-height: 1.35; color: #000; background: #fff !important; font-size: 10pt; }
        p { margin: 0.15em 0 0.3em 0 !important; } strong { font-weight: bold; } hr.report-hr { border: none; border-top: 1px solid #ccc; margin: 0.5em 0; }
        h2, h3, h4, h5 { margin: 0.4em 0 0.15em 0 !important; padding: 0; font-family: Arial, sans-serif; font-weight: bold; } h2.report-title { text-align: center; font-size: 1.2em; margin-bottom: 0.5em; color: #000; } h3.report-section-title { font-size: 1.05em; border-bottom: 1px solid #999; margin-bottom: 0.3em; padding-bottom: 0.1em; color: #000;}
        /* LE Vascular Findings Styles */
        .report-findings-section .le-vascular-findings-container > div.findings-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 6mm !important; margin-top: 3mm !important; }
        .report-findings-left-column { border-left: 1px solid #ccc !important; padding-left: 6mm !important; box-sizing: border-box; }
        .report-findings-section h4 { font-size: 1em; font-weight: bold; color: #000; margin-top: 0.5em; margin-bottom: 0.15em; padding-bottom: 1px; border-bottom: 1px dotted #aaa; }
        .report-findings-right-column > h4:first-of-type, .report-findings-left-column > h4:first-of-type { margin-top: 0 !important; }
        .report-findings-section h5 { font-size: 0.95em; font-weight: bold; color: #333; margin-top: 0.5em; margin-bottom: 0.15em; border-bottom: none; padding-bottom: 0; }
        .report-findings-section ul { list-style: none; padding-left: 4px; margin-top: 0.1em; margin-bottom: 0.5em; }
        .report-findings-section li { margin-bottom: 0.15em; line-height: 1.3; }
        .report-findings-section li strong { color: #000; margin-right: 3px; display: inline-block; min-width: 70px; }
         .report-findings-section .le-vascular-findings-container > .abi-summary-section, .report-findings-section .le-vascular-findings-container > .reflux-summary-section { margin-top: 5mm; padding-top: 2mm; border-top: 1px dashed #ccc; }
         .report-findings-section .abi-summary-section h5, .report-findings-section .reflux-summary-section h5 { font-size: 0.95em; font-weight: bold; margin-bottom: 1.5mm; color: #333; }
         .report-findings-section .abi-summary-section p, .report-findings-section .reflux-summary-section p { margin: 0.15em 0; font-size: 9pt; }
         .report-findings-section .le-vascular-findings-container > h4:nth-of-type(n+2) { margin-top: 5mm; padding-top: 2mm; border-top: 1px solid #ccc; border-bottom: none; font-size: 1.05em; }
        /* General layout */
        .report-container { width: 100%; max-width: 180mm; margin: auto; } .report-section { margin-bottom: 0.6em !important; }
        /* Images */
        .report-images-section .image-flex-container { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4mm !important; margin-top: 0.3em !important; } .report-image-item { flex: 0 1 calc(50% - 2.5mm); box-sizing: border-box; text-align: center; margin-bottom: 4mm !important; border: 1px solid #ccc; padding: 1.5mm; background-color: #fdfdfd; overflow: hidden; max-height: 45mm; display: flex; flex-direction: column; justify-content: center; align-items: center; } .report-image-item img { display: block; max-width: 100%; height: auto; max-height: 42mm; object-fit: contain; margin: 0 auto 1mm auto; } .report-image-item .caption { font-size: 7.5pt; color: #333; margin-top: 0; line-height: 1.1; word-wrap: break-word; }
        /* Signature */
        .signature-section { margin-top: 8mm !important; text-align: center; } .signature-title { font-size: 9.5pt; margin-bottom: 1mm; font-weight: bold;} .signature-space { height: 10mm; margin-bottom: 1mm; border-bottom: 1px dotted #aaa; width: 55%; margin-left: auto; margin-right: auto; } .signature-name { font-size: 9.5pt; font-weight: bold; margin-top: 0; }
        .report-footer { margin-top: 0.8em !important; font-size: 8.5pt; color: #333; text-align: center; border-top: 1px solid #ccc; padding-top: 0.4em !important; }
        pre { white-space: pre-wrap; word-wrap: break-word; font-family: 'Courier New', monospace; font-size: 9.5pt; margin: 0.4em 0 !important; } a[href]:after { content: none !important; } br { margin: 0 !important; padding: 0 !important; height: 0 !important; line-height: 0.1em !important; content: "" !important; display: block !important; }
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
    console.log(`[ReportCore - LE Vascular] Report exported as ${filename}`);
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

    const requiredElements = { generateBtn, printBtn, exportBtn, translateBtn, printTranslationBtn, reportPreview, translationSection, translationContent, translationEditArea, editTranslationBtn, translationLoading };
    for (const key in requiredElements) {
        if (!requiredElements[key]) {
            console.error(`[ReportCore - LE Vascular] Initialization failed: Element with ID matching '${key}' not found.`);
            showNotification(`Report UI element missing: ${key}. Check HTML.`, "error");
            return;
        }
    }
    console.log("[ReportCore - LE Vascular] All required report UI elements found.");

    // --- Generate Report Button Listener ---
    generateBtn.addEventListener('click', async () => {
        console.log("[ReportCore - LE Vascular] Generate Report button clicked.");
        // Reset UI
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

        // Data Collection & Formatting
        try {
            currentPatientData = getFormData('#patient-info-form');
            if (!currentPatientData.reportingDoctor) {
                console.warn("[ReportCore - LE Vascular] Reporting doctor name is empty.");
            }

            const { collectLEVascularData } = await import('../organs/le-vascular/le-vascular-module.js');
            const organData = collectLEVascularData();
            if (!organData || typeof organData.formatReportSectionHtml !== 'function') {
                 throw new Error("Failed to collect or format LE Vascular assessment data.");
            }

            const images = getUploadedImageData(true);
            const reportTitle = "LOWER EXTREMITY VASCULAR ULTRASOUND REPORT";
            generatedReportHtml = formatReportAsHtml(currentPatientData, organData, images, reportTitle);
            console.log("[ReportCore - LE Vascular] Report HTML generated.");

            // Display Report & Show Buttons
            reportPreview.innerHTML = generatedReportHtml;
            console.log("[ReportCore - LE Vascular] Report preview updated.");
            printBtn.style.display = 'inline-block';
            exportBtn.style.display = 'inline-block';
            if (getApiKey() && getTranslationPrompt()) {
                translateBtn.style.display = 'inline-block';
            } else {
                console.warn("[ReportCore - LE Vascular] Translate button hidden: API Key or Prompt missing.");
                showNotification("Translation disabled: Config missing.", "info");
            }
            showNotification("LE Vascular report generated successfully!", "success");

        } catch (error) {
            console.error("[ReportCore - LE Vascular] Error during report generation:", error);
            reportPreview.innerHTML = `<p class="placeholder-text" style="color: red;"><b>Error generating report:</b> ${error.message}</p>`;
            showNotification(`Report Generation Failed: ${error.message}`, 'error', 6000);
        }
    });

    // --- Translate Button Listener ---
    translateBtn.addEventListener('click', async () => {
        console.log("[ReportCore - LE Vascular] Translate Report button clicked.");
        if (!generatedReportHtml) { showNotification("Generate the report first.", "info"); return; }
        const apiKey = getApiKey(); const systemPrompt = getTranslationPrompt();
        if (!apiKey || !systemPrompt) { showNotification("Translation config missing (API Key or Prompt).", "error"); return; }

        let reportTextContent = '';
        try {
             const tempDiv = document.createElement('div'); tempDiv.innerHTML = generatedReportHtml;
             const findingsSection = tempDiv.querySelector('.report-findings-section');
             const textSource = findingsSection?.querySelector('.le-vascular-findings-container') || findingsSection;
             reportTextContent = (textSource?.innerText || textSource?.textContent || '').trim();
             if (!reportTextContent) throw new Error("Could not extract text content from report findings container.");
        } catch (extractError){
             console.error("[ReportCore - LE Vascular] Error extracting text:", extractError);
             showNotification(`Error preparing text for translation: ${extractError.message}`, "error");
             return;
        }

        translationSection.style.display = 'block'; translationContent.style.display = 'none'; translationEditArea.style.display = 'none';
        editTranslationBtn.style.display = 'none'; printTranslationBtn.style.display = 'none'; translationLoading.style.display = 'block';
        translateBtn.disabled = true; isEditingTranslation = false; currentTranslationMarkdown = '';

        try {
            const translatedMarkdown = await translateReportViaApi(reportTextContent, apiKey, systemPrompt);
            currentTranslationMarkdown = translatedMarkdown;

            if (typeof marked !== 'undefined' && marked.parse) {
                 marked.setOptions({ breaks: true, gfm: true });
                translationContent.innerHTML = marked.parse(currentTranslationMarkdown);
                translationContent.style.whiteSpace = 'normal';
            } else {
                console.warn("Marked.js library not found. Displaying raw Markdown.");
                translationContent.innerText = currentTranslationMarkdown;
                translationContent.style.whiteSpace = 'pre-wrap';
            }
            translationContent.style.display = 'block';
            editTranslationBtn.innerHTML = '<i class="fas fa-edit"></i> Sửa bản dịch'; editTranslationBtn.classList.remove('editing');
            editTranslationBtn.style.display = 'inline-block'; printTranslationBtn.style.display = 'inline-block';
            showNotification("Report translated successfully!", "success");
            translationSection.scrollIntoView({ behavior: 'smooth', block: 'nearest'});

        } catch (error) {
            console.error("[ReportCore - LE Vascular] Translation failed:", error);
            translationContent.innerHTML = `<p class="placeholder-text" style="color: red;"><b>Translation Failed:</b> ${error.message}</p>`;
            translationContent.style.display = 'block';
        } finally {
            translationLoading.style.display = 'none';
            translateBtn.disabled = false;
        }
    });

    // --- Edit/Save Translation Button Listener ---
    editTranslationBtn.addEventListener('click', () => {
        if (isEditingTranslation) { // Save
            currentTranslationMarkdown = translationEditArea.value;
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
            const title = `LE Vascular US Report - ${currentPatientData?.patientId || 'Unknown'} - ${currentPatientData?.examDate || ''}`;
            printPreparedHtml(generatedReportHtml, title); // Uses the updated function v4
        } else { showNotification("Please generate the report first.", "info"); }
    });

    // --- Print Translation (VI) Button Listener ---
    printTranslationBtn.addEventListener('click', () => {
        if (currentTranslationMarkdown) {
             let translatedBodyHtml = '';
             if (typeof marked !== 'undefined') {
                 marked.setOptions({ breaks: true, gfm: true });
                 translatedBodyHtml = marked.parse(currentTranslationMarkdown);
             } else {
                 translatedBodyHtml = `<pre style="white-space: pre-wrap; word-wrap: break-word;">${currentTranslationMarkdown.replace(/</g,"&lt;")}</pre>`;
             }
             const images = getUploadedImageData(true);
             const vietnameseReportHtml = generateVietnameseReportHtmlForPrint(currentPatientData, translatedBodyHtml, images);
             const titleVI = `Báo cáo SA Mạch máu Chi dưới - ${currentPatientData?.patientId || 'Unknown'} - ${currentPatientData?.examDate || ''}`;
             printPreparedHtml(vietnameseReportHtml, titleVI); // Uses the updated function v4
        } else { showNotification("No translation available to print.", "info"); }
    });

    // --- Export HTML Button Listener ---
    exportBtn.addEventListener('click', () => {
         if (generatedReportHtml) {
             const patientId = currentPatientData?.patientId || 'UnknownID';
             const examDate = currentPatientData?.examDate || new Date().toISOString().split('T')[0];
             const filename = `LE_Vascular_US_Report_${patientId}_${examDate}.html`;
             exportReportAsHtml(generatedReportHtml, filename); // Uses updated embedded CSS v4
         } else { showNotification("Please generate the report first.", "info"); }
     });

} // === End of initReportSystem ===

console.log("report-core.js (LE Vascular Version - v4 Print Layout Refinements) loaded.");