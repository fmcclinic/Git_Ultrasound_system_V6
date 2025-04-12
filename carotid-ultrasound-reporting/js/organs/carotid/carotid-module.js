// js/organs/carotid/carotid-module.js
// Module specific to Carotid ultrasound reporting logic.

// --- Core Imports ---
import { showNotification } from '../../core/ui-core.js';
import { populateForm, getFormData } from '../../core/form-core.js';

// --- Module-level variables ---
const hideSuggestionTimeoutsCarotid = {}; // Timeout tracker for carotid textareas

// --- Initialization ---
/**
 * Initializes the carotid module functionalities.
 * Sets up event listeners specific to the carotid assessment form.
 */
export function init() {
    console.log("[CarotidModule] Initializing...");
    try {
        const carotidForm = document.getElementById('carotid-assessment-form');

        if (!carotidForm) {
            console.error("[CarotidModule] CRITICAL: Carotid assessment form ('#carotid-assessment-form') not found. Module cannot function.");
            showNotification("Error: Carotid assessment UI not found.", "error");
            return; // Stop initialization if form is missing
        }

        // Event Delegation for suggestion buttons
        carotidForm.addEventListener('click', function(event) {
            const target = event.target;
            // Handle Suggestion Button click
            if (target.classList.contains('suggestion-btn')) {
                handleSuggestionButtonClickCarotid(target); // Use carotid-specific handler
                const container = target.closest('.suggestion-button-container');
                if (container) container.style.display = 'none'; // Hide after click
            }
        });

        // Setup suggestion visibility for textareas/inputs present on initial load
        setupSuggestionVisibilityCarotid(carotidForm);

        console.log("[CarotidModule] Initialized successfully.");
    } catch (error) {
        console.error("[CarotidModule] Error during initialization:", error);
        showNotification("Failed to initialize carotid module.", "error");
    }
}

// --- Suggestion Button Handling ---
/**
 * Sets up focus/blur listeners for suggestion buttons visibility within a parent element.
 * @param {HTMLElement} parentElement - Element to search within (form or lesion item).
 */
function setupSuggestionVisibilityCarotid(parentElement) {
    const suggestionContainers = parentElement.querySelectorAll('.suggestion-button-container');
    // console.debug(`[CarotidModule] Setting up suggestion visibility for ${suggestionContainers.length} containers in`, parentElement);
    suggestionContainers.forEach(container => {
        const inputElement = container.previousElementSibling; // Assumes input/textarea is right before container
        if (inputElement && (inputElement.tagName === 'TEXTAREA' || inputElement.tagName === 'INPUT')) { // Allow for input fields too
            let elementId = inputElement.id || `input_carotid_${Date.now()}_${Math.random().toString(16).slice(2)}`;
            inputElement.id = elementId; // Ensure it has an ID

            // Ensure no duplicate listeners
            inputElement.removeEventListener('focus', handleTextareaFocusCarotid);
            inputElement.removeEventListener('blur', handleTextareaBlurCarotid);

            // Add new listeners
            inputElement.addEventListener('focus', handleTextareaFocusCarotid);
            inputElement.addEventListener('blur', handleTextareaBlurCarotid);
        } else {
             // console.warn("[CarotidModule] Could not find textarea/input before suggestion container:", container);
        }
    });
}

// Named function for focus listener
function handleTextareaFocusCarotid(event) {
    const inputElement = event.target;
    const elementId = inputElement.id;
    const container = inputElement.nextElementSibling;
    // console.debug(`[CarotidModule] Focus on: ${elementId}`);
    if (hideSuggestionTimeoutsCarotid[elementId]) {
        clearTimeout(hideSuggestionTimeoutsCarotid[elementId]);
        delete hideSuggestionTimeoutsCarotid[elementId];
    }
    if (container && container.classList.contains('suggestion-button-container')) {
        container.style.display = 'flex'; // Use 'flex' as defined in CSS
    }
}

// Named function for blur listener
function handleTextareaBlurCarotid(event) {
    const inputElement = event.target;
    const elementId = inputElement.id;
    const container = inputElement.nextElementSibling;
    // console.debug(`[CarotidModule] Blur on: ${elementId}`);
    if (container && container.classList.contains('suggestion-button-container')) {
        // Delay hiding to allow clicking on a suggestion button
        hideSuggestionTimeoutsCarotid[elementId] = setTimeout(() => {
            container.style.display = 'none';
            delete hideSuggestionTimeoutsCarotid[elementId];
        }, 250); // 250ms delay
    }
}

/**
 * Handles suggestion button clicks for carotid module.
 * @param {HTMLButtonElement} button - The button clicked.
 */
function handleSuggestionButtonClickCarotid(button) {
    const textToInsert = button.dataset.insert;
    const container = button.closest('.suggestion-button-container');
    const targetElement = container ? container.previousElementSibling : null;

    if (targetElement && (targetElement.tagName === 'TEXTAREA' || targetElement.tagName === 'INPUT') && textToInsert !== undefined) {
        const currentValue = targetElement.value;
        let separator = '';
        if (currentValue.trim().length > 0) {
            const lastChar = currentValue.trim().slice(-1);
            separator = ['.', '?', '!', ':', ';', ','].includes(lastChar) ? ' ' : '. ';
            if (currentValue.endsWith(' ') || currentValue.endsWith('\n')) {
                 separator = '';
            }
        }
        targetElement.value += separator + textToInsert;
        targetElement.dispatchEvent(new Event('input', { bubbles: true }));
        targetElement.focus();
        if(targetElement.tagName === 'TEXTAREA') {
            targetElement.scrollTop = targetElement.scrollHeight;
        }
    } else {
        console.warn("[CarotidModule] Target input/textarea or data-insert attribute not found for suggestion button.", button);
    }
}


// --- Data Collection ---
/**
 * Collects all data for the carotid assessment form.
 * MUST return an object containing the data AND a function `formatReportSectionHtml`.
 * @returns {object | null} - Carotid data object including the formatting function, or null on error.
 */
export function collectCarotidData() {
    console.log("[CarotidModule] Collecting carotid data...");
    const form = document.getElementById('carotid-assessment-form');
    if (!form) {
        console.error("[collectCarotidData] Carotid assessment form ('#carotid-assessment-form') not found.");
        return null;
    }

    try {
        // Use getFormData scoped to the entire carotid form
        const allFormData = getFormData(form);

        // Structure the data logically (example structure)
        const structuredData = {
            left: {
                cca: {
                    psv: allFormData.leftCcaPsv,
                    edv: allFormData.leftCcaEdv,
                    imtMean: allFormData.leftCcaImtMean,
                    imtMax: allFormData.leftCcaImtMax,
                    plaque: allFormData.leftCcaPlaque,
                    waveform: allFormData.leftCcaWaveform
                },
                ica: {
                    psv: allFormData.leftIcaPsv,
                    edv: allFormData.leftIcaEdv,
                    ratio: allFormData.leftIcaRatio,
                    stenosisPct: allFormData.leftIcaStenosisPct,
                    plaque: allFormData.leftIcaPlaque,
                    waveform: allFormData.leftIcaWaveform
                },
                eca: {
                    psv: allFormData.leftEcaPsv,
                    edv: allFormData.leftEcaEdv,
                    plaque: allFormData.leftEcaPlaque,
                    waveform: allFormData.leftEcaWaveform
                },
                va: {
                    psv: allFormData.leftVaPsv,
                    edv: allFormData.leftVaEdv,
                    flowDirection: allFormData.leftVaFlowDirection,
                    waveform: allFormData.leftVaWaveform
                },
                sca: {
                    psv: allFormData.leftScaPsv,
                    edv: allFormData.leftScaEdv,
                    waveform: allFormData.leftScaWaveform
                }
            },
            right: {
                 cca: {
                    psv: allFormData.rightCcaPsv,
                    edv: allFormData.rightCcaEdv,
                    imtMean: allFormData.rightCcaImtMean,
                    imtMax: allFormData.rightCcaImtMax,
                    plaque: allFormData.rightCcaPlaque,
                    waveform: allFormData.rightCcaWaveform
                },
                ica: {
                    psv: allFormData.rightIcaPsv,
                    edv: allFormData.rightIcaEdv,
                    ratio: allFormData.rightIcaRatio,
                    stenosisPct: allFormData.rightIcaStenosisPct,
                    plaque: allFormData.rightIcaPlaque,
                    waveform: allFormData.rightIcaWaveform
                },
                eca: {
                    psv: allFormData.rightEcaPsv,
                    edv: allFormData.rightEcaEdv,
                    plaque: allFormData.rightEcaPlaque,
                    waveform: allFormData.rightEcaWaveform
                },
                va: {
                    psv: allFormData.rightVaPsv,
                    edv: allFormData.rightVaEdv,
                    flowDirection: allFormData.rightVaFlowDirection,
                    waveform: allFormData.rightVaWaveform
                },
                sca: {
                    psv: allFormData.rightScaPsv,
                    edv: allFormData.rightScaEdv,
                    waveform: allFormData.rightScaWaveform
                }
            },
            impression: allFormData.impression,
            recommendation: allFormData.recommendation,
            // IMPORTANT: Attach the specific formatter function for the carotid report section
            formatReportSectionHtml: function() { return formatCarotidReportSectionHtml(this); }
        };

        console.debug("[collectCarotidData] Collected Carotid Data:", JSON.parse(JSON.stringify(structuredData))); // Log a copy
        return structuredData;

    } catch (error) {
        console.error("[collectCarotidData] Error collecting carotid data:", error);
        showNotification("Failed to collect carotid assessment data.", "error");
        return null;
    }
}

// --- Template Loading ---
/**
 * Loads template data into the carotid assessment section.
 * @param {object} carotidTemplateData - Carotid-specific template data object (content of the 'carotid' key).
 * Should match the structure returned by collectCarotidData (excluding the formatter).
 */
export async function loadCarotidTemplateData(carotidTemplateData) {
    if (!carotidTemplateData || typeof carotidTemplateData !== 'object') {
        console.warn("[loadCarotidTemplateData] Invalid or missing carotid template data provided.");
        return; // Exit if data is invalid
    }
    console.log("[CarotidModule] Loading carotid template data...");
    const form = document.getElementById('carotid-assessment-form');

    if (!form) {
        console.error("[loadCarotidTemplateData] Carotid form not found! Cannot load template.");
        showNotification("Cannot load carotid template: UI elements missing.", "error");
        return;
    }

    try {
        // Flatten the structured data back into a simple key-value object
        // that populateForm expects (matching input 'name' attributes)
        const flattenedData = {};
        for (const side of ['left', 'right']) {
            if (carotidTemplateData[side]) {
                for (const vessel of ['cca', 'ica', 'eca', 'va', 'sca']) {
                    if (carotidTemplateData[side][vessel]) {
                        for (const param in carotidTemplateData[side][vessel]) {
                            const key = `${side}${vessel.charAt(0).toUpperCase() + vessel.slice(1)}${param.charAt(0).toUpperCase() + param.slice(1)}`;
                            // Special case for stenosisPct -> name attribute is XxxStenosisPct
                             const nameAttr = (param === 'stenosisPct') ? `${side}${vessel.charAt(0).toUpperCase() + vessel.slice(1)}StenosisPct` : key;
                             // Special case for flowDirection -> name attribute is XxxFlowDirection
                             const finalName = (param === 'flowDirection') ? `${side}${vessel.charAt(0).toUpperCase() + vessel.slice(1)}FlowDirection` : nameAttr;

                            flattenedData[finalName] = carotidTemplateData[side][vessel][param];
                        }
                    }
                }
            }
        }
        flattenedData.impression = carotidTemplateData.impression;
        flattenedData.recommendation = carotidTemplateData.recommendation;

         console.log("[loadCarotidTemplateData] Flattened data for population:", flattenedData);

        // Populate the form fields using the flattened data object
        // Suppress events during population to prevent premature calculations if any were added
        populateForm(form, flattenedData, { dispatchEvents: false });
        console.log("[loadCarotidTemplateData] Carotid form fields populated.");

        // Manually trigger updates or recalculations if needed AFTER population
        // (e.g., if ratio calculation was implemented)

        console.log("[loadCarotidTemplateData] Finished applying carotid template data.");

    } catch (error) {
        console.error("[loadCarotidTemplateData] Error applying carotid template:", error);
        showNotification("Failed to apply carotid template data.", "error");
    }
}


// --- Report Formatting ---

// Helper function to safely get values and format text
const getValue = (val, fallback = 'N/A') => (val !== null && val !== undefined && val !== '') ? String(val).replace(/\n/g, '<br>&nbsp;&nbsp;') : fallback;
const getNumericValue = (val, fallback = 'N/A') => (val !== null && val !== undefined && val !== '' && !isNaN(Number(val))) ? Number(val) : fallback;

// Helper to format vessel data block
function formatVesselHtml(vesselName, vesselData) {
    if (!vesselData) return '';

    let html = `<tr><td colspan="2"><strong>${vesselName}:</strong></td></tr>`;
    const psv = getNumericValue(vesselData.psv);
    const edv = getNumericValue(vesselData.edv);
    const imtMean = getNumericValue(vesselData.imtMean);
    const imtMax = getNumericValue(vesselData.imtMax);
    const ratio = getNumericValue(vesselData.ratio);
    const stenosisPct = getNumericValue(vesselData.stenosisPct);
    const flowDirection = getValue(vesselData.flowDirection);
    const waveform = getValue(vesselData.waveform);
    const plaque = getValue(vesselData.plaque);

    if (psv !== 'N/A') html += `<tr><td>PSV:</td><td>${psv} cm/s</td></tr>`;
    if (edv !== 'N/A') html += `<tr><td>EDV:</td><td>${edv} cm/s</td></tr>`;
    if (imtMean !== 'N/A') html += `<tr><td>IMT (Mean):</td><td>${imtMean} mm</td></tr>`;
    if (imtMax !== 'N/A') html += `<tr><td>IMT (Max):</td><td>${imtMax} mm</td></tr>`;
    if (ratio !== 'N/A') html += `<tr><td>ICA/CCA Ratio:</td><td>${ratio}</td></tr>`;
    if (stenosisPct !== 'N/A') html += `<tr><td>Stenosis (NASCET):</td><td>${stenosisPct}%</td></tr>`;
    if (flowDirection !== 'N/A') html += `<tr><td>Flow Direction:</td><td>${flowDirection}</td></tr>`;
    if (waveform !== 'N/A') html += `<tr><td>Waveform:</td><td>${waveform}</td></tr>`;
    if (plaque !== 'N/A') html += `<tr><td>Plaque Desc:</td><td>${plaque}</td></tr>`;

    // If no valid data was found for the vessel, indicate that
    if (html === `<tr><td colspan="2"><strong>${vesselName}:</strong></td></tr>`) {
       // return `<tr><td colspan="2"><strong>${vesselName}:</strong> Not evaluated or no significant findings.</td></tr>`;
       return ''; // Or just return empty string if no data
    }

    return html;
}


/**
 * Formats the FINDINGS section for a Carotid report as an HTML string.
 * Uses the data object collected by collectCarotidData.
 * @param {object} data - Collected carotid data object.
 * @returns {string} - Formatted findings HTML block string.
 */
function formatCarotidReportSectionHtml(data) {
    console.log("[CarotidModule] Formatting Carotid report section HTML...");
    if (!data) return "<p>Error: No carotid data provided for formatting.</p>";

    let findings = '<table class="report-table" style="width: 100%; border-collapse: collapse;">';
    findings += '<thead><tr><th style="width:50%;">RIGHT SIDE / BÊN PHẢI</th><th style="width:50%;">LEFT SIDE / BÊN TRÁI</th></tr></thead>';
    findings += '<tbody>';

    // Combine vessel data row by row
    findings += '<tr><td style="vertical-align: top; padding: 5px; border: 1px solid #ccc;">'; // Right Column Start
    findings += '<table style="width: 100%; border: none;"><tbody>';
    findings += formatVesselHtml("CCA (Right)", data.right?.cca);
    findings += formatVesselHtml("ICA (Right)", data.right?.ica);
    findings += formatVesselHtml("ECA (Right)", data.right?.eca);
    findings += formatVesselHtml("Vertebral (Right)", data.right?.va);
    findings += formatVesselHtml("Subclavian (Right)", data.right?.sca);
    findings += '</tbody></table>';
    findings += '</td>'; // Right Column End

    findings += '<td style="vertical-align: top; padding: 5px; border: 1px solid #ccc;">'; // Left Column Start
    findings += '<table style="width: 100%; border: none;"><tbody>';
    findings += formatVesselHtml("CCA (Left)", data.left?.cca);
    findings += formatVesselHtml("ICA (Left)", data.left?.ica);
    findings += formatVesselHtml("ECA (Left)", data.left?.eca);
    findings += formatVesselHtml("Vertebral (Left)", data.left?.va);
    findings += formatVesselHtml("Subclavian (Left)", data.left?.sca);
    findings += '</tbody></table>';
    findings += '</td>'; // Left Column End
    findings += '</tr>';

    findings += '</tbody></table>'; // Close main table

    // Impression and Recommendation
    findings += `<hr class="report-hr"><h4>IMPRESSION / KẾT LUẬN:</h4>`;
    findings += `<p>${getValue(data.impression, 'Not specified.')}</p>`;

    const recommendation = getValue(data.recommendation);
    if (recommendation !== 'N/A') {
        findings += `<hr class="report-hr"><h4>RECOMMENDATION / ĐỀ NGHỊ:</h4><p>${recommendation}</p>`;
    }

    console.log("[CarotidModule] Finished formatting Carotid report section HTML.");
    return findings;
}


console.log("carotid-module.js loaded.");