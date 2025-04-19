// js/organs/chestxray/chestxray-module.js
// Module specific to Chest X-ray reporting logic.

// --- Core Imports ---
import { showNotification } from '../../core/ui-core.js';
import { populateForm, getFormData } from '../../core/form-core.js';

// --- Module-level variables ---
const hideSuggestionTimeoutsCXR = {}; // Timeout tracker for CXR textareas

// --- Constants ---
// Keys for anatomy parts requiring conditional description display
const ANATOMY_STATUS_CONTROLS = ['bones', 'lungs']; // Add other IDs if needed
const NORMAL_STATUS_VALUES = [
    "Normal / Bình thường",
    "Clear bilaterally / Phổi hai bên trong" // Add other 'normal/clear' values if used
];

// --- Initialization ---
/**
 * Initializes the ChestXray module functionalities.
 * Sets up event listeners specific to the Chest X-ray assessment form.
 */
export function init() {
    console.log("[ChestXrayModule] Initializing...");
    try {
        const cxrForm = document.getElementById('cxr-assessment-form');

        if (!cxrForm) {
            console.error("[ChestXrayModule] CRITICAL: Chest X-ray assessment form ('#cxr-assessment-form') not found. Module cannot function.");
            showNotification("Error: Chest X-ray assessment UI not found.", "error");
            return; // Stop initialization
        }

        // --- Event Delegation for suggestion buttons & anatomy status changes ---
        cxrForm.addEventListener('click', function(event) {
            const target = event.target;
            // Handle Suggestion Button click
            if (target.classList.contains('suggestion-btn')) {
                handleSuggestionButtonClickCXR(target);
                const container = target.closest('.suggestion-button-container');
                if (container) container.style.display = 'none'; // Hide after click
            }
        });

        cxrForm.addEventListener('change', function(event) {
            const target = event.target;
            // Handle Anatomy Status Select change (for Bones, Lungs, etc.)
            if (target.classList.contains('anatomy-status-select')) {
                handleAnatomyStatusChangeCXR(target);
            }
        });

        // --- Initialize Anatomy Description Visibility ---
        // Needs to run after potential template loading, use timeout as safeguard
        setTimeout(() => {
            cxrForm.querySelectorAll('.anatomy-status-select').forEach(select => {
                handleAnatomyStatusChangeCXR(select); // Ensure initial state is correct
            });
        }, 150);


        // --- Setup suggestion visibility ---
        setupSuggestionVisibilityCXR(cxrForm);

        console.log("[ChestXrayModule] Initialized successfully.");
    } catch (error) {
        console.error("[ChestXrayModule] Error during initialization:", error);
        showNotification("Failed to initialize Chest X-ray module.", "error");
    }
}

// --- UI Helpers ---

/**
 * Shows or hides the related description textarea based on the status selection.
 * Specific to elements using the 'anatomy-status-select' class in the CXR form.
 * @param {HTMLSelectElement} selectElement - The status select element that changed.
 */
function handleAnatomyStatusChangeCXR(selectElement) {
    const targetAreaId = selectElement.dataset.targetArea; // Expects data-target-area="textarea_id"
    if (!targetAreaId) return;

    const descriptionGroup = selectElement.closest('.anatomy-content')?.querySelector(`#${targetAreaId}`)?.closest('.anatomy-description-group');
    if (!descriptionGroup) {
        console.warn(`[ChestXrayModule] Description group for target area '${targetAreaId}' not found.`);
        return;
    }

    // Show description group only if status is NOT one of the 'Normal' values
    const isNormal = NORMAL_STATUS_VALUES.includes(selectElement.value);
    if (!isNormal) {
        descriptionGroup.style.display = 'block';
    } else {
        descriptionGroup.style.display = 'none';
        // Optionally clear the textarea when status changes back to Normal
        // const textarea = descriptionGroup.querySelector('textarea');
        // if (textarea) textarea.value = '';
    }
}


/** Sets up focus/blur listeners for suggestion buttons visibility. */
function setupSuggestionVisibilityCXR(parentElement) {
    const suggestionContainers = parentElement.querySelectorAll('.suggestion-button-container');
    suggestionContainers.forEach(container => {
        const inputElement = container.previousElementSibling; // Assumes input/textarea is directly before container
        if (inputElement && (inputElement.tagName === 'TEXTAREA' || inputElement.tagName === 'INPUT')) {
            let elementId = inputElement.id || `input_cxr_${Date.now()}_${Math.random().toString(16).slice(2)}`;
            inputElement.id = elementId; // Ensure the element has an ID

            // Remove existing listeners to prevent duplicates if init is called multiple times
            inputElement.removeEventListener('focus', handleInputFocusCXR);
            inputElement.removeEventListener('blur', handleInputBlurCXR);

            // Add new listeners
            inputElement.addEventListener('focus', handleInputFocusCXR);
            inputElement.addEventListener('blur', handleInputBlurCXR);
        }
    });
}

/** Shows suggestion buttons on focus. */
function handleInputFocusCXR(event) {
    const inputElement = event.target;
    const elementId = inputElement.id;
    const container = inputElement.nextElementSibling; // Assumes container is directly after
    if (hideSuggestionTimeoutsCXR[elementId]) {
        clearTimeout(hideSuggestionTimeoutsCXR[elementId]);
        delete hideSuggestionTimeoutsCXR[elementId];
    }
    if (container && container.classList.contains('suggestion-button-container')) {
        container.style.display = 'flex'; // Use 'flex' for horizontal layout
    }
}

/** Hides suggestion buttons on blur with a delay. */
function handleInputBlurCXR(event) {
    const inputElement = event.target;
    const elementId = inputElement.id;
    const container = inputElement.nextElementSibling; // Assumes container is directly after
    if (container && container.classList.contains('suggestion-button-container')) {
        // Use a short timeout to allow clicking a suggestion button before hiding
        hideSuggestionTimeoutsCXR[elementId] = setTimeout(() => {
            container.style.display = 'none';
            delete hideSuggestionTimeoutsCXR[elementId]; // Clean up timeout ID
        }, 250); // 250ms delay
    }
}

/** Handles suggestion button click, inserting text into the associated input/textarea. */
function handleSuggestionButtonClickCXR(button) {
    const textToInsert = button.dataset.insert;
    const container = button.closest('.suggestion-button-container');
    const targetElement = container ? container.previousElementSibling : null; // Assumes input/textarea is directly before

    if (targetElement && (targetElement.tagName === 'TEXTAREA' || targetElement.tagName === 'INPUT') && textToInsert !== undefined) {
        const currentValue = targetElement.value;
        let separator = '';
        // Add separator (e.g., ". ") if the target is not empty and doesn't end with space/newline/punctuation
        if (currentValue.trim().length > 0 && !/[\s\.\?\!;:,]$/.test(currentValue.trim())) {
             separator = '. ';
        } else if (currentValue.length > 0 && !currentValue.endsWith(' ') && !currentValue.endsWith('\n')) {
            separator = ' '; // Add a space if not empty but ends with non-space
        }

        targetElement.value += separator + textToInsert;
        // Trigger input event to notify any other listeners (e.g., auto-save)
        targetElement.dispatchEvent(new Event('input', { bubbles: true }));
        targetElement.focus(); // Set focus back to the input field
        // Scroll to the bottom of textarea if applicable
        if(targetElement.tagName === 'TEXTAREA') {
            targetElement.scrollTop = targetElement.scrollHeight;
        }
    } else {
        console.warn("[ChestXrayModule] Target input/textarea or data-insert attribute not found for suggestion button.", button);
    }
}

// --- Data Collection ---
/**
 * Collects all data for the Chest X-ray assessment form.
 * Returns an object containing the structured data AND a function `formatReportSectionHtml`.
 * @returns {object | null} - ChestXray data object including the formatting function, or null on error.
 */
export function collectChestXrayData() {
    console.log("[ChestXrayModule] Collecting Chest X-ray data...");
    const form = document.getElementById('cxr-assessment-form');
    if (!form) {
        console.error("[collectChestXrayData] Chest X-ray assessment form ('#cxr-assessment-form') not found.");
        return null;
    }

    try {
        // Use getFormData from form-core.js
        const allFormData = getFormData(form);
        // console.log("Raw Form Data:", allFormData); // Debug: Log raw data

        // --- Structure the Data ---
        const structuredData = {
            technical: {
                projection: allFormData.cxrProjection,
                rotation: allFormData.cxrRotation,
                inspiration: allFormData.cxrInspiration,
                penetration: allFormData.cxrPenetration
            },
            linesTubes: allFormData.cxrLinesTubes,
            findings: {
                airways: {
                    desc: allFormData.cxrAirwaysDesc
                },
                bones: {
                    status: allFormData.cxrBonesStatus,
                    desc: allFormData.cxrBonesDesc
                },
                cardiacMediastinum: {
                    size: allFormData.cxrCardiacSize,
                    mediastinumWidth: allFormData.cxrMediastinumWidth,
                    desc: allFormData.cxrCardiacMediastinumDesc
                },
                diaphragmPleura: {
                    cpAngles: allFormData.cxrCpAngles,
                    pleuralEffusion: allFormData.cxrPleuralEffusion,
                    pneumothorax: allFormData.cxrPneumothorax,
                    desc: allFormData.cxrDiaphragmPleuraDesc
                },
                lungs: {
                    status: allFormData.cxrLungsStatus,
                    desc: allFormData.cxrLungsDesc
                },
                hila: {
                    desc: allFormData.cxrHilaDesc
                }
            },
            comparison: {
                date: allFormData.cxrComparisonDate,
                desc: allFormData.cxrComparisonDesc
            },
            impression: allFormData.impression,
            recommendation: allFormData.recommendation
        };

        // Attach the formatting function
        structuredData.formatReportSectionHtml = function() { return formatChestXrayReportSectionHtml(this); }

        console.debug("[collectChestXrayData] Collected Chest X-ray Data:", JSON.parse(JSON.stringify(structuredData))); // Deep copy for logging
        return structuredData;

    } catch (error) {
        console.error("[collectChestXrayData] Error collecting Chest X-ray data:", error);
        showNotification("Failed to collect Chest X-ray assessment data.", "error");
        return null;
    }
}


// --- Template Loading ---
/**
 * Loads template data into the Chest X-ray assessment form.
 * @param {object} cxrTemplateData - ChestXray-specific template data (content of the 'chestXray' key).
 */
export async function loadChestXrayTemplateData(cxrTemplateData) {
    if (!cxrTemplateData || typeof cxrTemplateData !== 'object') {
        console.warn("[loadChestXrayTemplateData] Invalid or missing Chest X-ray template data provided.");
        return;
    }
    console.log("[ChestXrayModule] Loading Chest X-ray template data...");
    const form = document.getElementById('cxr-assessment-form');
    if (!form) {
        console.error("[loadChestXrayTemplateData] Chest X-ray form not found! Cannot load template.");
        showNotification("Cannot load Chest X-ray template: UI elements missing.", "error");
        return;
    }

    try {
        const flattenedData = {};
        // Flatten Technical Factors
        Object.assign(flattenedData, cxrTemplateData.technical);
        // Flatten Lines/Tubes
        flattenedData.cxrLinesTubes = cxrTemplateData.linesTubes;
        // Flatten Findings subsections
        if (cxrTemplateData.findings) {
            flattenedData.cxrAirwaysDesc = cxrTemplateData.findings.airways?.desc;
            flattenedData.cxrBonesStatus = cxrTemplateData.findings.bones?.status;
            flattenedData.cxrBonesDesc = cxrTemplateData.findings.bones?.desc;
            flattenedData.cxrCardiacSize = cxrTemplateData.findings.cardiacMediastinum?.size;
            flattenedData.cxrMediastinumWidth = cxrTemplateData.findings.cardiacMediastinum?.mediastinumWidth;
            flattenedData.cxrCardiacMediastinumDesc = cxrTemplateData.findings.cardiacMediastinum?.desc;
            flattenedData.cxrCpAngles = cxrTemplateData.findings.diaphragmPleura?.cpAngles;
            flattenedData.cxrPleuralEffusion = cxrTemplateData.findings.diaphragmPleura?.pleuralEffusion;
            flattenedData.cxrPneumothorax = cxrTemplateData.findings.diaphragmPleura?.pneumothorax;
            flattenedData.cxrDiaphragmPleuraDesc = cxrTemplateData.findings.diaphragmPleura?.desc;
            flattenedData.cxrLungsStatus = cxrTemplateData.findings.lungs?.status;
            flattenedData.cxrLungsDesc = cxrTemplateData.findings.lungs?.desc;
            flattenedData.cxrHilaDesc = cxrTemplateData.findings.hila?.desc;
        }
        // Flatten Comparison
        if(cxrTemplateData.comparison) {
            flattenedData.cxrComparisonDate = cxrTemplateData.comparison.date;
            flattenedData.cxrComparisonDesc = cxrTemplateData.comparison.desc;
        }
        // Flatten Impression/Recommendation
        flattenedData.impression = cxrTemplateData.impression;
        flattenedData.recommendation = cxrTemplateData.recommendation;

        // Populate Form Fields
        populateForm(form, flattenedData, { dispatchEvents: true }); // Dispatch events to trigger UI updates
        console.log("[loadChestXrayTemplateData] Chest X-ray form fields populated.");

        // --- Final Updates & UI Sync ---
        // 1. Update anatomy description visibility based on loaded status
        form.querySelectorAll('.anatomy-status-select').forEach(select => {
             handleAnatomyStatusChangeCXR(select);
        });

        // 2. Ensure suggestion visibility is correctly set up after population
        setTimeout(() => setupSuggestionVisibilityCXR(form), 200); // Delay slightly

        console.log("[loadChestXrayTemplateData] Finished applying Chest X-ray template data.");

    } catch (error) {
        console.error("[loadChestXrayTemplateData] Error applying Chest X-ray template:", error);
        showNotification("Failed to apply Chest X-ray template data.", "error");
    }
}


// --- Report Formatting ---

/**
 * Helper function to safely get and format values for the report.
 * Returns the fallback if the value is null, undefined, or an empty string.
 * Replaces newlines in text areas with <br> for HTML display.
 * @param {*} value - The value to format.
 * @param {string} [unit=''] - Optional unit to append.
 * @param {string} [fallback=''] - Value to return if input is empty/null/undefined.
 * @returns {string} - Formatted value string or fallback.
 */
const formatValue = (value, unit = '', fallback = '') => {
    if (value === null || value === undefined || String(value).trim() === '') {
        return fallback;
    }
    // Replace newlines for multi-line text fields, add slight indent for readability
    const strVal = String(value).replace(/\n/g, '<br>&nbsp;&nbsp;&nbsp;');
    return strVal + (unit ? ` ${unit}` : '');
};

/**
 * Formats the FINDINGS section for a Chest X-ray report as an HTML string.
 * Uses the data object collected by collectChestXrayData.
 * **Implements CONDITIONAL REPORTING: Only includes items with actual data or non-default selections.**
 * Uses a single-column layout with H4 for main sections and H5 for findings subsections.
 * @param {object} data - Collected ChestXray data object.
 * @returns {string} - Formatted findings HTML block string.
 */
function formatChestXrayReportSectionHtml(data) {
    console.log("[ChestXrayModule] Formatting Chest X-ray report section HTML...");
    if (!data) return "<p>Error: No Chest X-ray data provided for formatting.</p>";

    let findingsHtml = '';
    const br = '<br>'; // Shortcut for line breaks

    // --- Technical Factors (Report only non-default values) ---
    const tech = data.technical;
    let techContent = '';
    // Default values based on cxr-report.html (first option)
    if (formatValue(tech?.projection) && tech.projection !== 'PA') techContent += `<li><strong>Projection / Tư thế:</strong> ${formatValue(tech.projection)}</li>`;
    if (formatValue(tech?.rotation) && tech.rotation !== 'None / Không xoay') techContent += `<li><strong>Rotation / Xoay:</strong> ${formatValue(tech.rotation)}</li>`;
    if (formatValue(tech?.inspiration) && tech.inspiration !== 'Adequate / Đủ sâu') techContent += `<li><strong>Inspiration / Hít vào:</strong> ${formatValue(tech.inspiration)}</li>`;
    if (formatValue(tech?.penetration) && tech.penetration !== 'Adequate / Đạt') techContent += `<li><strong>Penetration / Độ xuyên:</strong> ${formatValue(tech.penetration)}</li>`;

    if (techContent) {
        findingsHtml += `<h4>Technical Factors / Yếu tố Kỹ thuật</h4><ul>${techContent}</ul>`;
    }

    // --- Lines and Tubes (Report only if description exists) ---
    const linesTubesDesc = formatValue(data.linesTubes);
    if (linesTubesDesc) {
        findingsHtml += `<h4>Lines and Tubes / Dây và ống dẫn lưu</h4><p>${linesTubesDesc}</p>`;
    }

    // --- Findings (Main Section) ---
    const findings = data.findings;
    let findingsSubsectionsHtml = '';

    // Helper to add a findings subsection if it has content
    const addFindingSection = (title, status, description) => {
        const formattedDesc = formatValue(description);
        // Include section if status is explicitly abnormal OR if there's a description
        if ((status && !NORMAL_STATUS_VALUES.includes(status)) || formattedDesc) {
            let sectionHtml = `<h5>${title}</h5>`;
            if (status && !NORMAL_STATUS_VALUES.includes(status)) {
                sectionHtml += `<p><strong>Status / Tình trạng:</strong> ${status}</p>`;
            }
            if (formattedDesc) {
                 sectionHtml += `<p>${formattedDesc}</p>`; // Description as paragraph
            }
            findingsSubsectionsHtml += sectionHtml;
        }
    };
     // Helper for sections without status (Airways, Hila, Cardiac)
     const addFindingDescOnlySection = (title, description) => {
        const formattedDesc = formatValue(description);
        if (formattedDesc) {
            findingsSubsectionsHtml += `<h5>${title}</h5><p>${formattedDesc}</p>`;
        }
     };
     // Helper for sections with multiple selects/inputs + description (Cardiac, Diaphragm)
     const addComplexFindingSection = (title, fields, description) => {
        const formattedDesc = formatValue(description);
        let fieldContent = '';
        fields.forEach(f => {
            const val = formatValue(f.value);
            // Include field if it has a value AND is not the default (first option)
            if (val && f.value !== f.defaultValue) {
                fieldContent += `<li><strong>${f.label}:</strong> ${val}</li>`;
            }
        });

        if (fieldContent || formattedDesc) {
            let sectionHtml = `<h5>${title}</h5>`;
            if (fieldContent) {
                 sectionHtml += `<ul>${fieldContent}</ul>`;
            }
            if (formattedDesc) {
                 sectionHtml += `<p>${formattedDesc}</p>`; // Description as paragraph
            }
            findingsSubsectionsHtml += sectionHtml;
        }
     };


    // Airways
    addFindingDescOnlySection("Airways / Đường thở", findings?.airways?.desc);

    // Bones
    addFindingSection("Bones / Xương", findings?.bones?.status, findings?.bones?.desc);

     // Cardiac & Mediastinum
     addComplexFindingSection(
         "Cardiac Silhouette & Mediastinum / Bóng tim & Trung thất",
         [
             { label: "Cardiac Size / Kích thước tim", value: findings?.cardiacMediastinum?.size, defaultValue: "Normal / Bình thường"},
             { label: "Mediastinal Width / Bề rộng trung thất", value: findings?.cardiacMediastinum?.mediastinumWidth, defaultValue: "Normal / Bình thường" }
         ],
         findings?.cardiacMediastinum?.desc
     );

    // Diaphragm & Pleura
     addComplexFindingSection(
        "Diaphragm & Pleura / Cơ hoành & Màng phổi",
        [
            { label: "CP Angles / Góc sườn hoành", value: findings?.diaphragmPleura?.cpAngles, defaultValue: "Sharp bilaterally / Nhọn hai bên" },
            { label: "Pleural Effusion / Tràn dịch MP", value: findings?.diaphragmPleura?.pleuralEffusion, defaultValue: "None / Không" },
            { label: "Pneumothorax / Tràn khí MP", value: findings?.diaphragmPleura?.pneumothorax, defaultValue: "None / Không" }
        ],
        findings?.diaphragmPleura?.desc
     );

    // Lung Fields
    addFindingSection("Lung Fields / Phế trường", findings?.lungs?.status, findings?.lungs?.desc);

    // Hila
    addFindingDescOnlySection("Hila / Rốn phổi", findings?.hila?.desc);

    // Add the "Findings" main title only if there were any subsections with content
    if (findingsSubsectionsHtml) {
        findingsHtml += `<h4>Findings / Kết quả</h4>${findingsSubsectionsHtml}`;
    }

    // --- Comparison (Report only if date or description exists) ---
    const comp = data.comparison;
    const compDate = formatValue(comp?.date);
    const compDesc = formatValue(comp?.desc);
    if (compDate || compDesc) {
        findingsHtml += `<h4>Comparison / So sánh</h4>`;
        if (compDate) {
            findingsHtml += `<p><strong>Prior Study Date / Ngày phim cũ:</strong> ${compDate}</p>`;
        }
        if (compDesc) {
            findingsHtml += `<p>${compDesc}</p>`;
        }
    }

    // --- Impression and Recommendation ---
    const impressionText = formatValue(data.impression);
    const recommendationText = formatValue(data.recommendation);

    if (impressionText) {
        findingsHtml += `<hr class="report-hr"><h4>IMPRESSION / KẾT LUẬN:</h4>`;
        findingsHtml += `<p>${impressionText}</p>`; // Already handles <br>
    }

    if (recommendationText) {
        findingsHtml += `<hr class="report-hr"><h4>RECOMMENDATION / ĐỀ NGHỊ:</h4><p>${recommendationText}</p>`;
    }

    console.log("[ChestXrayModule] Finished formatting Chest X-ray report section HTML.");
    // Wrap the entire findings section for potential specific styling
    return `<div class="cxr-findings-container">${findingsHtml || '<p>No significant findings entered or all findings were normal/default. / Không nhập kết quả nào hoặc tất cả đều bình thường/mặc định.</p>'}</div>`;
}


console.log("chestxray-module.js loaded.");