// js/organs/obstetric/obstetric-module.js
// Module specific to Obstetric Ultrasound reporting logic.

// --- Core Imports ---
import { showNotification } from '../../core/ui-core.js';
import { populateForm, getFormData } from '../../core/form-core.js';

// --- Module-level variables ---
const hideSuggestionTimeoutsOB = {}; // Timeout tracker for OB textareas

// --- Constants ---
// Keys for anatomy parts used in HTML IDs/names and data structure
const ANATOMY_PARTS = ['head', 'face', 'neck', 'chest', 'abdomen', 'spine', 'limbs', 'genitalia'];
const NORMAL_STATUS_PREFIX = "Normal /"; // For checking if status is normal (bilingual)

// --- Initialization ---
/**
 * Initializes the Obstetric module functionalities.
 * Sets up event listeners specific to the Obstetric assessment form.
 */
export function init() {
    console.log("[ObstetricModule] Initializing...");
    try {
        const obForm = document.getElementById('ob-assessment-form');

        if (!obForm) {
            console.error("[ObstetricModule] CRITICAL: Obstetric assessment form ('#ob-assessment-form') not found. Module cannot function.");
            showNotification("Error: Obstetric assessment UI not found.", "error");
            return; // Stop initialization
        }

        // --- Event Delegation for suggestion buttons & anatomy status changes ---
        obForm.addEventListener('click', function(event) {
            const target = event.target;
            // Handle Suggestion Button click
            if (target.classList.contains('suggestion-btn')) {
                handleSuggestionButtonClickOB(target);
                const container = target.closest('.suggestion-button-container');
                if (container) container.style.display = 'none'; // Hide after click
            }
        });

        obForm.addEventListener('change', function(event) {
            const target = event.target;
            // Handle Anatomy Status Select change
            if (target.classList.contains('anatomy-status-select')) {
                handleAnatomyStatusChange(target);
            }
            // Handle LMP change for GA/EDD calculation
            if (target.id === 'lmp') {
                calculateGA_EDD_FromLMP(target.value);
            }
            // Handle Biometry/EFW Method change for EFW/GA/EDD calculation
            if (target.name && (target.name.startsWith('bpd_') || target.name.startsWith('hc_') || target.name.startsWith('ac_') || target.name.startsWith('fl_') || target.name.startsWith('efwMethod_'))) {
                 // TODO: Trigger EFW and GA/EDD from Biometry calculations if desired
                 calculateEFW(1); // Pass fetus number (assuming 1 for now)
                 // calculateGA_EDD_FromBiometry(1); // Pass fetus number
                 console.log("Biometry related field changed, EFW calculation triggered (placeholder).");
            }
             // Handle BPP component change
             if (target.name && target.name.startsWith('bpp')) {
                 calculateBPPScore();
             }
              // Handle Doppler PI change for CPR
             if (target.name && (target.name === 'uaPi' || target.name === 'mcaPi')) {
                 calculateCPR();
             }
        });

         // Optional: Add 'input' listeners for more immediate calculations if needed
        // obForm.addEventListener('input', function(event) { ... });


        // --- Initialize Anatomy Description Visibility ---
        // Needs to run after potential template loading, use timeout as safeguard
        setTimeout(() => {
            obForm.querySelectorAll('.anatomy-status-select').forEach(select => {
                handleAnatomyStatusChange(select); // Ensure initial state is correct
            });
            // Initial calculations for fields potentially filled by templates
            calculateBPPScore();
            calculateCPR();
            const lmpInput = document.getElementById('lmp');
            if(lmpInput?.value) calculateGA_EDD_FromLMP(lmpInput.value);
            calculateEFW(1); // Calculate for fetus 1 on load
            // calculateGA_EDD_FromBiometry(1);
        }, 150);


        // --- Setup suggestion visibility ---
        setupSuggestionVisibilityOB(obForm);

        console.log("[ObstetricModule] Initialized successfully.");
    } catch (error) {
        console.error("[ObstetricModule] Error during initialization:", error);
        showNotification("Failed to initialize Obstetric module.", "error");
    }
}

// --- Calculation Helpers ---

/**
 * Calculates Gestational Age (GA) and Estimated Due Date (EDD) from LMP.
 * Updates the corresponding form fields. Basic calculation.
 * @param {string} lmpDateString - Date string from the LMP input (YYYY-MM-DD).
 */
function calculateGA_EDD_FromLMP(lmpDateString) {
    const gaLmpField = document.getElementById('ga-lmp');
    const eddLmpField = document.getElementById('edd-lmp');
    if (!gaLmpField || !eddLmpField) return;

    if (!lmpDateString) {
        gaLmpField.value = '';
        eddLmpField.value = '';
        return;
    }

    try {
        const lmpDate = new Date(lmpDateString + 'T00:00:00'); // Ensure time doesn't affect date math
        if (isNaN(lmpDate.getTime())) {
            gaLmpField.value = '';
            eddLmpField.value = '';
            return; // Invalid date
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date

        // Calculate difference in milliseconds
        const diffTime = Math.abs(today - lmpDate);
        // Calculate difference in days
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Calculate GA in weeks and days
        const weeks = Math.floor(diffDays / 7);
        const days = diffDays % 7;
        gaLmpField.value = `${weeks}w${days}d / ${weeks}t${days}n`;

        // Calculate EDD (LMP + 280 days)
        const eddDate = new Date(lmpDate);
        eddDate.setDate(lmpDate.getDate() + 280);
        // Format EDD to YYYY-MM-DD
        const eddYear = eddDate.getFullYear();
        const eddMonth = String(eddDate.getMonth() + 1).padStart(2, '0');
        const eddDay = String(eddDate.getDate()).padStart(2, '0');
        eddLmpField.value = `${eddYear}-${eddMonth}-${eddDay}`;

    } catch (e) {
        console.error("Error calculating GA/EDD from LMP:", e);
        gaLmpField.value = 'Error';
        eddLmpField.value = '';
    }
}

/** Placeholder: Calculates GA and EDD based on biometry. Requires complex formulas/lookup tables. */
function calculateGA_EDD_FromBiometry(fetusNumber = 1) {
    // This requires implementation based on standard OB growth charts/formulas (e.g., ASUM, ISUOG)
    // It's complex and often involves averaging GA from multiple parameters (HC, AC, FL)
    console.warn(`[ObstetricModule] calculateGA_EDD_FromBiometry for fetus ${fetusNumber} is not fully implemented.`);
    // Placeholder: Just read existing values or leave blank
    // const gaUsField = document.getElementById(`ga-us`); // Assuming single fetus for now
    // const eddUsField = document.getElementById(`edd-us`);
    // You would get BPD, HC, AC, FL values here and apply formulas.
}

/**
 * Placeholder: Calculates Estimated Fetal Weight (EFW). Requires specific formulas.
 * @param {number} fetusNumber - The fetus number (default 1).
 */
function calculateEFW(fetusNumber = 1) {
    // Implement Hadlock or Shepard formulas based on selected method and BPD, HC, AC, FL inputs
    const methodSelect = document.getElementById(`efw-method_${fetusNumber}`);
    const efwField = document.getElementById(`efw_${fetusNumber}`);
    if (!methodSelect || !efwField) return;

    const method = methodSelect.value;
    const bpd = parseFloat(document.getElementById(`bpd_${fetusNumber}`)?.value); // in mm
    const hc = parseFloat(document.getElementById(`hc_${fetusNumber}`)?.value); // in mm
    const ac = parseFloat(document.getElementById(`ac_${fetusNumber}`)?.value); // in mm
    const fl = parseFloat(document.getElementById(`fl_${fetusNumber}`)?.value); // in mm

    let efw = null;

    try {
        if (method.startsWith('Hadlock')) {
            // Convert mm to cm for formulas
            const bpd_cm = bpd / 10;
            const hc_cm = hc / 10;
            const ac_cm = ac / 10;
            const fl_cm = fl / 10;

            if (method.includes('BPD,HC,AC,FL') && !isNaN(hc_cm) && !isNaN(ac_cm) && !isNaN(fl_cm)) {
                 // Hadlock 4 parameter (example using HC, AC, FL - check exact formula source)
                 // log10(EFW) = 1.326 - 0.00326*AC*FL + 0.0107*HC + 0.0438*AC + 0.158*FL
                const log10EFW = 1.326 - (0.00326 * ac_cm * fl_cm) + (0.0107 * hc_cm) + (0.0438 * ac_cm) + (0.158 * fl_cm);
                efw = Math.pow(10, log10EFW);
            } else if (method.includes('AC,FL') && !isNaN(ac_cm) && !isNaN(fl_cm)) {
                 // Hadlock 2 parameter (AC, FL) - different formula
                 // log10(EFW) = 1.335 - 0.0034*AC*FL + 0.0316*BPD + 0.0457*AC + 0.1623*FL
                 // Need BPD for this common AC,FL one? Or find one that's just AC, FL? Let's use a common AC/FL one:
                 // log10(EFW) = 1.3596 + 0.0064*HC + 0.0424*AC + 0.174*FL + 0.00061*BPD*AC - 0.00386*AC*FL
                 // Simplified one just using AC/FL: log10 EFW = 1.2546 + 0.151*AC + 0.0007*AC^2 - 0.0008*AC*FL
                 // Using Hadlock 1985 (Am J Obstet Gynecol. 1985 Feb 1;151(3):333-7) - common 3 param:
                 // log10(WT) = 1.304 + 0.05281(AC) + 0.1938(FL) - 0.004(AC)(FL)
                 // Let's use the 4 param as the main example if possible. Need AC/FL only formula if selected.
                 console.warn("Hadlock (AC,FL) formula not implemented precisely in this example.");

            } else if (method.includes('Shepard') && !isNaN(bpd_cm) && !isNaN(ac_cm)) {
                // Shepard (BPD, AC) formula
                // log10(EFW) = -1.7492 + 0.166*BPD + 0.046*AC - 0.002546*AC*BPD
                 const log10EFW = -1.7492 + (0.166 * bpd_cm) + (0.046 * ac_cm) - (0.002546 * ac_cm * bpd_cm);
                 efw = Math.pow(10, log10EFW);
            }
        }
        // Add other formula calculations here...

        if (efw !== null && !isNaN(efw)) {
            efwField.value = efw.toFixed(0); // EFW in grams, no decimals
        } else {
            efwField.value = '';
        }
    } catch (e) {
         console.error(`Error calculating EFW for fetus ${fetusNumber}:`, e);
         efwField.value = 'Error';
    }
     // Percentile calculation requires GA and lookup tables - usually done manually or via external library/API.
     // const efwPercentileField = document.getElementById(`efw-percentile_${fetusNumber}`);
     // efwPercentileField.value = ''; // Clear percentile as it's not calculated here
}


/** Calculates BPP score by summing component inputs. */
function calculateBPPScore() {
    const scoreField = document.getElementById('bpp_score');
    if (!scoreField) return;

    const tone = parseInt(document.getElementById('bpp_tone')?.value || 0);
    const movement = parseInt(document.getElementById('bpp_movement')?.value || 0);
    const breathing = parseInt(document.getElementById('bpp_breathing')?.value || 0);
    const fluid = parseInt(document.getElementById('bpp_fluid')?.value || 0);

    // Basic sum, ensure components are valid (0 or 2)
    let score = 0;
    if (tone === 2) score += 2;
    if (movement === 2) score += 2;
    if (breathing === 2) score += 2;
    if (fluid === 2) score += 2;

    scoreField.value = score;
}

/** Calculates Cerebroplacental Ratio (CPR). */
function calculateCPR() {
    const cprField = document.getElementById('cpr');
    if (!cprField) return;

    const mcaPi = parseFloat(document.getElementById('mca_pi')?.value);
    const uaPi = parseFloat(document.getElementById('ua_pi')?.value);

    if (!isNaN(mcaPi) && !isNaN(uaPi) && uaPi > 0) {
        const cpr = mcaPi / uaPi;
        cprField.value = cpr.toFixed(2);
    } else {
        cprField.value = '';
    }
}


// --- UI Helpers ---

/**
 * Shows or hides the anatomy description textarea based on the status selection.
 * @param {HTMLSelectElement} selectElement - The anatomy status select element that changed.
 */
function handleAnatomyStatusChange(selectElement) {
    const targetAreaId = selectElement.dataset.targetArea;
    if (!targetAreaId) return;

    const descriptionGroup = selectElement.closest('.anatomy-content')?.querySelector(`#${targetAreaId}`)?.closest('.anatomy-description-group');
    if (!descriptionGroup) {
        console.warn(`Description group for target area '${targetAreaId}' not found.`);
        return;
    }

    // Show description group only if "Abnormal" is selected
    if (selectElement.value === 'Abnormal / Bất thường') {
        descriptionGroup.style.display = 'block';
    } else {
        descriptionGroup.style.display = 'none';
        // Optionally clear the textarea when status changes from Abnormal
        // const textarea = descriptionGroup.querySelector('textarea');
        // if (textarea) textarea.value = '';
    }
}

/** Sets up focus/blur listeners for suggestion buttons visibility. */
function setupSuggestionVisibilityOB(parentElement) {
    const suggestionContainers = parentElement.querySelectorAll('.suggestion-button-container');
    suggestionContainers.forEach(container => {
        const inputElement = container.previousElementSibling; // Assumes input/textarea is directly before container
        if (inputElement && (inputElement.tagName === 'TEXTAREA' || inputElement.tagName === 'INPUT')) {
            let elementId = inputElement.id || `input_ob_${Date.now()}_${Math.random().toString(16).slice(2)}`;
            inputElement.id = elementId; // Ensure the element has an ID

            // Remove existing listeners to prevent duplicates if init is called multiple times
            inputElement.removeEventListener('focus', handleInputFocusOB);
            inputElement.removeEventListener('blur', handleInputBlurOB);

            // Add new listeners
            inputElement.addEventListener('focus', handleInputFocusOB);
            inputElement.addEventListener('blur', handleInputBlurOB);
        }
    });
}

/** Shows suggestion buttons on focus. */
function handleInputFocusOB(event) {
    const inputElement = event.target;
    const elementId = inputElement.id;
    const container = inputElement.nextElementSibling; // Assumes container is directly after
    if (hideSuggestionTimeoutsOB[elementId]) {
        clearTimeout(hideSuggestionTimeoutsOB[elementId]);
        delete hideSuggestionTimeoutsOB[elementId];
    }
    if (container && container.classList.contains('suggestion-button-container')) {
        container.style.display = 'flex'; // Use 'flex' for horizontal layout
    }
}

/** Hides suggestion buttons on blur with a delay. */
function handleInputBlurOB(event) {
    const inputElement = event.target;
    const elementId = inputElement.id;
    const container = inputElement.nextElementSibling; // Assumes container is directly after
    if (container && container.classList.contains('suggestion-button-container')) {
        // Use a short timeout to allow clicking a suggestion button before hiding
        hideSuggestionTimeoutsOB[elementId] = setTimeout(() => {
            container.style.display = 'none';
            delete hideSuggestionTimeoutsOB[elementId]; // Clean up timeout ID
        }, 250); // 250ms delay
    }
}

/** Handles suggestion button click, inserting text into the associated input/textarea. */
function handleSuggestionButtonClickOB(button) {
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
        console.warn("[ObstetricModule] Target input/textarea or data-insert attribute not found for suggestion button.", button);
    }
}


// --- Data Collection ---
/**
 * Collects all data for the Obstetric assessment form.
 * Returns an object containing the structured data AND a function `formatReportSectionHtml`.
 * @returns {object | null} - Obstetric data object including the formatting function, or null on error.
 */
export function collectObstetricData() {
    console.log("[ObstetricModule] Collecting Obstetric data...");
    const form = document.getElementById('ob-assessment-form');
    if (!form) {
        console.error("[collectObstetricData] Obstetric assessment form ('#ob-assessment-form') not found.");
        return null;
    }

    try {
        // Use getFormData from form-core.js
        const allFormData = getFormData(form);
         // console.log("Raw Form Data:", allFormData); // Debug: Log raw data

        // --- Structure the Data ---
        // Assuming singleton pregnancy for now (fetus number 1)
        const fetusNumber = 1; // Adapt this if multiple fetus support is added

        const structuredData = {
            gestationalInfo: {
                lmp: allFormData.lmp,
                gaLmp: allFormData.gaLmp,
                eddLmp: allFormData.eddLmp,
                gaUs: allFormData.gaUs,
                eddUs: allFormData.eddUs,
                ultrasoundMethod: allFormData.ultrasoundMethod,
            },
            // TODO: Adapt for multiple fetuses if implemented
            fetalBiometry: {
                crl: allFormData[`crl_${fetusNumber}`],
                bpd: allFormData[`bpd_${fetusNumber}`],
                hc: allFormData[`hc_${fetusNumber}`],
                ac: allFormData[`ac_${fetusNumber}`],
                fl: allFormData[`fl_${fetusNumber}`],
                hl: allFormData[`hl_${fetusNumber}`],
                efwMethod: allFormData[`efwMethod_${fetusNumber}`],
                efw: allFormData[`efw_${fetusNumber}`],
                efwPercentile: allFormData[`efwPercentile_${fetusNumber}`],
            },
            fetalAnatomy: {}, // Populate below
            amnioticFluid: {
                afi: allFormData.afi,
                sdp: allFormData.sdp,
                fluidAssessment: allFormData.fluidAssessment,
            },
            placenta: {
                location: allFormData.placentaLocation,
                distanceOs: allFormData.placentaDistanceOs,
                grade: allFormData.placentaGrade,
                appearance: allFormData.placentaAppearance,
            },
            cervix: {
                length: allFormData.cervixLength,
                method: allFormData.cervixMethod,
                appearance: allFormData.cervixAppearance,
            },
            maternalStructures: {
                uterus: allFormData.maternalUterus,
                adnexa: allFormData.maternalAdnexa,
            },
            fetalWellbeing: {
                 bppTone: allFormData.bppTone,
                 bppMovement: allFormData.bppMovement,
                 bppBreathing: allFormData.bppBreathing,
                 bppFluid: allFormData.bppFluid,
                 bppScore: allFormData.bppScore,
                 uaPi: allFormData.uaPi,
                 uaRi: allFormData.uaRi,
                 uaSd: allFormData.uaSd,
                 uaEdf: allFormData.uaEdf,
                 mcaPi: allFormData.mcaPi,
                 mcaRi: allFormData.mcaRi,
                 mcaPsv: allFormData.mcaPsv,
                 cpr: allFormData.cpr,
            },
            impression: allFormData.impression,
            recommendation: allFormData.recommendation
        };

        // Populate fetalAnatomy structure
        ANATOMY_PARTS.forEach(part => {
            structuredData.fetalAnatomy[part] = {
                status: allFormData[`anatomy${part.charAt(0).toUpperCase() + part.slice(1)}Status`], // e.g., anatomyHeadStatus
                desc: allFormData[`anatomy${part.charAt(0).toUpperCase() + part.slice(1)}Desc`] ?? '', // e.g., anatomyHeadDesc
            };
        });


        // Attach the formatting function
        structuredData.formatReportSectionHtml = function() { return formatObstetricReportSectionHtml(this); }

        console.debug("[collectObstetricData] Collected Obstetric Data:", JSON.parse(JSON.stringify(structuredData))); // Deep copy for logging
        return structuredData;

    } catch (error) {
        console.error("[collectObstetricData] Error collecting Obstetric data:", error);
        showNotification("Failed to collect Obstetric assessment data.", "error");
        return null;
    }
}


// --- Template Loading ---
/**
 * Loads template data into the Obstetric assessment form.
 * @param {object} obstetricTemplateData - Obstetric-specific template data (content of the 'obstetric' key).
 */
export async function loadObstetricTemplateData(obstetricTemplateData) {
    if (!obstetricTemplateData || typeof obstetricTemplateData !== 'object') {
        console.warn("[loadObstetricTemplateData] Invalid or missing Obstetric template data provided.");
        return;
    }
    console.log("[ObstetricModule] Loading Obstetric template data...");
    const form = document.getElementById('ob-assessment-form');
    if (!form) {
        console.error("[loadObstetricTemplateData] Obstetric form not found! Cannot load template.");
        showNotification("Cannot load Obstetric template: UI elements missing.", "error");
        return;
    }

    try {
        const flattenedData = {};
        // Flatten top-level sections
        Object.assign(flattenedData, obstetricTemplateData.gestationalInfo);
        Object.assign(flattenedData, obstetricTemplateData.amnioticFluid);
        Object.assign(flattenedData, obstetricTemplateData.placenta); // Map keys directly
        flattenedData.placentaLocation = obstetricTemplateData.placenta?.location;
        flattenedData.placentaDistanceOs = obstetricTemplateData.placenta?.distanceOs;
        flattenedData.placentaGrade = obstetricTemplateData.placenta?.grade;
        flattenedData.placentaAppearance = obstetricTemplateData.placenta?.appearance;
        Object.assign(flattenedData, obstetricTemplateData.cervix);
        flattenedData.cervixLength = obstetricTemplateData.cervix?.length;
        flattenedData.cervixMethod = obstetricTemplateData.cervix?.method;
        flattenedData.cervixAppearance = obstetricTemplateData.cervix?.appearance;
        Object.assign(flattenedData, obstetricTemplateData.maternalStructures);
        Object.assign(flattenedData, obstetricTemplateData.fetalWellbeing);
        flattenedData.impression = obstetricTemplateData.impression;
        flattenedData.recommendation = obstetricTemplateData.recommendation;

        // Flatten Fetal Biometry (assuming singleton, fetus 1)
        if (obstetricTemplateData.fetalBiometry) {
            // Assuming fetalBiometry is an object for singleton preset
            for (const key in obstetricTemplateData.fetalBiometry) {
                 flattenedData[`${key}_1`] = obstetricTemplateData.fetalBiometry[key];
            }
             // TODO: Adapt if fetalBiometry is an array for multiples
        }

        // Flatten Fetal Anatomy
        if (obstetricTemplateData.fetalAnatomy) {
            ANATOMY_PARTS.forEach(part => {
                if (obstetricTemplateData.fetalAnatomy[part]) {
                     const statusKey = `anatomy${part.charAt(0).toUpperCase() + part.slice(1)}Status`;
                     const descKey = `anatomy${part.charAt(0).toUpperCase() + part.slice(1)}Desc`;
                     flattenedData[statusKey] = obstetricTemplateData.fetalAnatomy[part].status;
                     flattenedData[descKey] = obstetricTemplateData.fetalAnatomy[part].desc;
                }
            });
        }

        // Populate Form Fields
        populateForm(form, flattenedData, { dispatchEvents: true }); // Dispatch events to trigger calculations/UI updates
        console.log("[loadObstetricTemplateData] Obstetric form fields populated.");

        // --- Final Updates & UI Sync ---
        // 1. Update anatomy description visibility based on loaded status
        form.querySelectorAll('.anatomy-status-select').forEach(select => {
             handleAnatomyStatusChange(select);
        });
         // 2. Trigger initial calculations for potentially loaded values
        const lmpInput = document.getElementById('lmp');
        if (lmpInput?.value) calculateGA_EDD_FromLMP(lmpInput.value);
        calculateEFW(1); // Calculate EFW for fetus 1
        // calculateGA_EDD_FromBiometry(1); // Calculate GA/EDD from biometry
        calculateBPPScore();
        calculateCPR();

         // 3. Ensure suggestion visibility is correctly set up after population
        setTimeout(() => setupSuggestionVisibilityOB(form), 200); // Delay slightly

        console.log("[loadObstetricTemplateData] Finished applying Obstetric template data.");

    } catch (error) {
        console.error("[loadObstetricTemplateData] Error applying Obstetric template:", error);
        showNotification("Failed to apply Obstetric template data.", "error");
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
    // Replace newlines for multi-line text fields
    const strVal = String(value).replace(/\n/g, '<br>&nbsp;&nbsp;');
    return strVal + (unit ? ` ${unit}` : '');
};

/**
 * Formats the FINDINGS section for an Obstetric report as an HTML string.
 * Uses the data object collected by collectObstetricData.
 * **Implements CONDITIONAL REPORTING: Only includes items with actual data.**
 * Uses a single-column layout.
 * @param {object} data - Collected Obstetric data object.
 * @returns {string} - Formatted findings HTML block string.
 */
function formatObstetricReportSectionHtml(data) {
    console.log("[ObstetricModule] Formatting Obstetric report section HTML...");
    if (!data) return "<p>Error: No Obstetric data provided for formatting.</p>";

    let findingsHtml = '';
    const br = '<br>'; // Shortcut for line breaks

    // --- Gestational Information ---
    const gi = data.gestationalInfo;
    let giContent = '';
    if (formatValue(gi?.lmp)) giContent += `<li><strong>LMP / Kinh chót:</strong> ${formatValue(gi.lmp)}</li>`;
    if (formatValue(gi?.gaLmp)) giContent += `<li><strong>GA by LMP / Tuổi thai theo KCC:</strong> ${formatValue(gi.gaLmp)}</li>`;
    if (formatValue(gi?.eddLmp)) giContent += `<li><strong>EDD by LMP / Ngày dự sinh theo KCC:</strong> ${formatValue(gi.eddLmp)}</li>`;
    if (formatValue(gi?.gaUs)) giContent += `<li><strong>GA by Ultrasound / Tuổi thai theo SA:</strong> ${formatValue(gi.gaUs)}</li>`;
    if (formatValue(gi?.eddUs)) giContent += `<li><strong>EDD by Ultrasound / Ngày dự sinh theo SA:</strong> ${formatValue(gi.eddUs)}</li>`;
    if (formatValue(gi?.ultrasoundMethod)) giContent += `<li><strong>Method / Phương pháp SA:</strong> ${formatValue(gi.ultrasoundMethod)}</li>`;
    if (giContent) {
        findingsHtml += `<h4>Gestational Information / Thông tin Thai kỳ</h4><ul>${giContent}</ul>`;
    }

    // --- Fetal Biometry ---
    const bio = data.fetalBiometry; // Assuming singleton for now
    let bioContent = '';
    if (formatValue(bio?.crl)) bioContent += `<li><strong>CRL:</strong> ${formatValue(bio.crl, 'mm')}</li>`;
    if (formatValue(bio?.bpd)) bioContent += `<li><strong>BPD / ĐK Lưỡng đỉnh:</strong> ${formatValue(bio.bpd, 'mm')}</li>`;
    if (formatValue(bio?.hc)) bioContent += `<li><strong>HC / Chu vi đầu:</strong> ${formatValue(bio.hc, 'mm')}</li>`;
    if (formatValue(bio?.ac)) bioContent += `<li><strong>AC / Chu vi bụng:</strong> ${formatValue(bio.ac, 'mm')}</li>`;
    if (formatValue(bio?.fl)) bioContent += `<li><strong>FL / Chiều dài XĐ:</strong> ${formatValue(bio.fl, 'mm')}</li>`;
    if (formatValue(bio?.hl)) bioContent += `<li><strong>HL / Chiều dài XC Tay:</strong> ${formatValue(bio.hl, 'mm')}</li>`;
    if (formatValue(bio?.efw)) {
         bioContent += `<li><strong>EFW / ƯLCN (${formatValue(bio.efwMethod)}):</strong> ${formatValue(bio.efw, 'g')}</li>`;
    } else if (formatValue(bio?.efwMethod)){ // Show method even if EFW not calculated/entered
         bioContent += `<li><strong>EFW Method / Công thức ƯLCN:</strong> ${formatValue(bio.efwMethod)}</li>`;
    }
    if (formatValue(bio?.efwPercentile)) bioContent += `<li><strong>EFW Percentile / Bách phân vị ƯLCN:</strong> ${formatValue(bio.efwPercentile, '%')}</li>`;

    if (bioContent) {
         // TODO: Add Fetus Number if multiple fetus support is added
         findingsHtml += `<h4>Fetal Biometry / Sinh trắc học Thai</h4><ul>${bioContent}</ul>`;
    }

    // --- Fetal Anatomy ---
    const anatomy = data.fetalAnatomy;
    let anatomyContent = '';
    let reportedNormal = false; // Flag to report "grossly normal" only once if applicable
    let hasAbnormalities = false;

    ANATOMY_PARTS.forEach(part => {
        const partData = anatomy[part];
        const status = formatValue(partData?.status);
        const desc = formatValue(partData?.desc);

        // ** CONDITIONAL REPORTING for Anatomy **
        // Report only if NOT normal or if description exists
        if (status && !status.startsWith(NORMAL_STATUS_PREFIX)) {
            const partName = part.charAt(0).toUpperCase() + part.slice(1); // Capitalize part name
            let partEntry = `<li><strong>${partName}:</strong> ${status}`;
            if (desc) {
                 partEntry += ` - ${desc}`;
            }
            partEntry += `</li>`;
            anatomyContent += partEntry;
            hasAbnormalities = true;
        } else if (desc) { // Report description even if status is normal/empty but desc is filled
            const partName = part.charAt(0).toUpperCase() + part.slice(1);
            anatomyContent += `<li><strong>${partName} (Description / Mô tả):</strong> ${desc}</li>`;
            // Note: This case might need refinement depending on desired reporting style.
            // Do we assume 'Abnormal' if only desc is filled? Or just report the description?
            // Current logic just reports the description.
            hasAbnormalities = true; // Consider any description as noteworthy
        } else if (status.startsWith(NORMAL_STATUS_PREFIX)){
            reportedNormal = true; // Mark that at least one part was reported as normal
        }
    });

    if (anatomyContent) { // If any non-normal findings or descriptions were added
        findingsHtml += `<h4>Fetal Anatomy Survey / Khảo sát Hình thái học Thai</h4><ul>${anatomyContent}</ul>`;
    } else if (reportedNormal && !hasAbnormalities) { // Only if *all* assessed parts were normal and no abnormalities added
        findingsHtml += `<h4>Fetal Anatomy Survey / Khảo sát Hình thái học Thai</h4><p>Appears grossly normal for gestational age. / Đại thể bình thường theo tuổi thai.</p>`;
    } else if (!reportedNormal && !hasAbnormalities) {
        // No anatomy data entered or assessed
        // Optionally report "Anatomy not assessed" or similar if needed, otherwise omit section.
        // findingsHtml += `<h4>Fetal Anatomy Survey / Khảo sát Hình thái học Thai</h4><p>Not assessed / Chưa đánh giá.</p>`;
    }


    // --- Amniotic Fluid ---
    const fluid = data.amnioticFluid;
    let fluidContent = '';
    if (formatValue(fluid?.afi)) fluidContent += `<li><strong>AFI / Chỉ số ối:</strong> ${formatValue(fluid.afi, 'cm')}</li>`;
    if (formatValue(fluid?.sdp)) fluidContent += `<li><strong>SDP / Khoang ối sâu nhất:</strong> ${formatValue(fluid.sdp, 'cm')}</li>`;
    if (formatValue(fluid?.fluidAssessment)) fluidContent += `<li><strong>Assessment / Đánh giá:</strong> ${formatValue(fluid.fluidAssessment)}</li>`;
    if (fluidContent) {
        findingsHtml += `<h4>Amniotic Fluid / Nước ối</h4><ul>${fluidContent}</ul>`;
    }

    // --- Placenta ---
    const plac = data.placenta;
    let placContent = '';
    if (formatValue(plac?.location)) placContent += `<li><strong>Location / Vị trí:</strong> ${formatValue(plac.location)}</li>`;
    // Only show distance if it's relevant (e.g., low-lying/previa selected in location OR distance entered)
    if (formatValue(plac?.distanceOs) && (formatValue(plac?.location).includes('Low-lying') || formatValue(plac?.location).includes('Previa') || parseFloat(plac.distanceOs) >= 0) ) {
        placContent += `<li><strong>Distance from Internal Os / Khoảng cách tới lỗ trong CTC:</strong> ${formatValue(plac.distanceOs, 'mm')}</li>`;
    }
    if (formatValue(plac?.grade)) placContent += `<li><strong>Grade / Độ trưởng thành:</strong> ${formatValue(plac.grade)}</li>`;
    if (formatValue(plac?.appearance)) placContent += `<li><strong>Appearance / Hình dạng:</strong> ${formatValue(plac.appearance)}</li>`;
    if (placContent) {
        findingsHtml += `<h4>Placenta / Nhau thai</h4><ul>${placContent}</ul>`;
    }

    // --- Cervix ---
    const cerv = data.cervix;
    let cervContent = '';
    if (formatValue(cerv?.length)) cervContent += `<li><strong>Length / Chiều dài:</strong> ${formatValue(cerv.length, 'mm')}</li>`;
    if (formatValue(cerv?.method)) cervContent += `<li><strong>Method / Phương pháp đo:</strong> ${formatValue(cerv.method)}</li>`;
    if (formatValue(cerv?.appearance)) cervContent += `<li><strong>Appearance / Hình dạng:</strong> ${formatValue(cerv.appearance)}</li>`;
    if (cervContent) {
        findingsHtml += `<h4>Cervix / Cổ tử cung</h4><ul>${cervContent}</ul>`;
    }

    // --- Maternal Structures ---
    const maternal = data.maternalStructures;
    let maternalContent = '';
    if (formatValue(maternal?.uterus)) maternalContent += `<li><strong>Uterus / Tử cung:</strong> ${formatValue(maternal.uterus)}</li>`;
    if (formatValue(maternal?.adnexa)) maternalContent += `<li><strong>Adnexa / Phần phụ:</strong> ${formatValue(maternal.adnexa)}</li>`;
    if (maternalContent) {
        findingsHtml += `<h4>Maternal Structures / Cấu trúc của Mẹ</h4><ul>${maternalContent}</ul>`;
    }

    // --- Fetal Well-being ---
    const wellbeing = data.fetalWellbeing;
    let wellbeingContent = '';
    // BPP
    if (formatValue(wellbeing?.bppScore)) {
         let bppDetail = `<li><strong>Biophysical Profile Score / Điểm Trắc đồ Sinh vật lý:</strong> ${formatValue(wellbeing.bppScore)}/8`;
         let components = [];
         if (formatValue(wellbeing?.bppTone)) components.push(`Tone: ${wellbeing.bppTone}`);
         if (formatValue(wellbeing?.bppMovement)) components.push(`Movement: ${wellbeing.bppMovement}`);
         if (formatValue(wellbeing?.bppBreathing)) components.push(`Breathing: ${wellbeing.bppBreathing}`);
         if (formatValue(wellbeing?.bppFluid)) components.push(`Fluid: ${wellbeing.bppFluid}`);
         if (components.length > 0) bppDetail += ` (${components.join(', ')})`;
         bppDetail += `</li>`;
         wellbeingContent += bppDetail;
    }
    // Doppler
    if (formatValue(wellbeing?.uaPi)) wellbeingContent += `<li><strong>Umbilical Artery PI / PI ĐM Rốn:</strong> ${formatValue(wellbeing.uaPi)}</li>`;
    if (formatValue(wellbeing?.uaRi)) wellbeingContent += `<li><strong>Umbilical Artery RI / RI ĐM Rốn:</strong> ${formatValue(wellbeing.uaRi)}</li>`;
    if (formatValue(wellbeing?.uaSd)) wellbeingContent += `<li><strong>Umbilical Artery S/D / S/D ĐM Rốn:</strong> ${formatValue(wellbeing.uaSd)}</li>`;
    if (formatValue(wellbeing?.uaEdf)) wellbeingContent += `<li><strong>UA End Diastolic Flow / Dòng cuối tâm trương ĐM Rốn:</strong> ${formatValue(wellbeing.uaEdf)}</li>`;
    if (formatValue(wellbeing?.mcaPi)) wellbeingContent += `<li><strong>MCA PI / PI ĐM Não giữa:</strong> ${formatValue(wellbeing.mcaPi)}</li>`;
    if (formatValue(wellbeing?.mcaRi)) wellbeingContent += `<li><strong>MCA RI / RI ĐM Não giữa:</strong> ${formatValue(wellbeing.mcaRi)}</li>`;
    if (formatValue(wellbeing?.mcaPsv)) wellbeingContent += `<li><strong>MCA PSV / PSV ĐM Não giữa:</strong> ${formatValue(wellbeing.mcaPsv, 'cm/s')}</li>`;
    if (formatValue(wellbeing?.cpr)) wellbeingContent += `<li><strong>CPR (MCA PI / UA PI) / Tỷ lệ Não-Rốn:</strong> ${formatValue(wellbeing.cpr)}</li>`;

    if (wellbeingContent) {
        findingsHtml += `<h4>Fetal Well-being / Sức khỏe Thai</h4><ul>${wellbeingContent}</ul>`;
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

    console.log("[ObstetricModule] Finished formatting Obstetric report section HTML.");
    // Wrap the entire findings section for potential specific styling
    return `<div class="obstetric-findings-container">${findingsHtml || '<p>No significant findings entered / Không nhập kết quả nào.</p>'}</div>`;
}


console.log("obstetric-module.js loaded.");